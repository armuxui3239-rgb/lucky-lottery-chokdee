import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { toast } from 'react-hot-toast';
import { Users, DollarSign, Share2, Copy, ChevronLeft, TrendingUp, Wallet, Gift, ArrowUpRight, QrCode, ShieldCheck, Zap } from 'lucide-react';
import { getAffiliateStats, getCommissionLogs } from '../services/profile';

const Affiliate: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [stats, setStats] = useState({
    total_referrals: 0,
    total_commission: 0,
    active_referrals: 0,
  });
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadAffiliateData();
    }
  }, [user]);

  const loadAffiliateData = async () => {
    setLoading(true);
    try {
      const [statsData, logsData] = await Promise.all([
        getAffiliateStats(user!.id),
        getCommissionLogs(user!.id)
      ]);
      setStats(statsData);
      setLogs(logsData);
    } catch (err) {
      console.error('Error loading affiliate data:', err);
    } finally {
      setLoading(false);
    }
  };

  const referralLink = `${window.location.origin}/register?ref=${profile?.referral_code || user?.id}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success('คัดลอกลิงก์แนะนำสำเร็จ!', {
      icon: '🔗',
      style: {
        borderRadius: '1.5rem',
        background: '#ec131e',
        color: '#fff',
        fontFamily: 'Prompt',
        fontSize: '14px',
        fontWeight: 'bold'
      }
    });
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
            <h1 className="text-base font-sans font-black tracking-[0.2em] uppercase  text-slate-900 leading-none">ระบบแนะนำเพื่อน</h1>
            <div className="size-12"></div>
          </div>
        </header>


        <main className="flex-1 pt-32 pb-40">
          <div className="max-w-5xl mx-auto space-y-16">

          {/* High-Performance Earnings Card */}
          <section className="px-8">
            <div className="relative p-10 rounded-[3rem] bg-gradient-to-br from-slate-900 via-slate-800 to-black overflow-hidden shadow-2xl shadow-black/20 border border-white/5 group">
              <div className="absolute -top-12 -right-12 p-12 opacity-5 blur-2xl group-hover:scale-110 transition-transform duration-700">
                 <DollarSign className="w-64 h-64 rotate-12 text-white" />
              </div>

              <div className="relative z-10 space-y-10">
                <div className="space-y-4">
                  <p className="text-white/40 text-[9px] font-black uppercase tracking-[0.4em] mb-2 leading-none ">ค่าคอมมิชชั่นสะสม</p>
                  <div className="flex items-baseline gap-3">
                    <h2 className="text-5xl font-sans font-black text-white  tracking-tighter leading-none">
                      {stats.total_commission.toLocaleString()}
                    </h2>
                    <span className="text-xl font-sans font-black text-primary ">฿</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 py-2">
                  <div className="flex flex-col gap-2">
                     <span className="text-white/40 text-[9px] font-black uppercase tracking-widest leading-none">เพื่อนที่แนะนำสำเร็จ</span>
                     <span className="text-2xl font-sans font-black text-white tracking-tighter ">{stats.total_referrals} <span className="text-[10px] uppercase opacity-40">คน</span></span>
                  </div>
                  <div className="flex flex-col gap-2">
                     <span className="text-white/40 text-[9px] font-black uppercase tracking-widest leading-none">เพื่อนที่กำลังใช้งาน</span>
                     <span className="text-2xl font-sans font-black text-emerald-400 tracking-tighter ">{stats.active_referrals} <span className="text-[10px] uppercase opacity-40 text-white">คน</span></span>
                  </div>
                </div>

                <button className="w-full h-14 bg-white/5 hover:bg-white/10 backdrop-blur-xl rounded-2xl border border-white/5 text-white font-sans font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all active:scale-95">
                   แจ้งถอนรายได้คอมมิชชั่น
                   <ArrowUpRight className="w-4 h-4 text-primary" />
                </button>
              </div>
            </div>
          </section>

          {/* Precision Referral Protocol */}
          <section className="px-8 space-y-6">
            <div className="flex items-center gap-4 px-1">
               <div className="w-2 h-8 bg-primary rounded-full shadow-2xl shadow-primary/40"></div>
               <div className="space-y-1">
                  <h2 className="text-xl font-sans font-black uppercase  tracking-tighter text-slate-900 leading-none">ลิงก์แนะนำเพื่อน</h2>
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none">เส้นทางสร้างรายได้จากโครงการของคุณ</p>
               </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-[3rem] p-8 space-y-6 shadow-inner">
               <div className="bg-white border border-slate-100 rounded-2xl p-5 flex items-center gap-4 group">
                  <div className="size-10 rounded-xl bg-white border border-slate-50 flex items-center justify-center shrink-0">
                    <Share2 className="w-5 h-5 text-slate-300" />
                  </div>
                  <p className="flex-1 text-[10px] font-black text-slate-400 truncate select-all font-mono tracking-tight">{referralLink}</p>
                  <button onClick={copyToClipboard} className="size-11 bg-primary/5 hover:bg-primary text-primary hover:text-white rounded-xl transition-all flex items-center justify-center group-active:scale-90 shadow-sm shadow-primary/5">
                     <Copy className="w-4 h-4" />
                  </button>
               </div>
               
               <div className="flex gap-4">
                  <button className="flex-1 h-14 bg-primary text-white rounded-2xl font-sans font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:bg-rose-700 transition-all active:scale-95 flex items-center justify-center gap-2">
                    <Zap className="size-4 fill-white text-white" />
                    เชิญเพื่อนทันที
                  </button>
                  <button className="size-14 bg-white border border-slate-100 rounded-2xl text-slate-300 hover:text-slate-900 hover:border-slate-300 transition-all flex items-center justify-center shadow-sm">
                    <QrCode className="size-6" />
                  </button>
               </div>
            </div>
          </section>

          {/* Intelligence Bento Grid */}
          <section className="px-8 space-y-8 animate-in fade-in slide-in-from-bottom duration-700">
            <div className="flex items-center justify-between px-2">
               <div className="space-y-1">
                  <h2 className="text-xl font-sans font-black uppercase  tracking-tighter text-slate-900 leading-none">ภาพรวมรายได้</h2>
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none">วิเคราะห์ค่าคอมมิชชั่นสะสม</p>
               </div>
               <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-xl border border-emerald-100">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">เติบโต +12.5%</span>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               <div className="p-8 rounded-[2.5rem] bg-white border border-slate-50 shadow-2xl shadow-black/5 flex flex-col justify-between aspect-square group hover:border-primary/20 transition-all">
                  <div className="size-12 rounded-2xl bg-primary/5 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                     <Wallet className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1 ">ยอดถอนเงิน</h4>
                    <p className="text-2xl font-sans font-black text-slate-900 tracking-tighter  leading-none">0.00 <span className="text-[10px] text-primary ">฿</span></p>
                  </div>
               </div>
               <div className="p-8 rounded-[2.5rem] bg-white border border-slate-50 shadow-2xl shadow-black/5 flex flex-col justify-between aspect-square group hover:border-primary/20 transition-all">
                  <div className="size-12 rounded-2xl bg-amber-500/5 text-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                     <Gift className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1 ">โบนัสพิเศษ</h4>
                    <p className="text-2xl font-sans font-black text-slate-900 tracking-tighter  leading-none">500 <span className="text-[10px] text-amber-500 ">฿</span></p>
                  </div>
               </div>
               <div className="p-8 rounded-[2.5rem] bg-emerald-50 border border-emerald-100 flex flex-col justify-between aspect-square group hover:border-emerald-200 transition-all hidden lg:flex">
                  <div className="size-12 rounded-2xl bg-white shadow-xl text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                     <TrendingUp className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-[9px] font-black text-emerald-300 uppercase tracking-widest mb-1 ">อัตราการเปลี่ยน</h4>
                    <p className="text-2xl font-sans font-black text-emerald-600 tracking-tighter  leading-none">25% <span className="text-[10px] text-emerald-300 ">PRO</span></p>
                  </div>
               </div>
            </div>


            {/* Audit History Log */}
            <div className="p-10 rounded-[3rem] bg-white border border-slate-50 space-y-8 shadow-inner-xl">
               <div className="flex justify-between items-center px-2">
                  <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] ">ตรวจสอบกิจกรรมล่าสุด</h4>
                  <button className="text-[8px] font-black uppercase text-primary border-b border-primary/20 tracking-[0.2em] pb-0.5">ดูทั้งหมด</button>
               </div>
               <div className="space-y-6">
                  {logs.length > 0 ? logs.map((log) => (
                    <div key={log.id} className="flex items-center gap-5 group transition-all">
                       <div className="size-14 rounded-2xl bg-white border border-slate-50 flex items-center justify-center shadow-xl group-hover:border-primary/20 transition-all shrink-0">
                          <Users className="size-6 text-slate-200 group-hover:text-primary transition-colors" />
                       </div>
                       <div className="flex-1 min-w-0">
                          <p className="text-sm font-sans font-black text-slate-900 uppercase  leading-none truncate">
                            {log.profiles?.full_name || `Partner #${log.referee_id.slice(0, 8)}`}
                          </p>
                          <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-2">
                             {new Date(log.created_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })} • สมาชิกชั้นที่ 1
                          </p>
                       </div>
                       <div className="text-right">
                          <p className="text-sm font-sans font-black text-emerald-500  tracking-tighter leading-none">+{log.amount.toLocaleString()} ฿</p>
                          <div className="flex items-center justify-end gap-1.5 mt-2">
                             <div className="size-1.5 bg-emerald-500 rounded-full shadow-[0_0_8px_#10b981]"></div>
                             <span className="text-[8px] font-black text-emerald-600 uppercase tracking-[0.2em]">{log.status === 'success' ? 'สำเร็จ' : 'ดำเนินการ'}</span>
                          </div>
                       </div>
                    </div>
                  )) : (
                    <div className="text-center py-10">
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">ยังไม่มีรายการคอมมิชชั่น</p>
                    </div>
                  )}
               </div>
            </div>
          </section>
          </div>
        </main>

        {/* Primary Call to Action */}
        <footer className="fixed bottom-20 left-0 right-0 p-8 bg-white/95 backdrop-blur-2xl border-t border-slate-50 z-50">
           <div className="max-w-5xl mx-auto px-4">
              <button 
                onClick={copyToClipboard}
                className="w-full h-18 bg-gradient-to-r from-primary via-primary-dark to-rose-950 text-white rounded-[2rem] font-sans font-black text-sm uppercase  tracking-widest shadow-2xl shadow-primary/30 flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-95 transition-all"
              >
                 แชร์ลิงก์ให้เพื่อน
                 <ShieldCheck className="w-6 h-6 text-white/50" />
              </button>
           </div>
        </footer>

      </div>
    </div>
  );
};

export default Affiliate;

