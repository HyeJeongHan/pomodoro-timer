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
  // mode: 현재 선택된 탭 (시각적)
  // timerMode: 실제 타이머가 속한 모드 (실행 중에는 탭 전환으로 바뀌지 않음)
  const [mode, setMode] = useState<Mode>("focus");
  const [timerMode, setTimerMode] = useState<Mode>("focus");
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
  const timerModeRef = useRef(timerMode);
  const timeLeftRef = useRef(timeLeft);
  const runningRef = useRef(running);
  const scheduleBlobRef = useRef<string | null>(null);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    timerModeRef.current = timerMode;
  }, [timerMode]);

  useEffect(() => {
    runningRef.current = running;
  }, [running]);

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
  // 프로그레스/이모지는 실제 타이머 모드 기준
  const totalTime = modeSeconds(timerMode);
  const progress = 1 - timeLeft / totalTime;
  // 타이머가 한 번 시작됐다가 일시정지된 상태
  const paused = !running && !done && timeLeft < totalTime;

  const switchMode = useCallback(
    (next: Mode) => {
      if (runningRef.current) {
        // 실행 중에는 탭만 바꾸고 타이머는 유지
        setMode(next);
        return;
      }
      cancelPush();
      setMode(next);
      setTimerMode(next);
      setTimeLeft(modeSeconds(next));
      setRunning(false);
      setDone(false);
      setEmojiIdx(Math.floor(Math.random() * 5));
    },
    [modeSeconds, cancelPush]
  );

  useEffect(() => {
    if (running) {
      schedulePush(timeLeftRef.current, timerModeRef.current);
      intervalRef.current = setInterval(() => {
        const next = timeLeftRef.current - 1;
        if (next <= 0) {
          clearInterval(intervalRef.current!);
          timeLeftRef.current = 0;
          setTimeLeft(0);
          setRunning(false);
          setDone(true);
          try {
            playDoneSound();
          } catch {
            // AudioContext 사용 불가 환경 무시
          }
          setWiggle(true);
          setTimeout(() => setWiggle(false), 800);
          sendNotification(
            timerModeRef.current === "focus" ? "🍅 집중 완료!" : "☕ 휴식 완료!",
            timerModeRef.current === "focus" ? "수고했어요! 잠깐 쉬어가세요." : "다시 집중 시작할까요?"
          );
        } else {
          timeLeftRef.current = next;
          setTimeLeft(next);
        }
      }, 1000);
    } else {
      clearInterval(intervalRef.current!);
      cancelPush();
    }
    return () => clearInterval(intervalRef.current!);
  }, [running, schedulePush, cancelPush]);

  useEffect(() => {
    if (done && !prevDoneRef.current && timerModeRef.current === "focus") {
      setSessionHistory((prev) => {
        const t = today();
        const next = { ...prev, [t]: (prev[t] ?? 0) + 1 };
        saveHistory(next);
        return next;
      });
    }
    prevDoneRef.current = done;
  }, [done]);

  const reset = useCallback(() => {
    setTimerMode(modeRef.current);
    setTimeLeft(modeSeconds(modeRef.current));
    setRunning(false);
    setDone(false);
  }, [modeSeconds]);

  const restart = useCallback(() => {
    setTimerMode(modeRef.current);
    setTimeLeft(modeSeconds(modeRef.current));
    setDone(false);
    setRunning(true);
  }, [modeSeconds]);

  const toggle = useCallback(() => {
    setRunning((r) => {
      if (!r) {
        // 시작 시점에 현재 탭 모드를 timerMode로 고정
        setTimerMode(modeRef.current);
        timerModeRef.current = modeRef.current;
      }
      return !r;
    });
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
      if (timerModeRef.current === "focus") setTimeLeft(v * 60);
    },
    []
  );

  const updateBreakMin = useCallback(
    (v: number) => {
      setBreakMin(v);
      if (timerModeRef.current === "break") setTimeLeft(v * 60);
    },
    []
  );

  const setDailyGoal = useCallback((n: number) => {
    setDailyGoalState(n);
    localStorage.setItem(GOAL_KEY, String(n));
  }, []);

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const ss = String(timeLeft % 60).padStart(2, "0");
  const emoji = EMOJIS[timerMode][emojiIdx];

  return {
    mode,
    timerMode,
    focusMin,
    breakMin,
    running,
    paused,
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
