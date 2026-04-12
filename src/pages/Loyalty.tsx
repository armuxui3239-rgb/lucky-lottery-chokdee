import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { ChevronLeft, Star, Gift, History, Award, Ticket, Landmark } from 'lucide-react';

interface Reward {
  id: string;
  name: string;
  description: string;
  points_required: number;
  image_url: string;
  category: string;
}

const Loyalty: React.FC = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [points, setPoints] = useState(0);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchLoyaltyData();
    }
  }, [user]);

  const fetchLoyaltyData = async () => {
    setLoading(true);
    try {
      const { data: pointsData } = await supabase
        .from('loyalty_points')
        .select('points_balance')
        .eq('user_id', user?.id)
        .maybeSingle();
      
      setPoints(pointsData?.points_balance || 0);

      const { data: rewardsData, error } = await supabase
        .from('loyalty_rewards')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setRewards(rewardsData || []);
    } catch (error) {
       console.error("Error fetching loyalty data:", error);
    } finally {
       setLoading(false);
    }
  };

  const getTierInfo = (tier: string = 'bronze') => {
    const tiers = {
      bronze: { label: 'สมาชิกบรอนซ์', next: 1000, color: 'text-amber-700', bg: 'from-amber-100 to-amber-200' },
      silver: { label: 'สมาชิกซิลเวอร์', next: 5000, color: 'text-slate-500', bg: 'from-slate-200 to-slate-400' },
      gold: { label: 'สมาชิกโกลด์', next: 10000, color: 'text-yellow-600', bg: 'from-yellow-200 to-yellow-500' },
      platinum: { label: 'สมาชิกแพลตตินัม', next: 25000, color: 'text-amber-900', bg: 'from-[#D4AF37] via-[#F9E498] to-[#AA8439]' },
      diamond: { label: 'สมาชิกไดมอนด์', next: 100000, color: 'text-indigo-900', bg: 'from-blue-200 via-indigo-400 to-indigo-600' }

    };
    return (tiers as any)[tier.toLowerCase()] || tiers.bronze;
  };

  const tier = getTierInfo(profile?.loyalty_tier);
  const progress = Math.min((points / tier.next) * 100, 100);


  if (loading) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="size-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen text-slate-900 font-prompt animate-in fade-in duration-500 w-full overflow-x-hidden">
      <div className="relative w-full flex flex-col min-h-screen">
        
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-2xl border-b border-slate-50 py-6 px-8">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <button onClick={() => navigate('/profile')} className="text-slate-900 flex size-10 items-center justify-center hover:bg-slate-50 rounded-full transition-all active:scale-95">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-sans font-black leading-tight flex-1 text-center pr-10  uppercase tracking-widest text-slate-900">สิทธิพิเศษ</h1>

            <button className="text-slate-400 hover:text-primary transition-colors">
               <History className="size-6" />
            </button>
          </div>
        </header>

        <main className="flex-1 pt-32 pb-44 px-8">
          <div className="max-w-6xl mx-auto space-y-16">
            
            {/* Points Card */}
            <div className="relative group perspective-1000">
               <div className="absolute inset-0 bg-amber-400 blur-[80px] opacity-10 group-hover:opacity-20 transition-opacity"></div>
               <div className={`relative overflow-hidden flex flex-col items-stretch justify-end rounded-[4rem] p-12 shadow-2xl bg-gradient-to-br transition-transform duration-700 hover:scale-[1.01] min-h-[320px] ${tier.bg}`}>
                 <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
                 <div className="absolute top-10 right-10">
                    <Award className="size-32 text-amber-900/10 -rotate-12" />
                 </div>
                 <div className="relative z-10 flex flex-col gap-4">
                   <div className="flex items-center gap-3">
                     <Star className={`${tier.color} size-6 fill-current`} />
                     <p className={`${tier.color} text-sm font-black uppercase tracking-[0.4em] `}>{tier.label}</p>
                   </div>
                   <div className="flex items-baseline gap-4">
                     <p className="text-amber-950 tracking-tighter text-8xl font-sans font-black ">{points.toLocaleString()}</p>
                     <p className="text-amber-900 text-2xl font-black uppercase tracking-widest ">แต้ม</p>

                   </div>
                   <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden mt-4">
                      <div className="h-full bg-amber-950 shadow-lg shadow-amber-950/20 transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                   </div>
                   <p className="text-amber-900/60 text-[10px] font-black uppercase tracking-widest mt-2">
                      {points >= 100000 ? 'ระดับสูงสุดแล้ว' : `อีก ${(tier.next - points).toLocaleString()} แต้ม เพื่อเลื่อนระดับถัดไป`}
                   </p>
                 </div>
               </div>
            </div>


            {/* Rewards Filter Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between border-l-8 border-primary pl-8 gap-4">
               <div className="flex flex-col space-y-2">
                  <h2 className="text-4xl font-sans font-black text-slate-900 tracking-tighter uppercase leading-none">
                    แลกรางวัล
                  </h2>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">
                    ของรางวัลสุดพิเศษสำหรับสมาชิกคนสำคัญ
                  </p>
               </div>
            </div>

            {/* Rewards List Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {rewards.map((reward) => (
                <div key={reward.id} className="group bg-white rounded-[3rem] overflow-hidden shadow-xl shadow-slate-100/50 border border-slate-50 flex flex-col transition-all duration-700 hover:border-primary/20 hover:-translate-y-2">
                   <div className="h-56 bg-slate-50 relative flex items-center justify-center overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-amber-500/5" />
                      <div className="relative group-hover:scale-110 transition-transform duration-700">
                         {reward.category === 'credit' && <Landmark className="size-20 text-primary opacity-20" />}
                         {reward.category === 'premium' && <Gift className="size-20 text-amber-500 opacity-20" />}
                         {reward.category === 'voucher' && <Ticket className="size-20 text-slate-900 opacity-20" />}
                      </div>
                      <div className="absolute bottom-6 left-6">
                         <span className="px-4 py-1.5 rounded-full bg-white text-[9px] font-black uppercase tracking-widest text-slate-400 shadow-sm border border-slate-50">
                            {reward.category}
                         </span>
                      </div>
                   </div>
                   
                   <div className="p-8 flex flex-col gap-6 flex-1">
                     <div className="space-y-2">
                       <h4 className="text-slate-900 font-sans font-black text-xl uppercase  group-hover:text-primary transition-colors">{reward.name}</h4>
                       <p className="text-slate-400 text-xs font-medium leading-relaxed">{reward.description}</p>
                     </div>
                     
                     <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                       <div className="flex flex-col">
                          <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">ใช้แต้ม</span>
                          <div className="flex items-center gap-2 text-amber-500">
                            <Star className="size-5 fill-amber-500" />
                            <span className="font-sans font-black text-2xl  tracking-tighter">{reward.points_required.toLocaleString()}</span>
                          </div>
                       </div>
                       
                       <button 
                         disabled={points < reward.points_required}
                         className={`px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl transition-all active:scale-95 ${
                           points >= reward.points_required 
                           ? 'bg-primary text-white shadow-primary/20 hover:bg-primary-dark hover:scale-105' 
                           : 'bg-slate-50 text-slate-200 shadow-none'
                         }`}
                       >
                         แลกรางวัล
                       </button>
                     </div>
                   </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Loyalty;

