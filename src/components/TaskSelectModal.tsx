import { useState } from "react";
import type { Task } from "../utils/tasks";

type Props = {
  tasks: Task[];
  mode?: "start" | "replace";
  onSelect: (id: string) => void;
  onAddAndSelect: (text: string) => void;
  onStartWithoutGoal: () => void;
  onClearAndContinue?: () => void;
  onCancel: () => void;
};

export default function TaskSelectModal({
  tasks,
  mode = "start",
  onSelect,
  onAddAndSelect,
  onStartWithoutGoal,
  onClearAndContinue,
  onCancel,
}: Props) {
  const [input, setInput] = useState("");
  const activeTasks = tasks.filter((t) => !t.done);
  const hasTask = activeTasks.length > 0;
  const isReplace = mode === "replace";

  const handleAdd = () => {
    if (!input.trim()) return;
    onAddAndSelect(input.trim());
  };

  return (
    <div style={s.overlay} onClick={onCancel}>
      <div style={s.sheet} onClick={(e) => e.stopPropagation()}>
        {hasTask ? (
          <>
            <p style={s.title}>{isReplace ? "목표를 교체할까요?" : "어떤 할 일을 할까요?"}</p>
            <div style={s.list}>
              {activeTasks.map((task) => (
                <button key={task.id} style={s.taskBtn} onClick={() => onSelect(task.id)}>
                  <span style={s.taskText}>{task.text}</span>
                  {(task.sessions ?? 0) > 0 && (
                    <span style={s.badge}>{task.sessions}세션</span>
                  )}
                </button>
              ))}
            </div>
            {isReplace && onClearAndContinue && (
              <button style={s.startDefault} onClick={onClearAndContinue}>
                목표 없이 계속
              </button>
            )}
            <button style={s.cancelBtn} onClick={onCancel}>취소</button>
          </>
        ) : (
          <>
            <p style={s.title}>{isReplace ? "교체할 목표가 없어요" : "집중할 목표가 없어요"}</p>
            <p style={s.sub}>
              {isReplace ? "할 일을 추가하거나, 목표 없이 계속하세요" : "할 일을 추가하거나, 바로 시작해보세요"}
            </p>
            <div style={s.addRow}>
              <input
                style={s.input}
                placeholder="할 일 입력..."
                value={input}
                autoFocus
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && !e.nativeEvent.isComposing && handleAdd()
                }
              />
              <button style={s.addBtn} onClick={handleAdd}>+</button>
            </div>
            {isReplace ? (
              onClearAndContinue && (
                <button style={s.startDefault} onClick={onClearAndContinue}>
                  목표 없이 계속
                </button>
              )
            ) : (
              <button style={s.startDefault} onClick={onStartWithoutGoal}>
                오늘도 화이팅!으로 시작
              </button>
            )}
            <button style={s.cancelBtn} onClick={onCancel}>취소</button>
          </>
        )}
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.35)",
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
    zIndex: 100,
    padding: "0 0 24px",
  },
  sheet: {
    width: "100%",
    maxWidth: 400,
    background: "var(--th-card-bg)",
    borderRadius: "20px 20px 16px 16px",
    padding: "20px 16px 16px",
    display: "flex",
    flexDirection: "column",
    gap: 8,
    backdropFilter: "blur(12px)",
    boxShadow: "0 -4px 24px rgba(0,0,0,0.12)",
  },
  title: {
    margin: 0,
    fontSize: 15,
    fontWeight: 700,
    color: "var(--th-p800)",
    textAlign: "center",
    paddingBottom: 4,
  },
  sub: {
    margin: 0,
    fontSize: 12,
    color: "var(--th-text-label)",
    textAlign: "center",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    maxHeight: 240,
    overflowY: "auto",
  },
  taskBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 14px",
    borderRadius: 12,
    border: "1.5px solid var(--th-p100)",
    background: "var(--th-step-bg)",
    cursor: "pointer",
    textAlign: "left",
    transition: "background 0.15s",
  },
  taskText: {
    fontSize: 13,
    fontWeight: 600,
    color: "var(--th-text-val)",
    flex: 1,
  },
  badge: {
    fontSize: 10,
    fontWeight: 700,
    color: "var(--th-p600)",
    background: "var(--th-p100)",
    padding: "2px 7px",
    borderRadius: 20,
    marginLeft: 8,
    flexShrink: 0,
  },
  addRow: {
    display: "flex",
    gap: 6,
  },
  input: {
    flex: 1,
    padding: "9px 12px",
    borderRadius: 12,
    border: "1.5px solid var(--th-p200)",
    background: "var(--th-step-bg)",
    fontSize: 13,
    color: "var(--th-text-val)",
    outline: "none",
  },
  addBtn: {
    width: 40,
    borderRadius: 12,
    border: "1.5px solid var(--th-p200)",
    background: "var(--th-p100)",
    color: "var(--th-p700)",
    fontSize: 20,
    fontWeight: 700,
    cursor: "pointer",
    flexShrink: 0,
  },
  startDefault: {
    padding: "10px 0",
    borderRadius: 12,
    border: "1.5px solid var(--th-p200)",
    background: "var(--th-p50)",
    color: "var(--th-p700)",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },
  cancelBtn: {
    padding: "9px 0",
    borderRadius: 12,
    border: "none",
    background: "none",
    color: "var(--th-text-label)",
    fontSize: 13,
    cursor: "pointer",
  },
};
