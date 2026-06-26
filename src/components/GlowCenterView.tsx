import { useState } from 'react';
import { AnimatePresence, motion, type PanInfo } from 'motion/react';
import { ChevronLeft, Crown, Gift, Info, Medal, Shuffle, Sparkles, Ticket, Zap, X } from 'lucide-react';
import { getGlowRank, GLOW_RANKS } from '../lib/glow';

export type GlowExchangeType = 'activityTicket' | 'rerollCity' | 'medalMysteryTicket';

interface GlowCenterViewProps {
  userStats: any;
  onBack: () => void;
  onExchange: (type: GlowExchangeType) => { success: boolean; message: string };
}

const rankCopy: Record<number, { title: string; description: string; aura: string }> = {
  1: {
    title: '初次留痕',
    description: '完成第一次出发，开始记录属于你的城市光迹。',
    aura: 'rgba(251,146,60,0.32)'
  },
  2: {
    title: '稳定探索',
    description: '开始形成跑步习惯，城市记忆被持续唤醒。',
    aura: 'rgba(226,232,240,0.28)'
  },
  3: {
    title: '黄金光迹',
    description: '路线完成度进入稳定阶段，探索节奏逐渐成型。',
    aura: 'rgba(251,191,36,0.34)'
  },
  4: {
    title: '钻石轨道',
    description: '跨城探索能力提升，光迹网络进入高亮状态。',
    aura: 'rgba(34,211,238,0.34)'
  },
  5: {
    title: '星耀巡航',
    description: '持续奔跑让你的城市版图开始形成星群。',
    aura: 'rgba(217,70,239,0.34)'
  },
  6: {
    title: '王者回响',
    description: '你已抵达最高段位，完整光迹将成为城市传说。',
    aura: 'rgba(251,113,133,0.34)'
  }
};

