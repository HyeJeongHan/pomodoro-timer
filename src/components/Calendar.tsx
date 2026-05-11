import { useState } from "react";
import { formatDate, today } from "../utils/date";

type Props = {
  sessionHistory: Record<string, number>;
};

const DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

export default function Calendar({ sessionHistory }: Props) {
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());

  const todayKey = today();

  const firstWeekday = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear((y) => y - 1); setViewMonth(11); }
    else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear((y) => y + 1); setViewMonth(0); }
    else setViewMonth((m) => m + 1);
  };

  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div style={s.wrap}>
      <div style={s.header}>
        <button style={s.navBtn} onClick={prevMonth}>‹</button>
        <span style={s.monthLabel}>{viewYear}년 {viewMonth + 1}월</span>
        <button style={s.navBtn} onClick={nextMonth}>›</button>
      </div>

      <div style={s.grid}>
        {DAY_LABELS.map((d, i) => (
          <div key={d} style={{ ...s.dayHeader, ...(i === 0 ? s.sun : i === 6 ? s.sat : {}) }}>
            {d}
          </div>
        ))}

        {cells.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} />;
          const key = formatDate(new Date(viewYear, viewMonth, day));
          const count = sessionHistory[key] ?? 0;
          const isToday = key === todayKey;
          const dotColor = count >= 5
            ? "var(--th-dot-strong)"
            : count >= 1
              ? "var(--th-dot-muted)"
              : null;

          return (
            <div key={key} style={s.cell}>
              <div style={{ ...s.dayNum, ...(isToday ? s.todayCircle : {}) }}>
                {day}
              </div>
              <div style={s.dotSlot}>
                {dotColor && (
                  <div style={{ ...s.dot, background: dotColor }} />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  wrap: {
    marginTop: 14,
    padding: "10px 6px 8px",
    background: "var(--th-settings-bg)",
    borderRadius: 16,
    border: "1.5px solid var(--th-p100)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
    padding: "0 4px",
  },
  navBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: 18,
    color: "var(--th-p700)",
    padding: "0 6px",
    lineHeight: 1,
    borderRadius: 6,
    transition: "opacity 0.15s",
  },
  monthLabel: {
    fontSize: 12,
    fontWeight: 700,
    color: "var(--th-p700)",
    letterSpacing: -0.2,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    rowGap: 1,
  },
  dayHeader: {
    textAlign: "center",
    fontSize: 10,
    fontWeight: 600,
    color: "var(--th-text-label)",
    padding: "2px 0 5px",
  },
  sun: { color: "#f87171" },
  sat: { color: "#60a5fa" },
  cell: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "1px 0",
  },
  dayNum: {
    fontSize: 11,
    fontWeight: 500,
    color: "var(--th-text-val)",
    width: 22,
    height: 22,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
  },
  todayCircle: {
    background: "linear-gradient(135deg, var(--th-p200), var(--th-p300))",
    fontWeight: 700,
    color: "var(--th-p800)",
  },
  dotSlot: {
    height: 6,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: "50%",
  },
};
