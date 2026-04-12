import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, ChevronLeft, ArrowUpRight, Crown, Star, Zap } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useSiteConfig } from '../lib/SiteConfigContext';

interface WinnerData {
  rank: number;
  name: string;
  prize: string;
  avatar: string;
  status: string;
}

const Leaderboard: React.FC = () => {
  const navigate = useNavigate();
  const { config } = useSiteConfig();
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null);
  const [periods, setPeriods] = useState<{ id: string; name: string }[]>([]);
  const [winners, setWinners] = useState<WinnerData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      await fetchPeriods();
    };
    init();
  }, []);

  useEffect(() => {
    if (selectedPeriod) {
      if (config.leaderboard_mock_mode === 'true') {
        setWinners([
          { rank: 1, name: 'สมชาย ร.', prize: '30,000,000 ฿', avatar: 'https://i.pravatar.cc/150?u=1', status: 'Platinum' },
          { rank: 2, name: 'วิภา ม.', prize: '6,000,000 ฿', avatar: 'https://i.pravatar.cc/150?u=2', status: 'Gold' },
          { rank: 3, name: 'อำนวย ค.', prize: '4,000,000 ฿', avatar: 'https://i.pravatar.cc/150?u=3', status: 'Gold' },
          { rank: 4, name: 'ใส่ใจ ห.', prize: '2,000,000 ฿', avatar: 'https://i.pravatar.cc/150?u=4', status: 'Member' },
          { rank: 5, name: 'วีระ บ.', prize: '1,000,000 ฿', avatar: 'https://i.pravatar.cc/150?u=5', status: 'Member' },
        ]);
        setLoading(false);
      } else {
        fetchWinners();
      }
    }
  }, [selectedPeriod, config.leaderboard_mock_mode]);

  const fetchPeriods = async () => {
    try {
      const { data, error } = await supabase
        .from('lottery_rounds')
        .select('id, name')
        .eq('status', 'settled')
        .order('draw_date', { ascending: false })
        .limit(4);
      
      if (error) throw error;
      if (data && data.length > 0) {
        setPeriods(data);
        setSelectedPeriod(data[0].id);
      }
    } catch (err) {
      console.error('Error fetching periods:', err);
    }
  };

  const fetchWinners = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('winners')
        .select(`
          amount,
          prize_type,
          display_name,
          user_id,
          profiles (
            id,
            avatar_url
          )
        `)
        .eq('is_public', true)
        .eq('round_id', selectedPeriod)
        .order('amount', { ascending: false })
        .limit(10);
      
      if (error) throw error;

      if (data) {
        const mapped = data.map((w: any, index: number) => ({
          rank: index + 1,
          name: w.display_name || 'สมาชิกผู้โชคดี',
          prize: `${w.amount.toLocaleString()} ฿`,
          avatar: w.profiles?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${w.user_id}`,
          status: w.amount > 5000000 ? 'Platinum' : w.amount > 1000000 ? 'Gold' : 'Member'
        }));
        setWinners(mapped);
      }
    } catch(err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen text-slate-900 font-prompt animate-in fade-in duration-500 w-full overflow-x-hidden">
      <div className="relative w-full flex flex-col min-h-screen">

        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-[60] bg-white/90 backdrop-blur-2xl border-b border-slate-50 py-6 px-8 shadow-sm">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <button onClick={() => navigate(-1)} className="size-12 flex items-center justify-center bg-white text-slate-400 hover:text-primary rounded-2xl transition-all active:scale-90 shadow-sm border border-slate-100">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-base font-sans font-black tracking-[0.2em] uppercase  text-slate-900 leading-none">ทำเนียบเศรษฐี</h1>
            <div className="size-12"></div>
          </div>
        </header>

        <main className="flex-1 pt-32 pb-48">
          <div className="max-w-5xl mx-auto space-y-16">

            {/* Hero Podium Section */}
            <section className="px-8 flex flex-col items-center">
              <div className="relative w-full p-10 rounded-[3rem] bg-gradient-to-br from-primary via-primary-dark to-rose-950 overflow-hidden shadow-2xl shadow-primary/30 border border-white/10">
                <div className="absolute -top-12 -right-12 p-12 opacity-5 blur-2xl">
                   <Crown className="w-56 h-56 rotate-12 text-white" />
                </div>

                <div className="relative z-10 space-y-8">
                  <div className="inline-flex items-center gap-2.5 px-4 py-1.5 bg-amber-500/20 rounded-full border border-amber-500/30">
                     <Trophy className="w-3.5 h-3.5 text-amber-500" />
                     <p className="text-[9px] font-black text-amber-500 uppercase tracking-[0.3em] leading-none">อันดับสูงสุดของงวด</p>
                  </div>
                  
                  <h2 className="text-4xl font-sans font-black text-white  tracking-tighter leading-none uppercase">
                     ทำเนียบ<br/><span className="text-amber-400">เศรษฐีใหม่</span>
                  </h2>
                  <div className="flex items-center gap-3">
                     <div className="size-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]"></div>
                     <p className="text-white/40 text-[9px] font-black uppercase tracking-[0.25em]">ยืนยันการจ่ายเงินเรียบร้อย</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Luxury Period Chips */}
            <section className="px-8 overflow-x-auto no-scrollbar flex gap-4">
               {periods.map((p) => (
                  <button 
                    key={p.id}
                    onClick={() => setSelectedPeriod(p.id)}
                    className={`px-8 py-3 rounded-2xl whitespace-nowrap text-[10px] font-sans font-black uppercase tracking-widest transition-all ${
                      selectedPeriod === p.id 
                      ? 'bg-primary text-white shadow-2xl shadow-primary/20 scale-105' 
                      : 'bg-white text-slate-400 border border-slate-100'
                    }`}
                  >
                    {p.name}
                  </button>
               ))}
            </section>

            {/* High-End Winner Feed */}
            <section className="px-8 space-y-5 animate-in fade-in slide-in-from-bottom duration-700">
               <div className="flex items-center justify-between px-2 mb-6">
                  <div className="space-y-1">
                     <h3 className="text-xl font-sans font-black text-slate-900 uppercase  tracking-tighter leading-none">รายชื่อผู้โชคดีระดับพรีเมียม</h3>
                     <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none">ยืนยันการจ่ายเงินรางวัลโดยระบบอัตโนมัติ</p>

                  </div>
                  <div className="flex items-center gap-1.5 text-primary bg-red-50 px-3 py-1.5 rounded-xl border border-red-100">
                     <Zap className="w-3.5 h-3.5" />
                     <span className="text-[9px] font-black uppercase tracking-widest">ผู้โชคดี</span>

                  </div>
               </div>

               {loading ? (
                 Array(5).fill(0).map((_, i) => (
                   <div key={i} className="h-28 bg-white rounded-[2.5rem] animate-pulse border border-slate-100" />
                 ))
               ) : winners.length > 0 ? (
                 winners.map((winner) => (
                    <div 
                      key={winner.rank}
                      className="group relative flex items-center justify-between gap-4 p-[1.5rem] rounded-[2.5rem] bg-white border border-slate-100 shadow-xl shadow-black/5 hover:border-primary/20 hover:shadow-primary/5 transition-all active:scale-[0.98]"
                    >
                      <div className="flex items-center gap-6">
                        <div className="relative shrink-0">
                           <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                           <img 
                             src={winner.avatar} 
                             alt={winner.name} 
                             className="relative w-16 h-16 rounded-[1.2rem] object-cover ring-4 ring-white shadow-lg" 
                           />
                           <div className={`absolute -bottom-2 -right-2 size-8 rounded-full flex items-center justify-center text-white font-sans font-black text-xs shadow-2xl ${
                             winner.rank === 1 ? 'bg-amber-400' : winner.rank === 2 ? 'bg-slate-300' : winner.rank === 3 ? 'bg-amber-700' : 'bg-slate-900'
                           }`}>
                              {winner.rank}
                           </div>
                        </div>
                        
                        <div className="min-w-0">
                           <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-black text-slate-900 uppercase tracking-widest truncate">{winner.name}</p>
                              <div className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest ${
                                 winner.status === 'Platinum' ? 'bg-indigo-50 text-indigo-500' : 
                                 winner.status === 'Gold' ? 'bg-amber-50 text-amber-500' : 
                                 'bg-slate-50 text-slate-400'
                              }`}>
                                 {winner.status === 'Platinum' ? 'แพลตตินัม' : winner.status === 'Gold' ? 'โกลด์' : 'สมาชิก'}
                              </div>
                           </div>
                           <div className="flex items-center gap-2">
                             <div className="size-1.5 bg-emerald-500 rounded-full"></div>
                             <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">จ่ายเงินสำเร็จ</p>
                           </div>
                        </div>
                      </div>

                      <div className="text-right">
                         <p className="text-2xl font-sans font-black text-slate-900 tracking-tighter leading-none">{winner.prize}</p>
                         <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">รางวัลรวม</p>
                      </div>
                    </div>
                  ))
               ) : (
                 <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-slate-200">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest ">ไม่มีข้อมูลผู้ถูกรางวัลในงวดนี้</p>
                 </div>
               )}
            </section>
          </div>
        </main>

        {/* Floating Action Protocol */}
        <div className="fixed bottom-20 left-0 right-0 px-8 z-40 pointer-events-none">
           <div className="max-w-5xl mx-auto pointer-events-auto">
              <button onClick={() => navigate('/results')} className="w-full h-18 bg-primary hover:bg-primary-dark text-white rounded-[2rem] font-sans font-black text-sm uppercase  tracking-[0.3em] shadow-2xl shadow-primary/20 flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-95 transition-all">
                 ตรวจสอบผลรางวัล
                 <ArrowUpRight className="w-6 h-6 text-white" />
              </button>
           </div>
        </div>

      </div>
    </div>
  );
};

export default Leaderboard;

