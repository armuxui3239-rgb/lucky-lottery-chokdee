import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Trophy, Star, Crown, Medal, ChevronDown } from 'lucide-react';

interface Winner {
  id: string;
  display_name: string;
  prize_type: string;
  amount: number;
  ticket_number: string;
  round_name?: string;
  lottery_rounds?: {
    name: string;
  };
  draw_date: string;
  is_public: boolean;
  created_at: string;
}

interface Round {
  id: string;
  name: string;
  draw_date: string;
}

const PRIZE_LABELS: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  first:      { label: 'รางวัลที่ 1',      icon: Crown,  color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200' },
  near_first: { label: 'ใกล้เคียงรางวัลที่ 1', icon: Star, color: 'text-orange-500', bg: 'bg-orange-50 border-orange-200' },
  second:     { label: 'รางวัลที่ 2',      icon: Medal,  color: 'text-slate-500',   bg: 'bg-slate-50 border-slate-200' },
  third:      { label: 'รางวัลที่ 3',      icon: Medal,  color: 'text-amber-700',   bg: 'bg-amber-50 border-amber-200' },
  fourth:     { label: 'รางวัลที่ 4',      icon: Trophy, color: 'text-blue-500',    bg: 'bg-blue-50 border-blue-200' },
  fifth:      { label: 'รางวัลที่ 5',      icon: Trophy, color: 'text-purple-500',  bg: 'bg-purple-50 border-purple-200' },
  front3:     { label: 'เลขหน้า 3 ตัว',   icon: Trophy, color: 'text-teal-500',    bg: 'bg-teal-50 border-teal-200' },
  back3:      { label: 'เลขท้าย 3 ตัว',   icon: Trophy, color: 'text-indigo-500',  bg: 'bg-indigo-50 border-indigo-200' },
  last2:      { label: 'เลขท้าย 2 ตัว',   icon: Trophy, color: 'text-pink-500',    bg: 'bg-pink-50 border-pink-200' },
};

export default function Winners() {
  const [winners, setWinners] = useState<Winner[]>([]);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [selectedRound, setSelectedRound] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRounds();
  }, []);

  useEffect(() => {
    fetchWinners();
  }, [selectedRound]);

  const fetchRounds = async () => {
    const { data } = await supabase
      .from('lottery_rounds')
      .select('id, name, draw_date')
      .in('status', ['settled'])
      .order('draw_date', { ascending: false })
      .limit(20);
    setRounds(data || []);
    if (data && data.length > 0) setSelectedRound(data[0].id);
  };

  const fetchWinners = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('winners')
        .select('*, lottery_rounds(name)')
        .eq('is_public', true)
        .order('amount', { ascending: false });

      if (selectedRound) query = query.eq('round_id', selectedRound);

      const { data } = await query.limit(50);
      setWinners(data || []);
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (n: number) => `฿${n.toLocaleString('th-TH')}`;

  return (
    <div className="min-h-screen bg-white font-prompt animate-in fade-in duration-500 pb-28">

      {/* Hero */}
      <div className="bg-gradient-to-br from-[#FF0000] to-rose-700 px-6 pt-8 pb-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
          <Crown size={200} className="text-yellow-300" />
        </div>
        <div className="max-w-2xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full text-[9px] font-black text-yellow-300 uppercase tracking-widest mb-4">
            <Trophy size={12} />
            ผู้โชคดีประจำงวด
          </div>
          <h1 className="text-3xl font-sans font-black text-white  tracking-tighter leading-none">
            🏆 ผู้ถูกรางวัล<br />
            <span className="text-yellow-300">ล็อตเตอรี่โชคดี</span>
          </h1>
          <p className="text-white/70 text-xs font-black uppercase tracking-widest mt-3">
            ยินดีกับทุกท่านที่ได้รับรางวัล
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-6">

        {/* Round Selector */}
        {rounds.length > 0 && (
          <div className="bg-white rounded-[2rem] shadow-xl shadow-black/8 border border-slate-100 p-5 mb-6">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
              เลือกงวด
            </label>
            <div className="relative">
              <select
                value={selectedRound}
                onChange={e => setSelectedRound(e.target.value)}
                className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm font-black text-slate-900 outline-none focus:border-primary transition-all pr-10"
              >
                <option value="">— ทุกงวด —</option>
                {rounds.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
        )}

        {/* Winners List */}
        {loading ? (
          <div className="space-y-3">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="h-20 rounded-[1.5rem] bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : winners.length === 0 ? (
          <div className="text-center py-20">
            <Trophy size={56} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-400 font-black text-sm">ยังไม่มีรายชื่อผู้ถูกรางวัล</p>
            <p className="text-slate-300 text-xs mt-1">รอประกาศผลงวดถัดไป</p>
          </div>
        ) : (
          <div className="space-y-3">
            {winners.map((w) => {
              const prize = PRIZE_LABELS[w.prize_type] || PRIZE_LABELS['fifth'];
              const Icon = prize.icon;
              return (
                <div key={w.id} className={`flex items-center gap-4 p-4 rounded-[1.75rem] border ${prize.bg} shadow-sm`}>
                  <div className={`size-12 rounded-2xl bg-white flex items-center justify-center shadow-sm flex-shrink-0`}>
                    <Icon size={22} className={prize.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-sm text-slate-900 truncate">{w.display_name || '*** ***'}</p>
                    <p className="text-[10px] text-slate-500 font-bold mt-0.5">
                      เลข {w.ticket_number || '------'} · {prize.label}
                    </p>
                    {(w.round_name || w.lottery_rounds?.name) && (
                      <p className="text-[9px] text-slate-400 font-black uppercase tracking-wide mt-0.5">{w.round_name || w.lottery_rounds?.name}</p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`font-sans font-black text-lg  leading-none ${prize.color}`}>
                      {formatAmount(w.amount)}
                    </p>
                    <p className="text-[9px] text-slate-400 font-black mt-1">รางวัล</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer note */}
        <div className="mt-8 p-5 bg-slate-50 rounded-[1.5rem] border border-slate-100 text-center">
          <p className="text-[10px] text-slate-400 font-bold leading-relaxed">
            * ระบบจะเก็บประวัติย้อนหลังให้ตรวจสอบได้ 30 วัน<br />
            * ข้อมูลผู้ถูกรางวัลได้รับการยืนยันจากระบบ<br />
            รางวัลจะถูกโอนเข้ากระเป๋าเงินอิเล็กทรอนิกส์โดยอัตโนมัติ
          </p>
        </div>
      </div>
    </div>
  );
}

