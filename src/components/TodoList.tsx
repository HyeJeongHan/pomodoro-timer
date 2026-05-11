import { useRef, useState } from "react";
import type { Task } from "../utils/tasks";

type Props = {
  tasks: Task[];
  onAdd: (text: string) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
};

export default function TodoList({ tasks, onAdd, onToggle, onDelete }: Props) {
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
        <span style={s.arrow}>{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div style={s.body}>
          {tasks.length === 0 && (
            <p style={s.empty}>아직 할 일이 없어요. 추가해보세요!</p>
          )}

          {tasks.map((task) => (
            <div key={task.id} style={s.row}>
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
              <button style={s.del} onClick={() => onDelete(task.id)}>
                ×
              </button>
            </div>
          ))}

          <div style={s.addRow}>
            <input
              ref={inputRef}
              style={s.input}
              placeholder="할 일 추가 후 Enter"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
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
