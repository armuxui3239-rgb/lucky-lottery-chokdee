import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  Tag, Plus, Edit2, Trash2, ToggleLeft, ToggleRight,
  RefreshCw, X, Save, Zap, Calendar, Percent, DollarSign, Gift
} from 'lucide-react';
import {
  getAllPromotions,
  createPromotion,
  updatePromotion,
  togglePromotion,
  deletePromotion,
  type Promotion,
} from '../../services/adminApi';

const typeOptions = [
  { value: 'bonus', label: 'โบนัส' },
  { value: 'cashback', label: 'แคชแบ็ก' },
  { value: 'referral', label: 'แนะนำเพื่อน' },
  { value: 'deposit', label: 'ฝากเงิน' },
  { value: 'free_ticket', label: 'สลากฟรี' },
];

const typeColors: Record<string, string> = {
  bonus: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  cashback: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  referral: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  deposit: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  free_ticket: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const emptyPromo: Partial<Promotion> = {
  title: '', subtitle: '', description: '', badge: '',
  promo_code: '', type: 'bonus', discount_type: 'fixed',
  discount_value: 0, minimum_deposit: 0,
  is_active: true, bg_gradient: 'from-red-600 via-red-800 to-rose-950',
  start_date: new Date().toISOString(),
};

export const AdminPromotions = () => {
  const [promos, setPromos] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [editPromo, setEditPromo] = useState<Partial<Promotion> | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchPromos = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllPromotions();
      setPromos(data);
    } catch (e: any) {
      toast.error('โหลดโปรโมชั่นล้มเหลว');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPromos(); }, [fetchPromos]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPromo) return;
    const t = toast.loading(isCreating ? 'กำลังสร้าง...' : 'กำลังบันทึก...');
    try {
      if (isCreating) {
        await createPromotion(editPromo);
        toast.success('สร้างโปรโมชั่นสำเร็จ! 🎉', { id: t });
      } else {
        await updatePromotion((editPromo as Promotion).id, editPromo);
        toast.success('บันทึกสำเร็จ', { id: t });
      }
      setEditPromo(null);
      setIsCreating(false);
      fetchPromos();
    } catch (e: any) {
      toast.error(e.message, { id: t });
    }
  };

  const handleToggle = async (promo: Promotion) => {
    setTogglingId(promo.id);
    try {
      await togglePromotion(promo.id, !promo.is_active);
      toast.success(`${!promo.is_active ? 'เปิด' : 'ปิด'}โปรโมชั่นสำเร็จ`);
      fetchPromos();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (promoId: string, title: string) => {
    if (!window.confirm(`ต้องการลบโปรโมชั่น "${title}" หรือไม่?`)) return;
    const t = toast.loading('กำลังลบ...');
    try {
      await deletePromotion(promoId);
      toast.success('ลบโปรโมชั่นแล้ว', { id: t });
      fetchPromos();
    } catch (e: any) {
      toast.error(e.message, { id: t });
    }
  };

  const activeCount = promos.filter(p => p.is_active).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-sans font-black text-white  tracking-tighter uppercase">จัดการโปรโมชั่น</h2>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">
            ทั้งหมด {promos.length} รายการ · เปิดใช้ {activeCount} รายการ
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => { setEditPromo({ ...emptyPromo }); setIsCreating(true); }}
            className="bg-red-600 hover:bg-red-500 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-red-900/20">
            <Plus size={14} /> สร้างโปรโมชั่น
          </button>
          <button onClick={fetchPromos} className="bg-slate-900 border border-slate-800 text-slate-400 hover:text-white p-2.5 rounded-xl transition-all">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Promo Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {promos.map(promo => (
          <div key={promo.id} className={`bg-slate-900 border rounded-[2rem] overflow-hidden transition-all hover:shadow-xl ${
            promo.is_active ? 'border-slate-700' : 'border-slate-800 opacity-60'
          }`}>
            {/* Gradient/Image Banner */}
            <div className="relative h-32 overflow-hidden group/banner">
              {promo.image_url ? (
                <img 
                  src={promo.image_url} 
                  alt={promo.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover/banner:scale-110"
                />
              ) : (
                <div className={`w-full h-full bg-gradient-to-r ${promo.bg_gradient}`} />
              )}
              
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent p-5 flex flex-col justify-end">
                {promo.badge && (
                  <span className="absolute top-3 right-3 bg-white/20 backdrop-blur-md text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase border border-white/10">
                    {promo.badge}
                  </span>
                )}
                <h3 className="font-sans font-black text-white text-lg  tracking-tighter leading-tight drop-shadow-md">{promo.title}</h3>
                {promo.subtitle && <p className="text-white/70 text-[10px] font-bold mt-0.5 drop-shadow-sm">{promo.subtitle}</p>}
              </div>
            </div>

            <div className="p-5 space-y-3">
              {/* Type Badge */}
              <div className="flex items-center justify-between">
                <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-lg border ${typeColors[promo.type] || typeColors.bonus}`}>
                  {typeOptions.find(t => t.value === promo.type)?.label}
                </span>
                {promo.promo_code && (
                  <span className="text-[9px] font-mono bg-slate-800 text-slate-300 px-2 py-1 rounded-lg">
                    CODE: {promo.promo_code}
                  </span>
                )}
              </div>

              {/* Discount Info */}
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-2 text-center">
                  <p className="text-slate-500 font-black uppercase text-[8px]">ส่วนลด</p>
                  <p className="text-white font-black mt-0.5">
                    {promo.discount_type === 'percent' ? `${promo.discount_value}%` : `฿${Number(promo.discount_value).toLocaleString()}`}
                  </p>
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-2 text-center">
                  <p className="text-slate-500 font-black uppercase text-[8px]">ฝากขั้นต่ำ</p>
                  <p className="text-white font-black mt-0.5">฿{Number(promo.minimum_deposit).toLocaleString()}</p>
                </div>
              </div>

              {/* Redemption */}
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-slate-500 font-black">ใช้แล้ว: {promo.redemptions_count || 0}{promo.max_redemptions ? `/${promo.max_redemptions}` : ''}</span>
                {promo.end_date && (
                  <span className="text-slate-600 font-black flex items-center gap-1">
                    <Calendar size={10} /> {new Date(promo.end_date).toLocaleDateString('th-TH', { day: '2-digit', month: 'short' })}
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <button onClick={() => handleToggle(promo)} disabled={togglingId === promo.id}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                    promo.is_active
                      ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700 border border-slate-700'
                  }`}>
                  {promo.is_active ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                  {promo.is_active ? 'เปิดอยู่' : 'ปิดอยู่'}
                </button>
                <button onClick={() => { setEditPromo({ ...promo }); setIsCreating(false); }}
                  className="size-9 bg-slate-800 text-slate-400 hover:bg-blue-500/20 hover:text-blue-400 rounded-xl flex items-center justify-center transition-all">
                  <Edit2 size={14} />
                </button>
                <button onClick={() => handleDelete(promo.id, promo.title)}
                  className="size-9 bg-slate-800 text-slate-400 hover:bg-red-500/20 hover:text-red-400 rounded-xl flex items-center justify-center transition-all">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {loading && <div className="text-center py-20 font-black text-slate-500 uppercase text-[10px] animate-pulse tracking-widest">กำลังโหลด...</div>}
      {!loading && promos.length === 0 && (
        <div className="text-center py-20 border border-dashed border-slate-800 rounded-[3rem] space-y-3">
          <Tag size={40} className="mx-auto text-slate-700" />
          <p className="text-slate-600 font-black uppercase text-xs tracking-widest">ยังไม่มีโปรโมชั่น</p>
        </div>
      )}

      {/* Edit / Create Modal */}
      {editPromo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-sm overflow-auto">
          <form onSubmit={handleSave} className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6 animate-in zoom-in-95 duration-200 my-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-sans font-black text-white  tracking-tighter uppercase">
                {isCreating ? '✨ สร้างโปรโมชั่นใหม่' : '✏️ แก้ไขโปรโมชั่น'}
              </h3>
              <button type="button" onClick={() => { setEditPromo(null); setIsCreating(false); }} className="text-slate-500 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Title */}
              <div className="md:col-span-2">
                <label className="text-[9px] font-black text-slate-500 uppercase block mb-1.5">หัวข้อ (Title) *</label>
                <input type="text" required value={editPromo.title || ''} onChange={e => setEditPromo({...editPromo, title: e.target.value})}
                  placeholder="เช่น: โบนัสต้อนรับ 100%" className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:border-red-500 outline-none" />
              </div>

              <div>
                <label className="text-[9px] font-black text-slate-500 uppercase block mb-1.5">คำบรรยาย</label>
                <input type="text" value={editPromo.subtitle || ''} onChange={e => setEditPromo({...editPromo, subtitle: e.target.value})}
                  placeholder="คำอธิบายสั้น..." className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:border-red-500 outline-none" />
              </div>

              <div>
                <label className="text-[9px] font-black text-slate-500 uppercase block mb-1.5">Badge Label</label>
                <input type="text" value={editPromo.badge || ''} onChange={e => setEditPromo({...editPromo, badge: e.target.value})}
                  placeholder="เช่น: 🔥 HOT, ใหม่!" className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:border-red-500 outline-none" />
              </div>

              <div>
                <label className="text-[9px] font-black text-slate-500 uppercase block mb-1.5">โค้ดโปรโมชั่น</label>
                <input type="text" value={editPromo.promo_code || ''} onChange={e => setEditPromo({...editPromo, promo_code: e.target.value.toUpperCase()})}
                  placeholder="LUCKY100" className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm font-mono focus:border-red-500 outline-none" />
              </div>

              <div>
                <label className="text-[9px] font-black text-slate-500 uppercase block mb-1.5">ประเภทโปรโมชั่น</label>
                <select value={editPromo.type || 'bonus'} onChange={e => setEditPromo({...editPromo, type: e.target.value as any})}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:border-red-500 outline-none">
                  {typeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>

              <div>
                <label className="text-[9px] font-black text-slate-500 uppercase block mb-1.5">ประเภทส่วนลด</label>
                <select value={editPromo.discount_type || 'fixed'} onChange={e => setEditPromo({...editPromo, discount_type: e.target.value as any})}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:border-red-500 outline-none">
                  <option value="fixed">จำนวนเงิน (฿)</option>
                  <option value="percent">เปอร์เซ็นต์ (%)</option>
                </select>
              </div>

              <div>
                <label className="text-[9px] font-black text-slate-500 uppercase block mb-1.5">
                  มูลค่าส่วนลด {editPromo.discount_type === 'percent' ? '(%)' : '(บาท)'}
                </label>
                <input type="number" min="0" value={editPromo.discount_value || 0} onChange={e => setEditPromo({...editPromo, discount_value: parseFloat(e.target.value)})}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:border-red-500 outline-none" />
              </div>

              <div>
                <label className="text-[9px] font-black text-slate-500 uppercase block mb-1.5">ยอดฝากขั้นต่ำ (บาท)</label>
                <input type="number" min="0" value={editPromo.minimum_deposit || 0} onChange={e => setEditPromo({...editPromo, minimum_deposit: parseFloat(e.target.value)})}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:border-red-500 outline-none" />
              </div>

              <div>
                <label className="text-[9px] font-black text-slate-500 uppercase block mb-1.5">จำกัดการใช้ (ครั้ง, ว่างเปล่า = ไม่จำกัด)</label>
                <input type="number" min="0" value={editPromo.max_redemptions || ''} onChange={e => setEditPromo({...editPromo, max_redemptions: e.target.value ? parseInt(e.target.value) : undefined})}
                  placeholder="ไม่จำกัด" className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:border-red-500 outline-none" />
              </div>

              <div>
                <label className="text-[9px] font-black text-slate-500 uppercase block mb-1.5">วันหมดอายุ</label>
                <input type="datetime-local" value={editPromo.end_date ? editPromo.end_date.slice(0,16) : ''} onChange={e => setEditPromo({...editPromo, end_date: e.target.value ? new Date(e.target.value).toISOString() : undefined})}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:border-red-500 outline-none" />
              </div>

              <div className="md:col-span-2">
                <label className="text-[9px] font-black text-slate-500 uppercase block mb-1.5">คำอธิบายเพิ่มเติม (รายละเอียด)</label>
                <textarea rows={3} value={editPromo.description || ''} onChange={e => setEditPromo({...editPromo, description: e.target.value})}
                  placeholder="เงื่อนไขและรายละเอียดโปรโมชั่น..." className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:border-red-500 outline-none resize-none" />
              </div>

              <div className="md:col-span-2">
                <label className="text-[9px] font-black text-slate-500 uppercase block mb-1.5">URL รูปภาพพื้นหลัง (ถ้ามีจะใช้แทน Gradient)</label>
                <input type="text" value={editPromo.image_url || ''} onChange={e => setEditPromo({...editPromo, image_url: e.target.value})}
                  placeholder="https://example.com/promo-bg.jpg" className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm font-mono focus:border-red-500 outline-none" />
              </div>

              <div className="md:col-span-2">
                <label className="text-[9px] font-black text-slate-500 uppercase block mb-1.5">Gradient พื้นหลัง (ใช้ถ้าไม่มีรูปภาพ)</label>
                <input type="text" value={editPromo.bg_gradient || ''} onChange={e => setEditPromo({...editPromo, bg_gradient: e.target.value})}
                  placeholder="from-red-600 via-red-800 to-rose-950" className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm font-mono focus:border-red-500 outline-none" />
              </div>

              {/* Status Toggle */}
              <div className="md:col-span-2 flex items-center gap-4">
                <label className="text-[9px] font-black text-slate-500 uppercase">สถานะ:</label>
                <button type="button" onClick={() => setEditPromo({...editPromo, is_active: !editPromo.is_active})}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all border ${
                    editPromo.is_active ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                  {editPromo.is_active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                  {editPromo.is_active ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                </button>
              </div>
            </div>

            <button type="submit" className="w-full bg-red-600 hover:bg-red-500 text-white font-black uppercase text-[10px] tracking-[0.2em] py-5 rounded-2xl shadow-xl shadow-red-900/20 transition-all flex items-center justify-center gap-3">
              <Save size={16} /> {isCreating ? 'สร้างโปรโมชั่น' : 'บันทึกการเปลี่ยนแปลง'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

