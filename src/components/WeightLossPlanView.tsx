import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Award, CheckCircle2, ChevronLeft, Flame, Gift, Lock, MapPin, Play, Route, Shuffle, Sparkles, Timer, Trophy } from 'lucide-react';
import { CITIES, getRouteData } from '../data/cities';

export interface WeightPlanRewardRecord {
  day: number;
  amount: string;
  openedAt: string;
}

interface WeightLossPlanViewProps {
  started: boolean;
  completedDays: number[];
  rewardBoxes: number[];
  openedRewardDays: number[];
  rewardHistory: WeightPlanRewardRecord[];
  onBack: () => void;
  onStartPlan: () => void;
  onOpenReward: (day: number) => { success: boolean; message: string; amount?: string };
  onNavigateToRouteDetail: (cityId: string, routeIndex: number, image: string, day: number) => void;
}

const MILESTONE_DAYS = [1, 7, 15, 21, 30];
const PLAN_WINDOW_DAYS = 120;
const COMPLETION_TARGET_DAYS = 30;

const generatePlanRoutes = () => {
  const cities = CITIES.filter(city => city.status !== 'upcoming');
  return Array.from({ length: PLAN_WINDOW_DAYS }, (_, index) => {
    const city = cities[index % cities.length];
    const routeIndex = Math.floor(index / cities.length) % Math.max(city.routes, 3) + 1;
    const routeData = getRouteData(city.id, routeIndex);
    return {
      day: index + 1,
      cityId: city.id,
      cityName: city.name,
      routeIndex,
      image: city.image,
      routeData
    };
  });
};

type PlanRoute = ReturnType<typeof generatePlanRoutes>[number];

