import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, ChevronLeft, Ticket as TicketIcon, CheckCircle2, Clock, XCircle, ArrowUpRight, BarChart3, Filter } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { getMyTickets, type Ticket } from '../services/lottery';

const History: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await getMyTickets(user!.id);
      setTickets(data);
    } catch (err) {
      console.error('Error fetching history:', err);
    } finally {
      setLoading(false);
    }
  };

  const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
      case 'win':
      case 'paid':
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100">
            <CheckCircle2 className="size-3" />
            <span className="text-[8px] font-black uppercase tracking-widest leading-none">ถูกรางวัล! (ชนะ)</span>
          </div>
        );
      case 'pending':
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 rounded-lg border border-amber-100">
            <Clock className="size-3" />
            <span className="text-[8px] font-black uppercase tracking-widest leading-none">รอตรวจสอบ</span>
          </div>
        );
      case 'lose':
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 text-slate-400 rounded-lg border border-white/10">
            <XCircle className="size-3" />
            <span className="text-[8px] font-black uppercase tracking-widest leading-none">ไม่ถูกรางวัล</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-500 rounded-lg border border-rose-100">
            <XCircle className="size-3" />
            <span className="text-[8px] font-black uppercase tracking-widest leading-none">ถูกปฏิเสธ</span>
          </div>
        );
    }
  };

  const totalInvestment = tickets.reduce((sum, t) => sum + t.price, 0);
  const activeTickets = tickets.filter(t => t.status === 'pending').length;

  return (
    <div className="bg-white min-h-screen text-slate-900 font-prompt animate-in fade-in duration-500 w-full overflow-x-hidden">
      <div className="relative w-full flex flex-col min-h-screen">
        
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-[60] bg-white/90 backdrop-blur-2xl border-b border-slate-50 py-6 px-8 shadow-sm">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <button onClick={() => navigate(-1)} className="size-12 flex items-center justify-center bg-slate-50 text-slate-400 hover:text-primary rounded-2xl transition-all active:scale-90 shadow-sm border border-slate-100">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-base font-sans font-black tracking-[0.2em] uppercase  text-slate-900 leading-none">ประวัติสลากของฉัน</h1>
            <button className="size-12 flex items-center justify-center bg-slate-50 text-slate-400 hover:text-primary rounded-2xl transition-all active:scale-90 shadow-sm border border-slate-100">
              <Filter size={20} />
            </button>
          </div>
        </header>

        <main className="flex-1 pt-32 pb-40">
          <div className="max-w-5xl mx-auto space-y-12">
          
           {/* Quick Metrics Bento */}
           <section className="px-8 grid grid-cols-2 gap-4">
                <div className="p-6 rounded-[2.5rem] bg-primary text-white space-y-4 shadow-2xl shadow-primary/20 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="size-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/10">
                     <TicketIcon className="size-5 text-white" />
                  </div>
                  <div>
                     <p className="text-[8px] font-black uppercase tracking-widest text-white/40 mb-1 leading-none">สลากที่กำลังลุ้น</p>
                     <p className="text-2xl font-sans font-black  tracking-tighter leading-none">{activeTickets} <span className="text-[10px] uppercase font-prompt">ใบ</span></p>
                  </div>
               </div>
               <div className="p-6 rounded-[2.5rem] bg-slate-50 border border-slate-100 space-y-4 shadow-inner flex flex-col justify-between">
                  <div className="size-10 rounded-xl bg-white shadow-xl flex items-center justify-center group-hover:scale-110 transition-transform cursor-pointer border border-slate-50">
                     <BarChart3 className="size-5 text-slate-300" />
                  </div>
                  <div>
                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-300 mb-1 leading-none">ยอดรวมการซื้อสลาก</p>
                    <p className="text-2xl font-sans font-black  tracking-tighter text-slate-900 leading-none">{totalInvestment.toLocaleString()} <span className="text-[10px] uppercase font-prompt text-primary">฿</span></p>
                  </div>
               </div>
           </section>

           {/* Luxury Ticket Log */}
           <section className="px-8 space-y-8 pb-10">
               <div className="flex items-center justify-between px-2">
                  <h3 className="text-xl font-sans font-black text-slate-900 uppercase  tracking-tighter leading-none">ประวัติการทำรายการ</h3>
                  <div className="flex items-center gap-2.5 text-primary bg-red-50 px-3 py-1.5 rounded-xl border border-red-100">
                     <Calendar size={14} />
                     <span className="text-[9px] font-black uppercase tracking-widest ">ข้อมูลล่าสุด</span>
                  </div>
               </div>

              <div className="space-y-6 animate-in fade-in slide-in-from-bottom duration-700">
                 {loading ? (
                    Array(3).fill(0).map((_, i) => (
                      <div key={i} className="h-32 rounded-[3rem] bg-slate-50 animate-pulse" />
                    ))
                 ) : tickets.length > 0 ? tickets.map((log) => (
                    <div key={log.id} className="p-8 rounded-[3rem] bg-white border border-slate-50 shadow-2xl shadow-black/5 space-y-6 relative overflow-hidden group hover:border-primary/20 transition-all">
                       <div className="flex justify-between items-start">
                           <div className="space-y-4">
                              <div className="flex flex-col gap-1">
                                 <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] leading-none mb-1">หมายเลขสลาก</p>
                                 <h4 className="text-3xl font-sans font-black text-slate-900 tracking-[0.1em]  leading-none">{log.ticket_number}</h4>
                              </div>
                              <div className="flex items-center gap-2">
                                 <span className="text-[8px] font-black uppercase tracking-widest p-1.5 bg-slate-50 text-slate-400 rounded-lg border border-slate-100 leading-none">
                                    {(log as any).lottery_rounds?.name || 'รายการสลาก'}
                                 </span>
                                 <StatusBadge status={log.status} />
                              </div>
                           </div>
                           <div className="text-right">
                              <p className="text-lg font-sans font-black text-slate-900  tracking-tighter leading-none">{log.price.toLocaleString()} <span className="text-[10px] text-primary">฿</span></p>
                              <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mt-2 leading-none ">ราคาซื้อสลาก</p>
                           </div>
                       </div>
                       
                       <div className="pt-6 border-t border-slate-50 flex justify-between items-center">
                          <div className="flex items-center gap-2 px-1">
                             <Clock className="size-3 text-slate-200" />
                             <span className="text-[9px] font-black uppercase text-slate-300 tracking-widest">
                                {new Date(log.created_at).toLocaleString('th-TH', { 
                                  day: 'numeric', 
                                  month: 'short', 
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                             </span>
                          </div>
                          <button className="size-10 rounded-xl bg-slate-50 text-slate-200 hover:text-slate-900 transition-colors flex items-center justify-center shadow-inner">
                             <ArrowUpRight className="size-5" />
                          </button>
                       </div>
                    </div>
                 )) : (
                   <div className="py-20 text-center border-2 border-dashed border-slate-50 rounded-[3rem]">
                      <TicketIcon className="size-16 text-slate-100 mx-auto mb-4" />
                      <p className="text-slate-600 font-black uppercase text-[10px] tracking-widest mt-4">คุณยังไม่มีรายการซื้อสลาก</p>
                   </div>
                 )}
              </div>
           </section>
          </div>
        </main>

        <footer className="fixed bottom-20 left-0 right-0 p-8 bg-white/95 backdrop-blur-2xl border-t border-slate-50 z-50">
           <div className="max-w-5xl mx-auto px-4">
              <button onClick={() => navigate('/')} className="w-full h-18 bg-primary text-white rounded-[2rem] font-sans font-black text-sm uppercase  tracking-widest shadow-2xl shadow-primary/30 flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-95 transition-all">
                 เลือกเลขใหม่เพิ่ม
                 <TicketIcon className="w-6 h-6 text-white/50" />
              </button>
           </div>
        </footer>

      </div>
    </div>
  );
};

export default History;

