const LOG_KEY = "pomodoro_session_log";

export type SessionEntry = {
  taskId: string | null;
  taskText: string | null;
  time: string; // HH:mm
};

export type SessionLog = Record<string, SessionEntry[]>;

export function loadSessionLog(): SessionLog {
  try {
    const raw = localStorage.getItem(LOG_KEY);
    if (raw) return JSON.parse(raw) as SessionLog;
  } catch {}
  return {};
}

export function saveSessionLog(log: SessionLog) {
  localStorage.setItem(LOG_KEY, JSON.stringify(log));
}

export function appendSessionEntry(
  log: SessionLog,
  date: string,
  entry: SessionEntry
): SessionLog {
  const entries = log[date] ?? [];
  return { ...log, [date]: [...entries, entry] };
}
