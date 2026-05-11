import { useState } from "react";
import type { ThemeName } from "../themes";
import { THEMES } from "../themes";
import { requestNotificationPermission } from "../utils/notifications";
import { subscribeToPush } from "../utils/webpush";
import styles from "../styles";

type Props = {
  focusMin: number;
  breakMin: number;
  updateFocusMin: (v: number) => void;
  updateBreakMin: (v: number) => void;
  theme: ThemeName;
  setTheme: (t: ThemeName) => void;
  dailyGoal: number;
  setDailyGoal: (n: number) => void;
};

export default function Settings({
  focusMin,
  breakMin,
  updateFocusMin,
  updateBreakMin,
  theme,
  setTheme,
  dailyGoal,
  setDailyGoal,
}: Props) {
  return (
    <div style={styles.settings}>
      <p style={styles.settingsTitle}>⏱ 시간 설정</p>

      <div style={{ ...styles.settingsRow, marginBottom: 14 }}>
        <label style={styles.label}>🎨 테마</label>
        <div style={{ display: "flex", gap: 8 }}>
          {THEMES.map((t) => (
            <button
              key={t.name}
              title={t.label}
              onClick={() => setTheme(t.name)}
              style={{
                width: 26,
                height: 26,
                borderRadius: "50%",
                background: t.swatch,
                border: "none",
                cursor: "pointer",
                outline: theme === t.name ? `3px solid ${t.swatch}` : "none",
                outlineOffset: 2,
                boxShadow: theme === t.name ? "0 0 0 1.5px #fff inset" : "none",
                transition: "outline 0.15s, box-shadow 0.15s",
              }}
            />
          ))}
        </div>
      </div>

      <div style={styles.settingsRow}>
        <label style={styles.label}>🎯 집중 시간</label>
        <div style={styles.stepper}>
          <button
            style={styles.stepBtn}
            onClick={() => updateFocusMin(Math.max(1, focusMin - 1))}
          >
            −
          </button>
          <span style={styles.stepVal}>{focusMin}분</span>
          <button
            style={styles.stepBtn}
            onClick={() => updateFocusMin(Math.min(99, focusMin + 1))}
          >
            +
          </button>
        </div>
      </div>

      <div style={styles.settingsRow}>
        <label style={styles.label}>🎯 오늘 목표</label>
        <div style={styles.stepper}>
          <button
            style={styles.stepBtn}
            onClick={() => setDailyGoal(Math.max(1, dailyGoal - 1))}
          >
            −
          </button>
          <span style={styles.stepVal}>{dailyGoal}개</span>
          <button
            style={styles.stepBtn}
            onClick={() => setDailyGoal(Math.min(20, dailyGoal + 1))}
          >
            +
          </button>
        </div>
      </div>

      <div style={{ ...styles.settingsRow, marginBottom: 0 }}>
        <label style={styles.label}>☕ 휴식 시간</label>
        <div style={styles.stepper}>
          <button
            style={styles.stepBtn}
            onClick={() => updateBreakMin(Math.max(1, breakMin - 1))}
          >
            −
          </button>
          <span style={styles.stepVal}>{breakMin}분</span>
          <button
            style={styles.stepBtn}
            onClick={() => updateBreakMin(Math.min(99, breakMin + 1))}
          >
            +
          </button>
        </div>
      </div>

      <PushToggle />
    </div>
  );
}

function PushToggle() {
  const supported = "serviceWorker" in navigator && "PushManager" in window;
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "denied">(
    !supported ? "denied" : "idle"
  );

  const handle = async () => {
    setStatus("loading");
    const granted = await requestNotificationPermission();
    if (!granted) { setStatus("denied"); return; }
    const ok = await subscribeToPush();
    setStatus(ok ? "done" : "denied");
  };

  const label =
    status === "loading" ? "설정 중…"
    : status === "done"  ? "✅ 알림 설정 완료"
    : status === "denied"? "🚫 알림 권한 없음"
    : "🔔 매일 저녁 알림 받기";

  return (
    <div style={{ marginTop: 10 }}>
      <button
        style={{
          width: "100%",
          padding: "8px 0",
          borderRadius: 12,
          border: "1.5px solid var(--th-p200)",
          background: status === "done" ? "var(--th-p100)" : "var(--th-step-bg)",
          color: "var(--th-p700)",
          fontSize: 12,
          fontWeight: 600,
          cursor: status === "idle" ? "pointer" : "default",
        }}
        onClick={status === "idle" ? handle : undefined}
        disabled={status !== "idle"}
      >
        {label}
      </button>
    </div>
  );
}
