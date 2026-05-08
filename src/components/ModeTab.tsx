import type { Mode } from "../types";
import styles from "../styles";

type Props = {
  mode: Mode;
  onSwitch: (next: Mode) => void;
};

export default function ModeTab({ mode, onSwitch }: Props) {
  return (
    <div style={styles.tabs}>
      {(["focus", "break"] as Mode[]).map((m) => (
        <button
          key={m}
          style={{ ...styles.tab, ...(mode === m ? styles.tabActive : {}) }}
          onClick={() => onSwitch(m)}
        >
          {m === "focus" ? "🎯 집중" : "☕ 휴식"}
        </button>
      ))}
    </div>
  );
}
