import { Compass, Sparkles, MapPin, Map, Sunrise } from 'lucide-react';

interface BannerProps {
  totalDays: number;
  totalCostJpy: number;
  totalCostKrw: number;
}

export default function Banner({ totalDays, totalCostJpy, totalCostKrw }: BannerProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-rose-500 via-orange-500 to-amber-500 text-white shadow-xl h-full p-6 md:p-8">
      {/* Decorative Osaka Castle Outline & Sakura petaling patterns */}
      <div className="absolute right-0 bottom-0 opacity-15 translate-x-12 translate-y-6 pointer-events-none hidden md:block">
        <svg width="400" height="300" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5">
          {/* Conceptual Japanese Castle Tower shape */}
          <path d="M 50 10 L 45 20 L 55 20 Z" />
          <path d="M 40 20 L 35 35 L 65 35 L 60 20 Z" />
          <path d="M 30 35 L 20 60 L 80 60 L 70 35 Z" />
          <path d="M 15 60 L 5 95 L 95 95 L 85 60 Z" />
          <rect x="42" y="40" width="16" height="20" rx="1" />
          <line x1="50" y1="40" x2="50" y2="60" />
          <line x1="10" y1="95" x2="90" y2="95" strokeWidth="3" />
        </svg>
      </div>

      <div className="absolute top-2 right-4 text-xs font-mono tracking-widest opacity-25 uppercase pointer-events-none">
        OSAKA ADVISOR // 2026
      </div>

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-medium tracking-wide">
            <Sunrise className="w-3.5 h-3.5 text-amber-200 animate-pulse" />
            <span>식도락과 낭만의 도시, 오사카 여행</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight font-sans">
            오사카 일정 플래너 <span className="font-light text-rose-100">大阪</span>
          </h1>

          <p className="text-rose-50 text-sm md:text-base leading-relaxed">
            도톤보리의 화려한 네온사인, 츠텐카쿠의 복고적인 감성, 그리고 따끈따끈한 타코야끼 향이 가득한 오사카! AI 기반 자동 플래너와 함께 더욱 똑똑하고 완벽한 일정을 짜보세요.
          </p>
        </div>

        {/* Quick Travel Card Stats */}
        <div className="grid grid-cols-3 gap-2 bg-black/15 backdrop-blur-md rounded-2xl p-4 border border-white/10 min-w-[280px]">
          <div className="text-center p-1.5">
            <div className="text-[10px] font-medium text-rose-200 uppercase tracking-wider mb-1">여행기간</div>
            <div className="text-base font-bold flex items-center justify-center gap-1">
              <span className="text-amber-200 font-mono text-lg">{totalDays}</span>일간
            </div>
          </div>
          <div className="text-center p-1.5 border-x border-white/10">
            <div className="text-[10px] font-medium text-rose-200 uppercase tracking-wider mb-1">예상경비 (엔)</div>
            <div className="text-base font-bold text-amber-200 font-mono">
              ¥{(totalCostJpy).toLocaleString()}
            </div>
          </div>
          <div className="text-center p-1.5">
            <div className="text-[10px] font-medium text-rose-200 uppercase tracking-wider mb-1">원화 환산</div>
            <div className="text-base font-bold text-emerald-200 font-mono">
              ~₩{(totalCostKrw).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Floating lanterns concept */}
      <div className="absolute top-1/2 left-2/3 -translate-y-1/2 pointer-events-none opacity-20 filter blur-xs">
        <span className="inline-block w-8 h-12 bg-rose-400 rounded-lg shadow-lg border border-amber-300 animate-bounce" style={{ animationDuration: '4s' }}></span>
        <span className="inline-block w-6 h-10 bg-amber-400 rounded-lg shadow-lg border border-amber-200 ml-4 animate-bounce" style={{ animationDuration: '5.5s' }}></span>
      </div>
    </div>
  );
}
