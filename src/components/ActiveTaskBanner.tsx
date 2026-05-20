import type { Task } from "../utils/tasks";

type Props = {
  task: Task | null;
  onClear: () => void;
};

export default function ActiveTaskBanner({ task, onClear }: Props) {
  if (!task) return null;

  return (
    <div style={s.wrap}>
      <span style={s.label}>집중 중</span>
      <span style={s.text}>{task.text}</span>
      <span style={s.sessions}>{task.sessions ?? 0}세션</span>
      <button style={s.clear} onClick={onClear} title="선택 해제">
        ×
      </button>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  wrap: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    margin: "8px 0 2px",
    padding: "6px 12px",
    borderRadius: 12,
    background: "var(--th-p50)",
    border: "1.5px solid var(--th-p200)",
  },
  label: {
    fontSize: 10,
    fontWeight: 700,
    color: "var(--th-p600)",
    flexShrink: 0,
  },
  text: {
    flex: 1,
    fontSize: 12,
    fontWeight: 600,
    color: "var(--th-p800)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  sessions: {
    fontSize: 10,
    fontWeight: 700,
    color: "var(--th-p400)",
    flexShrink: 0,
  },
  clear: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: 15,
    color: "var(--th-text-label)",
    padding: "0 2px",
    lineHeight: 1,
    flexShrink: 0,
    opacity: 0.6,
  },
};
