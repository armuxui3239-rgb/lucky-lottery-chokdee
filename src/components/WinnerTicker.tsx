import React, { useEffect, useState } from 'react';
import { Trophy } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Winner {
  display_name: string;
  prize_type: string;
  amount: number;
  created_at: string;
}

const WinnerTicker: React.FC = () => {
  const [winners, setWinners] = useState<Winner[]>([]);

  useEffect(() => {
    const fetchWinners = async () => {
      try {
        const { data } = await supabase
          .from('winners')
          .select('display_name, prize_type, amount, created_at')
          .eq('is_public', true)
          .order('created_at', { ascending: false })
          .limit(12);

        if (data && data.length > 0) {
          setWinners(data as Winner[]);
        }
      } catch {
        // ใช้ fallback data หากโหลดไม่ได้
      }
    };
    fetchWinners();
  }, []);

  return (
    <div className="w-full bg-white border-b border-red-50 py-2.5 overflow-hidden relative z-40">
      <div className="flex items-center whitespace-nowrap animate-marquee">
        {Array(3).fill(winners).flat().map((winner: Winner, idx: number) => (
          <div key={idx} className="flex items-center gap-2 mx-8 group">
            <div className="size-6 rounded-full bg-red-50 flex items-center justify-center text-primary border border-red-100">
              <Trophy size={12} className="group-hover:scale-110 transition-transform" />
            </div>
            <p className="text-[10px] font-prompt font-bold text-slate-800 uppercase tracking-tight">
              <span className="text-primary">{winner.display_name}</span>
              <span className="mx-1 text-slate-400 font-medium">ถูกรางวัล</span>
              <span className="text-emerald-500 font-black">{winner.amount.toLocaleString()} ฿</span>
              <span className="ml-2 px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-600 text-[8px] font-black ">
                {winner.prize_type}
              </span>
            </p>
            <div className="size-1 rounded-full bg-slate-200 ml-4"></div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
          display: inline-flex;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

export default WinnerTicker;

