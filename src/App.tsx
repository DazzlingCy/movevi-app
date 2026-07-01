import { useState, useEffect } from 'react';
import { Compass, Trophy, Map as MapIcon, User } from 'lucide-react';
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
import { getGlowRank } from './lib/glow';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [showEventsBadge, setShowEventsBadge] = useState(true);
  const [showIntro, setShowIntro] = useState(false);
  const [fullScreenPage, setFullScreenPage] = useState<{type: 'cityRoutes' | 'routeDetail' | 'runPlayback' | 'litRecords' | 'leaderboard' | 'weekendMedley' | 'teamRelay' | 'glowCenter', data?: any} | null>(null);

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
  const [litCityIds, setLitCityIds] = useState<string[]>(() => {
    // Always start fresh on load
    CITIES.forEach(c => {
      if (c.status !== 'upcoming') c.status = 'unlit';
      c.completed = 0;
      c.completedRouteIndices = [];
      c.completedRouteTimestamps = {};
      c.justLit = false;
    });
    return [];
  });

  const [completedChapters, setCompletedChapters] = useState<number[]>([]);
  const [targetFlight, setTargetFlight] = useState<{fromCityId: string, toCityId: string} | null>(null);
  const [pendingSelectionFrom, setPendingSelectionFrom] = useState<string | null>(null);
  const [userStats, setUserStats] = useState({
    completedCities: 3,
    completedRoutes: 36,
    totalDistance: 62.0,
    totalTimeHours: 12.0,
    lightValue: 120,
    lifetimeLightValue: 120,
    dailyCheckedIn: false,
    dailyDistance: 0,
    dailyCompletedRoutes: 0,
    weeklyCompletedCities: 0,
    claimedDailyTaskIds: [] as string[],
    claimedWeeklyTaskIds: [] as string[],
    medalMysteryTickets: 0,
    weeklyGlowExchangeIds: [] as string[]
  });

  const tabs = [
    { id: 'home', label: '首页', icon: Compass },
    { id: 'events', label: '活动', icon: Trophy },
    { id: 'cities', label: '城市', icon: MapIcon },
    { id: 'profile', label: '我的', icon: User },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomeTab 
          userStats={userStats}
          setUserStats={setUserStats}
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
            onSelectTeamRelay={() => setFullScreenPage({ type: 'teamRelay' })}
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
      activityTicket: { title: '活动补给券', cost: 30, requiredRankLevel: 3, weeklyLimit: 1 },
      rerollCity: { title: '下一城重选券', cost: 10, requiredRankLevel: 0, weeklyLimit: 0 },
      medalMysteryTicket: { title: '勋章盲盒抽奖券', cost: 20, requiredRankLevel: 3, weeklyLimit: 1 }
    }[type];
    const currentGlowRank = getGlowRank(userStats.lifetimeLightValue ?? userStats.lightValue ?? 0).current;
    const weeklyGlowExchangeIds = userStats.weeklyGlowExchangeIds || [];

    if (exchangeMeta.requiredRankLevel && currentGlowRank.level < exchangeMeta.requiredRankLevel) {
      return { success: false, message: '黄金段位以上可兑换' };
    }

    if (exchangeMeta.weeklyLimit && weeklyGlowExchangeIds.includes(type)) {
      return { success: false, message: '本周已兑换' };
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
        : (prev.weeklyGlowExchangeIds || [])
    }));

    if (type === 'activityTicket') {
      setMedleyLotteryChances(prev => prev + 1);
      return { success: true, message: '周末串烧抽奖机会 +1' };
    }

    if (type === 'medalMysteryTicket') {
      return { success: true, message: '已获得勋章盲盒抽奖券' };
    }

    const currentCityId = CITIES.find(city => city.status === 'in-progress')?.id || litCityIds[litCityIds.length - 1] || '1';
    setActiveTab('home');
    setFullScreenPage(null);
    setPendingSelectionFrom(currentCityId);
    return { success: true, message: '已开启下一城重选' };
  };

  return (
    <div className="flex flex-col h-screen w-full max-w-md mx-auto bg-[#05070A] text-slate-100 overflow-hidden relative font-sans shadow-2xl sm:h-[800px] sm:mt-10 sm:rounded-[40px] sm:border-[8px] sm:border-slate-800">
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
                   } else if (fullScreenPage.data.isActivityRoute) {
                     setFullScreenPage({ type: 'weekendMedley' });
                   } else {
                     setFullScreenPage({ type: 'cityRoutes', data: fullScreenPage.data.previousCityData });
                   }
                 }}
                 onStart={() => setFullScreenPage({ type: 'runPlayback', data: fullScreenPage.data })}
               />
            )}
            {fullScreenPage.type === 'runPlayback' && (
               <RunPlaybackView 
                 {...fullScreenPage.data}
                 onExit={() => setFullScreenPage({ type: 'routeDetail', data: fullScreenPage.data })}
                 onComplete={(stats) => {
                   const earnedLightValue = stats.calories || Math.floor(stats.distance * 65);
                   // Update user stats
                   setUserStats(prev => ({
                     ...prev,
                     totalDistance: prev.totalDistance + stats.distance,
                     totalTimeHours: prev.totalTimeHours + (stats.duration / 3600),
                     lightValue: (prev.lightValue || 0) + earnedLightValue,
                     lifetimeLightValue: (prev.lifetimeLightValue ?? prev.lightValue ?? 0) + earnedLightValue,
                     dailyDistance: (prev.dailyDistance || 0) + stats.distance,
                     dailyCompletedRoutes: (prev.dailyCompletedRoutes || 0) + 1
                   }));

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
    </div>
  );
}
