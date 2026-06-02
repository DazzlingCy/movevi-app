import { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Gift, History, Sparkles, Ticket, WalletCards } from 'lucide-react';
import { CASH_PRIZE_PROBABILITIES, WeekendMashupDraw, WeekendMashupState } from '../data/weekendMashup';

interface WeekendLotteryWheelViewProps {
  state: WeekendMashupState;
  onBack: () => void;
  onDraw: (draw: WeekendMashupDraw) => void;
}

const flipCards = [
  { id: 'card-1', label: 'A' },
  { id: 'card-2', label: 'B' },
  { id: 'card-3', label: 'C' },
];
const drawWeightedPrize = () => {
  const totalProbability = CASH_PRIZE_PROBABILITIES.reduce((sum, prize) => sum + prize.probability, 0);
  let cursor = Math.random() * totalProbability;

  for (const prize of CASH_PRIZE_PROBABILITIES) {
    cursor -= prize.probability;
    if (cursor <= 0) {
      return prize.amount;
    }
  }

  return CASH_PRIZE_PROBABILITIES[CASH_PRIZE_PROBABILITIES.length - 1].amount;
};

export default function WeekendLotteryWheelView({ state, onBack, onDraw }: WeekendLotteryWheelViewProps) {
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);
  const [resultAmount, setResultAmount] = useState<number | null>(null);

  const canPickCard = state.lotteryChances > 0 && selectedCardIndex === null && !isRevealing;
  const canReset = resultAmount !== null && state.lotteryChances > 0 && !isRevealing;

  const handlePickCard = (cardIndex: number) => {
    if (!canPickCard) return;

    const amount = drawWeightedPrize();

    setSelectedCardIndex(cardIndex);
    setResultAmount(amount);
    setIsRevealing(true);

    window.setTimeout(() => {
      const draw = { id: `${Date.now()}-${state.drawHistory.length}`, amount, createdAt: Date.now() };
      onDraw(draw);
      setIsRevealing(false);
    }, 720);
  };

  const resetCards = () => {
    if (!canReset) return;
    setSelectedCardIndex(null);
    setResultAmount(null);
  };

  const getActionLabel = () => {
    if (isRevealing) return '翻牌中';
    if (canReset) return '再翻一次';
    if (state.lotteryChances > 0 && selectedCardIndex === null) return '请选择一张现金卡';
    return '暂无抽奖机会';
  };

  return (
    <div className="h-full bg-[#07080b] text-slate-100 font-sans overflow-hidden flex flex-col">
      <div className="shrink-0 pt-safeb px-5 py-5 bg-black/75 backdrop-blur-xl border-b border-white/10">
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="w-10 h-10 rounded-full bg-white/[0.08] border border-white/10 flex items-center justify-center">
            <ChevronLeft size={24} />
          </button>
          <div className="text-center">
            <h1 className="text-base font-black text-white">现金奖励翻牌</h1>
            <p className="text-[11px] text-slate-500 mt-1">三张现金卡，选择一张揭晓奖励</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-rose-400/10 border border-rose-300/20 text-rose-100 flex items-center justify-center text-xs font-black">
            {state.lotteryChances}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar px-5 py-6 pb-28">
        <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-5 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-300/10 border border-amber-200/20 text-amber-100 text-xs font-bold">
            <Sparkles size={14} />
            周末现金奖池
          </div>

          <div className="mt-7 grid grid-cols-3 gap-3">
            {flipCards.map((card, index) => {
              const isSelected = selectedCardIndex === index;
              const isDimmed = selectedCardIndex !== null && !isSelected;

              return (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => handlePickCard(index)}
                  disabled={!canPickCard}
                  className={`relative h-40 rounded-2xl outline-none [perspective:900px] ${
                    canPickCard ? 'cursor-pointer active:scale-95' : 'cursor-default'
                  }`}
                  aria-label={`现金卡 ${card.label}`}
                >
                  <motion.div
                    animate={{ rotateY: isSelected ? 180 : 0, scale: isSelected ? 1.03 : 1 }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute inset-0"
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    <div
                      className={`absolute inset-0 rounded-2xl border p-3 flex flex-col items-center justify-between overflow-hidden shadow-[0_14px_30px_rgba(0,0,0,0.28)] ${
                        isDimmed
                          ? 'border-white/10 bg-slate-900/55 opacity-55'
                          : canPickCard
                            ? 'border-amber-200/35 bg-gradient-to-b from-[#2b2412] via-[#151a22] to-[#0f131b]'
                            : 'border-white/10 bg-slate-900/70'
                      }`}
                      style={{ backfaceVisibility: 'hidden' }}
                    >
                      <div className="w-full flex justify-between items-center text-[10px] text-amber-100/70 font-black">
                        <span>{card.label}</span>
                        <Sparkles size={12} />
                      </div>
                      <div className="w-11 h-11 rounded-full bg-amber-300/12 border border-amber-200/25 flex items-center justify-center shadow-[0_0_22px_rgba(251,191,36,0.16)]">
                        <WalletCards size={23} className="text-amber-200" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-white">现金卡</p>
                        <p className="text-[10px] text-slate-500 mt-1">{canPickCard ? '点击翻开' : '等待机会'}</p>
                      </div>
                    </div>

                    <div
                      className="absolute inset-0 rounded-2xl border border-amber-200/70 bg-gradient-to-b from-amber-200 via-rose-300 to-rose-500 p-3 flex flex-col items-center justify-between text-slate-950 shadow-[0_0_28px_rgba(251,191,36,0.32)]"
                      style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                    >
                      {isSelected && resultAmount !== null ? (
                        <>
                          <div className="w-full flex justify-between items-center text-[10px] font-black">
                            <span>WIN</span>
                            <Gift size={13} />
                          </div>
                          <div>
                            <p className="text-[11px] font-black opacity-75">现金奖励</p>
                            <p className="text-2xl font-black mt-1">¥{resultAmount.toFixed(2)}</p>
                          </div>
                          <p className="text-[10px] font-bold opacity-75">已开奖</p>
                        </>
                      ) : (
                        <div className="h-full flex items-center justify-center text-xs font-black opacity-70">未翻开</div>
                      )}
                    </div>
                  </motion.div>
                </button>
              );
            })}
          </div>

          {resultAmount !== null ? (
            <div className="mt-7 rounded-2xl bg-amber-300/10 border border-amber-200/25 p-4">
              <p className="text-sm text-amber-100 font-bold">恭喜翻中现金奖励</p>
              <div className="text-4xl font-black text-white mt-1">¥{resultAmount.toFixed(2)}</div>
            </div>
          ) : (
            <p className="text-sm text-slate-400 leading-relaxed mt-7">
              当前剩余 {state.lotteryChances} 次机会。选择任意一张现金卡翻开，将消耗 1 次机会抽取现金奖励。
            </p>
          )}
        </div>

        <div className="mt-5 rounded-2xl bg-[#10151d] border border-amber-200/15 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-black text-white flex items-center gap-2">
              <Gift size={17} className="text-amber-300" />
              奖池与概率
            </h2>
            <span className="text-[11px] text-amber-100/70 font-bold">公开展示</span>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {CASH_PRIZE_PROBABILITIES.map(prize => (
              <div key={prize.amount} className="rounded-xl bg-amber-300/[0.08] border border-amber-200/15 px-2 py-3 text-center">
                <div className="text-sm font-black text-amber-100">¥{prize.amount.toFixed(2)}</div>
                <div className="text-[10px] text-slate-500 mt-1">{prize.probability}%</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 rounded-2xl bg-[#10151d] border border-white/10 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-black text-white flex items-center gap-2">
              <History size={17} className="text-cyan-300" />
              开奖记录
            </h2>
            <span className="text-xs text-slate-500">{state.drawHistory.length} 次</span>
          </div>
          {state.drawHistory.length === 0 ? (
            <p className="text-sm text-slate-500">暂无记录，完成路线串烧后回来试试手气。</p>
          ) : (
            <div className="space-y-2">
              {state.drawHistory.map(draw => (
                <div key={draw.id} className="flex items-center justify-between rounded-xl bg-white/[0.05] border border-white/10 px-3 py-3">
                  <span className="text-sm text-slate-300">{new Date(draw.createdAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</span>
                  <span className="text-lg font-black text-amber-200">¥{draw.amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="shrink-0 bg-black/85 backdrop-blur-xl border-t border-white/10 px-5 py-4 pb-5">
        <button
          type="button"
          onClick={resetCards}
          disabled={!canReset}
          className={`w-full h-12 rounded-2xl font-black flex items-center justify-center gap-2 ${
            canReset
              ? 'bg-rose-400 text-slate-950 shadow-[0_0_24px_rgba(251,113,133,0.24)]'
              : 'bg-white/[0.06] text-slate-500'
          }`}
        >
          <Ticket size={18} />
          {getActionLabel()}
        </button>
        <p className="text-[11px] text-slate-500 text-center mt-3">
          完成三条路线得 1 次机会，分享成果可再得 1 次
        </p>
      </div>
    </div>
  );
}
