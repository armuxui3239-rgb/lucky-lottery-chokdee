import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  Trophy, Plus, Eye, EyeOff, Trash2, RefreshCw, X, Save,
  Star, Medal, Award, Crown, Download, DatabaseZap
} from 'lucide-react';
import { 
  getAllWinners, addWinner, toggleWinnerVisibility, deleteWinner, 
  getAllLotteryRounds, exportWinnersAsCSV, deleteOldWinners, 
  downloadCSV, type Winner 
} from '../../services/adminApi';

const prizeTypes = [
  { value: 'first', label: 'รางวัลที่ 1 (6,000,000 บาท)', amount: 6000000 },
  { value: 'second', label: 'รางวัลที่ 2 (200,000 บาท)', amount: 200000 },
  { value: 'third', label: 'รางวัลที่ 3 (80,000 บาท)', amount: 80000 },
  { value: 'fourth', label: 'รางวัลที่ 4 (40,000 บาท)', amount: 40000 },
  { value: 'fifth', label: 'รางวัลที่ 5 (20,000 บาท)', amount: 20000 },
  { value: 'near_first', label: 'รางวัลข้างเคียงที่ 1 (100,000 บาท)', amount: 100000 },
  { value: 'front3', label: 'รางวัล 3 ตัวหน้า (4,000 บาท)', amount: 4000 },
  { value: 'back3', label: 'รางวัล 3 ตัวหลัง (4,000 บาท)', amount: 4000 },
  { value: 'last2', label: 'รางวัล 2 ตัวล่าง (2,000 บาท)', amount: 2000 },
];

const prizeIcon = (type: string) => {
  if (type === 'first') return <Crown size={16} className="text-yellow-400" />;
  if (type === 'second') return <Medal size={16} className="text-slate-300" />;
  if (type === 'third') return <Award size={16} className="text-amber-600" />;
  return <Star size={16} className="text-slate-500" />;
};

const prizeColor = (type: string) => {
  if (type === 'first') return 'border-yellow-500/30 bg-yellow-500/5';
  if (type === 'second') return 'border-slate-300/20 bg-slate-300/5';
  if (type === 'third') return 'border-amber-600/20 bg-amber-600/5';
  return 'border-slate-700 bg-slate-900';
};

const emptyWinner = { display_name: '', prize_type: 'first', amount: 6000000, ticket_number: '', is_public: true };

