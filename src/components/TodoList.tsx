import { useRef, useState } from "react";
import type { Task } from "../utils/tasks";

type Props = {
  tasks: Task[];
  activeTaskId: string | null;
  deleteConfirmId: string | null;
  onAdd: (text: string) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onDeleteConfirm: () => void;
  onDeleteCancel: () => void;
  onSelect: (id: string) => void;
};

function SessionDots({ count }: { count: number }) {
  const display = Math.min(count, 5);
  const overflow = count - 5;
  return (
    <span style={s.dots}>
      {Array.from({ length: display }).map((_, i) => (
        <span key={i} style={s.dot}>●</span>
      ))}
      {overflow > 0 && <span style={s.overflow}>+{overflow}</span>}
    </span>
  );
}

export default function TodoList({ tasks, activeTaskId, deleteConfirmId, onAdd, onToggle, onDelete, onDeleteConfirm, onDeleteCancel, onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const doneCount = tasks.filter((t) => t.done).length;

  const submit = () => {
    if (!input.trim()) return;
    onAdd(input);
    setInput("");
  };

  return (
    <div style={s.wrap}>
      <button
        style={s.toggle}
        onClick={() => {
          setOpen((o) => {
            if (!o) setTimeout(() => inputRef.current?.focus(), 50);
            return !o;
          });
        }}
      >
        <span>📋</span>
        <span style={s.toggleLabel}>
          {tasks.length === 0
            ? "오늘의 할 일"
            : `할 일 ${doneCount}/${tasks.length} 완료`}
        </span>
        {activeTaskId && tasks.find((t) => t.id === activeTaskId) && (
          <span style={s.activePill}>🎯 집중 중</span>
        )}
        <span style={s.arrow}>{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div style={s.body}>
          {tasks.length === 0 && (
            <p style={s.empty}>아직 할 일이 없어요. 추가해보세요!</p>
          )}

          {tasks.map((task) => {
            const isActive = task.id === activeTaskId;
            const isConfirming = task.id === deleteConfirmId;
            return (
              <div key={task.id}>
                <div style={{ ...s.row, ...(isActive ? s.activeRow : {}) }}>
                  <button
                    style={{ ...s.focusBtn, ...(isActive ? s.focusBtnActive : {}) }}
                    onClick={() => onSelect(task.id)}
                    title={isActive ? "집중 해제" : "집중할 작업으로 설정"}
                  >
                    {isActive ? "🎯" : "○"}
                  </button>
                  <button style={s.check} onClick={() => onToggle(task.id)}>
                    {task.done ? "✅" : "⬜"}
                  </button>
                  <span
                    style={{
                      ...s.taskText,
                      textDecoration: task.done ? "line-through" : "none",
                      opacity: task.done ? 0.45 : 1,
                    }}
                  >
                    {task.text}
                  </span>
                  <SessionDots count={task.sessions ?? 0} />
                  <button style={s.del} onClick={() => onDelete(task.id)}>
                    ×
                  </button>
                </div>
                {isConfirming && (
                  <div style={s.confirmRow}>
                    <span style={s.confirmText}>삭제하면 타이머가 멈춰요</span>
                    <button style={s.confirmCancel} onClick={onDeleteCancel}>취소</button>
                    <button style={s.confirmDel} onClick={onDeleteConfirm}>삭제</button>
                  </div>
                )}
              </div>
            );
          })}

          <div style={s.addRow}>
            <input
              ref={inputRef}
              style={s.input}
              placeholder="할 일 추가 후 Enter"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.nativeEvent.isComposing && submit()}
            />
            <button style={s.addBtn} onClick={submit}>
              +
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  wrap: {
    marginTop: 10,
    borderRadius: 16,
    border: "1.5px solid var(--th-p100)",
    overflow: "hidden",
    background: "var(--th-settings-bg)",
  },
  toggle: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "9px 12px",
    background: "none",
    border: "none",
    cursor: "pointer",
    textAlign: "left",
  },
  toggleLabel: {
    flex: 1,
    fontSize: 12,
    fontWeight: 700,
    color: "var(--th-p700)",
  },
  activePill: {
    fontSize: 10,
    fontWeight: 700,
    color: "var(--th-p600)",
    background: "var(--th-p100)",
    padding: "2px 7px",
    borderRadius: 20,
  },
  arrow: {
    fontSize: 10,
    color: "var(--th-text-label)",
  },
  body: {
    borderTop: "1px solid var(--th-p100)",
    padding: "8px 10px 10px",
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  empty: {
    margin: "2px 0 6px",
    fontSize: 11,
    color: "var(--th-text-label)",
    textAlign: "center",
  },
  row: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "3px 4px",
    borderRadius: 10,
    transition: "background 0.15s",
  },
  activeRow: {
    background: "var(--th-p50)",
    outline: "1.5px solid var(--th-p200)",
  },
  check: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: 14,
    padding: 0,
    flexShrink: 0,
  },
  taskText: {
    flex: 1,
    fontSize: 12,
    color: "var(--th-text-val)",
    lineHeight: 1.4,
    wordBreak: "break-all",
  },
  dots: {
    display: "flex",
    alignItems: "center",
    gap: 1,
    flexShrink: 0,
  },
  dot: {
    fontSize: 7,
    color: "var(--th-p400)",
    lineHeight: 1,
  },
  overflow: {
    fontSize: 9,
    color: "var(--th-p600)",
    fontWeight: 700,
  },
  focusBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: 13,
    padding: "0 2px",
    flexShrink: 0,
    opacity: 0.25,
    lineHeight: 1,
    transition: "opacity 0.15s",
  },
  focusBtnActive: {
    opacity: 1,
  },
  confirmRow: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "5px 4px 3px",
    marginTop: -2,
  },
  confirmText: {
    flex: 1,
    fontSize: 11,
    color: "var(--th-p600)",
    fontWeight: 600,
  },
  confirmCancel: {
    fontSize: 11,
    padding: "3px 8px",
    borderRadius: 8,
    border: "1.5px solid var(--th-p200)",
    background: "none",
    color: "var(--th-text-label)",
    cursor: "pointer",
    fontWeight: 600,
  },
  confirmDel: {
    fontSize: 11,
    padding: "3px 8px",
    borderRadius: 8,
    border: "none",
    background: "var(--th-p400)",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 700,
  },
  del: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: 15,
    color: "var(--th-text-label)",
    padding: "0 2px",
    flexShrink: 0,
    lineHeight: 1,
    opacity: 0.6,
  },
  addRow: {
    display: "flex",
    gap: 6,
    marginTop: 4,
  },
  input: {
    flex: 1,
    padding: "6px 10px",
    borderRadius: 10,
    border: "1.5px solid var(--th-p100)",
    background: "var(--th-step-bg)",
    fontSize: 12,
    color: "var(--th-text-val)",
    outline: "none",
  },
  addBtn: {
    width: 30,
    height: 30,
    borderRadius: 10,
    border: "1.5px solid var(--th-p200)",
    background: "var(--th-p100)",
    color: "var(--th-p700)",
    fontSize: 18,
    cursor: "pointer",
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
};
