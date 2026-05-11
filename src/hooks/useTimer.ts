import { useState, useEffect, useRef, useCallback } from "react";
import type { Mode } from "../types";
import type { ThemeName } from "../themes";
import { EMOJIS } from "../constants";
import { playDoneSound } from "../utils/sound";

const HISTORY_KEY = "pomodoro_history";
const OLD_SESSION_KEY = "pomodoro_sessions";
const today = () => new Date().toISOString().slice(0, 10);

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
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevDoneRef = useRef(false);

  const todaySessions = sessionHistory[today()] ?? 0;
  const totalTime = mode === "focus" ? focusMin * 60 : breakMin * 60;
  const progress = 1 - timeLeft / totalTime;

  const switchMode = useCallback(
    (next: Mode) => {
      setMode(next);
      setTimeLeft((next === "focus" ? focusMin : breakMin) * 60);
      setRunning(false);
      setDone(false);
      setEmojiIdx(Math.floor(Math.random() * 5));
    },
    [focusMin, breakMin]
  );

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(intervalRef.current!);
            setRunning(false);
            setDone(true);
            playDoneSound();
            setWiggle(true);
            setTimeout(() => setWiggle(false), 800);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current!);
    }
    return () => clearInterval(intervalRef.current!);
  }, [running]);

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

  const reset = () => {
    setTimeLeft(mode === "focus" ? focusMin * 60 : breakMin * 60);
    setRunning(false);
    setDone(false);
  };

  const restart = () => {
    setTimeLeft(mode === "focus" ? focusMin * 60 : breakMin * 60);
    setDone(false);
    setRunning(true);
  };

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
    setFocusMin,
    setBreakMin,
    setRunning,
    setShowSettings,
    setTimeLeft,
    theme,
    setTheme,
    switchMode,
    reset,
    restart,
    todaySessions,
    sessionHistory,
  };
}