export const AdminWinners = () => {
  const [winners, setWinners] = useState<Winner[]>([]);
  const [rounds, setRounds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRound, setSelectedRound] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<any>(emptyWinner);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [w, r] = await Promise.all([
        getAllWinners(selectedRound || undefined, 100),
        getAllLotteryRounds(20),
      ]);
      setWinners(w);
      setRounds(r);
    } catch (e: any) {
      toast.error('โหลดข้อมูลล้มเหลว: ' + e.message);
    } finally {
      setLoading(false);
    }
  }, [selectedRound]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handlePrizeTypeChange = (type: string) => {
    const found = prizeTypes.find(p => p.value === type);
    setForm((f: any) => ({ ...f, prize_type: type, amount: found?.amount || f.amount }));
  };

  const handleExportCSV = async () => {
    const t = toast.loading('กำลังเตรียมไฟล์ CSV...');
    try {
      const csv = await exportWinnersAsCSV(selectedRound || undefined);
      if (!csv) {
        toast.error('ไม่มีข้อมูลให้ส่งออก', { id: t });
        return;
      }
      const fileName = `winners_${selectedRound || 'all'}_${new Date().toISOString().split('T')[0]}.csv`;
      downloadCSV(csv, fileName);
      toast.success('ส่งออกไฟล์สำเร็จ! 📥', { id: t });
    } catch (e: any) {
      toast.error(e.message, { id: t });
    }
  };

  const handleCleanup = async () => {
    if (!window.confirm('ยืนยันระบบกรองข้อมูล: ระบบจะลบประวัติผู้ถูกรางวัลที่เก่ากว่า 30 วันทั้งหมด? \n(แนะนำให้สำรองข้อมูล CSV ก่อนดำเนินการ)')) return;
    
    const t = toast.loading('กำลังล้างข้อมูลเก่า...');
    try {
       const deletedCount = await deleteOldWinners();
       toast.success(`ล้างข้อมูลสำเร็จ! ลบไปทั้งหมด ${deletedCount} รายการ`, { id: t });
       fetchData();
    } catch (e: any) {
       toast.error(e.message, { id: t });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.display_name.trim()) { toast.error('กรุณาระบุชื่อผู้ถูกรางวัล'); return; }
    setSaving(true);
    const t = toast.loading('กำลังบันทึก...');
    try {
      await addWinner({ ...form, round_id: selectedRound || undefined });
      toast.success('เพิ่มผู้ถูกรางวัลสำเร็จ! 🏆', { id: t });
      setShowForm(false);
      setForm(emptyWinner);
      fetchData();
    } catch (e: any) {
      toast.error(e.message, { id: t });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleVisibility = async (id: string, current: boolean) => {
    try {
      await toggleWinnerVisibility(id, !current);
      toast.success(!current ? 'แสดงสาธารณะแล้ว' : 'ซ่อนแล้ว');
      setWinners(prev => prev.map(w => w.id === id ? { ...w, is_public: !current } : w));
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('ต้องการลบรายการนี้หรือไม่?')) return;
    const t = toast.loading('กำลังลบ...');
    try {
      await deleteWinner(id);
      toast.success('ลบแล้ว', { id: t });
      setWinners(prev => prev.filter(w => w.id !== id));
    } catch (e: any) {
      toast.error(e.message, { id: t });
    }
  };

  const totalPrize = winners.reduce((s, w) => s + Number(w.amount), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-sans font-black text-white  tracking-tighter uppercase">ผู้ถูกรางวัล</h2>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">
            รวม {winners.length} รายการ · เงินรางวัลรวม ฿{totalPrize.toLocaleString()}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={handleCleanup}
            className="bg-slate-900 border border-amber-900/30 text-amber-500 hover:bg-amber-500/10 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all">
            <DatabaseZap size={14} /> ล้างประวัติ {">30วัน"}
          </button>
          <button onClick={handleExportCSV}
            className="bg-slate-900 border border-slate-700 text-slate-300 hover:text-white px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all">
            <Download size={14} /> สำรอง CSV
          </button>
          <button onClick={() => setShowForm(true)}
            className="bg-red-600 hover:bg-red-500 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-red-900/20">
            <Plus size={14} /> เพิ่มรายการ
          </button>
          <button onClick={fetchData} className="bg-slate-900 border border-slate-800 text-slate-400 hover:text-white p-2.5 rounded-xl transition-all">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Round Filter */}
      <div>
        <select value={selectedRound} onChange={e => setSelectedRound(e.target.value)}
          className="bg-slate-900 border border-slate-800 text-white rounded-2xl px-5 py-3 text-sm font-bold focus:border-red-500 outline-none min-w-[280px]">
          <option value="">--- ทุกงวด ---</option>
          {rounds.map(r => (
            <option key={r.id} value={r.id}>{r.name} ({new Date(r.draw_date).toLocaleDateString('th-TH')})</option>
          ))}
        </select>
      </div>

      {/* Winners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {winners.map(w => (
          <div key={w.id} className={`border rounded-[2rem] p-6 space-y-4 transition-all hover:shadow-xl ${prizeColor(w.prize_type)}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="size-11 bg-slate-800 rounded-2xl flex items-center justify-center shadow-lg">
                  {prizeIcon(w.prize_type)}
                </div>
                <div>
                  <p className="font-black text-white text-sm leading-tight">{w.display_name}</p>
                  {w.ticket_number && (
                    <p className="text-[10px] font-mono text-slate-400 mt-0.5">เลข: <span className="text-white font-black">{w.ticket_number}</span></p>
                  )}
                </div>
              </div>
              <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-full ${w.is_public ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-600'}`}>
                {w.is_public ? '👁 สาธารณะ' : '🔒 ซ่อน'}
              </span>
            </div>

            <div className="bg-slate-950/50 rounded-2xl p-3 text-center">
              <p className="text-[9px] text-slate-500 font-black uppercase">เงินรางวัล</p>
              <p className="text-2xl font-sans font-black text-white  tracking-tighter mt-0.5">
                ฿{Number(w.amount).toLocaleString()}
              </p>
              <p className="text-[9px] text-slate-600 mt-1">{prizeTypes.find(p => p.value === w.prize_type)?.label || w.prize_type}</p>
            </div>

            {w.round_name && (
              <p className="text-[9px] text-slate-600 font-black text-center">งวด: {w.round_name}</p>
            )}

            <div className="flex gap-2">
              <button onClick={() => handleToggleVisibility(w.id, w.is_public)}
                className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all border ${
                  w.is_public ? 'bg-slate-800 text-slate-400 hover:bg-slate-700 border-slate-700' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/20'
                }`}>
                {w.is_public ? <EyeOff size={12} /> : <Eye size={12} />}
                {w.is_public ? 'ซ่อน' : 'แสดง'}
              </button>
              <button onClick={() => handleDelete(w.id)}
                className="size-9 bg-slate-800 text-slate-400 hover:bg-red-500/20 hover:text-red-400 rounded-xl flex items-center justify-center transition-all">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {loading && <div className="text-center py-20 font-black text-slate-500 uppercase text-[10px] animate-pulse">กำลังโหลด...</div>}
      {!loading && winners.length === 0 && (
        <div className="text-center py-20 border border-dashed border-slate-800 rounded-[3rem] space-y-3">
          <Trophy size={40} className="mx-auto text-slate-700 opacity-30" />
          <p className="text-slate-600 font-black uppercase text-xs tracking-widest">ยังไม่มีผู้ถูกรางวัล</p>
        </div>
      )}

      {/* Add Winner Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-sm">
          <form onSubmit={handleSave} className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 max-w-lg w-full space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-sans font-black text-white  tracking-tighter uppercase">🏆 เพิ่มผู้ถูกรางวัล</h3>
              <button type="button" onClick={() => setShowForm(false)} className="text-slate-500 hover:text-white"><X size={20} /></button>
            </div>

            <div>
              <label className="text-[9px] font-black text-slate-500 uppercase block mb-1.5">ชื่อ/นามสกุล ที่แสดง *</label>
              <input type="text" required value={form.display_name} onChange={e => setForm({...form, display_name: e.target.value})}
                placeholder="เช่น: คุณสมชาย ว. / ปิด 3 ตัวท้าย"
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:border-red-500 outline-none" />
            </div>

            <div>
              <label className="text-[9px] font-black text-slate-500 uppercase block mb-1.5">ประเภทรางวัล *</label>
              <select value={form.prize_type} onChange={e => handlePrizeTypeChange(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:border-red-500 outline-none">
                {prizeTypes.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[9px] font-black text-slate-500 uppercase block mb-1.5">เงินรางวัล (บาท)</label>
                <input type="number" min="0" value={form.amount} onChange={e => setForm({...form, amount: parseFloat(e.target.value)})}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:border-red-500 outline-none" />
              </div>
              <div>
                <label className="text-[9px] font-black text-slate-500 uppercase block mb-1.5">เลขสลาก</label>
                <input type="text" value={form.ticket_number} onChange={e => setForm({...form, ticket_number: e.target.value})}
                  placeholder="xxxxxx" maxLength={6}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm font-mono focus:border-red-500 outline-none" />
              </div>
            </div>

            <div>
              <label className="text-[9px] font-black text-slate-500 uppercase block mb-1.5">งวดสลาก</label>
              <select value={form.round_id || ''} onChange={e => setForm({...form, round_id: e.target.value || undefined})}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:border-red-500 outline-none">
                <option value="">-- ไม่ระบุงวด --</option>
                {rounds.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-[9px] font-black text-slate-500 uppercase">แสดงสาธารณะ:</label>
              <button type="button" onClick={() => setForm({...form, is_public: !form.is_public})}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all border ${
                  form.is_public ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                {form.is_public ? <Eye size={14} /> : <EyeOff size={14} />}
                {form.is_public ? 'แสดงในหน้าเว็บ' : 'ซ่อนไว้ก่อน'}
              </button>
            </div>

            <button type="submit" disabled={saving}
              className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white font-black uppercase text-[10px] tracking-[0.2em] py-4 rounded-2xl shadow-xl shadow-red-900/20 transition-all flex items-center justify-center gap-2">
              <Save size={14} /> บันทึกผู้ถูกรางวัล
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
