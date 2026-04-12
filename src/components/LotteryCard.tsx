import React from 'react';

interface LotteryCardProps {
  number: string;
  drawDate: string;
  roundName: string;
  price?: number;
}

const LotteryCard: React.FC<LotteryCardProps> = ({ number, drawDate, roundName, price = 80 }) => {
  return (
    <div className="relative w-full max-w-[360px] aspect-[16/9] bg-gradient-to-br from-white via-slate-50 to-slate-100 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 group hover:scale-[1.02] transition-transform duration-500">
      {/* Background Decorative Patterns */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none select-none">
        <svg width="100%" height="100%" className="fill-slate-900">
          <pattern id="pattern-lottery" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M0 40 L40 0 M-10 10 L10 -10 M30 50 L50 30" stroke="currentColor" strokeWidth="1" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#pattern-lottery)" />
        </svg>
      </div>

      {/* Main Content */}
      <div className="relative h-full flex flex-col p-5">
        {/* Top Section */}
        <div className="flex justify-between items-start mb-2">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">สลากกินแบ่งรัฐบาล</span>
            <span className="text-sm font-black text-slate-800  leading-none">{roundName}</span>
          </div>
          <div className="bg-red-500 text-white px-3 py-1 rounded-full font-black text-[10px] shadow-lg shadow-red-500/20">
            OFFICIAL
          </div>
        </div>

        {/* Center Section: Lottery Number */}
        <div className="flex-1 flex items-center justify-center">
          <div className="relative w-full bg-white/50 backdrop-blur-sm border-2 border-dashed border-red-500/30 rounded-xl py-3 px-6 flex justify-between items-center shadow-inner">
            {number.split('').map((digit, idx) => (
              <span key={idx} className="text-5xl font-black text-slate-900 tracking-tight drop-shadow-sm">
                {digit}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-4 flex justify-between items-end">
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Draw Date</span>
            <span className="text-xs font-black text-slate-900 uppercase ">{drawDate}</span>
          </div>
          <div className="text-right">
             <span className="block text-[8px] font-black text-slate-300 uppercase tracking-tighter">Authorized Retailer</span>
             <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-600 ">
               ฿{price.toLocaleString()}
             </span>
          </div>
        </div>
      </div>

      {/* Hologram Effect */}
      <div className="absolute -top-10 -right-10 w-24 h-24 bg-gradient-to-br from-amber-200/20 via-blue-200/20 to-purple-200/20 rounded-full blur-2xl group-hover:translate-x-5 transition-transform duration-[2000ms]"></div>
    </div>
  );
};

export default LotteryCard;