const RankBadgeIcon = ({ level }: { level: number }) => {
  if (level === 1) {
    return <Zap size={34} strokeWidth={2.6} />;
  }

  if (level === 2) {
    return (
      <svg viewBox="0 0 64 64" className="h-10 w-10" fill="none" aria-hidden="true">
        <path d="M32 8L50 17V31C50 43 42 52 32 57C22 52 14 43 14 31V17L32 8Z" stroke="currentColor" strokeWidth="5" strokeLinejoin="round" />
        <path d="M24 31L30 37L42 25" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (level === 3) {
    return (
      <svg viewBox="0 0 64 64" className="h-11 w-11" fill="none" aria-hidden="true">
        <path d="M32 7L38 24H56L41.5 34.5L47 52L32 41.5L17 52L22.5 34.5L8 24H26L32 7Z" stroke="currentColor" strokeWidth="5" strokeLinejoin="round" />
        <circle cx="32" cy="32" r="7" fill="currentColor" />
      </svg>
    );
  }

  if (level === 4) {
    return (
      <svg viewBox="0 0 64 64" className="h-11 w-11" fill="none" aria-hidden="true">
        <path d="M32 6L54 22L46 54H18L10 22L32 6Z" stroke="currentColor" strokeWidth="5" strokeLinejoin="round" />
        <path d="M10 22H54M24 22L18 54M40 22L46 54M24 22L32 6L40 22" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" />
      </svg>
    );
  }

  if (level === 5) {
    return (
      <svg viewBox="0 0 64 64" className="h-11 w-11" fill="none" aria-hidden="true">
        <path d="M32 5L39 22L57 24L43.5 36L47 54L32 44.5L17 54L20.5 36L7 24L25 22L32 5Z" stroke="currentColor" strokeWidth="4.5" strokeLinejoin="round" />
        <path d="M32 18V40M21 29H43" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      </svg>
    );
  }

  return <Crown size={38} strokeWidth={2.5} />;
};

const shopItems: Array<{
  id: GlowExchangeType;
  title: string;
  cost: number;
  description: string;
  icon: typeof Gift;
  accent: string;
  requiredRankLevel?: number;
  weeklyLimit?: number;
}> = [
  {
    id: 'activityTicket',
    title: '活动补给券',
    cost: 30,
    description: '为周末城市记忆串烧增加 1 次现金抽奖机会。',
    icon: Ticket,
    accent: 'from-fuchsia-300 to-rose-500',
    requiredRankLevel: 3,
    weeklyLimit: 1
  },
  {
    id: 'medalMysteryTicket',
    title: '勋章盲盒券',
    cost: 20,
    description: '兑换 1 张勋章盲盒抽奖券。',
    icon: Medal,
    accent: 'from-amber-200 to-yellow-500',
    requiredRankLevel: 3,
    weeklyLimit: 1
  },
  {
    id: 'rerollCity',
    title: '下一城重选券',
    cost: 10,
    description: '重新打开下一站城市选择，换一种探索路线。',
    icon: Shuffle,
    accent: 'from-cyan-300 to-blue-500'
  }
];

export default function GlowCenterView({ userStats, onBack, onExchange }: GlowCenterViewProps) {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showRankInfo, setShowRankInfo] = useState(false);
  const lightValue = userStats?.lightValue || 0;
  const lifetimeLightValue = userStats?.lifetimeLightValue ?? lightValue;
  const weeklyGlowExchangeIds: string[] = userStats?.weeklyGlowExchangeIds || [];
  const rankInfo = getGlowRank(lifetimeLightValue);
  const currentRankIndex = Math.max(0, GLOW_RANKS.findIndex(rank => rank.level === rankInfo.current.level));
  const [selectedIndex, setSelectedIndex] = useState(currentRankIndex);
  const selectedRank = GLOW_RANKS[selectedIndex] || rankInfo.current;
  const selectedCopy = rankCopy[selectedRank.level];
  const selectedIsCurrent = selectedRank.level === rankInfo.current.level;
  const selectedUnlocked = lifetimeLightValue >= selectedRank.threshold;
  const nextRank = GLOW_RANKS.find(rank => rank.level === selectedRank.level + 1) || null;

  const handleRankDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipe = info.offset.x + info.velocity.x * 0.18;
    if (swipe < -55) {
      setSelectedIndex(index => Math.min(GLOW_RANKS.length - 1, index + 1));
    } else if (swipe > 55) {
      setSelectedIndex(index => Math.max(0, index - 1));
    }
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    window.setTimeout(() => setToastMessage(null), 2400);
  };

  const handleExchange = (type: GlowExchangeType) => {
    const result = onExchange(type);
    showToast(result.message);
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#020407] text-slate-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_0%,rgba(94,106,210,0.24),transparent_36%),radial-gradient(circle_at_84%_10%,rgba(251,191,36,0.18),transparent_34%),linear-gradient(180deg,#020407_0%,#07111b_46%,#030507_100%)]" />
      <div className="absolute inset-0 opacity-[0.065] bg-[linear-gradient(rgba(255,255,255,0.22)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.22)_1px,transparent_1px)] bg-[size:28px_28px]" />

      <div className="relative z-10 flex h-full flex-col">
        <header className="shrink-0 px-5 pt-5 pb-3">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.055] text-slate-200 backdrop-blur-md transition-colors hover:bg-white/10"
            >
              <ChevronLeft size={22} />
            </button>
            <div className="text-center">
              <p className="text-[10px] font-black tracking-[0.24em] text-indigo-200">GLOW RANK</p>
              <h1 className="text-lg font-black tracking-tight text-white">光迹值中心</h1>
            </div>
            <button
              onClick={() => setShowRankInfo(true)}
              className="flex h-10 items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.055] px-3 text-[10px] font-black text-slate-200 backdrop-blur-md transition-colors hover:bg-white/10"
            >
              <Info size={14} />
              说明
            </button>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto px-5 pb-8 hide-scrollbar">
          <section className="relative overflow-hidden rounded-[30px] border border-white/10 bg-[#0a0f17]/[0.86] p-4 shadow-2xl backdrop-blur-xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(94,106,210,0.2),transparent_46%),radial-gradient(circle_at_88%_10%,rgba(251,191,36,0.18),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.04),transparent_72%)]" />
            <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full blur-3xl" style={{ backgroundColor: selectedCopy.aura }} />
            <div className="relative rounded-[24px] border border-white/10 bg-black/[0.24] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
              <div className="flex items-center gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className={`h-14 w-14 rounded-full bg-gradient-to-br ${rankInfo.current.color} p-[2px] shadow-[0_0_28px_rgba(103,232,249,0.16)]`}>
                    <div className="h-full w-full rounded-full bg-slate-950 p-1">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200&h=200"
                    alt="User Avatar"
                    className="h-full w-full rounded-full object-cover"
                  />
                    </div>
                </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-black text-white">木小六</p>
                      <span className={`rounded-full bg-gradient-to-r ${rankInfo.current.color} px-2 py-0.5 text-[9px] font-black text-slate-950`}>LV.{rankInfo.current.level}</span>
                    </div>
                    <p className="mt-1 font-mono text-[10px] font-bold text-slate-400">累计 {lifetimeLightValue} 光迹值</p>
                  </div>
                </div>
              </div>
            </div>

            <motion.div
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.16}
              onDragEnd={handleRankDragEnd}
              key={selectedRank.level}
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 240, damping: 20 }}
              className={`relative mt-4 cursor-grab overflow-hidden rounded-[26px] border p-5 text-center active:cursor-grabbing ${
                selectedIsCurrent
                  ? 'border-amber-300/45 bg-amber-300/[0.065] shadow-[0_0_34px_rgba(251,191,36,0.16)]'
                  : selectedUnlocked
                    ? 'border-white/10 bg-black/[0.28]'
                    : 'border-white/[0.08] bg-black/[0.18] opacity-[0.82]'
              }`}
            >
              <div className="absolute inset-x-10 top-8 h-24 rounded-full blur-3xl" style={{ backgroundColor: selectedCopy.aura }} />
              {selectedIsCurrent && (
                <div className="absolute right-4 top-4 rounded-full border border-amber-200/35 bg-amber-300/12 px-3 py-1 text-[10px] font-black text-amber-100 shadow-[0_0_18px_rgba(251,191,36,0.15)]">
                  当前段位
                </div>
              )}
              <div className="relative mx-auto flex h-[120px] w-[120px] items-center justify-center rounded-[30px] border border-white/15 bg-slate-950/80 shadow-[inset_0_0_30px_rgba(255,255,255,0.04)]">
                <div className={`absolute inset-2 rounded-[26px] bg-gradient-to-br ${selectedRank.color} opacity-95 blur-[1px]`} />
                <div className="absolute inset-[12px] rounded-[22px] border border-black/35 bg-black/[0.24]" />
                <div className="absolute inset-[21px] rounded-2xl border border-white/10" />
                {selectedIsCurrent && (
                  <motion.div
                    className={`absolute inset-0 rounded-[30px] bg-gradient-to-br ${selectedRank.color} opacity-[0.38] blur-md`}
                    animate={{ scale: [1, 1.12, 1] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                  />
                )}
                <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-[#07111b] text-white shadow-[inset_0_0_18px_rgba(255,255,255,0.04),0_10px_28px_rgba(0,0,0,0.35)]">
                  <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_35%_22%,rgba(255,255,255,0.16),transparent_28%)]" />
                  <RankBadgeIcon level={selectedRank.level} />
                </div>
              </div>

              <div className="relative mt-5">
                <p className="text-[10px] font-black tracking-[0.24em] text-slate-400">LV.{selectedRank.level}</p>
                <h2 className={`mt-1 bg-gradient-to-r ${selectedRank.color} bg-clip-text text-4xl font-black text-transparent`}>
                  {selectedRank.name}
                </h2>
                <p className="mt-2 text-sm font-black text-white">{selectedCopy.title}</p>
                <p className="mx-auto mt-2 max-w-[260px] text-xs font-medium leading-relaxed text-slate-400">
                  {selectedCopy.description}
                </p>
              </div>

              <div className="relative mt-5 grid grid-cols-2 gap-3 text-left">
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                  <p className="text-[10px] font-bold text-slate-500">达成条件</p>
                  <p className="mt-1 font-mono text-lg font-black text-white">{selectedRank.threshold}+</p>
                </div>
                <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                  <p className="text-[10px] font-bold text-slate-500">当前状态</p>
                  <p className={`mt-1 text-sm font-black ${selectedUnlocked ? 'text-emerald-300' : 'text-slate-400'}`}>
                    {selectedIsCurrent ? '当前段位' : selectedUnlocked ? '已解锁' : '未解锁'}
                  </p>
                </div>
              </div>

              <div className="relative mt-5 flex items-center justify-center gap-1.5">
                {GLOW_RANKS.map((rank, index) => (
                  <span
                    key={rank.level}
                    className={`h-1.5 rounded-full transition-all ${index === selectedIndex ? 'w-6 bg-amber-300' : 'w-1.5 bg-white/20'}`}
                  />
                ))}
              </div>
              <p className="relative mt-2 text-[10px] font-bold text-slate-500">左右滑动切换段位</p>
            </motion.div>

            <div className="relative mt-5">
              <div className="mb-2 flex items-center justify-between text-[10px] font-bold text-slate-400">
                <span>{rankInfo.current.name}</span>
                <span>{rankInfo.next ? `还差 ${rankInfo.remaining} 到 ${rankInfo.next.name}` : '已达最高段位'}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${rankInfo.progress}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-emerald-300 to-amber-300"
                />
              </div>
            </div>
          </section>

          <section className="mt-5 rounded-[28px] border border-white/10 bg-[#080d14]/82 p-4 shadow-2xl">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black tracking-[0.22em] text-amber-200">GLOW SHOP</p>
                <h2 className="mt-1 text-base font-black tracking-tight text-white">兑换商城</h2>
              </div>
              <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 text-right">
                <p className="text-[10px] font-bold text-cyan-100/65">可用光迹值</p>
                <p className="font-mono text-sm font-black text-cyan-200">{lightValue}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {shopItems.map(item => {
                const Icon = item.icon;
                const rankLocked = !!item.requiredRankLevel && rankInfo.current.level < item.requiredRankLevel;
                const weeklyUsed = !!item.weeklyLimit && weeklyGlowExchangeIds.includes(item.id);
                const canExchange = !rankLocked && !weeklyUsed && lightValue >= item.cost;
                const buttonText = weeklyUsed ? '本周已兑' : rankLocked ? '黄金解锁' : canExchange ? '立即兑换' : '光迹值不足';
                return (
                  <motion.div
                    key={item.id}
                    whileTap={{ scale: canExchange ? 0.98 : 1 }}
                    className={`relative flex min-h-[198px] flex-col overflow-hidden rounded-[22px] border p-3 shadow-xl ${
                      canExchange
                        ? 'border-cyan-300/20 bg-slate-950/80'
                        : 'border-white/[0.08] bg-slate-950/[0.58]'
                    }`}
                  >
                    <div className={`absolute -right-8 -top-8 h-20 w-20 rounded-full bg-gradient-to-br ${item.accent} opacity-20 blur-2xl`} />
                    <div className="relative flex items-start justify-between gap-2">
                      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${item.accent} text-slate-950 shadow-lg`}>
                        <Icon size={20} />
                      </div>
                      <span className="shrink-0 rounded-full border border-amber-200/15 bg-amber-300/10 px-2.5 py-1 font-mono text-[11px] font-black text-amber-100">-{item.cost}</span>
                    </div>
                    <div className="relative mt-3 flex-1">
                      <h3 className="text-sm font-black leading-tight tracking-tight text-white">{item.title}</h3>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {item.requiredRankLevel && (
                          <span className={`inline-flex rounded-full px-2 py-1 text-[9px] font-black ${rankLocked ? 'bg-amber-300/10 text-amber-200' : 'bg-emerald-300/10 text-emerald-200'}`}>
                            黄金解锁
                          </span>
                        )}
                        {item.weeklyLimit && (
                          <span className={`inline-flex rounded-full px-2 py-1 text-[9px] font-black ${weeklyUsed ? 'bg-slate-500/10 text-slate-400' : 'bg-indigo-300/10 text-indigo-200'}`}>
                            每周 1 张
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-[10px] font-medium leading-relaxed text-slate-400">{item.description}</p>
                    </div>
                    <button
                      disabled={!canExchange}
                      onClick={() => handleExchange(item.id)}
                      className={`relative mt-4 h-10 w-full rounded-2xl text-[11px] font-black transition-colors ${
                        canExchange
                          ? 'bg-gradient-to-r from-cyan-200 to-indigo-200 text-slate-950 shadow-[0_0_22px_rgba(103,232,249,0.22)]'
                          : 'border border-white/10 bg-white/[0.035] text-slate-500'
                      }`}
                    >
                      {buttonText}
                    </button>
                  </motion.div>
                );
              })}
            </div>

          </section>
        </main>
      </div>

      <AnimatePresence>
        {showRankInfo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/75 p-6 backdrop-blur-md"
            onClick={() => setShowRankInfo(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 22, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 14, scale: 0.96 }}
              className="w-full max-w-[330px] rounded-[28px] border border-white/10 bg-[#07111b] p-5 shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-amber-200" />
                  <h2 className="text-lg font-black text-white">段位说明</h2>
                </div>
                <button
                  onClick={() => setShowRankInfo(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300"
                >
                  <X size={16} />
                </button>
              </div>
              <p className="mt-4 text-sm font-medium leading-relaxed text-slate-400">
                段位根据累计光迹值判定，用来记录你的长期探索进度。当前光迹值可以变化，但已达成的段位不会因为消耗而倒退。
              </p>
              {nextRank && (
                <div className="mt-5 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4">
                  <p className="text-[10px] font-black tracking-[0.2em] text-cyan-200">下一目标</p>
                  <p className="mt-2 text-sm font-black text-white">
                    累计 {nextRank.threshold} 光迹值解锁 {nextRank.name}
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="absolute left-1/2 top-20 z-50 -translate-x-1/2 whitespace-nowrap rounded-full bg-white/90 px-4 py-2 text-xs font-black text-slate-950 shadow-xl"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
