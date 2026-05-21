import { useState, useMemo } from "react";
import type { Task } from "../types";
import type { SessionLog } from "../utils/sessionLog";

type Props = {
  sessionHistory: Record<string, number>;
  sessionLog: SessionLog;
  tasks: Task[];
};

const PAGE_SIZE = 7;
const PREVIEW_COUNT = 3;
const DAY_KR = ["일", "월", "화", "수", "목", "금", "토"];

function formatDateLabel(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return `${d.getMonth() + 1}/${d.getDate()} (${DAY_KR[d.getDay()]})`;
}

export default function HistoryList({ sessionHistory, sessionLog, tasks }: Props) {
  const [page, setPage] = useState(0);
  const [filterTaskId, setFilterTaskId] = useState<string | null>(null);
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());

  const allDates = useMemo(
    () =>
      Object.keys(sessionHistory)
        .filter((d) => sessionHistory[d] > 0)
        .sort((a, b) => b.localeCompare(a)),
    [sessionHistory]
  );

  const filteredDates = useMemo(() => {
    if (!filterTaskId) return allDates;
    return allDates.filter((date) =>
      (sessionLog[date] ?? []).some((e) => e.taskId === filterTaskId)
    );
  }, [allDates, filterTaskId, sessionLog]);

  const totalPages = Math.ceil(filteredDates.length / PAGE_SIZE);
  const pageDates = filteredDates.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const activeTasks = useMemo(() => {
    const ids = new Set<string>();
    Object.values(sessionLog).forEach((entries) =>
      entries.forEach((e) => { if (e.taskId) ids.add(e.taskId); })
    );
    return tasks.filter((t) => ids.has(t.id));
  }, [tasks, sessionLog]);

  const handleFilter = (id: string | null) => {
    setFilterTaskId(id);
    setPage(0);
  };

  const toggleExpand = (date: string) => {
    setExpandedDates((prev) => {
      const next = new Set(prev);
      if (next.has(date)) next.delete(date);
      else next.add(date);
      return next;
    });
  };

  if (allDates.length === 0) {
    return (
      <div style={s.wrap}>
        <div style={s.titleRow}>
          <span style={s.title}>📋 기록</span>
        </div>
        <div style={s.empty}>아직 기록이 없어요. 첫 세션을 완료해보세요! 🍅</div>
      </div>
    );
  }

  return (
    <div style={s.wrap}>
      <div style={s.titleRow}>
        <span style={s.title}>📋 기록</span>
        <span style={s.totalCount}>{allDates.length}일 기록</span>
      </div>

      {activeTasks.length > 0 && (
        <div style={s.filterRow}>
          <button
            style={{ ...s.pill, ...(filterTaskId === null ? s.pillActive : {}) }}
            onClick={() => handleFilter(null)}
          >
            전체
          </button>
          {activeTasks.map((t) => (
            <button
              key={t.id}
              style={{ ...s.pill, ...(filterTaskId === t.id ? s.pillActive : {}) }}
              onClick={() => handleFilter(t.id)}
            >
              {t.text.length > 10 ? t.text.slice(0, 10) + "…" : t.text}
            </button>
          ))}
        </div>
      )}

      <div style={s.list}>
        {pageDates.length === 0 ? (
          <div style={s.empty}>해당 작업의 기록이 없어요.</div>
        ) : (
          pageDates.map((date) => {
            const entries = sessionLog[date] ?? [];
            const displayEntries = filterTaskId
              ? entries.filter((e) => e.taskId === filterTaskId)
              : entries;
            const count = filterTaskId
              ? displayEntries.length
              : sessionHistory[date];
            const untrackedCount = filterTaskId
              ? 0
              : Math.max(0, sessionHistory[date] - entries.length);

            const allItems = [
              ...displayEntries.map((e, i) => ({ type: "entry" as const, entry: e, i })),
              ...(untrackedCount > 0 ? [{ type: "untracked" as const, count: untrackedCount, i: -1 }] : []),
            ];
            const isExpanded = expandedDates.has(date);
            const needsCollapse = allItems.length > PREVIEW_COUNT;
            const visibleItems = needsCollapse && !isExpanded ? allItems.slice(0, PREVIEW_COUNT) : allItems;
            const hiddenCount = allItems.length - visibleItems.length;

            return (
              <div key={date} style={s.dateRow}>
                <div style={s.dateHeader}>
                  <span style={s.dateLabel}>{formatDateLabel(date)}</span>
                  <span style={s.tomatoes}>
                    {"🍅".repeat(Math.min(count, 6))}
                    {count > 6 ? ` +${count - 6}` : ""}
                  </span>
                </div>

                {allItems.length > 0 && (
                  <div style={s.entryList}>
                    {visibleItems.map((item) =>
                      item.type === "entry" ? (
                        <div key={item.i} style={s.entry}>
                          <span style={s.dot}>•</span>
                          <span style={s.entryText}>{item.entry.taskText ?? "작업 미지정"}</span>
                          <span style={s.entryTime}>{item.entry.time}</span>
                        </div>
                      ) : (
                        <div key="untracked" style={s.entry}>
                          <span style={s.dot}>•</span>
                          <span style={{ ...s.entryText, opacity: 0.45 }}>
                            이전 기록 {item.count}세션
                          </span>
                        </div>
                      )
                    )}
                    {needsCollapse && (
                      <button style={s.expandBtn} onClick={() => toggleExpand(date)}>
                        {isExpanded ? "접기 ▲" : `+${hiddenCount}개 더보기 ▼`}
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {totalPages > 1 && (
        <div style={s.pagination}>
          <button
            style={{ ...s.pageBtn, opacity: page >= totalPages - 1 ? 0.3 : 1 }}
            onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
            disabled={page >= totalPages - 1}
          >
            ‹ 이전 7일
          </button>
          <span style={s.pageInfo}>{page + 1} / {totalPages}</span>
          <button
            style={{ ...s.pageBtn, opacity: page === 0 ? 0.3 : 1 }}
            onClick={() => setPage((p) => Math.max(p - 1, 0))}
            disabled={page === 0}
          >
            다음 7일 ›
          </button>
        </div>
      )}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  wrap: {
    marginTop: 14,
    padding: "10px 12px 12px",
    background: "var(--th-settings-bg)",
    borderRadius: 16,
    border: "1.5px solid var(--th-p100)",
  },
  titleRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 12,
    fontWeight: 700,
    color: "var(--th-p700)",
  },
  totalCount: {
    fontSize: 11,
    color: "var(--th-text-label)",
  },
  filterRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 10,
  },
  pill: {
    padding: "3px 10px",
    borderRadius: 20,
    border: "1.5px solid var(--th-p200)",
    background: "none",
    color: "var(--th-text-label)",
    fontSize: 11,
    fontWeight: 500,
    cursor: "pointer",
  },
  pillActive: {
    background: "linear-gradient(135deg, var(--th-p200), var(--th-p300))",
    color: "var(--th-p800)",
    border: "1.5px solid var(--th-p300)",
    fontWeight: 700,
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  dateRow: {
    padding: "8px 10px",
    borderRadius: 12,
    background: "var(--th-p50)",
    border: "1px solid var(--th-p100)",
  },
  dateHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateLabel: {
    fontSize: 12,
    fontWeight: 700,
    color: "var(--th-p700)",
  },
  tomatoes: {
    fontSize: 11,
  },
  entryList: {
    marginTop: 6,
    display: "flex",
    flexDirection: "column",
    gap: 3,
  },
  entry: {
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  dot: {
    fontSize: 10,
    color: "var(--th-p400)",
    flexShrink: 0,
  },
  entryText: {
    fontSize: 11,
    color: "var(--th-text-val)",
    flex: 1,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  entryTime: {
    fontSize: 10,
    color: "var(--th-text-label)",
    flexShrink: 0,
  },
  pagination: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 10,
    borderTop: "1px solid var(--th-p100)",
  },
  pageBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: 11,
    fontWeight: 600,
    color: "var(--th-p700)",
    padding: "4px 8px",
  },
  pageInfo: {
    fontSize: 11,
    color: "var(--th-text-label)",
  },
  empty: {
    fontSize: 12,
    color: "var(--th-text-label)",
    textAlign: "center",
    padding: "16px 0",
  },
  expandBtn: {
    marginTop: 4,
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: 11,
    fontWeight: 600,
    color: "var(--th-p600)",
    padding: "2px 0",
    textAlign: "left",
  },
};
