import type { Mode } from "../types";
import styles from "../styles";

type Props = {
  mode: Mode;
  focusMin: number;
  breakMin: number;
  setFocusMin: (v: number) => void;
  setBreakMin: (v: number) => void;
  setTimeLeft: (v: number) => void;
};

export default function Settings({ mode, focusMin, breakMin, setFocusMin, setBreakMin, setTimeLeft }: Props) {
  return (
    <div style={styles.settings}>
      <p style={styles.settingsTitle}>⏱ 시간 설정</p>
      <div style={styles.settingsRow}>
        <label style={styles.label}>🎯 집중 시간</label>
        <div style={styles.stepper}>
          <button
            style={styles.stepBtn}
            onClick={() => {
              const v = Math.max(1, focusMin - 1);
              setFocusMin(v);
              if (mode === "focus") setTimeLeft(v * 60);
            }}
          >
            −
          </button>
          <span style={styles.stepVal}>{focusMin}분</span>
          <button
            style={styles.stepBtn}
            onClick={() => {
              const v = Math.min(99, focusMin + 1);
              setFocusMin(v);
              if (mode === "focus") setTimeLeft(v * 60);
            }}
          >
            +
          </button>
        </div>
      </div>
      <div style={styles.settingsRow}>
        <label style={styles.label}>☕ 휴식 시간</label>
        <div style={styles.stepper}>
          <button
            style={styles.stepBtn}
            onClick={() => {
              const v = Math.max(1, breakMin - 1);
              setBreakMin(v);
              if (mode === "break") setTimeLeft(v * 60);
            }}
          >
            −
          </button>
          <span style={styles.stepVal}>{breakMin}분</span>
          <button
            style={styles.stepBtn}
            onClick={() => {
              const v = Math.min(99, breakMin + 1);
              setBreakMin(v);
              if (mode === "break") setTimeLeft(v * 60);
            }}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
