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
import WeekendMashupView from './components/WeekendMashupView';
import WeekendRouteSelectView from './components/WeekendRouteSelectView';
import WeekendLotteryWheelView from './components/WeekendLotteryWheelView';
import {
  createWeekendMashupState,
  WeekendMashupDraw,
  WeekendMashupRoute,
  WeekendMashupState,
} from './data/weekendMashup';

type FullScreenPage =
  | { type: 'cityRoutes'; data: any }
  | { type: 'routeDetail'; data: any }
  | { type: 'runPlayback'; data: any }
  | { type: 'litRecords'; data?: any }
  | { type: 'leaderboard'; data?: any }
  | { type: 'weekendMashup'; data?: any }
  | { type: 'weekendRouteSelect'; data?: any }
  | { type: 'weekendLotteryWheel'; data?: any }
  | { type: 'weekendRouteDetail'; data: any }
  | { type: 'weekendRunPlayback'; data: any };

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [showIntro, setShowIntro] = useState(true);
  const [fullScreenPage, setFullScreenPage] = useState<FullScreenPage | null>(null);
  const [weekendMashupState, setWeekendMashupState] = useState<WeekendMashupState>(() => createWeekendMashupState());
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
    lightValue: 120
  });

  const tabs = [
    { id: 'home', label: '首页', icon: Compass },
    { id: 'events', label: '活动', icon: Trophy },
    { id: 'cities', label: '城市', icon: MapIcon },
    { id: 'profile', label: '我的', icon: User },
  ];

  const openWeekendRoute = (route: WeekendMashupRoute) => {
    const city = CITIES.find(c => c.id === route.cityId);
    setFullScreenPage({
      type: 'weekendRouteDetail',
      data: {
        activityRouteId: route.id,
        cityId: route.cityId,
        routeIndex: route.routeIndex,
        image: city?.image || '',
      },
    });
  };

  const saveWeekendRoutes = (routeIds: string[]) => {
    setWeekendMashupState(prev => ({
      ...prev,
      selectedRouteIds: routeIds,
      completedRouteIds: prev.completedRouteIds.filter(routeId => routeIds.includes(routeId)),
      selectionLocked: true,
    }));
    setFullScreenPage({ type: 'weekendMashup' });
  };

  const recordWeekendDraw = (draw: WeekendMashupDraw) => {
    setWeekendMashupState(prev => ({
      ...prev,
      lotteryChances: Math.max(0, prev.lotteryChances - 1),
      drawHistory: [draw, ...prev.drawHistory],
    }));
  };

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
        return <EventsTab onOpenWeekendMashup={() => setFullScreenPage({ type: 'weekendMashup' })} />;
      case 'cities':
        return <CitiesTab onCityClick={(city) => setFullScreenPage({ type: 'cityRoutes', data: city })} />;
      case 'profile':
        return <ProfileTab userStats={userStats} />;
      default:
        return <HomeTab userStats={userStats} setUserStats={setUserStats} />;
    }
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
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center space-y-1 transition-colors ${
                  isActive ? 'text-cyan-400' : 'text-slate-500 hover:text-white'
                }`}
              >
                <div className="w-6 h-6 flex items-center justify-center">
                  <Icon size={20} className={isActive ? 'drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]' : ''} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest">{tab.label}</span>
              </button>
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
                 onBack={() => setFullScreenPage({ type: 'cityRoutes', data: fullScreenPage.data.previousCityData })}
                 onStart={() => setFullScreenPage({ type: 'runPlayback', data: fullScreenPage.data })}
               />
            )}
            {fullScreenPage.type === 'runPlayback' && (
               <RunPlaybackView 
                 {...fullScreenPage.data}
                 onExit={() => setFullScreenPage({ type: 'routeDetail', data: fullScreenPage.data })}
                 onComplete={(stats) => {
                   // Update user stats
                   setUserStats(prev => ({
                     ...prev,
                     totalDistance: prev.totalDistance + stats.distance,
                     totalTimeHours: prev.totalTimeHours + (stats.duration / 3600),
                     lightValue: (prev.lightValue || 0) + (stats.calories || Math.floor(stats.distance * 65))
                   }));

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
                     setUserStats(prev => ({ ...prev, completedCities: prev.completedCities + 1 }));
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
            {fullScreenPage.type === 'weekendMashup' && (
              <WeekendMashupView
                state={weekendMashupState}
                onChange={setWeekendMashupState}
                onBack={() => setFullScreenPage(null)}
                onSelectRoutes={() => setFullScreenPage({ type: 'weekendRouteSelect' })}
                onStartRoute={openWeekendRoute}
                onOpenLottery={() => setFullScreenPage({ type: 'weekendLotteryWheel' })}
              />
            )}
            {fullScreenPage.type === 'weekendRouteSelect' && (
              <WeekendRouteSelectView
                state={weekendMashupState}
                onBack={() => setFullScreenPage({ type: 'weekendMashup' })}
                onSave={saveWeekendRoutes}
              />
            )}
            {fullScreenPage.type === 'weekendLotteryWheel' && (
              <WeekendLotteryWheelView
                state={weekendMashupState}
                onBack={() => setFullScreenPage({ type: 'weekendMashup' })}
                onDraw={recordWeekendDraw}
              />
            )}
            {fullScreenPage.type === 'weekendRouteDetail' && (
               <RouteDetailView
                 cityId={fullScreenPage.data.cityId}
                 routeIndex={fullScreenPage.data.routeIndex}
                 image={fullScreenPage.data.image}
                 onBack={() => setFullScreenPage({ type: 'weekendMashup' })}
                 onStart={() => setFullScreenPage({ type: 'weekendRunPlayback', data: fullScreenPage.data })}
               />
            )}
            {fullScreenPage.type === 'weekendRunPlayback' && (
               <RunPlaybackView
                 cityId={fullScreenPage.data.cityId}
                 routeIndex={fullScreenPage.data.routeIndex}
                 image={fullScreenPage.data.image}
                 onExit={() => setFullScreenPage({ type: 'weekendRouteDetail', data: fullScreenPage.data })}
                 onComplete={(stats) => {
                   setUserStats(prev => ({
                     ...prev,
                     totalDistance: prev.totalDistance + stats.distance,
                     totalTimeHours: prev.totalTimeHours + (stats.duration / 3600),
                     lightValue: (prev.lightValue || 0) + (stats.calories || Math.floor(stats.distance * 65)),
                   }));

                   const routeId = fullScreenPage.data.activityRouteId;
                   setWeekendMashupState(prev => {
                     const completedRouteIds = prev.completedRouteIds.includes(routeId)
                       ? prev.completedRouteIds
                       : [...prev.completedRouteIds, routeId];
                     const previousCompletedSelectedCount = prev.selectedRouteIds.filter(id => prev.completedRouteIds.includes(id)).length;
                     const completedSelectedCount = prev.selectedRouteIds.filter(id => completedRouteIds.includes(id)).length;
                     const earnedCompletionChance = previousCompletedSelectedCount < 3 && completedSelectedCount >= 3;

                     return {
                       ...prev,
                       completedRouteIds,
                       lotteryChances: prev.lotteryChances + (earnedCompletionChance ? 1 : 0),
                     };
                   });

                   setFullScreenPage({ type: 'weekendMashup' });
                 }}
               />
            )}
            {fullScreenPage.type === 'litRecords' && (
              <LitRecordsView onBack={() => setFullScreenPage(null)} />
            )}
            {fullScreenPage.type === 'leaderboard' && (
              <LeaderboardView onBack={() => setFullScreenPage(null)} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
