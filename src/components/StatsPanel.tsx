import { useMemo } from "react";
import type { SessionLog } from "../utils/sessionLog";
import { formatDate } from "../utils/date";

type Props = {
  sessionHistory: Record<string, number>;
  sessionLog: SessionLog;
  focusMin: number;
};

const COLORS = ["#f472b6", "#60a5fa", "#34d399", "#fbbf24", "#a78bfa", "#fb923c", "#94a3b8"];
const DAY_KR = ["월", "화", "수", "목", "금", "토", "일"];

function polarToCartesian(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function donutSegment(
  cx: number, cy: number,
  outerR: number, innerR: number,
  startDeg: number, endDeg: number
) {
  if (Math.abs(endDeg - startDeg) >= 359.9) {
    return [
      `M ${cx} ${cy - outerR}`,
      `A ${outerR} ${outerR} 0 1 1 ${cx - 0.01} ${cy - outerR} Z`,
      `M ${cx} ${cy - innerR}`,
      `A ${innerR} ${innerR} 0 1 0 ${cx - 0.01} ${cy - innerR} Z`,
    ].join(" ");
  }
  const os = polarToCartesian(cx, cy, outerR, startDeg);
  const oe = polarToCartesian(cx, cy, outerR, endDeg);
  const is = polarToCartesian(cx, cy, innerR, startDeg);
  const ie = polarToCartesian(cx, cy, innerR, endDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return [
    `M ${os.x.toFixed(2)} ${os.y.toFixed(2)}`,
    `A ${outerR} ${outerR} 0 ${large} 1 ${oe.x.toFixed(2)} ${oe.y.toFixed(2)}`,
    `L ${ie.x.toFixed(2)} ${ie.y.toFixed(2)}`,
    `A ${innerR} ${innerR} 0 ${large} 0 ${is.x.toFixed(2)} ${is.y.toFixed(2)}`,
    "Z",
  ].join(" ");
}

export default function StatsPanel({ sessionHistory, sessionLog, focusMin }: Props) {
  const weeklyData = useMemo(() => {
    const now = new Date();
    const dates: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      dates.push(formatDate(d));
    }
    const taskMap: Record<string, number> = {};
    let untracked = 0;
    dates.forEach((date) => {
      const entries = sessionLog[date] ?? [];
      entries.forEach((e) => {
        const key = e.taskText ?? "미기록";
        taskMap[key] = (taskMap[key] ?? 0) + 1;
      });
      const diff = (sessionHistory[date] ?? 0) - entries.length;
      if (diff > 0) untracked += diff;
    });
    if (untracked > 0) taskMap["이전 기록"] = (taskMap["이전 기록"] ?? 0) + untracked;
    return Object.entries(taskMap)
      .map(([text, count]) => ({ text, count }))
      .sort((a, b) => b.count - a.count);
  }, [sessionLog, sessionHistory]);

  const weeklyTotal = weeklyData.reduce((s, d) => s + d.count, 0);

  // day-of-week counts, Mon=0 … Sun=6
  const dowData = useMemo(() => {
    const counts = [0, 0, 0, 0, 0, 0, 0];
    Object.entries(sessionHistory).forEach(([date, count]) => {
      const day = new Date(date + "T00:00:00").getDay(); // 0=Sun
      counts[day === 0 ? 6 : day - 1] += count;
    });
    return counts;
  }, [sessionHistory]);

  const maxDow = Math.max(...dowData, 1);

  const segments = useMemo(() => {
    if (weeklyTotal === 0) return [];
    let start = 0;
    return weeklyData.map((d, i) => {
      const seg = { start, end: start + (d.count / weeklyTotal) * 360, color: COLORS[i % COLORS.length] };
      start = seg.end;
      return seg;
    });
  }, [weeklyData, weeklyTotal]);

  const hasAny = Object.keys(sessionHistory).length > 0;

  if (!hasAny) {
    return (
      <div style={s.wrap}>
        <div style={s.empty}>세션을 완료하면 통계가 표시돼요 🍅</div>
      </div>
    );
  }

  return (
    <div style={s.wrap}>
      {/* 요일별 막대그래프 */}
      <div style={s.sectionTitle}>요일별 집중 패턴</div>
      <div style={s.chartBox}>
        <svg width="100%" viewBox="0 0 210 82" style={{ overflow: "visible" }}>
          {dowData.map((count, i) => {
            const barH = count === 0 ? 2 : Math.max(5, (count / maxDow) * 55);
            const x = 10 + i * 28;
            const y = 58 - barH;
            return (
              <g key={i}>
                <rect
                  x={x} y={y} width={18} height={barH} rx={4}
                  fill={count === 0 ? "var(--th-p100)" : "var(--th-p300)"}
                />
                {count > 0 && (
                  <text x={x + 9} y={y - 3} textAnchor="middle" fontSize={8}
                    fill="var(--th-p600)" fontWeight="600">
                    {count}
                  </text>
                )}
                <text x={x + 9} y={74} textAnchor="middle" fontSize={9}
                  fill="var(--th-text-label)">
                  {DAY_KR[i]}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* 이번 주 도넛 차트 */}
      <div style={{ ...s.sectionTitle, marginTop: 16 }}>이번 주 작업별 시간</div>
      {weeklyTotal === 0 ? (
        <div style={s.empty}>이번 주 기록이 없어요.</div>
      ) : (
        <div style={s.donutRow}>
          <svg width={110} height={110} viewBox="0 0 110 110" style={{ flexShrink: 0 }}>
            {segments.map((seg, i) => (
              <path key={i} d={donutSegment(55, 55, 48, 30, seg.start, seg.end)}
                fill={seg.color} opacity={0.9} />
            ))}
            <text x={55} y={51} textAnchor="middle" fontSize={14}
              fontWeight="700" fill="var(--th-p700)">{weeklyTotal}</text>
            <text x={55} y={63} textAnchor="middle" fontSize={8}
              fill="var(--th-text-label)">세션</text>
          </svg>

          <div style={s.legend}>
            {weeklyData.map((d, i) => (
              <div key={i} style={s.legendItem}>
                <div style={{ ...s.legendDot, background: COLORS[i % COLORS.length] }} />
                <span style={s.legendText}>
                  {d.text.length > 11 ? d.text.slice(0, 11) + "…" : d.text}
                </span>
                <span style={s.legendCount}>
                  {d.count}회&nbsp;({Math.round((d.count / weeklyTotal) * 100)}%)
                </span>
              </div>
            ))}
            <div style={s.legendNote}>
              ※ {focusMin}분 × {weeklyTotal} = {focusMin * weeklyTotal}분
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  wrap: { padding: "12px 4px" },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: "var(--th-p700)",
    marginBottom: 8,
  },
  chartBox: {
    padding: "8px 4px 2px",
    background: "var(--th-p50)",
    borderRadius: 12,
    border: "1px solid var(--th-p100)",
  },
  donutRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: 12,
  },
  legend: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 5,
    paddingTop: 6,
    minWidth: 0,
  },
  legendItem: {
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    flexShrink: 0,
  },
  legendText: {
    fontSize: 11,
    color: "var(--th-text-val)",
    flex: 1,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  legendCount: {
    fontSize: 10,
    color: "var(--th-text-label)",
    flexShrink: 0,
    whiteSpace: "nowrap",
  },
  legendNote: {
    fontSize: 10,
    color: "var(--th-text-label)",
    marginTop: 4,
  },
  empty: {
    fontSize: 12,
    color: "var(--th-text-label)",
    textAlign: "center",
    padding: "20px 0",
  },
};
