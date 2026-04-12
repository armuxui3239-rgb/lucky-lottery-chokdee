import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Building2, RefreshCw, ToggleLeft, ToggleRight, Edit2, Save, X, CheckCircle, XCircle, CreditCard } from 'lucide-react';
import { getAllBanks, toggleBank, updateBank, type Bank } from '../../services/adminApi';

const bankColors: Record<string, string> = {
  SCB: 'bg-purple-600', KBANK: 'bg-green-600', BBL: 'bg-blue-700',
  KTB: 'bg-blue-500', TMB: 'bg-blue-400', BAY: 'bg-yellow-500',
  GSB: 'bg-rose-600', BAAC: 'bg-green-700', UOB: 'bg-red-700',
  TISCO: 'bg-red-500', LH: 'bg-orange-500', CIMB: 'bg-red-600',
  KKP: 'bg-blue-600', PROMPT: 'bg-blue-500', CITI: 'bg-blue-900',
};

export const AdminBanks = () => {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState(true);
  const [editBank, setEditBank] = useState<Bank | null>(null);
  const [editForm, setEditForm] = useState<Partial<Bank>>({});
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchBanks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllBanks();
      setBanks(data);
    } catch (e: any) {
      toast.error('โหลดข้อมูลธนาคารล้มเหลว');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBanks(); }, [fetchBanks]);

  const handleToggle = async (bank: Bank) => {
    setTogglingId(bank.id);
    try {
      await toggleBank(bank.id, !bank.is_active);
      toast.success(`${!bank.is_active ? 'เปิด' : 'ปิด'}ธนาคาร ${bank.name_th} แล้ว`);
      setBanks(prev => prev.map(b => b.id === bank.id ? { ...b, is_active: !b.is_active } : b));
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setTogglingId(null);
    }
  };

  const handleEdit = (bank: Bank) => {
    setEditBank(bank);
    setEditForm({ ...bank });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editBank) return;
    const t = toast.loading('กำลังบันทึก...');
    try {
      await updateBank(editBank.id, editForm);
      toast.success('บันทึกสำเร็จ', { id: t });
      setEditBank(null);
      fetchBanks();
    } catch (e: any) {
      toast.error(e.message, { id: t });
    }
  };

  const activeCount = banks.filter(b => b.is_active).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-sans font-black text-white  tracking-tighter uppercase">จัดการธนาคาร</h2>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">
            ทั้งหมด {banks.length} ธนาคาร · เปิดใช้งาน {activeCount} ธนาคาร
          </p>
        </div>
        <button onClick={fetchBanks} className="bg-slate-900 border border-slate-800 text-slate-400 hover:text-white p-2.5 rounded-xl transition-all self-start">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4">
        <p className="text-[11px] text-blue-400 font-black">
          💡 เปิด/ปิดธนาคารเพื่อควบคุมช่องทางรับชำระเงินของลูกค้า ธนาคารที่ปิดจะไม่แสดงในหน้าฝากเงิน
        </p>
      </div>

      {/* Banks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {banks.map(bank => (
          <div key={bank.id} className={`bg-slate-900 border rounded-[2rem] p-5 space-y-4 transition-all hover:shadow-xl ${
            bank.is_active ? 'border-slate-700' : 'border-slate-800 opacity-60'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`size-12 rounded-2xl flex items-center justify-center text-white font-black text-xs shadow-lg ${bankColors[bank.code] || 'bg-slate-700'}`}>
                  {bank.code.slice(0, 3)}
                </div>
                <div>
                  <p className="font-black text-white text-sm leading-tight">{bank.name_th}</p>
                  <p className="text-[10px] text-slate-500 font-mono">{bank.code}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {bank.is_active
                  ? <CheckCircle size={16} className="text-emerald-500" />
                  : <XCircle size={16} className="text-red-400" />
                }
              </div>
            </div>

            <p className="text-[10px] text-slate-500 font-black">{bank.name_en}</p>

            <div className="flex gap-2">
              <button onClick={() => handleToggle(bank)} disabled={togglingId === bank.id}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border disabled:opacity-40 ${
                  bank.is_active
                    ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/20'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 border-slate-700'
                }`}>
                {bank.is_active ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                {bank.is_active ? 'เปิดอยู่' : 'ปิดอยู่'}
              </button>
              <button onClick={() => handleEdit(bank)}
                className="size-9 bg-slate-800 text-slate-400 hover:bg-blue-500/20 hover:text-blue-400 rounded-xl flex items-center justify-center transition-all">
                <Edit2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {loading && <div className="text-center py-16 text-slate-500 font-black uppercase text-[10px] animate-pulse">กำลังโหลด...</div>}

      {/* Edit Modal */}
      {editBank && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-sm">
          <form onSubmit={handleSave} className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 max-w-md w-full space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-sans font-black text-white  tracking-tighter uppercase">
                แก้ไข {editBank.name_th}
              </h3>
              <button type="button" onClick={() => setEditBank(null)} className="text-slate-500 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className={`size-16 rounded-2xl mx-auto flex items-center justify-center text-white text-xl font-black shadow-xl ${bankColors[editBank.code] || 'bg-slate-700'}`}>
              {editBank.code.slice(0, 3)}
            </div>

            <div>
              <label className="text-[9px] font-black text-slate-500 uppercase block mb-1.5">ชื่อธนาคาร (ภาษาไทย)</label>
              <input type="text" value={editForm.name_th || ''} onChange={e => setEditForm({...editForm, name_th: e.target.value})}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:border-red-500 outline-none" />
            </div>

            <div>
              <label className="text-[9px] font-black text-slate-500 uppercase block mb-1.5">ชื่อธนาคาร (ภาษาอังกฤษ)</label>
              <input type="text" value={editForm.name_en || ''} onChange={e => setEditForm({...editForm, name_en: e.target.value})}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:border-red-500 outline-none" />
            </div>

            <div>
              <label className="text-[9px] font-black text-slate-500 uppercase block mb-1.5">URL โลโก้ธนาคาร</label>
              <input type="url" value={editForm.logo_url || ''} onChange={e => setEditForm({...editForm, logo_url: e.target.value})}
                placeholder="https://..."
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:border-red-500 outline-none" />
            </div>

            <button type="submit" className="w-full bg-red-600 hover:bg-red-500 text-white font-black uppercase text-[10px] tracking-[0.2em] py-4 rounded-2xl transition-all flex items-center justify-center gap-2">
              <Save size={14} /> บันทึก
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

