import { lazy, Suspense, useState, useEffect } from 'react';
import { Compass, Trophy, Map as MapIcon, User, Gift, Medal, Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import HomeTab from './components/HomeTab';
import { CITIES, getRouteData } from './data/cities';
import type { CollectionViewState, RouteCollectionIntent } from './components/RouteCollectionView';
import type { TeamRelayMember, TeamRelayTask } from './components/TeamRelayView';
import {
  GLOW_SHOP_ITEMS,
  getGlowRank,
  getGlowWheelDailyExchangeLimit,
  type GlowExchangeResult,
  type GlowValueRecord
} from './lib/glow';
import type { AuthUser } from './components/AuthView';
import type { AccountFeatureKind } from './components/AccountFeatureView';
import type {
  PurchaseRefundCampaignState,
  PurchaseRefundCheckIn,
  PurchaseRefundRegistration
} from './components/PurchaseRefundCampaignView';
import { getWeightPlanRewardAmount, type WeightPlanRewardRecord } from './lib/weightPlan';

const EventsTab = lazy(() => import('./components/EventsTab'));
const CitiesTab = lazy(() => import('./components/CitiesTab'));
const ProfileTab = lazy(() => import('./components/ProfileTab'));
const CityRoutesView = lazy(() => import('./components/CityRoutesView'));
const RouteDetailView = lazy(() => import('./components/RouteDetailView'));
const RouteMemoryView = lazy(() => import('./components/RouteMemoryView'));
const RunPlaybackView = lazy(() => import('./components/RunPlaybackView'));
const IntroScreen = lazy(() => import('./components/IntroScreen'));
const RouteCollectionView = lazy(() => import('./components/RouteCollectionView'));
const LeaderboardView = lazy(() => import('./components/LeaderboardView'));
const WeekendMedleyView = lazy(() => import('./components/WeekendMedleyView'));
const TeamRelayView = lazy(() => import('./components/TeamRelayView'));
const GlowCenterView = lazy(() => import('./components/GlowCenterView'));
const GlowShopView = lazy(() => import('./components/GlowShopView'));
const GlowWheelView = lazy(() => import('./components/GlowWheelView'));
const MedalLotteryView = lazy(() => import('./components/MedalLotteryView'));
const WeightLossPlanView = lazy(() => import('./components/WeightLossPlanView'));
const AuthView = lazy(() => import('./components/AuthView'));
const SettingsView = lazy(() => import('./components/SettingsView'));
const AccountFeatureView = lazy(() => import('./components/AccountFeatureView'));
const OnlineSupportView = lazy(() => import('./components/OnlineSupportView'));
const PurchaseRefundCampaignView = lazy(() => import('./components/PurchaseRefundCampaignView'));

const ViewLoadingFallback = () => (
  <div className="flex h-full w-full items-center justify-center bg-[#05070A]" role="status" aria-label="页面加载中">
    <div className="h-7 w-7 animate-spin rounded-full border-2 border-cyan-200/20 border-t-cyan-200" />
  </div>
);

const ENABLE_GLOW_TASKS = false;
const DEFAULT_LIT_CITY_IDS = ['2', '1'];
const DEFAULT_ROUTE_HISTORY = [
  { cityId: '15', routeId: 1, daysAgo: 0, hour: 12, minute: 14 },
  { cityId: '2', routeId: 3, daysAgo: 1, hour: 14, minute: 14 },
  { cityId: '2', routeId: 2, daysAgo: 1, hour: 9, minute: 36 },
  { cityId: '2', routeId: 1, daysAgo: 2, hour: 14, minute: 14 },
  { cityId: '1', routeId: 3, daysAgo: 3, hour: 14, minute: 14 },
  { cityId: '1', routeId: 2, daysAgo: 4, hour: 14, minute: 14 },
  { cityId: '1', routeId: 1, daysAgo: 5, hour: 14, minute: 14 }
] as const;
const DEFAULT_IN_PROGRESS_CITY_ID = '15';
const DEFAULT_IN_PROGRESS_COMPLETED_ROUTE_INDICES = [1];
const DEFAULT_MAIN_CITY_SEQUENCE = [...DEFAULT_LIT_CITY_IDS, DEFAULT_IN_PROGRESS_CITY_ID];

const createDefaultGlowValueRecords = (): GlowValueRecord[] => {
  const at = (daysAgo: number, hour: number, minute: number) => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    date.setHours(hour, minute, 0, 0);
    return date.getTime();
  };

  return [
    { id: 'demo-1', type: 'earn', title: '完成新加坡深度探索路线', description: '路线完成奖励', amount: 1, createdAt: at(0, 12, 14) },
    { id: 'demo-2', type: 'spend', title: '切换探索城市', description: '重新选择下一座城市', amount: 3, createdAt: at(0, 10, 5) },
    { id: 'demo-3', type: 'earn', title: '完成北京深度探索路线', description: '路线完成奖励', amount: 1, createdAt: at(1, 14, 14) },
    { id: 'demo-4', type: 'earn', title: '点亮北京全部路线', description: '城市全路线完成奖励', amount: 10, createdAt: at(1, 14, 13) },
    { id: 'demo-5', type: 'earn', title: '完成奥森无限绿意', description: '路线完成奖励', amount: 1, createdAt: at(1, 9, 36) },
    { id: 'demo-6', type: 'spend', title: '切换探索城市', description: '重新选择下一座城市', amount: 3, createdAt: at(2, 16, 20) },
    { id: 'demo-7', type: 'earn', title: '完成故宫角楼掠影', description: '路线完成奖励', amount: 1, createdAt: at(2, 14, 14) }
  ];
};

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
  const [fullScreenPage, setFullScreenPage] = useState<{type: 'cityRoutes' | 'routeDetail' | 'routeMemory' | 'runPlayback' | 'routeCollection' | 'leaderboard' | 'weekendMedley' | 'teamRelay' | 'glowCenter' | 'glowShop' | 'glowWheel' | 'medalLottery' | 'weightLossPlan' | 'purchaseRefundCampaign' | 'auth' | 'settings' | 'accountFeature' | 'onlineSupport', data?: any} | null>(null);
  const [collectionViewState, setCollectionViewState] = useState<CollectionViewState>({
    viewMode: 'cards',
    filter: 'all',
    continent: 'all',
    expandedCityId: null
  });
  const [newlyCollectedRouteKey, setNewlyCollectedRouteKey] = useState<string | null>(null);
  const [authUser, setAuthUser] = useState<AuthUser | null>({
    name: '沐小六',
    phone: '13800003026',
    memberId: 'MV-3026'
  });

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
  const [purchaseRefundCampaign, setPurchaseRefundCampaign] = useState<PurchaseRefundCampaignState>({
    status: 'unregistered',
    registration: null,
    checkIns: []
  });
  const [litCityIds, setLitCityIds] = useState<string[]>(() => {
    const historyAnchor = Date.now();
    CITIES.forEach(c => {
      if (c.status !== 'upcoming') c.status = 'unlit';
      c.completed = 0;
      c.completedRouteIndices = [];
      c.completedRouteTimestamps = {};
      c.completedRouteStats = {};
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
    DEFAULT_ROUTE_HISTORY.forEach(({ cityId, routeId, daysAgo, hour, minute }) => {
      const city = CITIES.find(item => item.id === cityId);
      if (!city) return;
      const collectedAt = new Date(historyAnchor);
      collectedAt.setDate(collectedAt.getDate() - daysAgo);
      collectedAt.setHours(hour, minute, 0, 0);
      city.completedRouteTimestamps = city.completedRouteTimestamps || {};
      city.completedRouteTimestamps[routeId] = collectedAt.getTime();
      const routeData = getRouteData(cityId, routeId);
      const distance = Number(routeData.distance) || 0;
      const [durationMinutes = 0, durationSeconds = 0] = routeData.duration.split(':').map(Number);
      city.completedRouteStats = city.completedRouteStats || {};
      city.completedRouteStats[routeId] = {
        completedAt: collectedAt.getTime(),
        distance,
        durationSeconds: durationMinutes * 60 + durationSeconds,
        calories: Number(routeData.calories) || Math.round(distance * 65),
        lightValueEarned: 1 + (routeId === city.routes ? 10 : 0)
      };
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
    lightValue: 330,
    lifetimeLightValue: 330,
    glowValueRecords: createDefaultGlowValueRecords(),
    dailyCheckedIn: false,
    dailyDistance: 0,
    dailyTreadmillStarted: false,
    dailyCompletedRoutes: 0,
    weeklyCompletedCities: 0,
    claimedDailyTaskIds: [] as string[],
    claimedWeeklyTaskIds: [] as string[],
    medalMysteryTickets: 0,
    glowWheelChances: 0,
    citySwitchPasses: 0,
    glowShopInventory: {} as Record<string, number>,
    ownedGlowShopItemIds: [] as string[],
    equippedGlowShopItemIds: [] as string[],
    dailyGlowWheelExchangeCount: 0,
    glowWheelDrawHistory: [] as Array<{ id: string; amount: number; createdAt: string }>,
    medalLotteryDrawHistory: [] as Array<{ id: string; nickname: string; amount: string; createdAt: string }>,
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
    const frame = window.requestAnimationFrame(() => {
      setShowSplash(false);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (purchaseRefundCampaign.status !== 'active' || !purchaseRefundCampaign.registration?.approvedAt) return;
    const start = new Date(purchaseRefundCampaign.registration.approvedAt);
    start.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentDay = Math.floor((today.getTime() - start.getTime()) / 86_400_000) + 1;
    if (currentDay > 60) {
      setPurchaseRefundCampaign(prev => ({ ...prev, status: 'expired' }));
    }
  }, [purchaseRefundCampaign.status, purchaseRefundCampaign.registration?.approvedAt]);

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

  const submitPurchaseRefundRegistration = (
    registration: Omit<PurchaseRefundRegistration, 'submittedAt' | 'approvedAt' | 'rejectionReason'>
  ) => {
    if (
      purchaseRefundCampaign.registration?.machineCode === registration.machineCode
      && purchaseRefundCampaign.status !== 'registrationRejected'
    ) {
      return { success: false, message: '该机器码已提交过报名' };
    }

    setPurchaseRefundCampaign({
      status: 'registrationPending',
      registration: { ...registration, submittedAt: Date.now() },
      checkIns: []
    });
    return { success: true, message: '报名已提交' };
  };

  const reviewPurchaseRefundRegistration = (approved: boolean) => {
    setPurchaseRefundCampaign(prev => {
      if (!prev.registration) return prev;
      return {
        ...prev,
        status: approved ? 'active' : 'registrationRejected',
        registration: {
          ...prev.registration,
          approvedAt: approved ? Date.now() : undefined,
          rejectionReason: approved ? undefined : '机器码与购机信息不一致，请核对后重新提交。'
        }
      };
    });
  };

  const submitPurchaseRefundCheckIn = (url: string) => {
    const isDouyinUrl = /^(https?:\/\/)?([\w-]+\.)?(douyin\.com)\//i.test(url);
    if (!isDouyinUrl) return { success: false, message: '请粘贴有效的抖音视频链接' };
    if (purchaseRefundCampaign.status !== 'active' || !purchaseRefundCampaign.registration?.approvedAt) {
      return { success: false, message: '当前无法提交打卡' };
    }

    const approvedAt = new Date(purchaseRefundCampaign.registration.approvedAt);
    approvedAt.setHours(0, 0, 0, 0);
    const today = new Date();
    const todayKey = `${today.getFullYear()}-${`${today.getMonth() + 1}`.padStart(2, '0')}-${`${today.getDate()}`.padStart(2, '0')}`;
    const campaignDay = Math.floor((new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime() - approvedAt.getTime()) / 86_400_000) + 1;
    if (campaignDay > 60) {
      setPurchaseRefundCampaign(prev => ({ ...prev, status: 'expired' }));
      return { success: false, message: '本期挑战已结束' };
    }
    if (purchaseRefundCampaign.checkIns.some(item => item.date === todayKey && item.status !== 'rejected')) {
      return { success: false, message: '今日已经提交过视频' };
    }

    const checkIn: PurchaseRefundCheckIn = {
      id: `purchase-refund-${Date.now()}`,
      day: Math.max(1, campaignDay),
      date: todayKey,
      url,
      submittedAt: Date.now(),
      status: 'pending'
    };
    setPurchaseRefundCampaign(prev => ({ ...prev, checkIns: [...prev.checkIns, checkIn] }));
    return { success: true, message: '视频已提交，审核通过后计入进度' };
  };

  const reviewPurchaseRefundCheckIn = (id: string, approved: boolean) => {
    setPurchaseRefundCampaign(prev => {
      const checkIns = prev.checkIns.map(item => item.id === id ? {
        ...item,
        status: approved ? 'approved' as const : 'rejected' as const,
        reviewedAt: Date.now(),
        rejectionReason: approved ? undefined : '视频未完整展示跑步机使用画面，请重新拍摄后提交。'
      } : item);
      const approvedCount = checkIns.filter(item => item.status === 'approved').length;
      return {
        ...prev,
        checkIns,
        status: approvedCount >= 30 ? 'completed' : prev.status
      };
    });
  };

  const demoPurchaseRefundNearCompletion = () => {
    setPurchaseRefundCampaign(prev => {
      if (!prev.registration) return prev;
      const approvedAt = new Date();
      approvedAt.setDate(approvedAt.getDate() - 29);
      approvedAt.setHours(9, 0, 0, 0);
      const demoCheckIns: PurchaseRefundCheckIn[] = Array.from({ length: 29 }, (_, index) => {
        const submittedAt = new Date(approvedAt);
        submittedAt.setDate(submittedAt.getDate() + index);
        submittedAt.setHours(20, 12, 0, 0);
        const date = `${submittedAt.getFullYear()}-${`${submittedAt.getMonth() + 1}`.padStart(2, '0')}-${`${submittedAt.getDate()}`.padStart(2, '0')}`;
        return {
          id: `purchase-refund-demo-${index + 1}`,
          day: index + 1,
          date,
          url: `https://www.douyin.com/video/demo-${index + 1}`,
          submittedAt: submittedAt.getTime(),
          reviewedAt: submittedAt.getTime() + 3_600_000,
          status: 'approved'
        };
      });
      return {
        ...prev,
        status: 'active',
        registration: { ...prev.registration, approvedAt: approvedAt.getTime(), rejectionReason: undefined },
        checkIns: demoCheckIns,
        refundRequestedAt: undefined,
        refundedAt: undefined
      };
    });
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
          onNavigate={(type, data) => {
            if (type === 'routeCollection') {
              setCollectionViewState(prev => ({ ...prev, expandedCityId: null }));
            }
            setFullScreenPage({ type: type as any, data });
          }}
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
            onSelectMedalLottery={() => setFullScreenPage({ type: 'medalLottery' })}
          />
        );
      case 'cities':
        return <CitiesTab onCityClick={(city) => setFullScreenPage({ type: 'cityRoutes', data: city })} />;
      case 'profile':
        return (
          <ProfileTab
            userStats={userStats}
            authUser={authUser}
            onOpenAuth={() => setFullScreenPage({ type: 'auth' })}
            onOpenSettings={() => setFullScreenPage({ type: 'settings' })}
            onOpenFeature={(feature: AccountFeatureKind) => setFullScreenPage({ type: 'accountFeature', data: feature })}
            onOpenWechatSupport={() => setFullScreenPage({
              type: 'accountFeature',
              data: { kind: 'service', initialSupportQrOpen: true }
            })}
            onOpenRouteCollection={() => {
              setCollectionViewState(prev => ({ ...prev, expandedCityId: null }));
              setFullScreenPage({ type: 'routeCollection' });
            }}
          />
        );
      default:
        return <HomeTab userStats={userStats} setUserStats={setUserStats} />;
    }
  };

  const handleGlowWheelTicketClaim = () => {
    const currentGlowRank = getGlowRank(userStats.lifetimeLightValue ?? userStats.lightValue ?? 0).current;
    const dailyExchangeLimit = getGlowWheelDailyExchangeLimit(currentGlowRank.level);
    const exchangedToday = userStats.dailyGlowWheelExchangeCount || 0;

    if (exchangedToday >= dailyExchangeLimit) {
      return { success: false, message: `今日领取已达上限（${dailyExchangeLimit} 张）` };
    }

    setUserStats(prev => ({
      ...prev,
      glowWheelChances: (prev.glowWheelChances || 0) + 1,
      dailyGlowWheelExchangeCount: (prev.dailyGlowWheelExchangeCount || 0) + 1
    }));

    return { success: true, message: '已领取 1 张抽奖券' };
  };

  const handleGlowShopRedeem = (itemId: string): GlowExchangeResult => {
    const item = GLOW_SHOP_ITEMS.find(candidate => candidate.id === itemId);
    if (!item) return { success: false, message: '未找到该商品' };

    if (!item.repeatable && userStats.ownedGlowShopItemIds.includes(item.id)) {
      return { success: false, message: '这件藏品已经拥有' };
    }

    if (userStats.lightValue < item.price) {
      return { success: false, message: `光迹值不足，还差 ${item.price - userStats.lightValue} 点` };
    }

    const grantedQuantity = item.quantity || 1;
    setUserStats(prev => {
      const nextInventory = {
        ...prev.glowShopInventory,
        [item.id]: (prev.glowShopInventory[item.id] || 0) + grantedQuantity
      };
      const nextOwnedIds = item.repeatable || prev.ownedGlowShopItemIds.includes(item.id)
        ? prev.ownedGlowShopItemIds
        : [...prev.ownedGlowShopItemIds, item.id];

      return {
        ...prev,
        lightValue: Math.max(0, prev.lightValue - item.price),
        citySwitchPasses: item.effect === 'city-switch-pass'
          ? prev.citySwitchPasses + grantedQuantity
          : prev.citySwitchPasses,
        medalMysteryTickets: item.effect === 'medal-ticket'
          ? prev.medalMysteryTickets + grantedQuantity
          : prev.medalMysteryTickets,
        glowShopInventory: nextInventory,
        ownedGlowShopItemIds: nextOwnedIds,
        glowValueRecords: [
          {
            id: `shop-${item.id}-${Date.now()}`,
            type: 'spend' as const,
            title: `兑换${item.name}`,
            description: '光迹商城兑换',
            amount: item.price,
            createdAt: Date.now()
          },
          ...(prev.glowValueRecords || [])
        ]
      };
    });

    return { success: true, message: `已兑换：${item.name}` };
  };

  const handleGlowShopUse = (itemId: string): GlowExchangeResult => {
    const item = GLOW_SHOP_ITEMS.find(candidate => candidate.id === itemId);
    if (!item?.cosmeticSlot) return { success: false, message: '该商品无需手动使用' };
    if (!userStats.ownedGlowShopItemIds.includes(item.id)) {
      return { success: false, message: '请先兑换这件收藏' };
    }

    const isEquipped = userStats.equippedGlowShopItemIds.includes(item.id);

    setUserStats(prev => {
      const sameSlotItemIds = GLOW_SHOP_ITEMS
        .filter(candidate => candidate.cosmeticSlot === item.cosmeticSlot)
        .map(candidate => candidate.id);
      return {
        ...prev,
        equippedGlowShopItemIds: isEquipped
          ? prev.equippedGlowShopItemIds.filter(id => id !== item.id)
          : [
              ...prev.equippedGlowShopItemIds.filter(id => !sameSlotItemIds.includes(id)),
              item.id
            ]
      };
    });

    return { success: true, message: isEquipped ? `已恢复默认：${item.subtitle}` : `已使用：${item.name}` };
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
      medalMysteryTickets: Math.max(0, (prev.medalMysteryTickets || 0) - 1),
      medalLotteryDrawHistory: [
        {
          id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
          nickname: '沐小六',
          amount,
          createdAt: new Date().toLocaleString('zh-CN', {
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          })
        },
        ...(prev.medalLotteryDrawHistory || [])
      ].slice(0, 12)
    }));

    return { success: true, message: `抽中 ${amount}`, amount };
  };

  const handleWeightPlanRewardOpen = (day: number) => {
    if (!weightPlanRewardBoxes.includes(day)) {
      return { success: false, message: '完成当天打卡后可领取红包' };
    }

    const existingRecord = weightPlanRewardHistory.find(record => record.day === day);
    if (existingRecord) {
      return { success: false, message: '该红包已领取', amount: existingRecord.amount };
    }

    const amount = getWeightPlanRewardAmount(day);
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
          <Suspense fallback={null}>
            <IntroScreen
              onComplete={() => {
                setShowIntro(false);
              }}
            />
          </Suspense>
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
            <Suspense fallback={<ViewLoadingFallback />}>
              {renderContent()}
            </Suspense>
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
            <Suspense fallback={<ViewLoadingFallback />}>
            {fullScreenPage.type === 'cityRoutes' && (
               <CityRoutesView 
                 city={fullScreenPage.data} 
                 onBack={() => {
                   if (fullScreenPage.data.sourcePage === 'routeCollection') {
                     setFullScreenPage({ type: 'routeCollection' });
                   } else {
                     setFullScreenPage(null);
                   }
                 }}
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
                    if (fullScreenPage.data.sourcePage === 'routeCollection') {
                      setFullScreenPage({ type: 'routeCollection' });
                    } else if (fullScreenPage.data.isTeamRelayRoute) {
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
            {fullScreenPage.type === 'routeMemory' && (
              <RouteMemoryView
                {...fullScreenPage.data}
                onBack={() => setFullScreenPage({ type: 'routeCollection' })}
              />
            )}
            {fullScreenPage.type === 'runPlayback' && (
               <RunPlaybackView 
                 {...fullScreenPage.data}
                  onExit={() => setFullScreenPage({ type: 'routeDetail', data: fullScreenPage.data })}
                  onComplete={(stats) => {
                    const completionCityData = fullScreenPage.data.previousCityData
                      ? CITIES.find(city => city.id === fullScreenPage.data.previousCityData.id) || fullScreenPage.data.previousCityData
                      : null;
                    const completedRouteIndex = fullScreenPage.data.routeIndex;
                    const existingCompletedRoutes = completionCityData?.completedRouteIndices || [];
                    const willCompleteCity = Boolean(
                      completionCityData
                      && !existingCompletedRoutes.includes(completedRouteIndex)
                      && existingCompletedRoutes.length + 1 >= completionCityData.routes
                      && completionCityData.status !== 'lit'
                    );
                    const routeCompletionLightValue = 1;
                    const cityCompletionBonus = willCompleteCity ? 10 : 0;
                    const earnedLightValue = routeCompletionLightValue + cityCompletionBonus;
                    const completedRouteTitle = fullScreenPage.data.routeData?.title || fullScreenPage.data.title || '城市路线';
                    const earnedRecords: GlowValueRecord[] = [
                      {
                        id: `route-glow-${Date.now()}`,
                        type: 'earn' as const,
                        title: `完成${completedRouteTitle}`,
                        description: '路线完成奖励',
                        amount: routeCompletionLightValue,
                        createdAt: Date.now()
                      },
                      ...(cityCompletionBonus > 0 && completionCityData ? [{
                        id: `city-glow-${Date.now()}`,
                        type: 'earn' as const,
                        title: `点亮${completionCityData.name}全部路线`,
                        description: '城市全路线完成奖励',
                        amount: cityCompletionBonus,
                        createdAt: Date.now()
                      }] : [])
                    ];
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
                      dailyCompletedRoutes: (prev.dailyCompletedRoutes || 0) + 1,
                      glowValueRecords: [
                        ...earnedRecords,
                        ...(prev.glowValueRecords || [])
                      ]
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
                      const isNewWeightPlanDay = !weightPlanCompletedDays.includes(day);
                      setWeightPlanCompletedDays(prevCompleted => {
                        if (prevCompleted.includes(day)) return prevCompleted;
                        return [...prevCompleted, day].sort((a, b) => a - b);
                      });
                      if (isNewWeightPlanDay && day <= 30) {
                        setWeightPlanRewardBoxes(prevBoxes => prevBoxes.includes(day) ? prevBoxes : [...prevBoxes, day]);
                      }
                      setFullScreenPage({ type: 'weightLossPlan' });
                      return;
                    }

                    const { previousCityData, routeIndex } = fullScreenPage.data;
                   const realCityData = CITIES.find(c => c.id === previousCityData.id) || previousCityData;
                   const currentCompleted = realCityData.completedRouteIndices || [];
                   const isNewlyCompletedRoute = !currentCompleted.includes(routeIndex);
                   
                   if (isNewlyCompletedRoute) {
                     realCityData.completedRouteIndices = [...currentCompleted, routeIndex];
                     if (!realCityData.completedRouteTimestamps) {
                       realCityData.completedRouteTimestamps = {};
                     }
                     const completedAt = Date.now();
                     realCityData.completedRouteTimestamps[routeIndex] = completedAt;
                     if (!realCityData.completedRouteStats) {
                       realCityData.completedRouteStats = {};
                     }
                     realCityData.completedRouteStats[routeIndex] = {
                       completedAt,
                       distance: stats.distance,
                       durationSeconds: stats.duration,
                       calories: stats.calories,
                       lightValueEarned: earnedLightValue
                     };
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

                   if (fullScreenPage.data.sourcePage === 'routeCollection') {
                     setCollectionViewState(prev => ({
                       ...prev,
                       expandedCityId: prev.viewMode === 'timeline' ? null : realCityData.id
                     }));
                     if (isNewlyCompletedRoute) {
                       setNewlyCollectedRouteKey(`${realCityData.id}-${routeIndex}`);
                     }
                     setFullScreenPage({ type: 'routeCollection' });
                     return;
                   }

                   // Navigate back to cityRoutes with the updated data
                   setFullScreenPage({ type: 'cityRoutes', data: realCityData });
                 }}
               />
            )}
            {fullScreenPage.type === 'routeCollection' && (
              <RouteCollectionView
                viewState={collectionViewState}
                newlyCollectedRouteKey={newlyCollectedRouteKey}
                onViewStateChange={setCollectionViewState}
                onBack={() => setFullScreenPage(null)}
                onOpenCityRoutes={(cityId) => {
                  const city = CITIES.find(item => item.id === cityId);
                  if (!city) return;
                  setFullScreenPage({
                    type: 'cityRoutes',
                    data: { ...city, sourcePage: 'routeCollection' }
                  });
                }}
                onOpenRoute={(cityId, routeIndex, image, intent: RouteCollectionIntent) => {
                  const previousCityData = CITIES.find(city => city.id === cityId);
                  setCollectionViewState(prev => ({
                    ...prev,
                    expandedCityId: prev.viewMode === 'timeline' ? null : cityId
                  }));
                  if (intent === 'review') {
                    setFullScreenPage({
                      type: 'routeMemory',
                      data: { cityId, routeIndex, image }
                    });
                  } else {
                    setFullScreenPage({
                      type: 'routeDetail',
                      data: { cityId, routeIndex, image, previousCityData, sourcePage: 'routeCollection', collectionIntent: intent }
                    });
                  }
                }}
                onCollectionCelebrationComplete={() => setNewlyCollectedRouteKey(null)}
              />
            )}
            {fullScreenPage.type === 'leaderboard' && (
              <LeaderboardView onBack={() => setFullScreenPage(null)} />
            )}
            {fullScreenPage.type === 'auth' && (
              <AuthView
                onBack={() => setFullScreenPage(null)}
                onSuccess={(user) => {
                  setAuthUser(user);
                  setFullScreenPage(null);
                  setActiveTab('profile');
                }}
              />
            )}
            {fullScreenPage.type === 'settings' && (
              <SettingsView
                user={authUser}
                onBack={() => setFullScreenPage(null)}
                onLogout={() => {
                  setAuthUser(null);
                  setFullScreenPage({ type: 'auth' });
                }}
              />
            )}
            {fullScreenPage.type === 'accountFeature' && (
              <AccountFeatureView
                kind={(typeof fullScreenPage.data === 'object' ? fullScreenPage.data?.kind : fullScreenPage.data) as AccountFeatureKind}
                userStats={userStats}
                authUser={authUser}
                onBack={() => setFullScreenPage(null)}
                onOpenAuth={() => setFullScreenPage({ type: 'auth' })}
                initialSupportQrOpen={Boolean(
                  typeof fullScreenPage.data === 'object' && fullScreenPage.data?.initialSupportQrOpen
                )}
              />
            )}
            {fullScreenPage.type === 'onlineSupport' && (
              <OnlineSupportView onBack={() => setFullScreenPage(null)} />
            )}
            {fullScreenPage.type === 'glowCenter' && (
              <GlowCenterView
                userStats={userStats}
                onBack={() => setFullScreenPage(null)}
                onOpenShop={() => setFullScreenPage({ type: 'glowShop' })}
              />
            )}
            {fullScreenPage.type === 'glowShop' && (
              <GlowShopView
                userStats={userStats}
                onBack={() => setFullScreenPage({ type: 'glowCenter' })}
                onRedeem={handleGlowShopRedeem}
                onUse={handleGlowShopUse}
              />
            )}
            {fullScreenPage.type === 'glowWheel' && (
               <GlowWheelView
                 userStats={userStats}
                 onBack={() => setFullScreenPage({ type: 'glowCenter' })}
                 onClaimChance={handleGlowWheelTicketClaim}
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
                 newbieTasks={{
                   treadmillActivated: !!userStats.dailyTreadmillStarted,
                   activationClaimed: (userStats.newbieCashRewardClaimedIds || []).includes('activate-treadmill'),
                   completedRoutes: userStats.completedRoutes || 0,
                   firstRouteClaimed: (userStats.newbieCashRewardClaimedIds || []).includes('first-route')
                 }}
                 onBack={() => setFullScreenPage(null)}
                 onStartPlan={() => {
                   setWeightPlanStarted(true);
                   setWeightPlanCompletedDays(prev => prev.length > 0 ? prev : [1, 2, 3, 5]);
                   setWeightPlanRewardBoxes(prev => prev.length > 0 ? prev : [1, 2, 3, 5]);
                 }}
                 onOpenReward={handleWeightPlanRewardOpen}
                 onClaimActivationTask={() => {
                   setUserStats(prev => ({
                     ...prev,
                     dailyTreadmillStarted: true
                   }));
                   issueNewbieCashReward({
                     id: 'activate-treadmill',
                     title: '跑步机激活红包',
                     amount: '1.80',
                     description: '首次下载并连接跑步机激活成功'
                   });
                 }}
                 onClaimFirstRouteTask={() => {
                   issueNewbieCashReward({
                     id: 'first-route',
                     title: '首条路线完成红包',
                     amount: '2.80',
                     description: '完成第一条路线，解锁新手现金红包'
                   });
                 }}
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
            {fullScreenPage.type === 'purchaseRefundCampaign' && (
              <PurchaseRefundCampaignView
                campaign={purchaseRefundCampaign}
                onBack={() => setFullScreenPage(null)}
                onOpenSupport={() => setFullScreenPage({ type: 'onlineSupport' })}
                onSubmitRegistration={submitPurchaseRefundRegistration}
                onReviewRegistration={reviewPurchaseRefundRegistration}
                onSubmitCheckIn={submitPurchaseRefundCheckIn}
                onReviewCheckIn={reviewPurchaseRefundCheckIn}
                onRequestRefund={() => setPurchaseRefundCampaign(prev => (
                  prev.status === 'completed'
                    ? { ...prev, status: 'refundPending', refundRequestedAt: Date.now() }
                    : prev
                ))}
                onConfirmRefund={() => setPurchaseRefundCampaign(prev => (
                  prev.status === 'refundPending'
                    ? { ...prev, status: 'refunded', refundedAt: Date.now() }
                    : prev
                ))}
                onDemoNearCompletion={demoPurchaseRefundNearCompletion}
                onDemoExpire={() => setPurchaseRefundCampaign(prev => ({ ...prev, status: 'expired' }))}
                onResetDemo={() => setPurchaseRefundCampaign({
                  status: 'unregistered',
                  registration: null,
                  checkIns: []
                })}
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
            </Suspense>
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

              <p className="relative mt-4 text-[10px] font-black tracking-[0.28em] text-amber-200">勋章已就绪</p>
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
              <p className="relative mt-4 text-[10px] font-black tracking-[0.26em] text-cyan-200">任务已就绪</p>
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
