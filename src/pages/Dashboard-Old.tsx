import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboard } from '../hooks/useDashboard';
import { Loader2 } from 'lucide-react';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { stats, loading } = useDashboard();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#1a1a1a]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const totalWon = stats?.total_wins || 0;
  const activeTickets = stats?.active_tickets || 0;

  return (
    <div className="bg-[#f8f6f6] dark:bg-[#221011] font-sans text-slate-900 dark:text-slate-100 antialiased min-h-screen">
      <div className="relative flex min-h-screen w-full max-w-[430px] mx-auto flex-col overflow-x-hidden pb-24 bg-white dark:bg-[#1a1a1a]">
        {/* Header */}
        <div className="flex items-center bg-white dark:bg-[#1a1a1a] p-4 sticky top-0 z-50 border-b border-slate-100 dark:border-slate-800">
          <button 
            onClick={() => navigate('/profile')}
            className="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
          >
            <span className="material-symbols-outlined text-slate-900 dark:text-white">arrow_back</span>
          </button>
          <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight flex-1 text-center">แดชบอร์ดสรุปยอดรวมโชค</h2>
          <div className="size-10"></div>
        </div>

        {/* Hero Card */}
        <div className="p-4">
          <div className="bg-gradient-to-br from-[#bf953f] via-[#fcf6ba] to-[#aa771c] relative overflow-hidden rounded-xl p-8 shadow-2xl flex flex-col items-center justify-center text-center space-y-2 group">
            <div className="absolute top-4 left-4 opacity-60">
              <span className="material-symbols-outlined text-white text-xl">auto_awesome</span>
            </div>
            <div className="absolute bottom-6 right-8 opacity-60">
              <span className="material-symbols-outlined text-white text-2xl">auto_awesome</span>
            </div>
            <p className="text-black/70 text-sm font-bold uppercase tracking-widest">ยอดรวมเงินรางวัลสะสม</p>
            <h1 className="text-black text-5xl font-black tracking-tighter drop-shadow-sm">฿{totalWon.toLocaleString()}</h1>
            <div className="flex items-center gap-1 bg-white/30 backdrop-blur-md px-3 py-1 rounded-full border border-white/40">
              <span className="material-symbols-outlined text-black text-sm leading-none">military_tech</span>
              <p className="text-black text-xs font-bold leading-none">Lifetime Wins</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 px-4">
          <div className="flex flex-col gap-2 rounded-xl p-5 bg-white dark:bg-[#ec131e]/10 border border-[#ec131e]/10 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <span className="material-symbols-outlined text-[#ec131e]">calendar_month</span>
              <span className="text-[10px] font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full">+20%</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">รายการสลากที่กำลังรอผล</p>
            <p className="text-slate-900 dark:text-white text-2xl font-bold">{activeTickets} <span className="text-sm font-normal text-slate-500">ใบ</span></p>
          </div>
          <div className="flex flex-col gap-2 rounded-xl p-5 bg-white dark:bg-[#ec131e]/10 border border-[#ec131e]/10 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <span className="material-symbols-outlined text-[#D4AF37]">workspace_premium</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">รางวัลใหญ่ที่สุดที่เคยได้</p>
            <p className="text-slate-900 dark:text-white text-2xl font-bold">฿1.0M</p>
          </div>
        </div>

        {/* Chart Section */}
        <div className="mt-8 px-4">
          <div className="bg-white dark:bg-[#ec131e]/5 rounded-xl p-6 border border-[#ec131e]/10">
            <h3 className="text-slate-900 dark:text-white text-lg font-bold mb-6">สัดส่วนประเภทรางวัลที่ถูก</h3>
            <div className="flex flex-col items-center gap-8">
              <div className="relative flex items-center justify-center">
                <div className="size-48 rounded-full shadow-lg flex items-center justify-center bg-gradient-to-br from-[#ffd700] via-[#ec131e] to-[#b8860b]">
                   <div className="bg-white dark:bg-[#1a1a1a] size-32 rounded-full flex flex-col items-center justify-center">
                      <span className="text-slate-400 text-[10px] font-bold uppercase">ทั้งหมด</span>
                      <span className="text-slate-900 dark:text-white text-xl font-black">24 ครั้ง</span>
                   </div>
                </div>
              </div>
              <div className="w-full space-y-4">
                 {[
                   { label: 'รางวัลที่ 1', color: '#ffd700', percent: '15%' },
                   { label: 'รางวัลเลขท้าย 2 ตัว', color: '#ec131e', percent: '30%' },
                   { label: 'รางวัลเลขท้าย 3 ตัว', color: '#b8860b', percent: '25%' },
                   { label: 'อื่นๆ', color: '#e2e8f0', percent: '30%' }
                 ].map((leg) => (
                   <div key={leg.label} className="flex items-center justify-between">
                     <div className="flex items-center gap-2">
                       <div className="size-3 rounded-full" style={{ backgroundColor: leg.color }}></div>
                       <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{leg.label}</span>
                     </div>
                     <span className="text-sm font-bold text-slate-900 dark:text-white">{leg.percent}</span>
                   </div>
                 ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

