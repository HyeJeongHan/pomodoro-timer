import { useEffect, useRef, useState } from "react";

type Props = {
  todaySessions: number;
  dailyGoal: number;
};

export default function DailyGoal({ todaySessions, dailyGoal }: Props) {
  const achieved = todaySessions >= dailyGoal;
  const [pop, setPop] = useState(false);
  const prevAchievedRef = useRef(false);

  useEffect(() => {
    if (achieved && !prevAchievedRef.current) {
      setPop(true);
      setTimeout(() => setPop(false), 800);
    }
    prevAchievedRef.current = achieved;
  }, [achieved]);

  const filled = Math.min(todaySessions, dailyGoal);
  const slots = Array.from({ length: dailyGoal });

  return (
    <div style={s.wrap}>
      <div style={s.tomatoes}>
        {slots.map((_, i) => (
          <span
            key={i}
            style={{
              fontSize: 13,
              opacity: i < filled ? 1 : 0.22,
              transition: "opacity 0.3s",
              display: "inline-block",
              animation: pop && i === filled - 1 ? "badgePop 0.8s ease" : undefined,
            }}
          >
            🍅
          </span>
        ))}
      </div>
      <span style={s.label}>
        {achieved
          ? "🎉 오늘 목표 달성!"
          : `${todaySessions} / ${dailyGoal} 세션`}
      </span>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  wrap: {
    marginTop: 12,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
  },
  tomatoes: {
    display: "flex",
    gap: 3,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  label: {
    fontSize: 11,
    color: "var(--th-text-label)",
    fontWeight: 600,
  },
};
