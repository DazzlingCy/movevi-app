export interface WeekendMashupRoute {
  id: string;
  cityId: string;
  routeIndex: number;
  themeLabel: string;
  reason: string;
}

export interface WeekendMashupDraw {
  id: string;
  amount: number;
  createdAt: number;
}

export interface WeekendMashupState {
  selectedRouteIds: string[];
  completedRouteIds: string[];
  lotteryChances: number;
  drawHistory: WeekendMashupDraw[];
  shareBonusClaimed: boolean;
  selectionLocked: boolean;
}

export const WEEKEND_MASHUP_ROUTES: WeekendMashupRoute[] = [
  { id: 'hangzhou-lingyin', cityId: '1', routeIndex: 2, themeLabel: '古寺山林', reason: '从灵隐古刹进入周末文化记忆。' },
  { id: 'beijing-palace', cityId: '2', routeIndex: 1, themeLabel: '皇城中轴', reason: '沿红墙与角楼唤醒古都心跳。' },
  { id: 'shanghai-memory', cityId: '3', routeIndex: 1, themeLabel: '海派街巷', reason: '在石库门与外滩之间串起城市旧梦。' },
  { id: 'nanjing-jinling', cityId: '4', routeIndex: 1, themeLabel: '六朝金陵', reason: '秦淮灯影和城墙风声适合慢慢跑。' },
  { id: 'xian-wall', cityId: '5', routeIndex: 1, themeLabel: '长安城墙', reason: '沿城墙跑过十三朝古都的轮廓。' },
  { id: 'tokyo-asakusa', cityId: '6', routeIndex: 1, themeLabel: '浅草旧街', reason: '把霓虹东京拉回寺町与老街。' },
  { id: 'paris-seine', cityId: '7', routeIndex: 1, themeLabel: '塞纳艺术', reason: '卢浮宫到奥赛，跑进巴黎的艺术轴线。' },
  { id: 'london-west-end', cityId: '8', routeIndex: 1, themeLabel: '西区声影', reason: '用脚步穿过剧院、广场与古老街巷。' },
  { id: 'newyork-liberty', cityId: '9', routeIndex: 1, themeLabel: '自由岛记忆', reason: '从移民故事开始理解纽约的世界性。' },
  { id: 'cairo-nile', cityId: '12', routeIndex: 1, themeLabel: '尼罗文明', reason: '在河岸、金字塔与古城之间收束串烧。' },
];

export const CASH_PRIZE_POOL = [0.88, 1.88, 6.66, 8.88, 18.88];

export const CASH_PRIZE_PROBABILITIES = [
  { amount: 0.88, probability: 45 },
  { amount: 1.88, probability: 30 },
  { amount: 6.66, probability: 15 },
  { amount: 8.88, probability: 8 },
  { amount: 18.88, probability: 2 },
];

export const WEEKEND_MASHUP_OPEN_WINDOW = {
  start: '2026.06.06 00:00',
  end: '2026.06.07 23:59',
  timezone: 'Asia/Shanghai',
  label: '2026.06.06 00:00 - 06.07 23:59',
};

export const createWeekendMashupState = (): WeekendMashupState => ({
  selectedRouteIds: [],
  completedRouteIds: [],
  lotteryChances: 0,
  drawHistory: [],
  shareBonusClaimed: false,
  selectionLocked: false,
});
