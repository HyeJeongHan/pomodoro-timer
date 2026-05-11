export type Badge = {
  emoji: string;
  name: string;
  min: number;
  next: number | null;
};

export const BADGES: Badge[] = [
  { emoji: "🌱", name: "씨앗",      min: 0,   next: 10  },
  { emoji: "🌿", name: "새싹",      min: 10,  next: 50  },
  { emoji: "🌳", name: "나무",      min: 50,  next: 200 },
  { emoji: "🌲", name: "숲",        min: 200, next: 500 },
  { emoji: "🏆", name: "포레스트",  min: 500, next: null },
];

export function getBadge(total: number): Badge {
  for (let i = BADGES.length - 1; i >= 0; i--) {
    if (total >= BADGES[i].min) return BADGES[i];
  }
  return BADGES[0];
}
