import type { Mode } from "../types";
import styles from "../styles";

type Props = {
  mode: Mode;
  running: boolean;
  done: boolean;
  onToggle: () => void;
  onReset: () => void;
};

export default function Controls({ mode, running, done, onToggle, onReset }: Props) {
  return (
    <div style={styles.controls}>
      <button style={styles.btnSecondary} onClick={onReset}>
        🔄
      </button>
      <button
        style={{
          ...styles.btnPrimary,
          background:
            mode === "focus"
              ? "linear-gradient(135deg, var(--th-p300), var(--th-p400))"
              : "linear-gradient(135deg, var(--th-break-btn-start), var(--th-break-btn-end))",
        }}
        onClick={onToggle}
      >
        {running ? "⏸ 일시정지" : done ? "🔁 다시하기" : "▶ 시작"}
      </button>
    </div>
  );
}
