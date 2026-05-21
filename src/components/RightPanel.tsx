import { useState } from "react";
import type { Task } from "../types";
import type { SessionLog } from "../utils/sessionLog";
import TodoList from "./TodoList";
import Calendar from "./Calendar";
import HistoryList from "./HistoryList";
import BadgeDisplay from "./BadgeDisplay";
import StatsPanel from "./StatsPanel";

type Tab = "todo" | "history" | "stats" | "badge";

const TABS: { id: Tab; emoji: string; label: string }[] = [
  { id: "todo",    emoji: "📝", label: "할 일" },
  { id: "history", emoji: "📋", label: "기록"  },
  { id: "stats",   emoji: "📊", label: "통계"  },
  { id: "badge",   emoji: "🏅", label: "배지"  },
];

type Props = {
  tasks: Task[];
  activeTaskId: string | null;
  deleteConfirmId: string | null;
  onAddTask: (text: string) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onDeleteConfirm: () => void;
  onDeleteCancel: () => void;
  onSelectTask: (id: string) => void;
  sessionHistory: Record<string, number>;
  sessionLog: SessionLog;
  totalSessions: number;
  focusMin: number;
};

export default function RightPanel({
  tasks, activeTaskId, deleteConfirmId,
  onAddTask, onToggleTask, onDeleteTask, onDeleteConfirm, onDeleteCancel, onSelectTask,
  sessionHistory, sessionLog, totalSessions, focusMin,
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("todo");

  return (
    <div>
      {/* 탭 바 */}
      <div style={s.tabBar}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            style={{ ...s.tabBtn, ...(activeTab === tab.id ? s.tabBtnActive : {}) }}
            onClick={() => setActiveTab(tab.id)}
          >
            <span>{tab.emoji}</span>
            <span style={s.tabLabel}>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 패널 */}
      {activeTab === "todo" && (
        <TodoList
          tasks={tasks}
          activeTaskId={activeTaskId}
          deleteConfirmId={deleteConfirmId}
          onAdd={onAddTask}
          onToggle={onToggleTask}
          onDelete={onDeleteTask}
          onDeleteConfirm={onDeleteConfirm}
          onDeleteCancel={onDeleteCancel}
          onSelect={onSelectTask}
        />
      )}
      {activeTab === "history" && (
        <>
          <Calendar sessionHistory={sessionHistory} />
          <HistoryList
            sessionHistory={sessionHistory}
            sessionLog={sessionLog}
            tasks={tasks}
          />
        </>
      )}
      {activeTab === "stats" && (
        <div style={s.statsWrap}>
          <StatsPanel
            sessionHistory={sessionHistory}
            sessionLog={sessionLog}
            focusMin={focusMin}
          />
        </div>
      )}
      {activeTab === "badge" && (
        <BadgeDisplay totalSessions={totalSessions} />
      )}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  tabBar: {
    display: "flex",
    gap: 3,
    marginBottom: 10,
    padding: "4px",
    background: "var(--th-p50)",
    borderRadius: 12,
    border: "1.5px solid var(--th-p100)",
  },
  tabBtn: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    padding: "6px 2px",
    borderRadius: 9,
    border: "none",
    background: "none",
    color: "var(--th-text-label)",
    fontSize: 11,
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.15s",
  },
  tabBtnActive: {
    background: "white",
    color: "var(--th-p700)",
    fontWeight: 700,
    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
  },
  tabLabel: {
    fontSize: 11,
  },
  statsWrap: {
    background: "var(--th-settings-bg)",
    borderRadius: 16,
    border: "1.5px solid var(--th-p100)",
    padding: "2px 8px 8px",
  },
};
