import { useState, useEffect } from 'react';
import { Compass, Trophy, Map as MapIcon, User, Gift, Medal, Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import HomeTab from './components/HomeTab';
import EventsTab from './components/EventsTab';
import { CITIES } from './data/cities';
import CitiesTab from './components/CitiesTab';
import ProfileTab from './components/ProfileTab';
import CityRoutesView from './components/CityRoutesView';
import RouteDetailView from './components/RouteDetailView';
import RunPlaybackView from './components/RunPlaybackView';
import IntroScreen from './components/IntroScreen';
import LitRecordsView from './components/LitRecordsView';
import LeaderboardView from './components/LeaderboardView';
import WeekendMedleyView from './components/WeekendMedleyView';
import TeamRelayView, { type TeamRelayMember, type TeamRelayTask } from './components/TeamRelayView';
import GlowCenterView, { type GlowExchangeType } from './components/GlowCenterView';
import GlowWheelView from './components/GlowWheelView';
import MedalLotteryView from './components/MedalLotteryView';
import WeightLossPlanView, { type WeightPlanRewardRecord } from './components/WeightLossPlanView';
import { getGlowRank, getGlowWheelDailyExchangeLimit } from './lib/glow';

const ENABLE_GLOW_TASKS = false;
const DEFAULT_LIT_CITY_IDS = ['2', '1'];
const DEFAULT_IN_PROGRESS_CITY_ID = '15';
const DEFAULT_IN_PROGRESS_COMPLETED_ROUTE_INDICES = [1];
const DEFAULT_MAIN_CITY_SEQUENCE = [...DEFAULT_LIT_CITY_IDS, DEFAULT_IN_PROGRESS_CITY_ID];

type NewbieCashReward = {
  id: 'activate-treadmill' | 'first-route' | 'thirty-day-plan';
  title: string;
  amount: string;
  description: string;
};

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [showEventsBadge, setShowEventsBadge] = useState(true);
  const [showIntro, setShowIntro] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [showTreadmillActivationTip, setShowTreadmillActivationTip] = useState(false);
  const [showDailyRouteTaskGuide, setShowDailyRouteTaskGuide] = useState(false);
  const [showRouteMedalGuide, setShowRouteMedalGuide] = useState(false);
  const [newbieCashReward, setNewbieCashReward] = useState<NewbieCashReward | null>(null);
  const [taskPanelOpenSignal, setTaskPanelOpenSignal] = useState(0);
  const [fullScreenPage, setFullScreenPage] = useState<{type: 'cityRoutes' | 'routeDetail' | 'runPlayback' | 'litRecords' | 'leaderboard' | 'weekendMedley' | 'teamRelay' | 'glowCenter' | 'glowWheel' | 'medalLottery' | 'weightLossPlan', data?: any} | null>(null);

  // Weekend City Memory Medley Activity states
  const [medleySelectedRouteIds, setMedleySelectedRouteIds] = useState<string[]>([]);
  const [medleyCompletedRouteIds, setMedleyCompletedRouteIds] = useState<string[]>([]);
  const [medleyLotteryChances, setMedleyLotteryChances] = useState<number>(0);
  const [medleyDrawHistory, setMedleyDrawHistory] = useState<number[]>([]);
  const [medleyShareBonusClaimed, setMedleyShareBonusClaimed] = useState<boolean>(false);
  const [medleyActivityStarted, setMedleyActivityStarted] = useState<boolean>(false);
  const [medleyCompletionRewardClaimed, setMedleyCompletionRewardClaimed] = useState<boolean>(false);

  // City Puzzle Team Activity states
  const [teamRelayStarted, setTeamRelayStarted] = useState<boolean>(false);
  const [teamRelayMembers, setTeamRelayMembers] = useState<TeamRelayMember[]>([]);
  const [teamRelayTasks, setTeamRelayTasks] = useState<TeamRelayTask[]>([]);
  const [teamRelayCompletedTaskIds, setTeamRelayCompletedTaskIds] = useState<string[]>([]);
  const [teamRelayLotteryChances, setTeamRelayLotteryChances] = useState<number>(0);
  const [teamRelayDrawHistory, setTeamRelayDrawHistory] = useState<number[]>([]);
  const [teamRelayShareBonusClaimed, setTeamRelayShareBonusClaimed] = useState<boolean>(false);
  const [teamRelayCityId, setTeamRelayCityId] = useState<string | null>(null);
  const [teamRelayPuzzleAwarded, setTeamRelayPuzzleAwarded] = useState<boolean>(false);

  // 30-Day Weight Loss Plan states
  const [weightPlanStarted, setWeightPlanStarted] = useState<boolean>(false);
  const [weightPlanCompletedDays, setWeightPlanCompletedDays] = useState<number[]>([]);
  const [weightPlanRewardBoxes, setWeightPlanRewardBoxes] = useState<number[]>([]);
  const [weightPlanOpenedRewardDays, setWeightPlanOpenedRewardDays] = useState<number[]>([]);
  const [weightPlanRewardHistory, setWeightPlanRewardHistory] = useState<WeightPlanRewardRecord[]>([]);
  const [litCityIds, setLitCityIds] = useState<string[]>(() => {
    CITIES.forEach(c => {
      if (c.status !== 'upcoming') c.status = 'unlit';
      c.completed = 0;
      c.completedRouteIndices = [];
      c.completedRouteTimestamps = {};
      c.justLit = false;
    });
    CITIES.forEach(c => {
      if (DEFAULT_LIT_CITY_IDS.includes(c.id)) {
        c.status = 'lit';
        c.completed = c.routes;
        c.completedRouteIndices = Array.from({ length: c.routes }, (_, index) => index + 1);
      } else if (c.id === DEFAULT_IN_PROGRESS_CITY_ID) {
        c.status = 'in-progress';
        c.completed = DEFAULT_IN_PROGRESS_COMPLETED_ROUTE_INDICES.length;
        c.completedRouteIndices = DEFAULT_IN_PROGRESS_COMPLETED_ROUTE_INDICES;
      }
    });
    return DEFAULT_MAIN_CITY_SEQUENCE;
  });

  const [completedChapters, setCompletedChapters] = useState<number[]>([]);
  const [targetFlight, setTargetFlight] = useState<{fromCityId: string, toCityId: string} | null>(null);
  const [pendingSelectionFrom, setPendingSelectionFrom] = useState<string | null>(null);
  const [userStats, setUserStats] = useState({
    completedCities: 2,
    completedRoutes: 7,
    totalDistance: 62.0,
    totalTimeHours: 12.0,
    lightValue: 120,
    lifetimeLightValue: 120,
    dailyCheckedIn: false,
    dailyDistance: 0,
    dailyTreadmillStarted: false,
    dailyCompletedRoutes: 0,
    weeklyCompletedCities: 0,
    claimedDailyTaskIds: [] as string[],
    claimedWeeklyTaskIds: [] as string[],
    medalMysteryTickets: 0,
    weeklyGlowExchangeIds: [] as string[],
    unlockedGlowPerkIds: [] as string[],
    claimedGlowRankRewardLevels: [] as number[],
    glowRankRewardHistory: [] as Array<{ level: number; amount: string; claimedAt: string }>,
    glowWheelChances: 0,
    dailyGlowWheelExchangeCount: 0,
    glowWheelDrawHistory: [] as Array<{ id: string; amount: number; createdAt: string }>,
    newbieCashRewardClaimedIds: [] as string[],
    newbieCashRewardHistory: [] as Array<{ id: string; title: string; amount: string; createdAt: string }>
  });

  const tabs = [
    { id: 'home', label: '首页', icon: Compass },
    { id: 'events', label: '活动', icon: Trophy },
    { id: 'cities', label: '城市', icon: MapIcon },
    { id: 'profile', label: '我的', icon: User },
  ];

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setShowSplash(false);
      if (!(userStats.newbieCashRewardClaimedIds || []).includes('activate-treadmill')) {
        setShowTreadmillActivationTip(true);
      }
    }, 1800);

    return () => window.clearTimeout(timer);
  }, []);

  const issueNewbieCashReward = (reward: NewbieCashReward) => {
    if ((userStats.newbieCashRewardClaimedIds || []).includes(reward.id)) {
      return;
    }

    const createdAt = new Date().toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });

    setUserStats(prev => {
      if ((prev.newbieCashRewardClaimedIds || []).includes(reward.id)) {
        return prev;
      }

      return {
        ...prev,
        newbieCashRewardClaimedIds: [...(prev.newbieCashRewardClaimedIds || []), reward.id],
        newbieCashRewardHistory: [
          {
            id: reward.id,
            title: reward.title,
            amount: reward.amount,
            createdAt
          },
          ...(prev.newbieCashRewardHistory || [])
        ]
      };
    });

    setNewbieCashReward(reward);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomeTab 
          userStats={userStats}
          setUserStats={setUserStats}
          taskPanelOpenSignal={taskPanelOpenSignal}
          onTreadmillActivated={() => {
            issueNewbieCashReward({
              id: 'activate-treadmill',
              title: '跑步机激活红包',
              amount: '1.80',
              description: '首次下载并连接跑步机激活成功'
            });
          }}
          onNavigate={(type, data) => setFullScreenPage({ type: type as any, data })} 
          completedChapters={completedChapters} 
          targetFlight={targetFlight} 
          pendingSelectionFrom={pendingSelectionFrom}
          litCityIds={litCityIds}
          onCitySelected={(cityId) => {
            if (pendingSelectionFrom) {
              setTargetFlight({ fromCityId: pendingSelectionFrom, toCityId: cityId });
              setPendingSelectionFrom(null);
            } else {
              // Direct selection or first selection
              const city = CITIES.find(c => c.id === cityId);
              if (city) {
                CITIES.forEach(c => { if(c.status === 'in-progress') c.status = 'unlit'; });
                city.status = 'in-progress';
                setLitCityIds(prev => {
                  if (prev.includes(cityId)) return prev;
                  return [...prev, cityId];
                });
              }
            }
          }}
          onFlightComplete={() => {
          if (targetFlight) {
            const nextCity = CITIES.find(c => c.id === targetFlight.toCityId);
            if (nextCity && (nextCity.status === 'unlit' || nextCity.status === 'in-progress')) {
              nextCity.status = 'in-progress';
              setLitCityIds(prev => {
                if (prev.includes(nextCity.id)) return prev;
                return [...prev, nextCity.id];
              });
            }
          }
          setTargetFlight(null);
        }} />;
      case 'events':
        return (
          <EventsTab
            onSelectMedley={() => setFullScreenPage({ type: 'weekendMedley' })}
            onSelectWeightLossPlan={() => setFullScreenPage({ type: 'weightLossPlan' })}
            onSelectTeamRelay={() => setFullScreenPage({ type: 'teamRelay' })}
            onSelectMedalLottery={() => setFullScreenPage({ type: 'medalLottery' })}
          />
        );
      case 'cities':
        return <CitiesTab onCityClick={(city) => setFullScreenPage({ type: 'cityRoutes', data: city })} />;
      case 'profile':
        return <ProfileTab userStats={userStats} />;
      default:
        return <HomeTab userStats={userStats} setUserStats={setUserStats} />;
    }
  };

  const handleGlowExchange = (type: GlowExchangeType) => {
    const exchangeMeta = {
      activityTicket: { title: '串烧补给券', cost: 10, requiredRankLevel: 3, weeklyLimit: 1, oneTime: false },
      rerollCity: { title: '下一城重选券', cost: 3, requiredRankLevel: 0, weeklyLimit: 0, oneTime: false },
      medalMysteryTicket: { title: '勋章盲盒抽奖券', cost: 10, requiredRankLevel: 3, weeklyLimit: 1, oneTime: false },
      silverTrail: { title: '银光路线主题', cost: 8, requiredRankLevel: 2, weeklyLimit: 0, oneTime: true },
      diamondFrame: { title: '钻石头像框', cost: 20, requiredRankLevel: 4, weeklyLimit: 0, oneTime: true },
      starlightBadge: { title: '星耀徽记', cost: 30, requiredRankLevel: 5, weeklyLimit: 0, oneTime: true },
      kingNameplate: { title: '王者铭牌', cost: 50, requiredRankLevel: 6, weeklyLimit: 0, oneTime: true }
    }[type];
    const currentGlowRank = getGlowRank(userStats.lifetimeLightValue ?? userStats.lightValue ?? 0).current;
    const weeklyGlowExchangeIds = userStats.weeklyGlowExchangeIds || [];

    if (exchangeMeta.requiredRankLevel && currentGlowRank.level < exchangeMeta.requiredRankLevel) {
      return { success: false, message: '黄金段位以上可兑换' };
    }

    if (exchangeMeta.weeklyLimit && weeklyGlowExchangeIds.includes(type)) {
      return { success: false, message: '本周已兑换' };
    }

    if (exchangeMeta.oneTime && (userStats.unlockedGlowPerkIds || []).includes(type)) {
      return { success: false, message: '该权益已拥有' };
    }

    if ((userStats.lightValue || 0) < exchangeMeta.cost) {
      return { success: false, message: '光迹值不足' };
    }

    setUserStats(prev => ({
      ...prev,
      lightValue: Math.max(0, (prev.lightValue || 0) - exchangeMeta.cost),
      medalMysteryTickets: type === 'medalMysteryTicket'
        ? (prev.medalMysteryTickets || 0) + 1
        : (prev.medalMysteryTickets || 0),
      weeklyGlowExchangeIds: exchangeMeta.weeklyLimit
        ? [...(prev.weeklyGlowExchangeIds || []), type]
        : (prev.weeklyGlowExchangeIds || []),
      unlockedGlowPerkIds: exchangeMeta.oneTime
        ? [...(prev.unlockedGlowPerkIds || []), type]
        : (prev.unlockedGlowPerkIds || [])
    }));

    if (type === 'activityTicket') {
      setMedleyLotteryChances(prev => prev + 1);
      return { success: true, message: '周末串烧抽奖机会 +1' };
    }

    if (type === 'medalMysteryTicket') {
      return { success: true, message: '已获得勋章盲盒抽奖券' };
    }

    if (exchangeMeta.oneTime) {
      return { success: true, message: `已解锁${exchangeMeta.title}` };
    }

    const currentCityId = CITIES.find(city => city.status === 'in-progress')?.id || litCityIds[litCityIds.length - 1] || '1';
    setActiveTab('home');
    setFullScreenPage(null);
    setPendingSelectionFrom(currentCityId);
    return { success: true, message: '已开启下一城重选' };
  };

  const handleClaimGlowRankReward = (level: number) => {
    const currentGlowRank = getGlowRank(userStats.lifetimeLightValue ?? userStats.lightValue ?? 0).current;
    if (level > currentGlowRank.level) {
      return { success: false, message: '尚未达到该段位' };
    }

    if ((userStats.claimedGlowRankRewardLevels || []).includes(level)) {
      return { success: false, message: '该段位红包已领取' };
    }

    const rewardAmounts: Record<number, string> = {
      1: '0.18',
      2: '0.38',
      3: '0.88',
      4: '1.88',
      5: '5.88',
      6: '8.88'
    };
    const amount = rewardAmounts[level] || '0.18';

    setUserStats(prev => ({
      ...prev,
      claimedGlowRankRewardLevels: [...(prev.claimedGlowRankRewardLevels || []), level],
      glowRankRewardHistory: [
        {
          level,
          amount,
          claimedAt: new Date().toLocaleString('zh-CN', {
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          })
        },
        ...(prev.glowRankRewardHistory || [])
      ]
    }));

    return { success: true, message: `获得段位红包 ¥${amount}`, amount };
  };

  const handleGlowWheelExchange = (cost: number) => {
    const currentGlowRank = getGlowRank(userStats.lifetimeLightValue ?? userStats.lightValue ?? 0).current;
    const dailyExchangeLimit = getGlowWheelDailyExchangeLimit(currentGlowRank.level);
    const exchangedToday = userStats.dailyGlowWheelExchangeCount || 0;

    if (exchangedToday >= dailyExchangeLimit) {
      return { success: false, message: `今日兑换已达上限（${dailyExchangeLimit} 张）` };
    }

    if ((userStats.lightValue || 0) < cost) {
      return { success: false, message: '光迹值不足' };
    }

    setUserStats(prev => ({
      ...prev,
      lightValue: Math.max(0, (prev.lightValue || 0) - cost),
      glowWheelChances: (prev.glowWheelChances || 0) + 1,
      dailyGlowWheelExchangeCount: (prev.dailyGlowWheelExchangeCount || 0) + 1
    }));

    return { success: true, message: '已兑换 1 张抽奖券' };
  };

  const handleGlowWheelDraw = (amount: number) => {
    if ((userStats.glowWheelChances || 0) <= 0) {
      return { success: false, message: '暂无抽奖机会' };
    }

    setUserStats(prev => ({
      ...prev,
      glowWheelChances: Math.max(0, (prev.glowWheelChances || 0) - 1),
      glowWheelDrawHistory: [
        {
          id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
          amount,
          createdAt: new Date().toLocaleString('zh-CN', {
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          })
        },
        ...(prev.glowWheelDrawHistory || [])
      ].slice(0, 20)
    }));

    return { success: true, message: `抽中 ¥${amount.toFixed(2)}` };
  };

  const handleMedalLotteryDraw = () => {
    if ((userStats.medalMysteryTickets || 0) <= 0) {
      return { success: false, message: '暂无勋章盲盒券，请先兑换抽奖机会' };
    }

    const prizePool = ['2.66 元', '1.66 元', '6 分', '2.66 元', '1.66 元', '6 分'];
    const amount = prizePool[Math.floor(Math.random() * prizePool.length)];
    setUserStats(prev => ({
      ...prev,
      medalMysteryTickets: Math.max(0, (prev.medalMysteryTickets || 0) - 1)
    }));

    return { success: true, message: `抽中 ${amount}`, amount };
  };

  const handleWeightPlanRewardOpen = (day: number) => {
    if (!weightPlanRewardBoxes.includes(day)) {
      return { success: false, message: '完成节点后可开启红包盲盒' };
    }

    const existingRecord = weightPlanRewardHistory.find(record => record.day === day);
    if (existingRecord) {
      return { success: false, message: '该盲盒已开启', amount: existingRecord.amount };
    }

    const rewardPools: Record<number, string[]> = {
      1: ['¥0.18', '¥0.38'],
      7: ['¥0.88', '¥1.88'],
      15: ['¥1.88', '¥5.88'],
      21: ['¥1.88', '¥5.88'],
      30: ['¥5.88', '¥8.88', '¥18.88']
    };
    const pool = rewardPools[day] || ['¥0.18'];
    const amount = pool[Math.floor(Math.random() * pool.length)];
    const record: WeightPlanRewardRecord = {
      day,
      amount,
      openedAt: new Date().toLocaleString('zh-CN', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    setWeightPlanOpenedRewardDays(prev => prev.includes(day) ? prev : [...prev, day]);
    setWeightPlanRewardHistory(prev => [record, ...prev]);
    return { success: true, message: `获得红包 ${amount}`, amount };
  };

  return (
    <div className="flex flex-col h-screen w-full max-w-md mx-auto bg-[#05070A] text-slate-100 overflow-hidden relative font-sans shadow-2xl sm:h-[800px] sm:mt-10 sm:rounded-[40px] sm:border-[8px] sm:border-slate-800">
      <AnimatePresence>
        {showSplash && (
          <motion.div
            className="absolute inset-0 z-[200] bg-[#071226]"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
          >
            <img
              src="./splash.png"
              alt="木卫六"
              className="h-full w-full object-cover"
            />
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showIntro && (
          <IntroScreen 
            onComplete={() => {
              setShowIntro(false);
            }} 
          />
        )}
      </AnimatePresence>
      <main className="flex-1 relative overflow-hidden bg-[#05070A]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="w-full h-full"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>
      
      {/* Bottom Navigation */}
      <nav className="px-6 py-3 shrink-0 bg-black/80 backdrop-blur-2xl border-t border-white/10 pb-3 sm:pb-3 z-50">
        <div className="flex justify-between items-center max-w-3xl mx-auto">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <motion.button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id === 'events') {
                    setShowEventsBadge(false);
                  }
                }}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92, y: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                className={`flex flex-col items-center space-y-1 transition-colors focus:outline-none relative ${
                  isActive ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <div className="w-6 h-6 flex items-center justify-center relative">
                  <Icon size={20} className={isActive ? 'drop-shadow-[0_0_8px_rgba(34,211,238,0.8)] text-cyan-400 transition-all' : 'transition-colors'} />
                  {tab.id === 'events' && showEventsBadge && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border border-black shadow-[0_0_6px_rgba(244,63,94,0.8)]" />
                  )}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest">{tab.label}</span>
              </motion.button>
            );
          })}
        </div>
      </nav>

      {/* Full Screen Pages overlays on top of everything including bottom nav */}
      <AnimatePresence>
        {fullScreenPage && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="absolute inset-0 z-[100] bg-[#05070A]"
          >
            {fullScreenPage.type === 'cityRoutes' && (
               <CityRoutesView 
                 city={fullScreenPage.data} 
                 onBack={() => setFullScreenPage(null)} 
                 onRouteClick={(routeIndex) => setFullScreenPage({ 
                   type: 'routeDetail', 
                   data: { cityId: fullScreenPage.data.id, routeIndex, image: fullScreenPage.data.image, previousCityData: fullScreenPage.data } 
                 })} 
                 onExploreNext={(currentCityId) => {
                   setPendingSelectionFrom(currentCityId);
                   setFullScreenPage(null);
                   setActiveTab('home');
                 }}
               />
            )}
            {fullScreenPage.type === 'routeDetail' && (
               <RouteDetailView 
                 {...fullScreenPage.data}
                 onBack={() => {
                   if (fullScreenPage.data.isTeamRelayRoute) {
                     setFullScreenPage({ type: 'teamRelay' });
                   } else if (fullScreenPage.data.isWeightPlanRoute) {
                     setFullScreenPage({ type: 'weightLossPlan' });
                   } else if (fullScreenPage.data.isActivityRoute) {
                     setFullScreenPage({ type: 'weekendMedley' });
                   } else {
                     setFullScreenPage({ type: 'cityRoutes', data: fullScreenPage.data.previousCityData });
                   }
                 }}
                 onStart={() => {
                   setUserStats(prev => ({
                     ...prev,
                     dailyTreadmillStarted: true
                   }));
                   setFullScreenPage({ type: 'runPlayback', data: fullScreenPage.data });
                 }}
               />
            )}
            {fullScreenPage.type === 'runPlayback' && (
               <RunPlaybackView 
                 {...fullScreenPage.data}
                 onExit={() => setFullScreenPage({ type: 'routeDetail', data: fullScreenPage.data })}
                  onComplete={(stats) => {
                    const earnedLightValue = stats.calories || Math.floor(stats.distance * 65);
                    setShowRouteMedalGuide(true);
                    // Update user stats
                    const shouldShowDailyRouteTaskGuide = ENABLE_GLOW_TASKS && (userStats.dailyCompletedRoutes || 0) === 0;
                    setUserStats(prev => ({
                      ...prev,
                      totalDistance: prev.totalDistance + stats.distance,
                      totalTimeHours: prev.totalTimeHours + (stats.duration / 3600),
                      lightValue: (prev.lightValue || 0) + earnedLightValue,
                      lifetimeLightValue: (prev.lifetimeLightValue ?? prev.lightValue ?? 0) + earnedLightValue,
                      dailyDistance: (prev.dailyDistance || 0) + stats.distance,
                      dailyCompletedRoutes: (prev.dailyCompletedRoutes || 0) + 1
                    }));
                    if (shouldShowDailyRouteTaskGuide) {
                      setShowDailyRouteTaskGuide(true);
                    }
                    issueNewbieCashReward({
                      id: 'first-route',
                      title: '首条路线完成红包',
                      amount: '2.80',
                      description: '完成第一条路线，解锁新手现金红包'
                    });

                    if (fullScreenPage.data.isActivityRoute) {
                      const activityKey = `${fullScreenPage.data.cityId}-${fullScreenPage.data.routeIndex}`;
                      const alreadyCompleted = medleyCompletedRouteIds.includes(activityKey);
                      const nextCompleted = alreadyCompleted
                        ? medleyCompletedRouteIds
                        : [...medleyCompletedRouteIds, activityKey];
                      setMedleyCompletedRouteIds(nextCompleted);
                      if (!alreadyCompleted && nextCompleted.length === 3 && !medleyCompletionRewardClaimed) {
                        setMedleyLotteryChances(prevChances => prevChances + 5);
                        setMedleyCompletionRewardClaimed(true);
                      }
                      setFullScreenPage({ type: 'weekendMedley' });
                      return;
                    }

                    if (fullScreenPage.data.isTeamRelayRoute) {
                      const taskId = fullScreenPage.data.teamRelayTaskId || `${fullScreenPage.data.cityId}-${fullScreenPage.data.routeIndex}`;
                      setTeamRelayCompletedTaskIds(prevCompleted => {
                        if (prevCompleted.includes(taskId)) return prevCompleted;
                        const nextCompleted = [...prevCompleted, taskId];
                        if (teamRelayTasks.length > 0 && nextCompleted.length === teamRelayTasks.length && !teamRelayPuzzleAwarded) {
                          setTeamRelayLotteryChances(prevChances => prevChances + 1);
                          setTeamRelayPuzzleAwarded(true);
                        }
                        return nextCompleted;
                      });
                      setFullScreenPage({ type: 'teamRelay' });
                      return;
                    }

                    if (fullScreenPage.data.isWeightPlanRoute) {
                      const day = fullScreenPage.data.weightPlanDay;
                      const milestoneDays = [1, 7, 15, 21, 30];
                      const isNewWeightPlanDay = !weightPlanCompletedDays.includes(day);
                      const nextWeightPlanCompletedCount = isNewWeightPlanDay
                        ? weightPlanCompletedDays.length + 1
                        : weightPlanCompletedDays.length;
                      setWeightPlanCompletedDays(prevCompleted => {
                        if (prevCompleted.includes(day)) return prevCompleted;
                        return [...prevCompleted, day].sort((a, b) => a - b);
                      });
                      if (milestoneDays.includes(day)) {
                        setWeightPlanRewardBoxes(prevBoxes => prevBoxes.includes(day) ? prevBoxes : [...prevBoxes, day]);
                      }
                      if (nextWeightPlanCompletedCount >= 30) {
                        issueNewbieCashReward({
                          id: 'thirty-day-plan',
                          title: '30天燃脂完成红包',
                          amount: '8.80',
                          description: '120天期限内完成30天燃脂计划'
                        });
                      }
                      setFullScreenPage({ type: 'weightLossPlan' });
                      return;
                    }

                    const { previousCityData, routeIndex } = fullScreenPage.data;
                   const realCityData = CITIES.find(c => c.id === previousCityData.id) || previousCityData;
                   const currentCompleted = realCityData.completedRouteIndices || [];
                   
                   if (!currentCompleted.includes(routeIndex)) {
                     realCityData.completedRouteIndices = [...currentCompleted, routeIndex];
                     if (!realCityData.completedRouteTimestamps) {
                       realCityData.completedRouteTimestamps = {};
                     }
                     realCityData.completedRouteTimestamps[routeIndex] = Date.now();
                     realCityData.completed = Math.min(realCityData.completedRouteIndices.length, realCityData.routes);
                     
                     // If this is a newly completed route, increment completedRoutes counter
                     setUserStats(prev => ({ ...prev, completedRoutes: prev.completedRoutes + 1 }));
                   }
                   
                   if (realCityData.completed === realCityData.routes && realCityData.status !== 'lit') {
                     realCityData.status = 'lit';
                     realCityData.justLit = true;
                     // Increment completed cities counter
                     setUserStats(prev => ({
                       ...prev,
                       completedCities: prev.completedCities + 1,
                       weeklyCompletedCities: (prev.weeklyCompletedCities || 0) + 1
                     }));
                   }

                   setCompletedChapters(prev => {
                     const newChapters = [...prev];
                     // Chapter 1: Complete 1 route
                     if (!newChapters.includes(1)) newChapters.push(1);
                     // Chapter 2: Complete 1 city
                     if (realCityData.status === 'lit' && !newChapters.includes(2)) {
                       newChapters.push(2);
                     }
                     
                     const litCount = CITIES.filter(c => c.status === 'lit').length;
                     if (litCount >= 3) {
                       if (!newChapters.includes(3)) newChapters.push(3);
                     }
                     if (litCount >= CITIES.length) {
                       if (!newChapters.includes(4)) newChapters.push(4);
                     }
                     
                     return newChapters;
                   });

                   // Navigate back to cityRoutes with the updated data
                   setFullScreenPage({ type: 'cityRoutes', data: realCityData });
                 }}
               />
            )}
            {fullScreenPage.type === 'litRecords' && (
              <LitRecordsView onBack={() => setFullScreenPage(null)} />
            )}
            {fullScreenPage.type === 'leaderboard' && (
              <LeaderboardView onBack={() => setFullScreenPage(null)} />
            )}
            {fullScreenPage.type === 'glowCenter' && (
              <GlowCenterView
                userStats={userStats}
                onBack={() => setFullScreenPage(null)}
                onExchange={handleGlowExchange}
                onClaimRankReward={handleClaimGlowRankReward}
              />
            )}
            {fullScreenPage.type === 'glowWheel' && (
               <GlowWheelView
                 userStats={userStats}
                 onBack={() => setFullScreenPage({ type: 'glowCenter' })}
                 onExchangeChance={handleGlowWheelExchange}
                 onDraw={handleGlowWheelDraw}
               />
            )}
            {fullScreenPage.type === 'medalLottery' && (
               <MedalLotteryView
                 tickets={userStats.medalMysteryTickets || 0}
                 onBack={() => setFullScreenPage(null)}
                 onGoRun={() => {
                   setFullScreenPage(null);
                   setActiveTab('home');
                 }}
                 onDraw={handleMedalLotteryDraw}
               />
            )}
            {fullScreenPage.type === 'weightLossPlan' && (
               <WeightLossPlanView
                 started={weightPlanStarted}
                 completedDays={weightPlanCompletedDays}
                 rewardBoxes={weightPlanRewardBoxes}
                 openedRewardDays={weightPlanOpenedRewardDays}
                 rewardHistory={weightPlanRewardHistory}
                 onBack={() => setFullScreenPage(null)}
                 onStartPlan={() => setWeightPlanStarted(true)}
                 onOpenReward={handleWeightPlanRewardOpen}
                 onNavigateToRouteDetail={(cityId, routeIndex, image, day) => {
                   setFullScreenPage({
                     type: 'routeDetail',
                     data: {
                       cityId,
                       routeIndex,
                       image,
                       isWeightPlanRoute: true,
                       weightPlanDay: day
                     }
                   });
                 }}
               />
            )}
            {fullScreenPage.type === 'weekendMedley' && (
               <WeekendMedleyView 
                 onBack={() => setFullScreenPage(null)}
                 selectedRouteIds={medleySelectedRouteIds}
                 completedRouteIds={medleyCompletedRouteIds}
                 lotteryChances={medleyLotteryChances}
                 drawHistory={medleyDrawHistory}
                 shareBonusClaimed={medleyShareBonusClaimed}
                 activityStarted={medleyActivityStarted}
                 onUpdateState={(state) => {
                   if (state.selectedRouteIds !== undefined) setMedleySelectedRouteIds(state.selectedRouteIds);
                   if (state.completedRouteIds !== undefined) setMedleyCompletedRouteIds(state.completedRouteIds);
                   if (state.lotteryChances !== undefined) setMedleyLotteryChances(state.lotteryChances);
                   if (state.drawHistory !== undefined) setMedleyDrawHistory(state.drawHistory);
                   if (state.shareBonusClaimed !== undefined) setMedleyShareBonusClaimed(state.shareBonusClaimed);
                   if (state.activityStarted !== undefined) setMedleyActivityStarted(state.activityStarted);
                 }}
                 onNavigateToRouteDetail={(cityId, routeIndex, image) => {
                   setFullScreenPage({
                     type: 'routeDetail',
                     data: {
                       cityId,
                       routeIndex,
                       image,
                       isActivityRoute: true
                     }
                   });
                 }}
               />
            )}
            {fullScreenPage.type === 'teamRelay' && (
               <TeamRelayView
                 onBack={() => setFullScreenPage(null)}
                 started={teamRelayStarted}
                 members={teamRelayMembers}
                 tasks={teamRelayTasks}
                 completedTaskIds={teamRelayCompletedTaskIds}
                 lotteryChances={teamRelayLotteryChances}
                 drawHistory={teamRelayDrawHistory}
                 shareBonusClaimed={teamRelayShareBonusClaimed}
                 cityId={teamRelayCityId}
                 puzzleAwarded={teamRelayPuzzleAwarded}
                 onUpdateState={(state) => {
                   if (state.started !== undefined) setTeamRelayStarted(state.started);
                   if (state.members !== undefined) setTeamRelayMembers(state.members);
                   if (state.tasks !== undefined) setTeamRelayTasks(state.tasks);
                   if (state.completedTaskIds !== undefined) setTeamRelayCompletedTaskIds(state.completedTaskIds);
                   if (state.lotteryChances !== undefined) setTeamRelayLotteryChances(state.lotteryChances);
                   if (state.drawHistory !== undefined) setTeamRelayDrawHistory(state.drawHistory);
                   if (state.shareBonusClaimed !== undefined) setTeamRelayShareBonusClaimed(state.shareBonusClaimed);
                   if (state.cityId !== undefined) setTeamRelayCityId(state.cityId);
                   if (state.puzzleAwarded !== undefined) setTeamRelayPuzzleAwarded(state.puzzleAwarded);
                 }}
                 onNavigateToRouteDetail={(cityId, routeIndex, image, taskId) => {
                   setFullScreenPage({
                     type: 'routeDetail',
                     data: {
                       cityId,
                       routeIndex,
                       image,
                       isTeamRelayRoute: true,
                       teamRelayTaskId: taskId
                     }
                   });
                 }}
               />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showTreadmillActivationTip && !newbieCashReward && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[132] flex items-center justify-center bg-black/62 p-6 backdrop-blur-md"
            onClick={() => setShowTreadmillActivationTip(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 14, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 360, damping: 28 }}
              className="relative w-full max-w-xs overflow-hidden rounded-[30px] border border-amber-200/22 bg-[#090d14] p-5 text-center shadow-[0_30px_90px_rgba(0,0,0,0.62)]"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="absolute inset-x-0 top-0 h-36 bg-[radial-gradient(circle_at_50%_0%,rgba(251,191,36,0.30),transparent_68%)]" />
              <div className="absolute inset-x-8 top-8 h-24 rounded-full bg-cyan-300/10 blur-3xl" />
              <button
                onClick={() => setShowTreadmillActivationTip(false)}
                className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-400 active:scale-95"
                aria-label="关闭"
              >
                <X size={15} />
              </button>

              <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] border border-amber-100/28 bg-amber-300/12 text-amber-100 shadow-[0_0_34px_rgba(251,191,36,0.18)]">
                <Gift size={29} />
                <Sparkles size={15} className="absolute -right-1 -top-1 text-cyan-100" />
              </div>

              <p className="relative mt-4 text-[10px] font-black tracking-[0.26em] text-amber-200/80">新人激活礼</p>
              <h3 className="relative mt-2 text-xl font-black text-white">连接跑步机领红包</h3>
              <p className="relative mt-2 text-sm font-bold leading-6 text-slate-300">
                首次连接跑步机并完成激活，即可获得 <span className="font-mono text-amber-100">¥1.8</span> 现金红包。
              </p>

              <button
                onClick={() => setShowTreadmillActivationTip(false)}
                className="relative mt-5 h-12 w-full rounded-full bg-gradient-to-r from-amber-100 via-yellow-200 to-cyan-100 text-sm font-black text-slate-950 shadow-[0_14px_34px_rgba(251,191,36,0.20)] active:scale-95"
              >
                去连接跑步机
              </button>
              <button
                onClick={() => setShowTreadmillActivationTip(false)}
                className="relative mt-2 h-10 w-full rounded-full text-xs font-black text-slate-500 active:scale-95"
              >
                稍后再说
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {newbieCashReward && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[155] flex items-center justify-center bg-black/78 p-6 backdrop-blur-lg"
            onClick={() => setNewbieCashReward(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 28, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 340, damping: 24 }}
              className="relative w-full max-w-xs overflow-hidden rounded-[32px] border border-red-200/24 bg-[#140909] p-5 text-center shadow-[0_32px_110px_rgba(0,0,0,0.68)]"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(255,210,112,0.42),transparent_34%),radial-gradient(circle_at_50%_100%,rgba(244,63,94,0.32),transparent_52%),linear-gradient(180deg,rgba(127,29,29,0.58),rgba(17,7,7,0.94))]" />
              <button
                onClick={() => setNewbieCashReward(null)}
                className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-red-100/70 active:scale-95"
                aria-label="关闭"
              >
                <X size={15} />
              </button>

              {[0, 1, 2, 3, 4, 5].map(item => (
                <motion.span
                  key={item}
                  className="absolute h-1.5 w-1.5 rounded-full bg-amber-200 shadow-[0_0_16px_rgba(251,191,36,0.95)]"
                  initial={{ opacity: 0, x: 142, y: 142, scale: 0.4 }}
                  animate={{
                    opacity: [0, 1, 0],
                    x: 142 + Math.cos((item / 6) * Math.PI * 2) * 112,
                    y: 142 + Math.sin((item / 6) * Math.PI * 2) * 86,
                    scale: [0.4, 1, 0.6]
                  }}
                  transition={{ duration: 1.28, repeat: Infinity, delay: item * 0.08, ease: 'easeOut' }}
                />
              ))}

              <motion.div
                initial={{ y: 8, rotate: -4 }}
                animate={{ y: [0, -8, 0], rotate: [-3, 3, -3] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                className="relative mx-auto mt-3 flex h-24 w-24 items-center justify-center rounded-[30px] border border-amber-100/35 bg-gradient-to-br from-[#ff4b2e] via-[#ff7a1a] to-[#ffd15d] text-white shadow-[0_22px_54px_rgba(248,113,22,0.38)]"
              >
                <div className="absolute left-0 right-0 top-0 h-9 rounded-t-[30px] bg-white/18" />
                <div className="absolute inset-x-3 top-9 h-px bg-yellow-100/70" />
                <Gift size={42} className="relative drop-shadow-[0_4px_12px_rgba(0,0,0,0.35)]" />
                <Sparkles size={16} className="absolute -right-1 -top-1 text-yellow-100" />
              </motion.div>

              <p className="relative mt-5 text-[10px] font-black tracking-[0.26em] text-amber-100/80">现金红包到账</p>
              <h3 className="relative mt-2 text-lg font-black text-white">{newbieCashReward.title}</h3>
              <p className="relative mt-2 text-xs font-bold leading-5 text-red-100/70">
                {newbieCashReward.description}
              </p>
              <p className="relative mt-4 font-mono text-[46px] font-black leading-none tracking-[-0.06em] text-amber-100">
                ¥{newbieCashReward.amount}
              </p>

              <button
                onClick={() => setNewbieCashReward(null)}
                className="relative mt-6 h-12 w-full rounded-full bg-gradient-to-r from-amber-100 via-yellow-200 to-orange-200 text-sm font-black text-red-950 shadow-[0_14px_34px_rgba(251,191,36,0.22)] active:scale-95"
              >
                收下红包
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showRouteMedalGuide && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[145] flex items-center justify-center bg-black/76 p-6 backdrop-blur-md"
            onClick={() => setShowRouteMedalGuide(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 360, damping: 28 }}
              className="relative w-full max-w-xs overflow-hidden rounded-[30px] border border-amber-200/20 bg-[#080b12] p-5 text-center shadow-[0_30px_100px_rgba(0,0,0,0.62)]"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="absolute inset-x-0 top-0 h-36 bg-[radial-gradient(circle_at_50%_0%,rgba(251,191,36,0.34),transparent_68%)]" />
              <div className="absolute inset-x-8 top-10 h-24 rounded-full bg-cyan-300/10 blur-3xl" />
              <button
                onClick={() => setShowRouteMedalGuide(false)}
                className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-400 active:scale-95"
                aria-label="关闭"
              >
                <X size={15} />
              </button>

              <motion.div
                initial={{ scale: 0.72, rotate: -8 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 420, damping: 20, delay: 0.08 }}
                className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-[26px] border border-amber-100/30 bg-gradient-to-br from-amber-300 via-orange-300 to-rose-400 text-slate-950 shadow-[0_0_42px_rgba(251,191,36,0.34)]"
              >
                <Medal size={34} strokeWidth={2.5} />
                <Sparkles size={16} className="absolute -right-1 -top-1 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.85)]" />
              </motion.div>

              <p className="relative mt-4 text-[10px] font-black tracking-[0.28em] text-amber-200">MEDAL READY</p>
              <h3 className="relative mt-2 text-xl font-black text-white">路线勋章已获取</h3>
              <p className="relative mt-2 text-sm font-bold leading-6 text-slate-300">
                完成路线已获得专属勋章，可前往勋章盲盒抽奖，抽取现金红包。
              </p>

              <div className="relative mt-5 grid gap-2.5">
                <button
                  onClick={() => {
                    setShowRouteMedalGuide(false);
                    setFullScreenPage({ type: 'medalLottery' });
                  }}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-amber-200 via-orange-200 to-cyan-200 text-sm font-black text-slate-950 shadow-[0_14px_34px_rgba(251,191,36,0.22)] active:scale-95"
                >
                  <Gift size={18} />
                  前往抽奖
                </button>
                <button
                  onClick={() => setShowRouteMedalGuide(false)}
                  className="h-11 w-full rounded-full border border-white/10 bg-white/[0.04] text-sm font-black text-slate-300 active:scale-95"
                >
                  稍后再说
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {ENABLE_GLOW_TASKS && showDailyRouteTaskGuide && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[140] flex items-center justify-center bg-black/72 p-6 backdrop-blur-md"
            onClick={() => setShowDailyRouteTaskGuide(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 14, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 360, damping: 28 }}
              className="relative w-full max-w-xs overflow-hidden rounded-[28px] border border-cyan-200/20 bg-[#08101a] p-5 text-center shadow-[0_30px_90px_rgba(0,0,0,0.58)]"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_50%_0%,rgba(103,232,249,0.26),transparent_70%)]" />
              <button
                onClick={() => setShowDailyRouteTaskGuide(false)}
                className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-400"
              >
                <X size={15} />
              </button>
              <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-cyan-200/20 bg-cyan-300/10 text-cyan-100">
                <Gift size={28} />
                <Sparkles size={15} className="absolute -right-1 -top-1 text-amber-200" />
              </div>
              <p className="relative mt-4 text-[10px] font-black tracking-[0.26em] text-cyan-200">TASK READY</p>
              <h3 className="relative mt-2 text-xl font-black text-white">今日路线任务已完成</h3>
              <p className="relative mt-2 text-xs font-bold leading-6 text-slate-400">
                去任务中心领取光迹值，也可以从任务中心进入光迹值现金抽奖。
              </p>
              <button
                onClick={() => {
                  setShowDailyRouteTaskGuide(false);
                  setFullScreenPage(null);
                  setActiveTab('home');
                  setTaskPanelOpenSignal(prev => prev + 1);
                }}
                className="relative mt-5 h-11 w-full rounded-full bg-gradient-to-r from-cyan-200 to-indigo-200 text-sm font-black text-slate-950 shadow-[0_12px_30px_rgba(103,232,249,0.22)] active:scale-95"
              >
                去任务中心
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
