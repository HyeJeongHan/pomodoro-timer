import { useState, useRef, useEffect } from "react";
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
import ActiveTaskBanner from "./components/ActiveTaskBanner";
import TaskSelectModal from "./components/TaskSelectModal";
import { calcWeeklyStats } from "./utils/weeklyStats";
import styles from "./styles";

export default function App() {
  const timer = useTimer();
  const { tasks, addTask, toggleTask, deleteTask, activeTaskId, selectTask, clearActiveTask, addSessionToTask, addAndSelectTask } = useTasks();
  const currentTheme = THEMES.find((t) => t.name === timer.theme)!;
  const [showShare, setShowShare] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showModeConflict, setShowModeConflict] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isReplacing, setIsReplacing] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);
  const shareRef = useRef<HTMLDivElement>(null);
  const prevDoneRef = useRef(false);

  const weeklyStats = calcWeeklyStats(timer.sessionHistory, timer.focusMin);

  useEffect(() => {
    if (timer.showSettings && settingsRef.current) {
      settingsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [timer.showSettings]);

  useEffect(() => {
    if (showShare && shareRef.current) {
      shareRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [showShare]);

  useEffect(() => {
    if (timer.done && !prevDoneRef.current && timer.timerMode === "focus" && activeTaskId) {
      addSessionToTask(activeTaskId);
    }
    prevDoneRef.current = timer.done;
  }, [timer.done, timer.timerMode, activeTaskId, addSessionToTask]);

  const handleShareToggle = () => {
    setShowShare((s) => !s);
    timer.closeSettings();
  };

  const handleSettingsToggle = () => {
    timer.toggleSettings();
    setShowShare(false);
  };

  const handleStartClick = () => {
    // 일시정지
    if (timer.running && timer.mode === timer.timerMode) {
      timer.toggle();
      return;
    }
    // 다른 모드 타이머가 실행 중인데 시작 버튼 클릭 → 경고
    if (timer.running && timer.mode !== timer.timerMode) {
      setShowModeConflict(true);
      return;
    }
    // 완료 후 다시하기
    if (timer.done) {
      timer.restart();
      return;
    }
    // 일시정지 상태 → 모달 없이 그냥 재개
    if (timer.paused) {
      requestNotificationPermission();
      timer.toggle();
      return;
    }
    // 휴식 모드는 바로 시작 (작업 선택 불필요)
    if (timer.mode === "break") {
      requestNotificationPermission();
      timer.toggle();
      return;
    }
    // 집중 모드 최초 시작: 작업 선택 모달
    setShowTaskModal(true);
  };

  // 경고 확인 후 현재 탭 모드로 강제 전환하여 시작
  const handleModeConflictConfirm = () => {
    setShowModeConflict(false);
    timer.reset(); // 현재 탭 모드로 리셋
    if (timer.mode === "break") {
      requestNotificationPermission();
      timer.toggle();
    } else {
      setShowTaskModal(true);
    }
  };

  const handleTaskSelect = (id: string) => {
    selectTask(id);
    setShowTaskModal(false);
    requestNotificationPermission();
    timer.toggle();
  };

  const handleAddAndSelect = (text: string) => {
    addAndSelectTask(text);
    setShowTaskModal(false);
    requestNotificationPermission();
    timer.toggle();
  };

  const handleStartWithoutGoal = () => {
    addAndSelectTask("오늘도 화이팅!");
    setShowTaskModal(false);
    requestNotificationPermission();
    timer.toggle();
  };

  const handleDeleteTask = (id: string) => {
    if (id === activeTaskId && (timer.running || timer.paused)) {
      setDeleteConfirmId(id);
      return;
    }
    deleteTask(id);
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirmId) {
      deleteTask(deleteConfirmId);
      timer.reset();
      setDeleteConfirmId(null);
    }
  };

  // 배너 × 클릭: 타이머 실행/일시정지 중이면 교체 모달, 아니면 그냥 해제
  const handleBannerClear = () => {
    if (timer.running || timer.paused) {
      setIsReplacing(true);
    } else {
      clearActiveTask();
    }
  };

  // 목록에서 직접 선택: 타이머 실행 여부 무관하게 activeTask만 교체
  const handleListSelect = (id: string) => {
    if (id === activeTaskId) {
      // 이미 선택된 항목 클릭 → 배너 × 와 동일하게 처리
      handleBannerClear();
    } else {
      selectTask(id);
    }
  };

  // 교체 모달에서 작업 선택 — 타이머는 그대로 유지
  const handleReplaceSelect = (id: string) => {
    selectTask(id);
    setIsReplacing(false);
  };

  const handleReplaceAddAndSelect = (text: string) => {
    addAndSelectTask(text);
    setIsReplacing(false);
  };

  const conflictModeLabel = timer.timerMode === "focus" ? "집중" : "휴식";

  return (
    <div style={{ ...styles.page, ...(currentTheme.vars as React.CSSProperties) }}>
      <div style={styles.card} className="app-card">
        <div style={styles.header}>
          <span style={styles.title}>뽀모도로 🍅</span>
          <div style={{ display: "flex", gap: 4 }}>
            <button style={styles.iconBtn} onClick={handleShareToggle} title="공유">
              📤
            </button>
            <button style={styles.iconBtn} onClick={handleSettingsToggle} title="설정">
              ⚙️
            </button>
          </div>
        </div>

        <div className="app-body">
          <div className="app-col-left">
            <ModeTab
              mode={timer.mode}
              onSwitch={(next) => {
                setShowModeConflict(false);
                timer.switchMode(next);
              }}
            />

            <CircleTimer
              mode={timer.timerMode}
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
              onToggle={handleStartClick}
              onReset={timer.reset}
              onRestart={timer.restart}
            />

            {showModeConflict && (
              <div style={conflictStyle.wrap}>
                <span style={conflictStyle.text}>
                  ⚠️ {conflictModeLabel} 타이머가 실행 중이에요. 시작하면 {conflictModeLabel} 타이머가 리셋됩니다.
                </span>
                <div style={conflictStyle.btns}>
                  <button style={conflictStyle.cancel} onClick={() => setShowModeConflict(false)}>
                    취소
                  </button>
                  <button style={conflictStyle.confirm} onClick={handleModeConflictConfirm}>
                    시작하기
                  </button>
                </div>
              </div>
            )}

            <ActiveTaskBanner
              task={tasks.find((t) => t.id === activeTaskId) ?? null}
              onClear={handleBannerClear}
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
          </div>

          <div className="app-col-right">
            <TodoList
              tasks={tasks}
              activeTaskId={activeTaskId}
              deleteConfirmId={deleteConfirmId}
              onAdd={addTask}
              onToggle={toggleTask}
              onDelete={handleDeleteTask}
              onDeleteConfirm={handleDeleteConfirm}
              onDeleteCancel={() => setDeleteConfirmId(null)}
              onSelect={handleListSelect}
            />

            <BadgeDisplay totalSessions={timer.totalSessions} />

            <Calendar sessionHistory={timer.sessionHistory} />

            {showShare && (
              <div ref={shareRef}>
                <ShareCard
                  stats={weeklyStats}
                  streak={timer.streak}
                  focusMin={timer.focusMin}
                  themeVars={currentTheme.vars}
                />
              </div>
            )}

            {timer.showSettings && (
              <div ref={settingsRef}>
                <Settings
                  focusMin={timer.focusMin}
                  breakMin={timer.breakMin}
                  updateFocusMin={timer.updateFocusMin}
                  updateBreakMin={timer.updateBreakMin}
                  theme={timer.theme}
                  setTheme={timer.setTheme}
                  dailyGoal={timer.dailyGoal}
                  setDailyGoal={timer.setDailyGoal}
                  devMode={timer.devMode}
                  setDevMode={timer.setDevMode}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {showTaskModal && (
        <TaskSelectModal
          tasks={tasks}
          onSelect={handleTaskSelect}
          onAddAndSelect={handleAddAndSelect}
          onStartWithoutGoal={handleStartWithoutGoal}
          onCancel={() => setShowTaskModal(false)}
        />
      )}

      {isReplacing && (
        <TaskSelectModal
          tasks={tasks}
          mode="replace"
          onSelect={handleReplaceSelect}
          onAddAndSelect={handleReplaceAddAndSelect}
          onStartWithoutGoal={() => {}}
          onClearAndContinue={() => { clearActiveTask(); setIsReplacing(false); }}
          onCancel={() => setIsReplacing(false)}
        />
      )}

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

        .app-card {
          width: calc(100vw - 32px);
          max-width: 340px;
        }
        .app-body {
          display: flex;
          flex-direction: column;
        }
        @media (min-width: 640px) {
          .app-card {
            max-width: 800px;
            width: calc(100vw - 48px);
          }
          .app-body {
            flex-direction: row;
            align-items: flex-start;
            gap: 28px;
          }
          .app-col-left {
            width: 284px;
            flex-shrink: 0;
          }
          .app-col-right {
            flex: 1;
            min-width: 0;
          }
        }
      `}</style>
    </div>
  );
}

const conflictStyle: Record<string, React.CSSProperties> = {
  wrap: {
    marginTop: 8,
    padding: "10px 14px",
    borderRadius: 14,
    background: "var(--th-p50)",
    border: "1.5px solid var(--th-p200)",
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  text: {
    fontSize: 12,
    color: "var(--th-p800)",
    lineHeight: 1.5,
    fontWeight: 500,
  },
  btns: {
    display: "flex",
    gap: 8,
  },
  cancel: {
    flex: 1,
    padding: "7px 0",
    borderRadius: 10,
    border: "1.5px solid var(--th-p200)",
    background: "none",
    color: "var(--th-text-label)",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
  },
  confirm: {
    flex: 1,
    padding: "7px 0",
    borderRadius: 10,
    border: "none",
    background: "linear-gradient(135deg, var(--th-p300), var(--th-p400))",
    color: "#fff",
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
  },
};
