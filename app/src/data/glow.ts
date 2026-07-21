export interface GlowUserStats {
  completedCities: number;
  completedRoutes: number;
  totalDistance: number;
  totalTimeHours: number;
  lightValue: number;
  weeklyLightEarned: number;
  dailyDistance: number;
  dailyTreadmillStarted?: boolean;
  weeklyCitySwitches: number;
  dailyCompletedRoutes: number;
  weeklyCompletedRoutes: number;
}

export interface GlowRank {
  level: number;
  name: string;
  min: number;
  max: number | null;
  nextName: string | null;
  remaining: number;
  progress: number;
  color: string;
}

export interface GlowTask {
  id: string;
  period: '今日' | '本周';
  label: string;
  progress: number;
  target: number;
  unit: string;
  completed: boolean;
}

const GLOW_RANKS = [
  { level: 1, name: '初光', min: 0, max: 29, color: '#94a3b8' },
  { level: 2, name: '青铜', min: 30, max: 79, color: '#d28a5c' },
  { level: 3, name: '黄金', min: 80, max: 149, color: '#f5cb4e' },
  { level: 4, name: '铂金', min: 150, max: 259, color: '#67e8f9' },
  { level: 5, name: '星钻', min: 260, max: 399, color: '#a78bfa' },
  { level: 6, name: '极光', min: 400, max: null, color: '#34d399' }
] as const;

export function getGlowRank(lightValue: number): GlowRank {
  const safeValue = Math.max(0, Number.isFinite(lightValue) ? lightValue : 0);
  const index = GLOW_RANKS.findIndex(rank => rank.max === null || safeValue <= rank.max);
  const rank = GLOW_RANKS[Math.max(0, index)];
  const nextRank = GLOW_RANKS[Math.min(GLOW_RANKS.length - 1, Math.max(0, index) + 1)];
  const isMaxRank = rank.level === GLOW_RANKS.length;
  const rangeSize = rank.max === null ? 1 : rank.max - rank.min + 1;
  const progress = isMaxRank
    ? 100
    : Math.min(100, Math.max(0, ((safeValue - rank.min) / rangeSize) * 100));

  return {
    ...rank,
    nextName: isMaxRank ? null : nextRank.name,
    remaining: isMaxRank ? 0 : Math.max(0, nextRank.min - safeValue),
    progress
  };
}

export function getGlowTaskProgress(userStats: GlowUserStats) {
  const tasks: GlowTask[] = [
    {
      id: 'daily-route',
      period: '今日',
      label: '完成任意 1 条路线',
      progress: userStats.dailyCompletedRoutes,
      target: 1,
      unit: '条',
      completed: userStats.dailyCompletedRoutes >= 1
    },
    {
      id: 'daily-treadmill',
      period: '今日',
      label: '启动一次跑步机',
      progress: userStats.dailyTreadmillStarted ? 1 : 0,
      target: 1,
      unit: '次',
      completed: !!userStats.dailyTreadmillStarted
    },
    {
      id: 'weekly-route',
      period: '本周',
      label: '完成任意 3 条路线',
      progress: userStats.weeklyCompletedRoutes,
      target: 3,
      unit: '条',
      completed: userStats.weeklyCompletedRoutes >= 3
    }
  ];

  return tasks.sort((a, b) => {
    const order = ['daily-treadmill', 'daily-route', 'weekly-route'];
    return order.indexOf(a.id) - order.indexOf(b.id);
  });
}
