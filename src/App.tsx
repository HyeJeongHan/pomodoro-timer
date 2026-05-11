import { useState } from "react";
import { useTimer } from "./hooks/useTimer";
import { requestNotificationPermission } from "./utils/notifications";
import { useTasks } from "./hooks/useTasks";
import { THEMES } from "./themes";
import CircleTimer from "./components/CircleTimer";
import ModeTab from "./components/ModeTab";
import Controls from "./components/Controls";
import Settings from "./components/Settings";
import Calendar from "./components/Calendar";
import ShareCard from "./components/ShareCard";
import BadgeDisplay from "./components/BadgeDisplay";
import DailyGoal from "./components/DailyGoal";
import TodoList from "./components/TodoList";
import { calcWeeklyStats } from "./utils/weeklyStats";
import styles from "./styles";

export default function App() {
  const timer = useTimer();
  const { tasks, addTask, toggleTask, deleteTask } = useTasks();
  const currentTheme = THEMES.find((t) => t.name === timer.theme)!;
  const [showShare, setShowShare] = useState(false);

  const weeklyStats = calcWeeklyStats(timer.sessionHistory, timer.focusMin);

  return (
    <div style={{ ...styles.page, ...(currentTheme.vars as React.CSSProperties) }}>
      <div style={styles.card}>
        <div style={styles.header}>
          <span style={styles.title}>뽀모도로 🍅</span>
          <div style={{ display: "flex", gap: 4 }}>
            <button
              style={styles.iconBtn}
              onClick={() => { setShowShare((s) => !s); timer.setShowSettings(() => false); }}
              title="공유"
            >
              📤
            </button>
            <button
              style={styles.iconBtn}
              onClick={() => { timer.setShowSettings((s) => !s); setShowShare(false); }}
              title="설정"
            >
              ⚙️
            </button>
          </div>
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
          onToggle={() => {
            if (!timer.running) requestNotificationPermission();
            timer.setRunning((r) => !r);
          }}
          onReset={timer.reset}
          onRestart={timer.restart}
        />

        <DailyGoal
          todaySessions={timer.todaySessions}
          dailyGoal={timer.dailyGoal}
        />

        {timer.streak > 0 && (
          <div style={styles.streakBadge}>
            <span style={{ fontSize: 16 }}>🔥</span>
            <span style={styles.streakText}>{timer.streak}일 연속 집중 중!</span>
          </div>
        )}

        <TodoList
          tasks={tasks}
          onAdd={addTask}
          onToggle={toggleTask}
          onDelete={deleteTask}
        />

        <BadgeDisplay totalSessions={timer.totalSessions} />

        <Calendar sessionHistory={timer.sessionHistory} />

        {showShare && (
          <ShareCard
            stats={weeklyStats}
            streak={timer.streak}
            focusMin={timer.focusMin}
            themeVars={currentTheme.vars}
          />
        )}

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
            dailyGoal={timer.dailyGoal}
            setDailyGoal={timer.setDailyGoal}
          />
        )}
      </div>

      <style>{`
        @keyframes wiggle {
          0%,100% { transform: rotate(0deg) scale(1); }
          25% { transform: rotate(-4deg) scale(1.05); }
          75% { transform: rotate(4deg) scale(1.05); }
        }
        @keyframes badgePop {
          0%   { transform: scale(1); }
          30%  { transform: scale(1.5) rotate(-10deg); }
          60%  { transform: scale(1.3) rotate(8deg); }
          100% { transform: scale(1); }
        }
        body { margin: 0; }
      `}</style>
    </div>
  );
}
