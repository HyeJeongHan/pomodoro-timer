import { useState, useEffect, useRef, useCallback } from "react";
import type { Mode } from "../types";
import type { ThemeName } from "../themes";
import { EMOJIS } from "../constants";
import { playDoneSound } from "../utils/sound";
import { sendNotification } from "../utils/notifications";
import { formatDate, today } from "../utils/date";

const HISTORY_KEY = "pomodoro_history";
const OLD_SESSION_KEY = "pomodoro_sessions";
const GOAL_KEY = "pomodoro_daily_goal";

function loadHistory(): Record<string, number> {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (raw) return JSON.parse(raw) as Record<string, number>;
    const oldRaw = localStorage.getItem(OLD_SESSION_KEY);
    if (oldRaw) {
      const old = JSON.parse(oldRaw) as { date?: string; count?: number };
      if (old.date && typeof old.count === "number") {
        const migrated: Record<string, number> = { [old.date]: old.count };
        localStorage.setItem(HISTORY_KEY, JSON.stringify(migrated));
        return migrated;
      }
    }
  } catch {}
  return {};
}

function saveHistory(history: Record<string, number>) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

function loadDailyGoal(): number {
  try {
    const raw = localStorage.getItem(GOAL_KEY);
    if (raw) return parseInt(raw, 10);
  } catch {}
  return 4;
}

function calcStreak(history: Record<string, number>): number {
  const cur = new Date();
  cur.setHours(0, 0, 0, 0);

  if (!history[formatDate(cur)]) cur.setDate(cur.getDate() - 1);

  let streak = 0;
  while ((history[formatDate(cur)] ?? 0) > 0) {
    streak++;
    cur.setDate(cur.getDate() - 1);
  }
  return streak;
}

export function useTimer() {
  const [mode, setMode] = useState<Mode>("focus");
  const [focusMin, setFocusMin] = useState(25);
  const [breakMin, setBreakMin] = useState(5);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [emojiIdx, setEmojiIdx] = useState(0);
  const [wiggle, setWiggle] = useState(false);
  const [done, setDone] = useState(false);
  const [theme, setTheme] = useState<ThemeName>("pink");
  const [sessionHistory, setSessionHistory] = useState<Record<string, number>>(loadHistory);
  const [dailyGoal, setDailyGoalState] = useState(loadDailyGoal);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevDoneRef = useRef(false);
  const modeRef = useRef(mode);
  const timeLeftRef = useRef(timeLeft);
  const scheduleBlobRef = useRef<string | null>(null);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);

  const schedulePush = useCallback(async (delaySeconds: number, m: Mode) => {
    const subRaw = localStorage.getItem("pomodoro_push_subscription");
    if (!subRaw) return;
    try {
      const res = await fetch("/api/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscription: JSON.parse(subRaw),
          delaySeconds,
          title: m === "focus" ? "🍅 집중 완료!" : "☕ 휴식 완료!",
          body: m === "focus" ? "수고했어요! 잠깐 쉬어가세요." : "다시 집중 시작할까요?",
        }),
      });
      const { blobUrl } = (await res.json()) as { blobUrl: string };
      scheduleBlobRef.current = blobUrl;
    } catch {}
  }, []);

  const cancelPush = useCallback(async () => {
    if (!scheduleBlobRef.current) return;
    const url = scheduleBlobRef.current;
    scheduleBlobRef.current = null;
    try {
      await fetch("/api/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blobUrl: url }),
      });
    } catch {}
  }, []);

  const modeSeconds = useCallback(
    (m: Mode) => (m === "focus" ? focusMin : breakMin) * 60,
    [focusMin, breakMin]
  );

  const todaySessions = sessionHistory[today()] ?? 0;
  const totalSessions = Object.values(sessionHistory).reduce((a, b) => a + b, 0);
  const streak = calcStreak(sessionHistory);
  const totalTime = modeSeconds(mode);
  const progress = 1 - timeLeft / totalTime;

  const switchMode = useCallback(
    (next: Mode) => {
      cancelPush();
      setMode(next);
      setTimeLeft(modeSeconds(next));
      setRunning(false);
      setDone(false);
      setEmojiIdx(Math.floor(Math.random() * 5));
    },
    [modeSeconds, cancelPush]
  );

  useEffect(() => {
    if (running) {
      schedulePush(timeLeftRef.current, modeRef.current);
      intervalRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(intervalRef.current!);
            setRunning(false);
            setDone(true);
            playDoneSound();
            setWiggle(true);
            setTimeout(() => setWiggle(false), 800);
            sendNotification(
              modeRef.current === "focus" ? "🍅 집중 완료!" : "☕ 휴식 완료!",
              modeRef.current === "focus" ? "수고했어요! 잠깐 쉬어가세요." : "다시 집중 시작할까요?"
            );
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current!);
      cancelPush();
    }
    return () => clearInterval(intervalRef.current!);
  }, [running, schedulePush, cancelPush]);

  useEffect(() => {
    if (done && !prevDoneRef.current && mode === "focus") {
      setSessionHistory((prev) => {
        const t = today();
        const next = { ...prev, [t]: (prev[t] ?? 0) + 1 };
        saveHistory(next);
        return next;
      });
    }
    prevDoneRef.current = done;
  }, [done, mode]);

  const reset = useCallback(() => {
    setTimeLeft(modeSeconds(mode));
    setRunning(false);
    setDone(false);
  }, [mode, modeSeconds]);

  const restart = useCallback(() => {
    setTimeLeft(modeSeconds(mode));
    setDone(false);
    setRunning(true);
  }, [mode, modeSeconds]);

  const toggle = useCallback(() => {
    setRunning((r) => !r);
  }, []);

  const toggleSettings = useCallback(() => {
    setShowSettings((s) => !s);
  }, []);

  const closeSettings = useCallback(() => {
    setShowSettings(false);
  }, []);

  const updateFocusMin = useCallback(
    (v: number) => {
      setFocusMin(v);
      if (mode === "focus") setTimeLeft(v * 60);
    },
    [mode]
  );

  const updateBreakMin = useCallback(
    (v: number) => {
      setBreakMin(v);
      if (mode === "break") setTimeLeft(v * 60);
    },
    [mode]
  );

  const setDailyGoal = useCallback((n: number) => {
    setDailyGoalState(n);
    localStorage.setItem(GOAL_KEY, String(n));
  }, []);

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const ss = String(timeLeft % 60).padStart(2, "0");
  const emoji = EMOJIS[mode][emojiIdx];

  return {
    mode,
    focusMin,
    breakMin,
    running,
    showSettings,
    wiggle,
    done,
    progress,
    mm,
    ss,
    emoji,
    theme,
    setTheme,
    switchMode,
    reset,
    restart,
    toggle,
    toggleSettings,
    closeSettings,
    updateFocusMin,
    updateBreakMin,
    todaySessions,
    totalSessions,
    sessionHistory,
    streak,
    dailyGoal,
    setDailyGoal,
  };
}
