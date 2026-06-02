import { motion } from 'motion/react';
import { Gift, Globe2, ChevronRight, Sparkles, MessageSquare, History } from 'lucide-react';

export default function EventsTab({ onOpenWeekendMashup }: { onOpenWeekendMashup?: () => void }) {
  return (
    <div className="w-full h-full bg-[#05070A] overflow-y-auto pb-24 text-slate-100 font-sans hide-scrollbar relative">
      <div className="sticky top-0 z-20 bg-black/40 backdrop-blur-md pt-safeb flex items-center justify-center px-5 py-4 border-b border-white/10">
        <h1 className="text-sm font-bold tracking-widest uppercase text-cyan-400">热门活动</h1>
      </div>

      <div className="p-3 space-y-3">
        {/* Banner: 周末城市记忆串烧 */}
        <motion.div
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={onOpenWeekendMashup}
          className="relative w-full h-[174px] rounded-2xl overflow-hidden shadow-2xl cursor-pointer group border border-cyan-400/35"
        >
          <img
            src="https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&q=80&w=700&h=520"
            alt="周末城市记忆串烧"
            className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 opacity-65"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-cyan-950/20 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/25 via-transparent to-amber-400/20 pointer-events-none" />

          <div className="absolute top-3 left-3 bg-cyan-400/15 backdrop-blur-sm text-[10px] font-bold px-2.5 py-1 rounded-full text-cyan-100 flex items-center gap-1.5 shadow-lg border border-cyan-300/40">
            <History size={12} />
            历史文化主题
          </div>
          <div className="absolute top-3 right-3 bg-amber-400/15 backdrop-blur-sm text-[10px] font-bold px-2.5 py-1 rounded-full text-amber-100 flex items-center gap-1.5 shadow-lg border border-amber-300/40">
            <Sparkles size={12} className="animate-pulse" />
            周末限时
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h2 className="text-xl font-black mb-1 text-white">周末城市记忆串烧</h2>
            <p className="text-cyan-50/75 text-[11px] leading-relaxed max-w-[72%] line-clamp-2">
              从 10 座城市文化路线中挑选 3 条，完成串烧赢现金抽奖，分享成果再加抽一次。
            </p>
            <div className="flex items-center justify-between mt-3">
              <div className="flex gap-2 text-[11px] text-slate-100">
                <span className="px-2 py-0.5 rounded-full bg-white/10 border border-white/10">10 选 3</span>
                <span className="px-2 py-0.5 rounded-full bg-white/10 border border-white/10">现金奖池</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-cyan-400/15 backdrop-blur flex items-center justify-center border border-cyan-300/35 group-hover:bg-cyan-400/25 transition-colors">
                <ChevronRight size={16} className="text-cyan-100" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Banner 1: 勋章盲盒抽奖 */}
        <motion.div
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative w-full h-[162px] rounded-2xl overflow-hidden shadow-2xl cursor-pointer group border border-amber-500/30"
        >
          <img 
            src="https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&q=80&w=600&h=400" 
            alt="勋章抽奖" 
            className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 opacity-60" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-amber-900/20 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-transparent pointer-events-none" />
          
          <div className="absolute top-3 right-3 bg-amber-500/20 backdrop-blur-sm text-[10px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-full text-amber-200 flex items-center gap-1 shadow-lg border border-amber-500/50">
            <Sparkles size={12} className="animate-pulse" />
            限时开启
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="w-9 h-9 bg-amber-500/20 backdrop-blur-md rounded-xl flex items-center justify-center mb-2 border border-amber-500/30 shadow-inner">
               <Gift size={18} className="text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
            </div>
            <h2 className="text-lg font-bold mb-1 tracking-wide text-amber-100">勋章盲盒抽奖</h2>
            <div className="flex items-center justify-between">
              <p className="text-amber-200/60 text-[11px] max-w-[62%] line-clamp-2">消耗勋章，解锁全球城市路线，获取专属勋章抽取现金奖励</p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className="px-3.5 py-1.5 rounded-full bg-amber-500/20 hover:bg-amber-500/25 border border-amber-500/40 text-amber-200 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-lg active:scale-95 cursor-default"
                >
                  <MessageSquare size={13} />
                  讨论
                </button>
                <div className="w-8 h-8 rounded-full bg-amber-500/10 backdrop-blur flex items-center justify-center border border-amber-500/30 group-hover:bg-amber-500/30 transition-colors">
                  <ChevronRight size={16} className="text-amber-200" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Banner 2: 百人百城计划 */}
        <motion.div
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative w-full h-[174px] rounded-2xl overflow-hidden shadow-2xl cursor-pointer group border border-purple-500/30"
        >
          <img 
            src="https://images.unsplash.com/photo-1506501139174-099022df5260?auto=format&fit=crop&q=80&w=600&h=500" 
            alt="百人百城计划" 
            className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 opacity-60" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-purple-900/20 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-transparent pointer-events-none" />
          
          <div className="absolute top-3 right-3 bg-purple-500/20 backdrop-blur-sm text-[10px] uppercase tracking-widest font-bold px-2.5 py-1 rounded-full text-purple-200 flex items-center gap-1 shadow-lg border border-purple-500/50">
            S1 赛季
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="w-9 h-9 bg-purple-500/20 backdrop-blur-md rounded-xl flex items-center justify-center mb-2 border border-purple-500/30 shadow-inner">
               <Globe2 size={18} className="text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
            </div>
            <h2 className="text-lg font-bold mb-1 tracking-wide text-purple-100">百人百城计划</h2>
            <div className="flex items-center justify-between">
              <p className="text-purple-200/60 text-[11px] max-w-[62%] leading-relaxed line-clamp-2">集结全球跑者，共同解锁全球100个标志性城市赛道，瓜分百万奖池。</p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className="px-3.5 py-1.5 rounded-full bg-purple-500/20 hover:bg-purple-500/25 border border-purple-500/40 text-purple-200 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-lg active:scale-95 cursor-default"
                >
                  <MessageSquare size={13} />
                  讨论
                </button>
                <div className="w-8 h-8 rounded-full bg-purple-500/10 backdrop-blur flex items-center justify-center border border-purple-500/30 group-hover:bg-purple-500/30 transition-colors">
                  <ChevronRight size={16} className="text-purple-200" />
                </div>
              </div>
            </div>

            <div className="w-full h-1 bg-white/5 mt-3 rounded-full overflow-hidden border border-white/5">
               <motion.div 
                 initial={{ width: 0 }} 
                 animate={{ width: "13.68%" }} 
                 transition={{ duration: 1.5, delay: 0.5 }}
                 className="h-full bg-purple-400" 
               />
            </div>
            <p className="text-[10px] text-purple-300/50 font-mono mt-1 w-full text-right">奖金池 1368/10000</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
