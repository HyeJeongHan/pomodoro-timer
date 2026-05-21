import { useState, useRef, useEffect } from "react";
import { useTimer } from "./hooks/useTimer";
import { requestNotificationPermission } from "./utils/notifications";
import { useTasks } from "./hooks/useTasks";
import { THEMES } from "./themes";
import CircleTimer from "./components/CircleTimer";
import ModeTab from "./components/ModeTab";
import Controls from "./components/Controls";
import Settings from "./components/Settings";
import ShareCard from "./components/ShareCard";
import DailyGoal from "./components/DailyGoal";
import ActiveTaskBanner from "./components/ActiveTaskBanner";
import TaskSelectModal from "./components/TaskSelectModal";
import RightPanel from "./components/RightPanel";
import { calcWeeklyStats } from "./utils/weeklyStats";
import { loadSessionLog, saveSessionLog, appendSessionEntry, type SessionLog } from "./utils/sessionLog";
import { today } from "./utils/date";
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
  const shareRef = useRef<HTMLDivElement>(null);
  const prevDoneRef = useRef(false);

  const weeklyStats = calcWeeklyStats(timer.sessionHistory, timer.focusMin);
  const [sessionLog, setSessionLog] = useState<SessionLog>(loadSessionLog);


  useEffect(() => {
    if (showShare && shareRef.current) {
      shareRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [showShare]);

  useEffect(() => {
    if (timer.done && !prevDoneRef.current && timer.timerMode === "focus") {
      if (activeTaskId) addSessionToTask(activeTaskId);

      const activeTask = tasks.find((t) => t.id === activeTaskId) ?? null;
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, "0");
      const mm = String(now.getMinutes()).padStart(2, "0");
      setSessionLog((prev) => {
        const next = appendSessionEntry(prev, today(), {
          taskId: activeTaskId,
          taskText: activeTask?.text ?? null,
          time: `${hh}:${mm}`,
        });
        saveSessionLog(next);
        return next;
      });
    }
    prevDoneRef.current = timer.done;
  }, [timer.done, timer.timerMode, activeTaskId, addSessionToTask, tasks]);

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
            {showShare ? (
              <div ref={shareRef}>
                <ShareCard
                  stats={weeklyStats}
                  streak={timer.streak}
                  focusMin={timer.focusMin}
                  themeVars={currentTheme.vars}
                />
              </div>
            ) : (
              <RightPanel
                tasks={tasks}
                activeTaskId={activeTaskId}
                deleteConfirmId={deleteConfirmId}
                onAddTask={addTask}
                onToggleTask={toggleTask}
                onDeleteTask={handleDeleteTask}
                onDeleteConfirm={handleDeleteConfirm}
                onDeleteCancel={() => setDeleteConfirmId(null)}
                onSelectTask={handleListSelect}
                sessionHistory={timer.sessionHistory}
                sessionLog={sessionLog}
                totalSessions={timer.totalSessions}
                focusMin={timer.focusMin}
              />
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

      {timer.showSettings && (
        <div className="settings-overlay" onClick={timer.closeSettings}>
          <div className="settings-dialog" onClick={(e) => e.stopPropagation()}>
            <div style={settingsDialogHeader}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--th-p700)" }}>⚙️ 설정</span>
              <button style={settingsCloseBtn} onClick={timer.closeSettings}>✕</button>
            </div>
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
        </div>
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
        .app-col-right {
          margin-top: 20px;
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
            margin-top: 0;
          }
        }
        .settings-overlay {
          position: fixed;
          inset: 0;
          z-index: 200;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.35);
          backdrop-filter: blur(3px);
          padding: 20px;
        }
        .settings-dialog {
          background: var(--th-card-bg);
          border-radius: 20px;
          border: 1.5px solid var(--th-p200);
          width: 100%;
          max-width: 320px;
          max-height: 85vh;
          overflow-y: auto;
          box-shadow: 0 12px 40px rgba(0,0,0,0.18);
          animation: dialogIn 0.18s ease;
        }
        @keyframes dialogIn {
          from { opacity: 0; transform: scale(0.95) translateY(6px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}

const settingsDialogHeader: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "14px 16px 0",
};

const settingsCloseBtn: React.CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  fontSize: 16,
  color: "var(--th-text-label)",
  padding: "2px 4px",
  borderRadius: 6,
  lineHeight: 1,
};

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
