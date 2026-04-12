import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { syncAndSettleRound } from '../../services/lottoSync';
import toast from 'react-hot-toast';
import { Ticket, Plus, Calendar, Zap, ShieldCheck, Info, CheckCircle } from 'lucide-react';

export const AdminLottery = () => {
  const [rounds, setRounds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // New round state
  const [isCreating, setIsCreating] = useState(false);
  const [newDrawDate, setNewDrawDate] = useState('');
  const [newName, setNewName] = useState('');

  useEffect(() => {
    fetchRounds();
  }, []);

  const fetchRounds = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('lottery_rounds')
      .select('*, lottery_results(id, result_6digit)')
      .order('draw_date', { ascending: false })
      .limit(10);
    if (data) setRounds(data);
    setLoading(false);
  };

  const handleCreateRound = async (e: React.FormEvent) => {
    e.preventDefault();
    const t = toast.loading('กำลังสร้างงวดใหม่...');
    try {
      const { error } = await supabase.from('lottery_rounds').insert({
        draw_date: newDrawDate,
        name: newName,
        status: 'open',
        price_per_ticket: 80
      });
      if (error) throw error;
      toast.success('สำเร็จ!', { id: t });
      setIsCreating(false);
      setNewDrawDate('');
      setNewName('');
      fetchRounds();
    } catch (e: any) {
      toast.error(e.message, { id: t });
    }
  };

  const handleFetchAndSettle = async (round: any) => {
    const confirm = window.confirm(`คุณแน่ใจหรือไม่ที่จะเริ่มระบบ "ดึงผลรางวัล & คำนวณเงินรางวัล" อัตโนมัติสำหรับงวดวันที่ ${new Date(round.draw_date).toLocaleDateString('th-TH')}?\n\n* ระบบจะดึง API รัฐบาลและสั่งจ่ายเงินรางวัลให้ลูกค้าที่ถูกรางวัลทันที!`);
    if (!confirm) return;

    const t = toast.loading('ระบบกำลังดึง API และสั่งจ่ายเงินรางวัล...');
    try {
      // เรียกใช้ระบบ Sync & Settle อัตโนมัติ
      const response = await syncAndSettleRound(round.id, round.draw_date);
      
      console.log('Settlement Response:', response);
      toast.success('สำเร็จ! ดึงผลรางวัลและสั่งจ่ายเงินเรียบร้อยแล้ว', { id: t, duration: 5000 });
      fetchRounds();
    } catch (e: any) {
      console.error(e);
      toast.error('เกิดข้อผิดพลาด: ระบบอาจยังไม่มีผลรางวัลรัฐบาลออกในวันนี้ หรือปัญหาการเชื่อมต่อ', { id: t });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-sans font-black text-white  tracking-tighter uppercase">จัดการงวดสลาก (อัตโนมัติ)</h2>
        <button 
          onClick={() => setIsCreating(!isCreating)}
          className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-red-900/20"
        >
          <Plus size={14} /> เปิดงวดใหม่
        </button>
      </div>

      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex gap-3">
         <ShieldCheck className="text-emerald-500 shrink-0" size={20} />
         <div className="space-y-1">
            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">ระบบป้องกันการแก้ไขผล (Audit Security)</p>
            <p className="text-[9px] text-slate-400 font-bold leading-relaxed">
               แอดมินไม่มีสิทธิ์แก้ไขผลรางวัลด้วยมือ ระบบเชื่อมต่อตรงกับ API รัฐบาล (GLO) เพื่อความเป็นกลางและถูกต้อง 100% 
               เมื่อครบกำหนดออกรางวัล กรุณากดปุ่ม Sync เพื่อระเบิดรางวัลให้ลูกค้า
            </p>
         </div>
      </div>

      {isCreating && (
        <form onSubmit={handleCreateRound} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2 mb-4">
             <Calendar size={16} className="text-red-500" /> สร้างงวดใหม่
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="space-y-1">
                <label className="text-[9px] text-slate-500 font-black uppercase ml-1">วันที่ออกรางวัล</label>
                <input type="date" value={newDrawDate} onChange={e => setNewDrawDate(e.target.value)} required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-red-500 outline-none transition-all" />
             </div>
             <div className="space-y-1">
                <label className="text-[9px] text-slate-500 font-black uppercase ml-1">ชื่องวด (Title)</label>
                <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="งวดประจำวันที่ 1 พฤศจิกายน 2568" required className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-red-500 outline-none transition-all" />
             </div>
          </div>
          <button type="submit" className="bg-white text-slate-900 font-black text-[10px] uppercase tracking-widest px-6 py-3 rounded-xl hover:bg-slate-200 transition-all flex items-center gap-2">
             <Zap size={14} className="fill-slate-900" /> เริ่มเปิดขายสลากงวดนี้
          </button>
        </form>
      )}

      {/* Lists */}
      <div className="space-y-4">
         {loading ? (
            <div className="text-slate-500 p-20 text-center font-black animate-pulse uppercase tracking-[0.3em] text-xs">กำลังประสานข้อมูล...</div>
         ) : rounds.map(r => (
            <div key={r.id} className="group bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl p-6 flex items-center justify-between transition-all hover:scale-[1.01] shadow-lg">
               <div className="flex items-center gap-6">
                  <div className="size-14 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-center text-slate-500 group-hover:text-red-500 transition-colors">
                     <Ticket size={24} />
                  </div>
                  <div>
                     <h4 className="font-black text-lg text-white uppercase  tracking-tighter">{r.name}</h4>
                     <div className="flex items-center gap-3 mt-1">
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest leading-none">วันที่ออกรางวัล: {new Date(r.draw_date).toLocaleDateString('th-TH')}</p>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase  ${r.status === 'open' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-800 text-slate-500'}`}>
                           {r.status === 'open' ? 'เปิดขาย' : 'ออกรางวัลแล้ว'}
                        </span>
                     </div>
                  </div>
               </div>

               <div className="flex items-center gap-4">
                  {r.lottery_results?.length > 0 ? (
                     <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-2 bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20">
                           <CheckCircle size={14} className="text-emerald-500" />
                           <span className="text-[10px] font-black text-emerald-500 uppercase  tracking-widest leading-none">รางวัลออกแล้ว: {r.lottery_results[0].result_6digit}</span>
                        </div>
                        <p className="text-[8px] text-slate-600 font-extrabold uppercase mr-1">ระบบทำการจ่ายรางวัลเข้า Wallet อัตโนมัติแล้ว</p>
                     </div>
                  ) : (
                    <button 
                      onClick={() => handleFetchAndSettle(r)}
                      disabled={new Date(r.draw_date) > new Date()}
                      className={`px-5 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 group/btn ${
                         new Date(r.draw_date) > new Date() 
                         ? 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700' 
                         : 'bg-white text-slate-950 hover:bg-red-600 hover:text-white shadow-xl shadow-white/5'
                      }`}
                    >
                      <Zap size={14} className={new Date(r.draw_date) > new Date() ? "" : "fill-slate-950 group-hover/btn:fill-white"} />
                      {new Date(r.draw_date) > new Date() ? 'ยังไม่ถึงกำหนดออกรางวัล' : 'ดึงผลรางวัล & จ่ายเงินออโต้'}
                    </button>
                  )}
               </div>
            </div>
         ))}
         {!loading && rounds.length === 0 && (
            <div className="text-center p-20 border border-dashed border-slate-800 rounded-[3rem] text-slate-600 font-black uppercase text-xs tracking-widest">
               ไม่พบข้อมูลประวัติงวดสลาก
            </div>
         )}
      </div>
    </div>
  );
};

