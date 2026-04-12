import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight,
  PieChart,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react';

const AdminReports: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30_days');

  const fetchReports = async () => {
    setLoading(true);
    try {
      // 1. Fetch Total Revenue (Tickets Sold)
      const { data: ticketSales } = await supabase
        .from('lottery_tickets')
        .select('price');
      
      const totalRevenue = ticketSales?.reduce((sum, t) => sum + t.price, 0) || 0;

      // 2. Fetch Total Payouts (Winners)
      const { data: winnerPayouts } = await supabase
        .from('winners')
        .select('prize_amount');
      
      const totalPayouts = winnerPayouts?.reduce((sum, w) => sum + w.prize_amount, 0) || 0;

      // 3. Fetch User Growth
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // 4. Fetch Active Rounds
      const { count: activeRounds } = await supabase
        .from('lottery_rounds')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      setStats({
        totalRevenue,
        totalPayouts,
        totalUsers,
        activeRounds,
        profit: totalRevenue - totalPayouts,
        margin: totalRevenue > 0 ? ((totalRevenue - totalPayouts) / totalRevenue) * 100 : 0
      });
    } catch (error: any) {
      toast.error('โหลดข้อมูลรายงานล้มเหลว: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [dateRange]);

  const MetricCard = ({ title, value, icon: Icon, color, subValue }: any) => (
    <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl relative overflow-hidden group hover:border-primary/30 transition-all">
       <div className={`size-14 rounded-2xl bg-white/5 text-${color === 'primary' ? 'primary' : color + '-500'} flex items-center justify-center mb-6 border border-white/5`}>
          <Icon size={28} />
       </div>
       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-2">{title}</p>
       <div className="flex items-baseline gap-2">
          <h4 className="text-3xl font-sans font-black text-white tracking-tighter  uppercase">{value}</h4>
          {subValue && <span className="text-[10px] font-black text-primary uppercase ">{subValue}</span>}
       </div>
       <div className="absolute top-0 right-0 p-8 opacity-[0.03] rotate-12 scale-150 text-white pointer-events-none group-hover:scale-110 transition-transform">
          <Icon size={120} />
       </div>
    </div>
  );

  return (
    <div className="space-y-10 font-prompt text-white">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h2 className="text-2xl font-black text-white tracking-tight uppercase  flex items-center gap-3">
            <BarChart3 size={24} className="text-primary" />
            รายงานและสถิติภาพรวม
          </h2>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">วิเคราะห์รายได้ กำไร และการเติบโตอย่างละเอียด</p>
        </div>
        
        <div className="flex items-center gap-3 bg-slate-900 p-1 rounded-2xl border border-slate-800 shadow-2xl">
           <button onClick={() => setDateRange('7_days')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${dateRange === '7_days' ? 'bg-primary text-white' : 'text-slate-500 hover:text-slate-300'}`}>7 วัน</button>
           <button onClick={() => setDateRange('30_days')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${dateRange === '30_days' ? 'bg-primary text-white' : 'text-slate-500 hover:text-slate-300'}`}>30 วัน</button>
           <button onClick={() => setDateRange('all')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${dateRange === 'all' ? 'bg-primary text-white' : 'text-slate-500 hover:text-slate-300'}`}>ทั้งหมด</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          Array(4).fill(0).map((_, i) => <div key={i} className="h-44 bg-slate-900 rounded-[2.5rem] animate-pulse border border-slate-800" />)
        ) : (
          <>
            <MetricCard title="ยอดขายรวม (Gross)" value={stats.totalRevenue.toLocaleString()} subValue="฿" icon={DollarSign} color="primary" />
            <MetricCard title="จ่ายเงินรางวัล (Payout)" value={stats.totalPayouts.toLocaleString()} subValue="฿" icon={TrendingUp} color="rose" />
            <MetricCard title="สมาชิกทั้งหมด" value={stats.totalUsers.toLocaleString()} subValue="คน" icon={Users} color="emerald" />
            <MetricCard title="กำไรสุทธิ (Net Profit)" value={stats.profit.toLocaleString()} subValue="฿" icon={PieChart} color="amber" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <div className="md:col-span-2 bg-slate-900 rounded-[3rem] border border-slate-800 p-10 shadow-2xl flex flex-col justify-center gap-10 relative overflow-hidden">
            <div className="absolute top-[-10%] right-[-5%] size-64 bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>
            
            <div className="flex items-center justify-between relative z-10">
               <div className="space-y-1">
                  <h3 className="text-xl font-sans font-black text-white  uppercase tracking-tighter">วิเคราะห์รายได้เทียบรายวัน</h3>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">ข้อมูลแบบ Real-time</p>
               </div>
               <button onClick={fetchReports} className="size-12 bg-slate-950 text-slate-600 hover:text-primary rounded-xl flex items-center justify-center transition-all active:scale-90 border border-slate-800">
                  <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
               </button>
            </div>
            
            <div className="h-64 flex items-end justify-between gap-2 px-4">
               {/* Simplified Mock Graph */}
               {[40, 70, 45, 90, 65, 85, 55, 75, 95, 60].map((h, i) => (
                 <div key={i} className="flex-1 group relative">
                    <div 
                      className="w-full bg-slate-800 rounded-xl transition-all duration-700 group-hover:bg-primary/20" 
                      style={{ height: `${h}%` }}
                    >
                       <div className="absolute inset-0 bg-primary/40 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                 </div>
               ))}
            </div>
            
            <div className="flex justify-between px-4 text-[9px] font-black text-slate-500 uppercase tracking-widest border-t border-slate-800/50 pt-6">
                <span>01 Apr</span>
                <span>10 Apr</span>
                <span>20 Apr</span>
                <span>30 Apr</span>
            </div>
         </div>

         <div className="bg-slate-900 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden flex flex-col justify-between group">
            <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
            
            <div className="space-y-8 relative z-10">
               <div className="size-14 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10">
                  <PieChart className="text-primary" size={28} />
               </div>
               <div>
                  <h4 className="text-lg font-sans font-black text-white  uppercase tracking-tighter">ขีดจำกัดงวดปัจจุบัน</h4>
                  <p className="text-[10px] font-black text-white/30 uppercase tracking-widest leading-relaxed mt-2">เปอร์เซ็นต์คำนวณจากคลังสลากที่ถูกจองแล้วเทียบกับสถิติงวดก่อน</p>
               </div>
               
               <div className="space-y-4">
                  <div className="flex justify-between items-baseline">
                     <span className="text-xs font-black text-white uppercase ">อัตรากำไรเฉลี่ย</span>
                     <span className="text-2xl font-sans font-black text-amber-400 ">+{stats?.margin.toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                     <div className="h-full bg-primary" style={{ width: `${stats?.margin}%` }}></div>
                  </div>
               </div>
            </div>

            <button className="w-full h-14 bg-white text-slate-900 rounded-2xl font-black text-[9px] uppercase tracking-widest shadow-2xl relative z-10 hover:scale-105 active:scale-95 transition-all">
               ส่งออกรายงาน (CSV)
            </button>
         </div>
      </div>
    </div>
  );
};

export default AdminReports;

