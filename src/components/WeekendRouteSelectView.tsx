import { useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, ChevronLeft, Lock, MapPin, Save } from 'lucide-react';
import { CITIES, getRouteData } from '../data/cities';
import { WeekendMashupState, WEEKEND_MASHUP_ROUTES } from '../data/weekendMashup';

interface WeekendRouteSelectViewProps {
  state: WeekendMashupState;
  onBack: () => void;
  onSave: (routeIds: string[]) => void;
}

export default function WeekendRouteSelectView({ state, onBack, onSave }: WeekendRouteSelectViewProps) {
  const [draftRouteIds, setDraftRouteIds] = useState<string[]>(state.selectedRouteIds);
  const isComplete = draftRouteIds.length === 3;

  const handleToggle = (routeId: string) => {
    if (state.selectionLocked) return;

    setDraftRouteIds(prev => {
      if (prev.includes(routeId)) {
        return prev.filter(id => id !== routeId);
      }
      if (prev.length >= 3) {
        return prev;
      }
      return [...prev, routeId];
    });
  };

  return (
    <div className="h-full bg-[#07080b] text-slate-100 font-sans overflow-hidden flex flex-col">
      <div className="shrink-0 pt-safeb px-5 py-5 bg-black/75 backdrop-blur-xl border-b border-white/10">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="w-10 h-10 rounded-full bg-white/[0.08] border border-white/10 flex items-center justify-center">
            <ChevronLeft size={24} />
          </button>
          <div className="text-center">
            <h1 className="text-base font-black text-white">选择路线串烧</h1>
            <p className="text-[11px] text-slate-500 mt-1">10 条文化路线中选择 3 条</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-cyan-400/10 border border-cyan-300/20 text-cyan-100 flex items-center justify-center text-xs font-black">
            {draftRouteIds.length}/3
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar px-4 py-4 pb-28 space-y-3">
        {state.selectionLocked && (
          <div className="rounded-2xl border border-amber-300/25 bg-amber-400/10 p-4 flex items-center gap-3 text-amber-100">
            <Lock size={18} />
            <span className="text-sm font-bold">路线已保存锁定，不可更改。</span>
          </div>
        )}

        {WEEKEND_MASHUP_ROUTES.map((route, index) => {
          const city = CITIES.find(item => item.id === route.cityId);
          const routeData = getRouteData(route.cityId, route.routeIndex);
          const isSelected = draftRouteIds.includes(route.id);
          const isDisabled = !isSelected && draftRouteIds.length >= 3;

          return (
            <motion.button
              key={route.id}
              type="button"
              onClick={() => handleToggle(route.id)}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.025 }}
              className={`w-full rounded-2xl overflow-hidden border text-left transition-colors ${
                isSelected
                  ? 'border-cyan-300/65 bg-cyan-400/[0.09]'
                  : 'border-white/10 bg-white/[0.045]'
              } ${isDisabled || state.selectionLocked ? 'opacity-60' : ''}`}
            >
              <div className="flex gap-3 p-3">
                <div className="relative w-[96px] h-[124px] shrink-0 rounded-xl overflow-hidden bg-slate-800">
                  <img src={city?.image} alt={city?.name} className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                  <span className="absolute left-2 bottom-2 text-xs font-black text-white">{city?.name}</span>
                </div>

                <div className="flex-1 min-w-0 py-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="inline-flex px-2 py-0.5 rounded-full bg-amber-300/10 border border-amber-200/20 text-[11px] text-amber-100 font-bold mb-2">
                        {route.themeLabel}
                      </div>
                      <h2 className="text-lg font-black text-white leading-snug">{routeData.title}</h2>
                    </div>
                    <div className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-cyan-400 border-cyan-300 text-slate-950' : 'bg-white/[0.06] border-white/10 text-slate-500'
                    }`}>
                      {isSelected ? <CheckCircle2 size={18} /> : index + 1}
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed mt-2 line-clamp-2">{route.reason}</p>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-3">
                    <span className="flex items-center gap-1">
                      <MapPin size={12} />
                      {routeData.distance} km
                    </span>
                    <span>{routeData.duration}</span>
                    <span>{routeData.rating} 分</span>
                  </div>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      <div className="shrink-0 bg-black/85 backdrop-blur-xl border-t border-white/10 px-5 py-4 pb-5">
        <button
          type="button"
          disabled={!isComplete || state.selectionLocked}
          onClick={() => onSave(draftRouteIds)}
          className={`w-full h-12 rounded-2xl font-black flex items-center justify-center gap-2 ${
            isComplete && !state.selectionLocked
              ? 'bg-cyan-400 text-slate-950 shadow-[0_0_24px_rgba(34,211,238,0.24)]'
              : 'bg-white/[0.06] text-slate-500'
          }`}
        >
          <Save size={18} />
          {state.selectionLocked ? '路线已保存' : isComplete ? '保存选择' : '请选择 3 条路线'}
        </button>
        <p className="text-[11px] text-slate-500 text-center mt-3">保存后本次活动路线不可更改</p>
      </div>
    </div>
  );
}

