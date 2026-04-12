import React from 'react';
import { BarChart3, Users, Ticket, Wallet, ArrowUpRight, TrendingUp } from 'lucide-react';

export const AdminOverview: React.FC<{ dbStats: any, recentTransactions: any[], loading: boolean }> = ({ dbStats, recentTransactions, loading }) => {
  const stats = [
    { label: 'ยอดขายรวม', value: `฿${dbStats?.total_sales?.toLocaleString() || '0'}`, icon: Ticket, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'สมาชิกทั้งหมด', value: dbStats?.total_users?.toLocaleString() || '0', icon: Users, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { label: 'เงินในระบบรวม', value: `฿${dbStats?.total_deposit?.toLocaleString() || '0'}`, icon: Wallet, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'รอถอน', value: dbStats?.pending_withdrawals?.toString() || '0', icon: TrendingUp, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] relative overflow-hidden group">
            <div className={`absolute -right-4 -bottom-4 size-24 ${s.bg} rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700`}></div>
            <div className="relative z-10 space-y-3">
              <div className={`size-12 rounded-2xl ${s.bg} ${s.color} flex items-center justify-center`}>
                <s.icon size={24} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{s.label}</p>
                <p className="text-2xl font-black text-white  tracking-tighter mt-1">{loading ? '...' : s.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modern Chart Placeholder / Real-time Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-black text-white uppercase  tracking-tighter">วิเคราะห์ยอดการจอง</h3>
            <button className="text-[10px] font-black text-primary uppercase border border-primary/30 px-4 py-2 rounded-xl">View Report</button>
          </div>
          <div className="h-64 flex items-end gap-2">
            {[40, 70, 45, 90, 65, 80, 50, 95, 60, 85].map((h, i) => (
              <div key={i} className="flex-1 bg-gradient-to-t from-red-600 to-red-400 rounded-t-lg transition-all hover:opacity-80 cursor-pointer" style={{ height: `${h}%` }}></div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 flex flex-col justify-between">
          <div className="space-y-2">
            <h3 className="text-lg font-black text-white uppercase  tracking-tighter">Server Health</h3>
            <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest leading-relaxed">ระบบประมวลผลอัตโนมัติทำงานปกติ 100%</p>
          </div>
          <div className="py-8">
            <div className="size-32 bg-emerald-500/10 rounded-full border-4 border-emerald-500/20 mx-auto flex items-center justify-center relative">
              <div className="size-24 bg-emerald-500/20 rounded-full animate-ping absolute"></div>
              <BarChart3 size={40} className="text-emerald-500" />
            </div>
          </div>
          <button className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest hover:bg-white/10 transition-all">
            Maintenance Mode
          </button>
        </div>
      </div>
    </div>
  );
};