export default function WeightLossPlanView({
  started,
  completedDays,
  rewardBoxes,
  openedRewardDays,
  rewardHistory,
  onBack,
  onStartPlan,
  onOpenReward,
  onNavigateToRouteDetail
}: WeightLossPlanViewProps) {
  const [toast, setToast] = useState<string | null>(null);
  const [result, setResult] = useState<{ day: number; amount: string } | null>(null);
  const [rewardReveal, setRewardReveal] = useState<{ day: number; phase: 'collecting' | 'opening' } | null>(null);
  const [openingRewardDay, setOpeningRewardDay] = useState<number | null>(null);
  const [routeOverrides, setRouteOverrides] = useState<Record<number, PlanRoute>>({});
  const [showCompletionPreview, setShowCompletionPreview] = useState(false);
  const [previewOpenedRewardDays, setPreviewOpenedRewardDays] = useState<number[]>([]);
  const [previewRewardHistory, setPreviewRewardHistory] = useState<WeightPlanRewardRecord[]>([]);
  const rewardTimersRef = useRef<number[]>([]);
  const planRoutes = useMemo(() => generatePlanRoutes(), []);
  const previewCompletedDays = useMemo(() => Array.from({ length: COMPLETION_TARGET_DAYS }, (_, index) => index + 1), []);
  const getPreviewRewardAmount = (day: number) => {
    const previewAmounts: Record<number, string> = {
      1: '￥0.18',
      7: '￥0.88',
      15: '￥1.88',
      21: '￥5.88',
      30: '￥8.8'
    };
    return previewAmounts[day] || '￥0.18';
  };
  const completedDaysView = showCompletionPreview ? previewCompletedDays : completedDays;
  const rewardBoxesView = showCompletionPreview ? MILESTONE_DAYS : rewardBoxes;
  const openedRewardDaysView = showCompletionPreview ? previewOpenedRewardDays : openedRewardDays;
  const rewardHistoryView = showCompletionPreview ? previewRewardHistory : rewardHistory;
  const isPlanVisible = started || showCompletionPreview;
  const canShowCompletionPreview =
    typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname);
  const completedSet = new Set(completedDaysView);
  const nextDay = Math.min(completedDaysView.length + 1, PLAN_WINDOW_DAYS);
  const [displayDay, setDisplayDay] = useState(Math.max(1, completedDays.length));
  const activeDay = Math.min(displayDay, PLAN_WINDOW_DAYS);
  const todayRoute = routeOverrides[activeDay] || planRoutes[activeDay - 1];
  const todayCompleted = completedSet.has(activeDay);
  const isFutureDay = activeDay > nextDay;
  const completedDistance = planRoutes
    .filter(item => completedSet.has(item.day))
    .reduce((sum, item) => sum + Number(item.routeData.distance || 0), 0);
  const openedBoxes = openedRewardDaysView.length;
  const totalRewardCount = MILESTONE_DAYS.length;
  const planComplete = completedDaysView.length >= COMPLETION_TARGET_DAYS;
  const progressPercent = Math.min(100, Math.round((completedDaysView.length / COMPLETION_TARGET_DAYS) * 100));
  const nextRewardDay = MILESTONE_DAYS.find(day => day > completedDaysView.length);
  const clampDisplayDay = (day: number) => Math.min(PLAN_WINDOW_DAYS, Math.max(1, day));
  const handleRouteSwipe = (_event: MouseEvent | TouchEvent | PointerEvent, info: { offset: { x: number } }) => {
    if (Math.abs(info.offset.x) < 44) return;
    setDisplayDay(prev => clampDisplayDay(prev + (info.offset.x < 0 ? 1 : -1)));
  };
  const handleShuffleRoute = () => {
    if (!todayRoute || todayCompleted || isFutureDay) return;

    const cities = CITIES.filter(city => city.status !== 'upcoming' && city.id !== todayRoute.cityId);
    const city = cities[Math.floor(Math.random() * cities.length)];
    const routeIndex = Math.floor(Math.random() * Math.max(city.routes, 1)) + 1;
    const nextRoute: PlanRoute = {
      day: activeDay,
      cityId: city.id,
      cityName: city.name,
      routeIndex,
      image: city.image,
      routeData: getRouteData(city.id, routeIndex)
    };

    setRouteOverrides(prev => ({ ...prev, [activeDay]: nextRoute }));
    showToast(`已切换至${city.name}路线`);
  };

  useEffect(() => {
    return () => {
      rewardTimersRef.current.forEach(timer => window.clearTimeout(timer));
    };
  }, []);

  useEffect(() => {
    if (showCompletionPreview) {
      setDisplayDay(COMPLETION_TARGET_DAYS);
      setPreviewOpenedRewardDays([]);
      setPreviewRewardHistory([]);
      setResult(null);
    }
  }, [showCompletionPreview]);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2200);
  };

  const handleOpenReward = (day: number) => {
    if (openingRewardDay !== null) return;

    setOpeningRewardDay(day);
    setRewardReveal({ day, phase: 'collecting' });

    if (showCompletionPreview) {
      const openTimer = window.setTimeout(() => {
        setRewardReveal({ day, phase: 'opening' });

        const resultTimer = window.setTimeout(() => {
          const amount = getPreviewRewardAmount(day);
          setRewardReveal(null);
          setOpeningRewardDay(null);
          setPreviewOpenedRewardDays(prev => (prev.includes(day) ? prev : [...prev, day]));
          setPreviewRewardHistory(prev => {
            if (prev.some(item => item.day === day)) return prev;
            return [...prev, { day, amount, openedAt: '预览状态' }];
          });
          setResult({ day, amount });
          showToast(`第${day}天红包已开启`);
        }, 980);

        rewardTimersRef.current.push(resultTimer);
      }, 620);

      rewardTimersRef.current.push(openTimer);
      return;
    }

    const openTimer = window.setTimeout(() => {
      const response = onOpenReward(day);

      if (!response.success || !response.amount) {
        setRewardReveal(null);
        setOpeningRewardDay(null);
        showToast(response.message);
        if (response.amount) {
          setResult({ day, amount: response.amount });
        }
        return;
      }

      setRewardReveal({ day, phase: 'opening' });

      const resultTimer = window.setTimeout(() => {
        setRewardReveal(null);
        setOpeningRewardDay(null);
        setResult({ day, amount: response.amount! });
        showToast(response.message);
      }, 980);

      rewardTimersRef.current.push(resultTimer);
    }, 620);

    rewardTimersRef.current.push(openTimer);
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#05070A] text-slate-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_0%,rgba(16,185,129,0.24),transparent_34%),radial-gradient(circle_at_88%_2%,rgba(251,191,36,0.18),transparent_32%),linear-gradient(180deg,#06110d_0%,#05070A_52%,#020304_100%)]" />
      <div className="absolute inset-0 opacity-[0.055] bg-[linear-gradient(rgba(255,255,255,0.24)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.24)_1px,transparent_1px)] bg-[size:28px_28px]" />

      <div className="relative z-10 flex h-full flex-col">
        <header className="shrink-0 px-4 pb-3 pt-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.055] text-slate-200 backdrop-blur-md active:scale-95"
            >
              <ChevronLeft size={22} />
            </button>
            <div className="text-center">
              <h1 className="text-xl font-black tracking-tight text-white">30天燃脂计划</h1>
            </div>
            {canShowCompletionPreview ? (
              <button
                type="button"
                onClick={() => setShowCompletionPreview(prev => !prev)}
                className={`h-10 rounded-full border px-3 text-xs font-black transition active:scale-95 ${
                  showCompletionPreview
                    ? 'border-amber-200/35 bg-amber-200/15 text-amber-100'
                    : 'border-emerald-300/20 bg-emerald-300/10 text-emerald-100'
                }`}
              >
                预览30天
              </button>
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-emerald-300/15 bg-emerald-300/10 text-emerald-200">
                <Flame size={19} />
              </div>
            )}
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto px-4 pb-8 hide-scrollbar">
          <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[#0c1210]/85 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
            <div className="absolute inset-x-0 top-0 h-48 bg-[radial-gradient(circle_at_25%_18%,rgba(52,211,153,0.26),transparent_30%),radial-gradient(circle_at_80%_0%,rgba(250,204,21,0.22),transparent_34%)]" />
            <div className="relative">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/20 bg-emerald-200/10 px-2.5 py-1 text-[10px] font-black text-emerald-100">
                <Sparkles size={12} />
                每日一条路线
              </div>
              <h2 className="mt-3 text-[32px] font-black leading-[0.98] tracking-[-0.04em] text-white">
                完成30天燃脂
              </h2>
              <p className="mt-3 max-w-[280px] text-sm font-semibold leading-5 text-slate-400">
                每天完成一条推荐路线，120天期限内累计完成30天，即可达成整期计划。
              </p>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="rounded-2xl border border-emerald-200/12 bg-emerald-200/[0.055] p-3">
                  <p className="text-[10px] font-bold text-emerald-100/55">开始日期</p>
                  <p className="mt-1 font-mono text-sm font-black tabular-nums text-emerald-100">2026.07.21</p>
                </div>
                <div className="rounded-2xl border border-amber-200/12 bg-amber-200/[0.055] p-3">
                  <p className="text-[10px] font-bold text-amber-100/55">结束日期</p>
                  <p className="mt-1 font-mono text-sm font-black tabular-nums text-amber-100">2026.11.17</p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-2">
                <div className="rounded-2xl border border-white/10 bg-black/24 p-3">
                  <p className="text-[10px] font-bold text-slate-500">完成天数</p>
                  <p className="mt-1 font-mono text-xl font-black tabular-nums text-white">{completedDaysView.length}/{COMPLETION_TARGET_DAYS}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/24 p-3">
                  <p className="text-[10px] font-bold text-slate-500">累计公里</p>
                  <p className="mt-1 font-mono text-xl font-black tabular-nums text-emerald-200">{completedDistance.toFixed(1)}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/24 p-3">
                  <p className="text-[10px] font-bold text-slate-500">奖励</p>
                  <p className="mt-1 font-mono text-xl font-black tabular-nums text-amber-200">{openedBoxes}/{totalRewardCount}</p>
                </div>
              </div>

              {!started && !showCompletionPreview && (
                <button
                  onClick={onStartPlan}
                  className="mt-5 h-12 w-full rounded-full bg-white text-sm font-black text-slate-950 shadow-[0_12px_28px_rgba(255,255,255,0.12)] active:scale-[0.98]"
                >
                  开启30天计划
                </button>
              )}
            </div>
          </section>

          {isPlanVisible && (
            <motion.section
              className="mt-4 rounded-2xl border border-emerald-300/15 bg-[#0d1412]/90 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.045)]"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.12}
              onDragEnd={handleRouteSwipe}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-300/70">
                    {planComplete ? 'PLAN COMPLETE' : `DAY ${activeDay}`}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-black tracking-tight text-white">
                      {planComplete ? '整期计划已完成' : activeDay === nextDay ? '今日推荐路线' : `第 ${activeDay} 天路线`}
                    </h2>
                    {!planComplete && activeDay === nextDay && !todayCompleted && (
                      <button
                        type="button"
                        onClick={handleShuffleRoute}
                        className="inline-flex h-8 items-center gap-1.5 rounded-full border border-emerald-200/20 bg-emerald-200/10 px-3 text-[11px] font-black text-emerald-100 active:scale-95"
                      >
                        <Shuffle size={13} />
                        换一条
                      </button>
                    )}
                  </div>
                </div>
                <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 font-mono text-xs font-black text-emerald-100">
                  {activeDay}/{PLAN_WINDOW_DAYS}
                </div>
              </div>
              <p className="mt-2 text-[11px] font-bold text-slate-500">左右滑动切换日期查看路线</p>

              {todayRoute && (
                <div className="mt-4 overflow-hidden rounded-2xl border border-white/[0.08] bg-black/25">
                  <div className="relative h-32">
                    <img src={todayRoute.image} alt={todayRoute.cityName} className="h-full w-full object-cover opacity-75" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-100">
                        <MapPin size={14} />
                        {todayRoute.cityName}
                      </div>
                      <h3 className="mt-1 text-xl font-black text-white">{todayRoute.routeData.title}</h3>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 p-3">
                    <div className="rounded-xl bg-white/[0.045] p-2">
                      <p className="text-[10px] text-slate-500">距离</p>
                      <p className="font-mono text-sm font-black text-white">{todayRoute.routeData.distance} km</p>
                    </div>
                    <div className="rounded-xl bg-white/[0.045] p-2">
                      <p className="text-[10px] text-slate-500">预计时长</p>
                      <p className="font-mono text-sm font-black text-white">{todayRoute.routeData.duration}</p>
                    </div>
                    <div className="rounded-xl bg-white/[0.045] p-2">
                      <p className="text-[10px] text-slate-500">消耗</p>
                      <p className="font-mono text-sm font-black text-white">{todayRoute.routeData.calories}</p>
                    </div>
                  </div>
                  {todayCompleted ? (
                    <div className="mx-3 mb-3">
                      <div className="flex h-10 w-full items-center justify-center gap-2 rounded-full border border-emerald-300/25 bg-emerald-300/10 text-sm font-black text-emerald-200">
                        <CheckCircle2 size={18} />
                        已完成
                      </div>
                    </div>
                  ) : isFutureDay ? (
                    <button
                      type="button"
                      disabled
                      className="mx-3 mb-3 flex h-11 w-[calc(100%-24px)] items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.035] text-sm font-black text-slate-500"
                    >
                      <Lock size={16} />
                      日期未到，暂不可开始
                    </button>
                  ) : (
                    <button
                      onClick={() => onNavigateToRouteDetail(todayRoute.cityId, todayRoute.routeIndex, todayRoute.image, todayRoute.day)}
                      className="mx-3 mb-3 flex h-11 w-[calc(100%-24px)] items-center justify-center gap-2 rounded-full bg-emerald-300 text-sm font-black text-slate-950 shadow-[0_12px_28px_rgba(52,211,153,0.20)] active:scale-[0.98]"
                    >
                      <Play size={17} className="fill-slate-950" />
                      去完成
                    </button>
                  )}
                </div>
              )}
            </motion.section>
          )}

          <section className="relative mt-4 overflow-hidden rounded-[26px] border border-orange-200/18 bg-gradient-to-br from-[#111816] via-[#19140d] to-[#21120d] p-4 text-slate-100 shadow-[0_20px_54px_rgba(0,0,0,0.34)]">
            <div className="absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_16%_0%,rgba(52,211,153,0.13),transparent_48%),radial-gradient(circle_at_84%_0%,rgba(251,146,60,0.22),transparent_46%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.055),transparent_42%)]" />
            <div className="relative flex items-center justify-between gap-3">
              <h2 className="text-lg font-black tracking-tight text-white">
                完成30天领<span className="ml-1 font-mono text-xl text-amber-300 tabular-nums">8.8元</span>
              </h2>
              <div className="rounded-full border border-white/10 bg-white/[0.08] px-3 py-1 text-xs font-bold text-slate-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                已完成{completedDaysView.length}天
              </div>
            </div>

            <div className="relative mt-5 grid grid-cols-5 gap-2">
              {MILESTONE_DAYS.map((day, index) => {
                const earned = rewardBoxesView.includes(day);
                const opened = openedRewardDaysView.includes(day);
                const record = rewardHistoryView.find(item => item.day === day);
                const isOpening = openingRewardDay === day;
                const isNext = !earned && day === nextRewardDay;
                const amount = opened ? record?.amount : getPreviewRewardAmount(day);
                const label = `第${day}天`;
                return (
                  <button
                    key={day}
                    type="button"
                    disabled={!earned || opened || openingRewardDay !== null}
                    onClick={() => earned && !opened && handleOpenReward(day)}
                    className={`group relative flex min-w-0 flex-col items-center text-center transition ${
                      earned && !opened ? 'active:scale-95' : ''
                    }`}
                  >
                    {index < MILESTONE_DAYS.length - 1 && (
                      <span className={`pointer-events-none absolute left-[64%] top-8 h-px w-[72%] border-t ${
                        earned ? 'border-dashed border-rose-300/50' : 'border-dashed border-white/12'
                      }`} />
                    )}
                    <div className={`relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl transition ${
                      opened
                        ? 'border border-white/12 bg-gradient-to-br from-white/[0.16] via-white/[0.08] to-white/[0.035] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]'
                        : earned
                          ? 'bg-gradient-to-br from-[#ff7a63] via-[#f43f5e] to-[#fb923c] shadow-[0_10px_26px_rgba(244,63,94,0.28),0_0_0_1px_rgba(255,255,255,0.10)] ring-2 ring-amber-200/20'
                          : isNext
                            ? 'bg-gradient-to-br from-[#704034] via-[#7f3648] to-[#8b4d2f] shadow-[0_8px_20px_rgba(251,146,60,0.14)]'
                            : 'bg-gradient-to-br from-white/[0.10] via-white/[0.055] to-white/[0.025] opacity-70 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
                    } ${isOpening ? 'animate-pulse ring-2 ring-orange-300/55' : ''}`}>
                      <div className={`absolute inset-x-1 top-2 h-5 rounded-t-xl ${opened ? 'bg-white/8' : 'bg-white/25'}`} />
                      <div className={`absolute left-1/2 top-7 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border shadow-[0_2px_8px_rgba(249,115,22,0.35)] ${
                        opened
                          ? 'border-white/20 bg-white/14'
                          : 'border-orange-100/80 bg-gradient-to-br from-[#fff4b5] to-[#ffb44d]'
                      }`} />
                      {opened ? (
                        <CheckCircle2 size={18} className="relative mt-4 text-emerald-200 drop-shadow" />
                      ) : earned ? (
                        <Gift size={18} className={`relative mt-4 text-white drop-shadow ${isOpening ? 'animate-bounce' : ''}`} />
                      ) : (
                        <Lock size={15} className="relative mt-4 text-white/70" />
                      )}
                    </div>
                    <p className={`mt-2 font-mono text-sm font-black tabular-nums ${
                      opened ? 'text-slate-400' : earned ? 'text-rose-200' : isNext ? 'text-amber-200' : 'text-slate-500'
                    }`}>
                      {amount}
                    </p>
                    <p className={`mt-0.5 rounded-full px-2 py-0.5 text-xs font-black ${
                      opened
                        ? 'bg-emerald-300/10 text-emerald-200'
                        : earned
                          ? 'bg-rose-400/18 text-rose-100 shadow-[0_0_16px_rgba(251,113,133,0.18)]'
                          : isNext
                            ? 'text-amber-300'
                            : 'text-slate-500'
                    }`}>
                      {opened ? '已领取' : earned ? '可领取' : label}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="relative mt-5 h-2 overflow-hidden rounded-full bg-white/[0.08]">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-rose-400 via-orange-300 to-amber-200"
                initial={false}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
              />
            </div>
            <div className="relative mt-2 flex items-center justify-between text-[11px] font-bold text-slate-400">
              <span>{planComplete ? '计划已完成' : nextRewardDay ? `下一奖励第${nextRewardDay}天` : '全部奖励已解锁'}</span>
              <span>{progressPercent}%</span>
            </div>
          </section>

          <section className="mt-4 rounded-2xl border border-white/[0.09] bg-white/[0.035] p-4">
            <div className="flex gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-emerald-300/10 text-emerald-200">
                <Route size={18} />
              </div>
              <div>
                <h3 className="text-sm font-black text-white">活动规则</h3>
                <div className="mt-2 space-y-2 text-xs font-semibold leading-5 text-slate-400">
                  <p>1. 120天期限内，每天按顺序完成 1 条推荐路线。</p>
                  <p>2. 累计完成30天即完成计划。</p>
                  <p>3. 完成第 1、7、15、21、30 天时获得固定红包奖励，领取后可查看现金奖励。</p>
                  <p>4. 获得的红包可在【我的】-【我的钱包】中提现。</p>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="absolute left-1/2 top-20 z-50 -translate-x-1/2 whitespace-nowrap rounded-full bg-white px-4 py-2 text-xs font-black text-slate-950 shadow-xl"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {rewardReveal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 p-6 backdrop-blur-lg"
          >
            <motion.div
              initial={{ scale: 0.82, y: 24 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className="relative w-full max-w-[300px] overflow-hidden rounded-[30px] border border-amber-200/25 bg-[#130d08] p-6 text-center shadow-[0_28px_90px_rgba(0,0,0,0.65)]"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(251,191,36,0.34),transparent_34%),radial-gradient(circle_at_50%_100%,rgba(244,63,94,0.24),transparent_48%)]" />
              <div className="absolute inset-x-8 top-5 h-px bg-gradient-to-r from-transparent via-amber-200/70 to-transparent" />
              {[0, 1, 2, 3, 4, 5].map(item => (
                <motion.span
                  key={item}
                  className="absolute h-1.5 w-1.5 rounded-full bg-amber-200 shadow-[0_0_16px_rgba(251,191,36,0.9)]"
                  initial={{
                    opacity: 0,
                    x: 138,
                    y: 128,
                    scale: 0.4
                  }}
                  animate={{
                    opacity: [0, 1, 0],
                    x: 138 + Math.cos((item / 6) * Math.PI * 2) * 104,
                    y: 128 + Math.sin((item / 6) * Math.PI * 2) * 82,
                    scale: [0.4, 1, 0.7]
                  }}
                  transition={{
                    duration: 1.1,
                    repeat: Infinity,
                    delay: item * 0.08,
                    ease: 'easeOut'
                  }}
                />
              ))}

              <div className="relative mx-auto mt-2 flex h-28 w-28 items-center justify-center">
                <motion.div
                  className="absolute inset-0 rounded-full bg-amber-200/20 blur-2xl"
                  animate={{ scale: rewardReveal.phase === 'opening' ? [1, 1.34, 1.08] : [0.9, 1.08, 0.9], opacity: [0.42, 0.88, 0.5] }}
                  transition={{ duration: rewardReveal.phase === 'opening' ? 0.7 : 1.4, repeat: rewardReveal.phase === 'opening' ? 0 : Infinity }}
                />
                <motion.div
                  className="relative flex h-24 w-24 items-center justify-center rounded-[28px] border border-amber-100/35 bg-gradient-to-br from-[#ff4b2e] via-[#ff7a1a] to-[#ffd15d] text-white shadow-[0_20px_50px_rgba(248,113,22,0.36)]"
                  animate={rewardReveal.phase === 'opening'
                    ? { rotateY: [0, 18, -16, 0], scale: [1, 1.08, 0.96, 1.12] }
                    : { y: [0, -8, 0], rotate: [-2, 2, -2] }}
                  transition={{ duration: rewardReveal.phase === 'opening' ? 0.82 : 1.5, repeat: rewardReveal.phase === 'opening' ? 0 : Infinity }}
                >
                  <div className="absolute left-0 right-0 top-0 h-9 rounded-t-[28px] bg-white/18" />
                  <div className="absolute inset-x-3 top-9 h-px bg-yellow-100/70" />
                  <Gift size={42} className="relative drop-shadow-[0_4px_12px_rgba(0,0,0,0.35)]" />
                </motion.div>
              </div>

              <p className="relative mt-5 text-[10px] font-black uppercase tracking-[0.28em] text-amber-100/80">
                DAY {rewardReveal.day} REWARD
              </p>
              <h3 className="relative mt-2 text-2xl font-black text-white">
                {rewardReveal.phase === 'collecting' ? '红包奖励已获得' : '正在领取奖励'}
              </h3>
              <p className="relative mt-2 text-xs font-bold leading-5 text-amber-100/70">
                {rewardReveal.phase === 'collecting' ? '奖励正在发放，准备领取现金红包。' : '领取处理中，马上公布本次奖励。'}
              </p>

              <div className="relative mt-5 h-2 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-amber-200 via-orange-300 to-rose-300"
                  initial={{ width: '12%' }}
                  animate={{ width: rewardReveal.phase === 'collecting' ? '54%' : '100%' }}
                  transition={{ duration: rewardReveal.phase === 'collecting' ? 0.56 : 0.86, ease: 'easeOut' }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/78 p-6 backdrop-blur-md"
            onClick={() => setResult(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 24 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 230, damping: 22 }}
              className={`relative w-full max-w-[330px] overflow-hidden rounded-[32px] border p-7 text-center shadow-[0_30px_100px_rgba(0,0,0,0.66)] ${
                result.day >= COMPLETION_TARGET_DAYS
                  ? 'border-amber-200/18 bg-[#3a1212]'
                  : 'border-emerald-200/16 bg-[#0b1117]'
              }`}
              onClick={event => event.stopPropagation()}
            >
              <div className={`absolute inset-0 ${
                result.day >= COMPLETION_TARGET_DAYS
                  ? 'bg-[radial-gradient(circle_at_50%_18%,rgba(251,146,60,0.40),transparent_36%),radial-gradient(circle_at_82%_88%,rgba(244,63,94,0.22),transparent_48%)]'
                  : 'bg-[radial-gradient(circle_at_50%_0%,rgba(250,204,21,0.20),transparent_38%),radial-gradient(circle_at_50%_100%,rgba(52,211,153,0.20),transparent_54%)]'
              }`} />
              <button
                type="button"
                onClick={() => setResult(null)}
                className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-white/[0.08] text-white/70 active:scale-95"
              >
                ×
              </button>
              {[0, 1, 2, 3].map(item => (
                <motion.span
                  key={item}
                  className="absolute h-1.5 w-1.5 rounded-full bg-amber-200/70 shadow-[0_0_14px_rgba(251,191,36,0.75)]"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{
                    opacity: [0, 1, 0.25],
                    scale: [0.5, 1, 0.7],
                    x: [0, (item % 2 === 0 ? 1 : -1) * (56 + item * 18)],
                    y: [0, -42 - item * 12]
                  }}
                  transition={{ duration: 1.8, repeat: Infinity, delay: item * 0.18 }}
                  style={{ left: `${42 + item * 12}%`, top: `${38 + item * 8}%` }}
                />
              ))}

              <div className={`relative mx-auto flex h-24 w-24 items-center justify-center ${
                result.day >= COMPLETION_TARGET_DAYS
                  ? 'rounded-[30px] bg-gradient-to-br from-[#ff7b4b] via-[#ff742f] to-[#ffbe4d] text-white shadow-[0_22px_58px_rgba(248,113,22,0.34)]'
                  : 'rounded-[26px] border border-amber-200/22 bg-amber-300/12 text-amber-100 shadow-[0_0_42px_rgba(250,204,21,0.16)]'
              }`}>
                {result.day >= COMPLETION_TARGET_DAYS ? (
                  <>
                    <div className="absolute inset-x-2 top-5 h-8 rounded-t-[24px] bg-white/18" />
                    <div className="absolute inset-x-4 top-11 h-px bg-yellow-100/70" />
                    <Gift size={42} className="relative drop-shadow-[0_4px_12px_rgba(0,0,0,0.35)]" />
                  </>
                ) : (
                  <Trophy size={42} />
                )}
              </div>
              <p className={`relative mt-6 text-[10px] font-black uppercase tracking-[0.28em] ${
                result.day >= COMPLETION_TARGET_DAYS ? 'text-amber-100/80' : 'text-amber-100'
              }`}>
                {result.day >= COMPLETION_TARGET_DAYS ? '现金红包到账' : `第${result.day}天红包`}
              </p>
              {result.day >= COMPLETION_TARGET_DAYS && (
                <h3 className="relative mt-3 text-2xl font-black tracking-tight text-white">
                  第{result.day}天红包
                </h3>
              )}
              <p className={`relative mt-4 font-black tracking-[-0.08em] ${
                result.day >= COMPLETION_TARGET_DAYS
                  ? 'text-6xl text-[#fff4bd]'
                  : 'text-6xl text-white'
              }`}>
                {result.amount}
              </p>
              <button
                onClick={() => setResult(null)}
                className={`relative mt-8 h-14 w-full rounded-full text-base font-black shadow-[0_16px_34px_rgba(52,211,153,0.24)] active:scale-[0.98] ${
                  result.day >= COMPLETION_TARGET_DAYS
                    ? 'bg-gradient-to-r from-[#fff7bd] to-[#ffd79c] text-[#2b0e06]'
                    : 'bg-emerald-300 text-slate-950'
                }`}
              >
                收下红包
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
