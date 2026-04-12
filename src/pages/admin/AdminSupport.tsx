import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { 
  Headphones, 
  Search, 
  MessageSquare, 
  User, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  MoreVertical,
  Reply,
  ShieldAlert
} from 'lucide-react';

interface SupportTicket {
  id: string;
  user_id: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
  profiles: {
    full_name: string;
    phone: string;
  };
}

const AdminSupport: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchTickets = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('support_tickets')
        .select(`
          *,
          profiles:user_id (full_name, phone)
        `)
        .order('created_at', { ascending: false });

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }

      const { data, error } = await query;
      if (error) throw error;
      setTickets(data || []);
    } catch (error: any) {
      toast.error('โหลดข้อมูลตั๋วสนับสนุนล้มเหลว: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [filterStatus]);

  const updateTicketStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      toast.success('อัปเดตสถานะตั๋วเรียบร้อย');
      fetchTickets();
    } catch (error: any) {
      toast.error('อัปเดตสถานะล้มเหลว: ' + error.message);
    }
  };

  const filteredTickets = tickets.filter(t => 
    t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.profiles?.phone?.includes(searchTerm)
  );

  return (
    <div className="space-y-6 font-prompt text-white">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h2 className="text-2xl font-black text-white tracking-tight uppercase  flex items-center gap-3">
            <Headphones size={24} className="text-primary" />
            ระบบช่วยเหลือและร้องเรียน
          </h2>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">จัดการคำร้องขอและความช่วยเหลือจากผู้ใช้งาน</p>
        </div>
        
        <div className="flex bg-slate-900 p-1 rounded-2xl border border-slate-800 shadow-sm">
           <button onClick={() => setFilterStatus('all')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${filterStatus === 'all' ? 'bg-primary text-white' : 'text-slate-500 hover:text-slate-300'}`}>ทั้งหมด</button>
           <button onClick={() => setFilterStatus('open')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${filterStatus === 'open' ? 'bg-primary text-white' : 'text-slate-500 hover:text-slate-300'}`}>รอดำเนินการ</button>
           <button onClick={() => setFilterStatus('in_progress')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${filterStatus === 'in_progress' ? 'bg-primary text-white' : 'text-slate-500 hover:text-slate-300'}`}>กำลังแก้</button>
           <button onClick={() => setFilterStatus('closed')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${filterStatus === 'closed' ? 'bg-primary text-white' : 'text-slate-500 hover:text-slate-300'}`}>เสร็จสิ้น</button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
        <input 
          type="text" 
          placeholder="ค้นหาตามชื่อ, เบอร์โทร หรือหัวข้อ..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-4 pl-12 pr-6 text-sm font-medium focus:ring-4 focus:ring-primary/10 transition-all outline-none text-white placeholder:text-slate-600"
        />
      </div>

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="h-44 bg-slate-900 rounded-[2rem] border border-slate-800 animate-pulse" />
          ))
        ) : filteredTickets.length > 0 ? (
          filteredTickets.map((ticket) => (
            <div key={ticket.id} className="bg-slate-900 rounded-[2rem] border border-slate-800 p-8 shadow-2xl hover:border-slate-700 transition-all group">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
                <div className="flex items-center gap-6">
                  <div className={`size-14 rounded-2xl flex items-center justify-center transition-all ${
                    ticket.status === 'open' ? 'bg-rose-500/10 text-rose-500' : 
                    ticket.status === 'in_progress' ? 'bg-amber-500/10 text-amber-500' : 
                    'bg-emerald-500/10 text-emerald-500'
                  }`}>
                    <MessageSquare size={24} />
                  </div>
                  <div className="flex flex-col">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1.5">หัวข้อคำร้อง</p>
                    <h4 className="text-lg font-black text-white tracking-tight  uppercase">{ticket.subject}</h4>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className={`px-4 py-1.5 rounded-xl border flex items-center gap-2 ${
                    ticket.priority === 'urgent' ? 'bg-red-50 text-red-600 border-red-100' :
                    ticket.priority === 'high' ? 'bg-orange-50 text-orange-500 border-orange-100' :
                    'bg-slate-50 text-slate-400 border-slate-100'
                  }`}>
                    <ShieldAlert size={12} />
                    <span className="text-[9px] font-black uppercase tracking-widest leading-none">{ticket.priority}</span>
                  </div>
                  
                  <div className={`px-4 py-1.5 rounded-xl border flex items-center gap-2 ${
                    ticket.status === 'open' ? 'bg-rose-50 text-rose-500 border-rose-100' : 
                    ticket.status === 'in_progress' ? 'bg-amber-50 text-amber-500 border-amber-100' : 
                    'bg-emerald-50 text-emerald-500 border-emerald-100'
                  }`}>
                    {ticket.status === 'open' ? <Clock size={12} className="animate-pulse" /> : 
                     ticket.status === 'in_progress' ? <AlertCircle size={12} /> : 
                     <CheckCircle2 size={12} />}
                    <span className="text-[9px] font-black uppercase tracking-widest leading-none">
                      {ticket.status === 'open' ? 'รอดำเนินการ' : ticket.status === 'in_progress' ? 'กำลังดำเนินการ' : 'เสร็จสิ้น'}
                    </span>
                  </div>

                  <button className="size-10 bg-slate-50 text-slate-300 hover:text-slate-600 rounded-xl flex items-center justify-center transition-all active:scale-95">
                    <MoreVertical size={18} />
                  </button>
                </div>
              </div>

              <div className="py-6 flex flex-col md:flex-row gap-8">
                <div className="flex-1 space-y-4">
                  <p className="text-slate-300 text-sm font-medium leading-relaxed bg-slate-950/50 p-6 rounded-2xl border border-slate-800 ">"{ticket.message}"</p>
                  <div className="flex items-center gap-4 text-slate-500">
                    <Reply size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">ตอบกลับเบื้องต้นผ่าน SMS หรือแชทไลน์</span>
                  </div>
                </div>
                
                <div className="w-full md:w-64 space-y-6">
                  <div className="flex items-center gap-4 group/user p-4 rounded-2xl hover:bg-slate-800 transition-all border border-transparent hover:border-slate-800">
                    <div className="size-12 rounded-xl bg-slate-800 flex items-center justify-center text-slate-500 group-hover/user:text-primary transition-all">
                      <User size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-black text-white uppercase tracking-tight">{ticket.profiles?.full_name}</p>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">{ticket.profiles?.phone}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {ticket.status !== 'closed' && (
                      <button 
                        onClick={() => updateTicketStatus(ticket.id, ticket.status === 'open' ? 'in_progress' : 'closed')}
                        className="col-span-2 h-12 bg-primary text-white rounded-xl font-black text-[9px] uppercase tracking-widest  shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                      >
                        {ticket.status === 'open' ? 'เริ่มดำเนินการ' : 'ปิดตั๋วคำร้อง'}
                      </button>
                    )}
                    {ticket.status === 'closed' && (
                       <button 
                       onClick={() => updateTicketStatus(ticket.id, 'open')}
                       className="col-span-2 h-12 bg-slate-900 text-white rounded-xl font-black text-[9px] uppercase tracking-widest shadow-lg active:scale-95 transition-all"
                     >
                       เปิดหัวข้อใหม่
                     </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-24 text-center bg-white rounded-[3rem] border border-slate-100 border-dashed space-y-4">
            <Headphones size={48} className="text-slate-100 mx-auto" />
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">ไม่พบรายการช่วยเหลือในขณะนี้</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSupport;

