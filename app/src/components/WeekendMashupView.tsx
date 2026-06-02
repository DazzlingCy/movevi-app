import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  Download,
  Gift,
  Image as ImageIcon,
  Landmark,
  ListChecks,
  Lock,
  MessageCircle,
  Play,
  Share2,
  Sparkles,
  ScrollText,
  X,
} from 'lucide-react';
import { CITIES, getRouteData } from '../data/cities';
import {
  WeekendMashupRoute,
  WeekendMashupState,
  WEEKEND_MASHUP_OPEN_WINDOW,
  WEEKEND_MASHUP_ROUTES,
} from '../data/weekendMashup';

interface WeekendMashupViewProps {
  state: WeekendMashupState;
  onBack: () => void;
  onChange: (nextState: WeekendMashupState | ((prev: WeekendMashupState) => WeekendMashupState)) => void;
  onSelectRoutes: () => void;
  onStartRoute: (route: WeekendMashupRoute) => void;
  onOpenLottery: () => void;
}

export default function WeekendMashupView({
  state,
  onBack,
  onChange,
  onSelectRoutes,
  onStartRoute,
  onOpenLottery,
}: WeekendMashupViewProps) {
  const [notice, setNotice] = useState('');
  const [posterUrl, setPosterUrl] = useState('');
  const [showPoster, setShowPoster] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const selectedRoutes = useMemo(
    () => state.selectedRouteIds
      .map(routeId => WEEKEND_MASHUP_ROUTES.find(route => route.id === routeId))
      .filter((route): route is WeekendMashupRoute => Boolean(route)),
    [state.selectedRouteIds],
  );

  const completedSelectedCount = selectedRoutes.filter(route => state.completedRouteIds.includes(route.id)).length;
  const allCompleted = state.selectionLocked && completedSelectedCount === 3;
  const nextRoute = selectedRoutes.find(route => !state.completedRouteIds.includes(route.id));

  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 1800);
  };

  const wrapCanvasText = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
    let line = '';
    let currentY = y;

    for (const char of text) {
      const testLine = line + char;
      if (ctx.measureText(testLine).width > maxWidth && line) {
        ctx.fillText(line, x, currentY);
        line = char;
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }

    if (line) {
      ctx.fillText(line, x, currentY);
    }
  };

  const generatePoster = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 900;
    canvas.height = 1400;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    ctx.fillStyle = '#f4efe6';
    ctx.fillRect(0, 0, 900, 1400);

    ctx.fillStyle = '#171411';
    ctx.fillRect(40, 40, 820, 1260);

    ctx.fillStyle = '#f8f2e8';
    ctx.beginPath();
    ctx.roundRect(58, 58, 784, 1224, 28);
    ctx.fill();

    ctx.strokeStyle = '#b48a45';
    ctx.lineWidth = 2;
    ctx.strokeRect(92, 92, 716, 1156);

    ctx.fillStyle = '#171411';
    ctx.font = '700 24px sans-serif';
    ctx.fillText('MOVEVI WEEKEND ROUTE MASHUP', 116, 142);

    ctx.fillStyle = '#b48a45';
    ctx.font = '700 22px sans-serif';
    ctx.fillText(WEEKEND_MASHUP_OPEN_WINDOW.label, 116, 184);

    ctx.fillStyle = '#171411';
    ctx.font = '900 74px sans-serif';
    ctx.fillText('周末城市', 116, 304);
    ctx.fillText('记忆串烧', 116, 390);

    ctx.strokeStyle = '#171411';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(116, 430);
    ctx.lineTo(300, 430);
    ctx.stroke();

    ctx.fillStyle = '#4b463d';
    ctx.font = '400 28px sans-serif';
    wrapCanvasText(ctx, '三座城市，三段历史文化路线。用一次周末奔跑，把古寺、皇城、旧街与河岸收进同一段记忆。', 116, 492, 668, 44);

    const cardY = 590;
    ctx.fillStyle = '#171411';
    ctx.font = '800 30px sans-serif';
    ctx.fillText('ROUTE SELECTION', 116, cardY);

    ctx.fillStyle = '#b48a45';
    ctx.font = '700 24px sans-serif';
    ctx.fillText('我的路线串烧', 116, cardY + 42);

    selectedRoutes.forEach((route, index) => {
      const city = CITIES.find(item => item.id === route.cityId);
      const routeData = getRouteData(route.cityId, route.routeIndex);
      const y = cardY + 86 + index * 132;

      ctx.strokeStyle = '#d9cbb7';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(116, y, 668, 96, 20);
      ctx.stroke();

      ctx.fillStyle = '#171411';
      ctx.beginPath();
      ctx.roundRect(138, y + 18, 58, 58, 15);
      ctx.fill();

      ctx.fillStyle = '#f8f2e8';
      ctx.font = '800 24px sans-serif';
      ctx.fillText(`${index + 1}`.padStart(2, '0'), 148, y + 55);

      ctx.fillStyle = '#171411';
      ctx.font = '800 30px sans-serif';
      ctx.fillText(`${city?.name || '城市'} · ${routeData.title}`, 226, y + 39);

      ctx.fillStyle = '#6f675d';
      ctx.font = '400 22px sans-serif';
      ctx.fillText(`${route.themeLabel} / ${routeData.distance} km / ${routeData.duration}`, 226, y + 70);
    });

    ctx.fillStyle = '#171411';
    ctx.beginPath();
    ctx.roundRect(116, 1112, 288, 86, 18);
    ctx.fill();

    ctx.fillStyle = '#f8f2e8';
    ctx.font = '900 40px sans-serif';
    ctx.fillText('3 / 3', 146, 1166);

    ctx.fillStyle = '#171411';
    ctx.font = '800 36px sans-serif';
    ctx.fillText('路线已完成', 436, 1150);

    ctx.fillStyle = '#6f675d';
    ctx.font = '400 23px sans-serif';
    ctx.fillText('分享成果，解锁现金翻牌机会。', 436, 1184);

    ctx.strokeStyle = '#b48a45';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(116, 1224);
    ctx.lineTo(784, 1224);
    ctx.stroke();

    ctx.fillStyle = '#171411';
    ctx.font = '700 24px sans-serif';
    ctx.fillText('MOVEVI', 116, 1266);

    ctx.fillStyle = '#6f675d';
    ctx.font = '400 22px sans-serif';
    ctx.fillText('Run the memory of cities', 222, 1266);

    return canvas.toDataURL('image/png');
  };

  const handleShare = () => {
    if (!allCompleted) return;
    const url = generatePoster();
    if (!url) {
      showNotice('海报生成失败，请稍后再试');
      return;
    }
    setPosterUrl(url);
    setShowPoster(true);
  };

  const grantShareBonus = () => {
    if (state.shareBonusClaimed) {
      showNotice('已领取过分享抽奖机会');
      return;
    }

    onChange(prev => ({
      ...prev,
      lotteryChances: prev.lotteryChances + 1,
      shareBonusClaimed: true,
    }));
    showNotice('分享成功，已追加 1 次抽奖机会');
  };

  const handleDownloadPoster = () => {
    if (!posterUrl) return;
    const link = document.createElement('a');
    link.href = posterUrl;
    link.download = 'movevi-weekend-mashup.png';
    link.click();
    showNotice('分享图片已保存');
  };

  const handleWechatShare = async () => {
    if (!posterUrl || isSharing) return;
    setIsSharing(true);

    window.setTimeout(() => {
      grantShareBonus();
      setShowPoster(false);
      setIsSharing(false);
    }, 450);
  };

  const handlePrimaryAction = () => {
    if (!state.selectionLocked) {
      onSelectRoutes();
      return;
    }
    if (nextRoute) {
      onStartRoute(nextRoute);
    }
  };

  return (
    <div className="h-full bg-[#080706] text-slate-100 font-sans overflow-hidden flex flex-col">
      <div className="flex-1 overflow-y-auto hide-scrollbar pb-32">
        <div className="relative min-h-[390px] overflow-hidden border-b border-amber-200/10">
          <img
            src="https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&q=80&w=900&h=700"
            alt="历史文化城市活动"
            className="absolute inset-0 h-full w-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-[#18110b]/62 to-[#080706]" />
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/24 via-transparent to-emerald-700/16" />
          <div className="absolute inset-x-0 bottom-0 h-28 bg-[radial-gradient(circle_at_50%_100%,rgba(245,158,11,0.20),transparent_62%)]" />

          <div className="relative z-10 pt-safeb px-5 py-5">
            <div className="flex items-center justify-between">
              <button onClick={onBack} className="w-10 h-10 rounded-full bg-black/35 backdrop-blur-md border border-amber-100/15 flex items-center justify-center">
                <ChevronLeft size={24} />
              </button>
              <div className="px-3 py-1.5 rounded-full bg-amber-300/16 text-amber-100 border border-amber-200/30 text-xs font-bold flex items-center gap-1.5">
                <CalendarDays size={14} />
                周末限时开放
              </div>
            </div>

            <div className="mt-14">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-400/10 text-emerald-100 border border-emerald-300/20 text-xs font-bold mb-4">
                <Landmark size={14} />
                历史文化主题
              </div>
              <h1 className="text-3xl font-black leading-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.65)]">周末城市记忆串烧</h1>
              <p className="text-sm text-amber-50/85 leading-relaxed mt-3 max-w-[320px]">
                这个周末，从古寺、皇城、旧街与河岸出发，把三座城市的历史片段串成一段奔跑记忆。每一条路线都是一枚城市印章，完成串烧后解锁现金翻牌抽奖。
              </p>

              <div className="mt-5 rounded-2xl bg-black/35 backdrop-blur-md border border-amber-200/20 p-3 shadow-[0_12px_36px_rgba(0,0,0,0.25)]">
                <div className="flex items-center gap-2 text-amber-100 text-xs font-bold">
                  <CalendarDays size={15} />
                  活动开放时间
                </div>
                <div className="text-lg font-black text-white mt-1">{WEEKEND_MASHUP_OPEN_WINDOW.label}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 mt-4 relative z-20">
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl bg-[#171411]/85 border border-amber-100/12 p-3 backdrop-blur-md">
              <div className="text-2xl font-black text-white">{state.selectedRouteIds.length}/3</div>
              <div className="text-[11px] text-slate-400 mt-1">已选路线</div>
            </div>
            <div className="rounded-2xl bg-[#171411]/85 border border-amber-100/12 p-3 backdrop-blur-md">
              <div className="text-2xl font-black text-emerald-300">{completedSelectedCount}/3</div>
              <div className="text-[11px] text-slate-400 mt-1">完成进度</div>
            </div>
            <div className="rounded-2xl bg-[#171411]/85 border border-amber-100/12 p-3 backdrop-blur-md">
              <div className="text-2xl font-black text-amber-300">{state.lotteryChances}</div>
              <div className="text-[11px] text-slate-400 mt-1">抽奖机会</div>
            </div>
          </div>

          <div className="mt-5 rounded-2xl bg-[#13100d] border border-amber-100/12 p-4 shadow-[0_18px_60px_rgba(0,0,0,0.22)]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-black text-white flex items-center gap-2">
                <ScrollText size={18} className="text-amber-200" />
                我的路线串烧
              </h2>
              <span className={`text-xs px-2 py-1 rounded-full border flex items-center gap-1.5 ${
                state.selectionLocked
                  ? 'text-emerald-200 bg-emerald-400/10 border-emerald-300/20'
                  : 'text-amber-100 bg-amber-300/10 border-amber-200/25'
              }`}>
                {state.selectionLocked ? <Lock size={12} /> : <ListChecks size={12} />}
                {state.selectionLocked ? '已锁定' : '10 选 3'}
              </span>
            </div>

            {selectedRoutes.length === 0 ? (
              <button
                type="button"
                onClick={onSelectRoutes}
                className="w-full rounded-2xl border border-dashed border-amber-200/35 bg-amber-300/[0.07] p-5 text-left active:scale-[0.99] transition-transform"
              >
                <div className="w-11 h-11 rounded-xl bg-amber-300/15 border border-amber-200/25 flex items-center justify-center mb-4">
                  <ListChecks size={22} className="text-amber-100" />
                </div>
                <h3 className="font-black text-white text-lg">选择 3 条城市路线</h3>
                <p className="text-sm text-slate-400 leading-relaxed mt-2">
                  进入独立路线列表，挑选 3 条历史文化路线。保存后本次活动不可更改。
                </p>
              </button>
            ) : (
              <div className="space-y-3">
                {selectedRoutes.map((route, index) => {
                  const city = CITIES.find(item => item.id === route.cityId);
                  const routeData = getRouteData(route.cityId, route.routeIndex);
                  const isCompleted = state.completedRouteIds.includes(route.id);

                  return (
                    <button
                      key={route.id}
                      type="button"
                      onClick={() => !isCompleted && onStartRoute(route)}
                      className={`w-full flex items-center gap-3 rounded-2xl border p-3 text-left transition-colors ${
                        isCompleted
                          ? 'bg-emerald-400/[0.08] border-emerald-300/20'
                          : 'bg-white/[0.055] border-amber-100/10 active:bg-white/[0.085]'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black shrink-0 ${
                        isCompleted ? 'bg-emerald-400 text-slate-950' : 'bg-amber-300/14 text-amber-100 border border-amber-200/25'
                      }`}>
                        {isCompleted ? <CheckCircle2 size={20} /> : index + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-base font-black text-white truncate">{city?.name} · {routeData.title}</div>
                        <div className="text-xs text-slate-500 mt-1">{isCompleted ? '已完成' : '点击进入路线'}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-5 rounded-2xl bg-[#13100d] border border-amber-100/12 p-4">
            <h2 className="font-black text-white mb-3 flex items-center gap-2">
              <Sparkles size={17} className="text-amber-200" />
              活动规则
            </h2>
            <div className="space-y-2 text-sm text-slate-400 leading-relaxed">
              <p>1. 保存 3 条路线后，本次路线串烧不可更改。</p>
              <p>2. 完成全部 3 条路线后，获得 1 次现金翻牌抽奖机会。</p>
              <p>3. 分享活动成果成功后，额外获得 1 次抽奖机会。</p>
            </div>
          </div>

          {state.drawHistory.length > 0 && (
            <div className="mt-5 rounded-2xl bg-[#13100d] border border-amber-100/12 p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-black text-white">最近中奖</h2>
                <span className="text-xs text-slate-500">{state.drawHistory.length} 次</span>
              </div>
              <div className="space-y-2">
                {state.drawHistory.slice(0, 3).map(draw => (
                  <div key={draw.id} className="flex items-center justify-between rounded-xl bg-white/[0.05] px-3 py-2">
                    <span className="text-xs text-slate-500">
                      {new Date(draw.createdAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="font-black text-amber-200">¥{draw.amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="shrink-0 z-30 bg-black/85 backdrop-blur-xl border-t border-amber-100/12 px-5 py-4 pb-5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handlePrimaryAction}
            disabled={state.selectionLocked && !nextRoute}
            className={`flex-1 h-12 rounded-2xl font-black flex items-center justify-center gap-2 ${
              !state.selectionLocked || nextRoute
                ? 'bg-amber-300 text-slate-950 shadow-[0_0_24px_rgba(245,158,11,0.24)]'
                : 'bg-white/[0.06] text-slate-500'
            }`}
          >
            {!state.selectionLocked ? <ListChecks size={18} /> : <Play size={18} className={nextRoute ? 'fill-slate-950' : ''} />}
            {!state.selectionLocked ? '选择路线' : nextRoute ? '开始串烧' : '串烧完成'}
          </button>
          <button
            type="button"
            onClick={handleShare}
            disabled={!allCompleted}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${
              allCompleted
                ? 'bg-amber-400 text-slate-950 border-amber-300'
                : 'bg-white/[0.06] text-slate-500 border-white/10'
            }`}
          >
            <Share2 size={19} />
          </button>
          <button
            type="button"
            onClick={onOpenLottery}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${
              state.lotteryChances > 0
                ? 'bg-rose-400 text-slate-950 border-rose-300'
                : 'bg-white/[0.06] text-slate-500 border-white/10'
            }`}
          >
            <Gift size={20} />
          </button>
        </div>
        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
          <span>分享加抽：{state.shareBonusClaimed ? '已领取' : allCompleted ? '待领取' : '完成后解锁'}</span>
          <span>开奖记录：{state.drawHistory.length} 次</span>
        </div>
      </div>

      <AnimatePresence>
        {showPoster && posterUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/78 backdrop-blur-md flex flex-col justify-end"
          >
            <motion.div
              initial={{ y: 80 }}
              animate={{ y: 0 }}
              exit={{ y: 80 }}
              className="bg-[#11100e] border-t border-amber-100/15 rounded-t-3xl p-5 max-h-[92%] overflow-y-auto hide-scrollbar"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-black text-white flex items-center gap-2">
                    <ImageIcon size={19} className="text-amber-200" />
                    分享成果图片
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">保存到本地，或分享给微信好友</p>
                </div>
                <button onClick={() => setShowPoster(false)} className="w-9 h-9 rounded-full bg-white/[0.08] flex items-center justify-center">
                  <X size={18} />
                </button>
              </div>

              <div className="rounded-2xl overflow-hidden border border-amber-100/12 bg-black/30 shadow-[0_18px_60px_rgba(0,0,0,0.32)]">
                <img src={posterUrl} alt="活动成果分享图" className="w-full block" />
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4">
                <button
                  type="button"
                  onClick={handleDownloadPoster}
                  className="h-12 rounded-2xl bg-white/[0.08] border border-white/10 text-slate-100 font-black flex items-center justify-center gap-2"
                >
                  <Download size={18} />
                  保存本地
                </button>
                <button
                  type="button"
                  onClick={handleWechatShare}
                  disabled={isSharing}
                  className="h-12 rounded-2xl bg-emerald-400 text-slate-950 font-black flex items-center justify-center gap-2"
                >
                  <MessageCircle size={18} />
                  {isSharing ? '分享中' : '微信好友'}
                </button>
              </div>

              <p className="text-[11px] text-slate-500 text-center mt-3">
                分享成功后可获得 1 次抽奖机会，每次活动仅限领取一次。
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {notice && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed left-1/2 bottom-28 z-50 -translate-x-1/2 rounded-full bg-white text-slate-950 px-4 py-2 text-sm font-bold shadow-xl"
          >
            {notice}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
