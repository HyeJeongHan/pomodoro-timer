import { useTimer } from "./hooks/useTimer";
import { THEMES } from "./themes";
import CircleTimer from "./components/CircleTimer";
import ModeTab from "./components/ModeTab";
import Controls from "./components/Controls";
import Settings from "./components/Settings";
import styles from "./styles";

export default function App() {
  const timer = useTimer();
  const currentTheme = THEMES.find((t) => t.name === timer.theme)!;

  return (
    <div style={{ ...styles.page, ...(currentTheme.vars as React.CSSProperties) }}>
      <div style={styles.card}>
        <div style={styles.header}>
          <span style={styles.title}>뽀모도로 🍅</span>
          <button
            style={styles.iconBtn}
            onClick={() => timer.setShowSettings((s) => !s)}
            title="설정"
          >
            ⚙️
          </button>
        </div>

        <ModeTab mode={timer.mode} onSwitch={timer.switchMode} />

        <CircleTimer
          mode={timer.mode}
          progress={timer.progress}
          emoji={timer.emoji}
          mm={timer.mm}
          ss={timer.ss}
          done={timer.done}
          wiggle={timer.wiggle}
        />

        <Controls
          mode={timer.mode}
          running={timer.running}
          done={timer.done}
          onToggle={() => timer.setRunning((r) => !r)}
          onReset={timer.reset}
          onRestart={timer.restart}
        />

        <div style={styles.sessionBadge}>
          {"🍅".repeat(Math.min(timer.todaySessions, 8))}
          {timer.todaySessions > 0 && (
            <span style={{ marginLeft: 6 }}>오늘 {timer.todaySessions}세션 완료</span>
          )}
          {timer.todaySessions === 0 && "오늘 아직 완료한 세션이 없어요"}
        </div>

        {timer.showSettings && (
          <Settings
            mode={timer.mode}
            focusMin={timer.focusMin}
            breakMin={timer.breakMin}
            setFocusMin={timer.setFocusMin}
            setBreakMin={timer.setBreakMin}
            setTimeLeft={timer.setTimeLeft}
            theme={timer.theme}
            setTheme={timer.setTheme}
          />
        )}
      </div>

      <style>{`
        @keyframes wiggle {
          0%,100% { transform: rotate(0deg) scale(1); }
          25% { transform: rotate(-4deg) scale(1.05); }
          75% { transform: rotate(4deg) scale(1.05); }
        }
        body { margin: 0; }
      `}</style>
    </div>
  );
}
