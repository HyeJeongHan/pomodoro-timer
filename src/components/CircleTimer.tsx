import type { Mode } from "../types";
import styles from "../styles";

type Props = {
  mode: Mode;
  progress: number;
  emoji: string;
  mm: string;
  ss: string;
  done: boolean;
  wiggle: boolean;
};

export default function CircleTimer({ mode, progress, emoji, mm, ss, done, wiggle }: Props) {
  const r = 90;
  const circ = 2 * Math.PI * r;
  const dash = circ * progress;

  return (
    <div
      style={{
        ...styles.circleWrap,
        animation: wiggle ? "wiggle 0.4s ease" : "none",
      }}
    >
      <svg width="220" height="220" viewBox="0 0 220 220">
        <defs>
          <filter id="soft">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        <circle cx="110" cy="110" r={r} fill="none" stroke="var(--th-p100)" strokeWidth="14" />
        <circle
          cx="110"
          cy="110"
          r={r}
          fill="none"
          stroke={mode === "focus" ? "var(--th-p400)" : "var(--th-break)"}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          strokeDashoffset={0}
          transform="rotate(-90 110 110)"
          style={{ transition: "stroke-dasharray 0.5s ease" }}
        />
        <text x="110" y="98" textAnchor="middle" fontSize="36" style={{ userSelect: "none" }}>
          {emoji}
        </text>
        <text
          x="110"
          y="134"
          textAnchor="middle"
          fontSize="32"
          fontFamily="'Courier New', monospace"
          fontWeight="700"
          fill={mode === "focus" ? "var(--th-p600)" : "var(--th-break-dark)"}
        >
          {mm}:{ss}
        </text>
        {done && (
          <text x="110" y="158" textAnchor="middle" fontSize="13" fill="#a855f7" fontFamily="sans-serif">
            완료! 🎉
          </text>
        )}
      </svg>
    </div>
  );
}
