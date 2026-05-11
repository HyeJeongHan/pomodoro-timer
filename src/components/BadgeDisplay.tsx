import { useEffect, useRef, useState } from "react";
import { getBadge, BADGES } from "../utils/badge";

type Props = {
  totalSessions: number;
};

export default function BadgeDisplay({ totalSessions }: Props) {
  const badge = getBadge(totalSessions);
  const nextBadge = BADGES.find((b) => b.min === badge.next);
  const toNext = badge.next !== null ? badge.next - totalSessions : 0;

  const [celebrate, setCelebrate] = useState(false);
  const prevNameRef = useRef(badge.name);

  useEffect(() => {
    if (prevNameRef.current !== badge.name) {
      setCelebrate(true);
      setTimeout(() => setCelebrate(false), 700);
      prevNameRef.current = badge.name;
    }
  }, [badge.name]);

  const progress =
    badge.next !== null
      ? ((totalSessions - badge.min) / (badge.next - badge.min)) * 100
      : 100;

  return (
    <div style={s.wrap}>
      <div style={s.left}>
        <span
          style={{
            fontSize: 28,
            lineHeight: 1,
            display: "inline-block",
            animation: celebrate ? "badgePop 0.7s ease" : undefined,
          }}
        >
          {badge.emoji}
        </span>
      </div>

      <div style={s.right}>
        <div style={s.topRow}>
          <span style={s.name}>{badge.name}</span>
          <span style={s.total}>누적 {totalSessions}세션</span>
        </div>

        <div style={s.barBg}>
          <div style={{ ...s.barFill, width: `${progress}%` }} />
        </div>

        <div style={s.hint}>
          {badge.next !== null
            ? `${nextBadge?.emoji} ${nextBadge?.name}까지 ${toNext}세션 남았어요`
            : "🎉 최고 단계 달성!"}
        </div>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  wrap: {
    marginTop: 10,
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 12px",
    background: "var(--th-settings-bg)",
    borderRadius: 16,
    border: "1.5px solid var(--th-p100)",
  },
  left: {
    flexShrink: 0,
    width: 36,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  right: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  topRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  name: {
    fontSize: 13,
    fontWeight: 700,
    color: "var(--th-p700)",
  },
  total: {
    fontSize: 10,
    color: "var(--th-text-label)",
  },
  barBg: {
    height: 5,
    borderRadius: 3,
    background: "var(--th-p100)",
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 3,
    background: "linear-gradient(90deg, var(--th-p300), var(--th-p400))",
    transition: "width 0.5s ease",
  },
  hint: {
    fontSize: 10,
    color: "var(--th-text-label)",
  },
};
