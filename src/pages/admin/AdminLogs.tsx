import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { 
  Activity, 
  Search, 
  Calendar, 
  User, 
  Terminal, 
  ShieldCheck, 
  Database,
  History,
  ArrowRight,
  Filter
} from 'lucide-react';

interface ActivityLog {
  id: string;
  admin_id: string;
  action_type: string;
  resource_type: string;
  resource_id: string;
  details: any;
  ip_address: string;
  created_at: string;
  profiles: {
    full_name: string;
    email: string;
  };
}

const AdminLogs: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('admin_activity_logs')
        .select(`
          *,
          profiles:admin_id (full_name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setLogs(data || []);
    } catch (error: any) {
      toast.error('โหลดประวัติการทำงานล้มเหลว: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => 
    log.action_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.resource_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 font-prompt text-white">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h2 className="text-2xl font-black text-white tracking-tight uppercase italic flex items-center gap-3">
            <Activity size={24} className="text-primary" />
            Audit Trail ระบบ
          </h2>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">ตรวจสอบประวัติการทำงานของเจ้าหน้าที่และระบบทั้งหมด</p>
        </div>
        
        <button onClick={fetchLogs} className="h-12 px-6 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-all active:scale-95 shadow-sm">
           <History size={16} />
           รีเฟรชข้อมูล
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 rounded-[2rem] border border-slate-800 p-8 shadow-2xl flex items-center gap-6">
          <div className="size-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
             <ShieldCheck size={28} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">ความปลอดภัย</p>
            <h4 className="text-lg font-black text-white tracking-tight uppercase italic">เปิดใช้งาน</h4>
          </div>
        </div>
        <div className="bg-slate-900 rounded-[2rem] border border-slate-800 p-8 shadow-2xl flex items-center gap-6">
          <div className="size-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
             <Terminal size={28} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">บันทึกวันนี้</p>
            <h4 className="text-lg font-black text-white tracking-tight uppercase italic">{logs.length} รายการ</h4>
          </div>
        </div>
        <div className="bg-slate-900 rounded-[2rem] border border-slate-800 p-8 shadow-2xl flex items-center gap-6">
          <div className="size-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
             <Database size={28} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">สถานะ DB</p>
            <h4 className="text-lg font-black text-white tracking-tight uppercase italic">เชื่อมต่อปกติ</h4>
          </div>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
        <input 
          type="text" 
          placeholder="ค้นหาตามประเภทการกระทำ หรือเจ้าหน้าที่..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 pl-12 pr-6 text-sm font-medium focus:ring-4 focus:ring-primary/10 transition-all outline-none text-white placeholder:text-slate-600"
        />
      </div>

      <div className="bg-slate-900 rounded-[2rem] border border-slate-800 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800">
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">วัน-เวลา</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">เจ้าหน้าที่</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">การกระทำ</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest">ทรัพยากร</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">รายละเอียด</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-8 py-6 h-16 bg-slate-900/50" />
                  </tr>
                ))
              ) : filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-white/5 transition-all group">
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                       <p className="text-xs font-black text-slate-300 italic tracking-tight uppercase group-hover:text-primary transition-colors">{new Date(log.created_at).toLocaleString('th-TH', { day: '2-digit', month: 'short' })}</p>
                       <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">{new Date(log.created_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                       <div className="size-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-500 group-hover:text-primary transition-colors">
                          <User size={14} />
                       </div>
                       <div className="flex flex-col">
                          <p className="text-xs font-black text-white uppercase tracking-tight">{log.profiles?.full_name}</p>
                          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{log.profiles?.email}</p>
                       </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest ${
                      log.action_type === 'CREATE' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                      log.action_type === 'UPDATE' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                      'bg-rose-500/10 text-rose-500 border-rose-500/20'
                    }`}>
                       <ArrowRight size={10} />
                       {log.action_type}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">{log.resource_type}</p>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] hover:text-primary transition-all">
                       ตรวจสอบ JSON
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {!loading && filteredLogs.length === 0 && (
            <div className="py-24 text-center space-y-4">
               <History size={48} className="text-slate-800 mx-auto" />
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">ไม่พบประวัติการทำรายการที่ค้นหา</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminLogs;
