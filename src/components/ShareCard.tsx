import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import type { WeeklyStats } from "../utils/weeklyStats";

type Props = {
  stats: WeeklyStats;
  streak: number;
  focusMin: number;
  themeVars: Record<string, string>;
};

export default function ShareCard({ stats, streak, focusMin, themeVars }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [capturing, setCapturing] = useState(false);

  const hours = Math.floor(stats.totalMinutes / 60);
  const mins = stats.totalMinutes % 60;
  const timeStr =
    hours > 0 ? `${hours}시간 ${mins > 0 ? `${mins}분` : ""}` : `${mins}분`;

  const handleShare = async () => {
    if (!cardRef.current || capturing) return;
    setCapturing(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
      });
      const blob = await new Promise<Blob>((resolve) =>
        canvas.toBlob((b) => resolve(b!), "image/png")
      );
      if (navigator.share && navigator.canShare({ files: [new File([blob], "pomodoro.png", { type: "image/png" })] })) {
        await navigator.share({
          files: [new File([blob], "pomodoro.png", { type: "image/png" })],
          title: "내 뽀모도로 기록",
        });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "pomodoro-card.png";
        a.click();
        URL.revokeObjectURL(url);
      }
    } finally {
      setCapturing(false);
    }
  };

  const maxCount = Math.max(...stats.days.map((d) => d.count), 1);

  return (
    <div style={s.wrap}>
      {/* 캡처 대상 카드 */}
      <div
        ref={cardRef}
        style={{
          ...s.card,
          background: `linear-gradient(145deg, ${themeVars["--th-p100"]}, ${themeVars["--th-p200"]})`,
          border: `1.5px solid ${themeVars["--th-p300"]}`,
        }}
      >
        <div style={s.cardHeader}>
          <span style={{ ...s.cardTitle, color: themeVars["--th-p800"] }}>🍅 뽀모도로</span>
          <span style={{ ...s.cardSub, color: themeVars["--th-p700"] }}>이번 주 기록</span>
        </div>

        <div style={s.bigNum}>
          <span style={{ ...s.bigCount, color: themeVars["--th-p800"] }}>
            {stats.totalSessions}
          </span>
          <span style={{ ...s.bigLabel, color: themeVars["--th-p700"] }}>세션</span>
        </div>

        <div style={s.statsRow}>
          <div style={s.statItem}>
            <span style={{ ...s.statVal, color: themeVars["--th-p800"] }}>⏱ {timeStr}</span>
            <span style={{ ...s.statLabel, color: themeVars["--th-p700"] }}>총 집중 시간</span>
          </div>
          {streak > 0 && (
            <div style={s.statItem}>
              <span style={{ ...s.statVal, color: themeVars["--th-p800"] }}>🔥 {streak}일</span>
              <span style={{ ...s.statLabel, color: themeVars["--th-p700"] }}>연속 집중</span>
            </div>
          )}
          {stats.bestDay && stats.bestDayCount > 0 && (
            <div style={s.statItem}>
              <span style={{ ...s.statVal, color: themeVars["--th-p800"] }}>✨ {stats.bestDay}</span>
              <span style={{ ...s.statLabel, color: themeVars["--th-p700"] }}>최고의 날</span>
            </div>
          )}
        </div>

        {/* 미니 바 차트 */}
        <div style={s.chart}>
          {stats.days.map((d) => (
            <div key={d.key} style={s.barCol}>
              <div style={s.barWrap}>
                <div
                  style={{
                    ...s.bar,
                    height: `${Math.round((d.count / maxCount) * 36)}px`,
                    background: d.count > 0
                      ? `linear-gradient(to top, ${themeVars["--th-p400"]}, ${themeVars["--th-p300"]})`
                      : themeVars["--th-p100"],
                    opacity: d.count > 0 ? 1 : 0.4,
                  }}
                />
              </div>
              <span style={{ ...s.barLabel, color: themeVars["--th-p700"] }}>{d.label}</span>
            </div>
          ))}
        </div>

        <div style={{ ...s.cardFooter, color: themeVars["--th-p700"] }}>
          {focusMin}분 집중 · pomodoro timer
        </div>
      </div>

      {/* 공유 버튼 */}
      <button
        style={{
          ...s.shareBtn,
          background: `linear-gradient(135deg, ${themeVars["--th-p300"]}, ${themeVars["--th-p400"]})`,
          color: themeVars["--th-p800"],
        }}
        onClick={handleShare}
        disabled={capturing}
      >
        {capturing ? "생성 중…" : "📤 이미지로 공유하기"}
      </button>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  wrap: {
    marginTop: 12,
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  card: {
    borderRadius: 20,
    padding: "16px 16px 12px",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 800,
    letterSpacing: -0.3,
  },
  cardSub: {
    fontSize: 10,
    fontWeight: 600,
    opacity: 0.8,
  },
  bigNum: {
    display: "flex",
    alignItems: "baseline",
    gap: 4,
  },
  bigCount: {
    fontSize: 40,
    fontWeight: 800,
    lineHeight: 1,
    letterSpacing: -2,
  },
  bigLabel: {
    fontSize: 14,
    fontWeight: 700,
  },
  statsRow: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },
  statItem: {
    display: "flex",
    flexDirection: "column",
    gap: 1,
  },
  statVal: {
    fontSize: 11,
    fontWeight: 700,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: 500,
    opacity: 0.75,
  },
  chart: {
    display: "flex",
    alignItems: "flex-end",
    gap: 4,
    height: 52,
  },
  barCol: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 3,
    height: "100%",
    justifyContent: "flex-end",
  },
  barWrap: {
    display: "flex",
    alignItems: "flex-end",
    height: 36,
  },
  bar: {
    width: "100%",
    minHeight: 3,
    borderRadius: 3,
    transition: "height 0.3s ease",
  },
  barLabel: {
    fontSize: 9,
    fontWeight: 600,
  },
  cardFooter: {
    fontSize: 9,
    opacity: 0.6,
    textAlign: "center",
    letterSpacing: 0.2,
  },
  shareBtn: {
    width: "100%",
    padding: "10px 0",
    borderRadius: 16,
    border: "none",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    letterSpacing: -0.2,
    transition: "opacity 0.15s",
  },
};
