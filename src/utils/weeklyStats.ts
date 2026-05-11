const DAY_KO = ["일", "월", "화", "수", "목", "금", "토"];

function fmt(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export type WeeklyStats = {
  totalSessions: number;
  totalMinutes: number;
  bestDay: string | null;
  bestDayCount: number;
  days: { key: string; label: string; count: number }[];
};

export function calcWeeklyStats(
  history: Record<string, number>,
  focusMin: number
): WeeklyStats {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  // 이번 주 월요일 기준 7일 (오늘 포함 이전 7일)
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() - (6 - i));
    const key = fmt(d);
    return {
      key,
      label: DAY_KO[d.getDay()],
      count: history[key] ?? 0,
    };
  });

  const totalSessions = days.reduce((s, d) => s + d.count, 0);
  const totalMinutes = totalSessions * focusMin;

  let bestDay: string | null = null;
  let bestDayCount = 0;
  for (const d of days) {
    if (d.count > bestDayCount) {
      bestDayCount = d.count;
      bestDay = d.label + "요일";
    }
  }

  return { totalSessions, totalMinutes, bestDay, bestDayCount, days };
}
