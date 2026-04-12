import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  Star, Plus, Edit2, Trash2, RefreshCw, X, Save,
  ToggleLeft, ToggleRight, Gift, Award, TrendingUp, CheckCircle
} from 'lucide-react';
import {
  getAllLoyaltyRewards, createLoyaltyReward, updateLoyaltyReward, deleteLoyaltyReward,
  getAllLoyaltyPoints, getPendingRedemptions, approveRedemption, recalculateLoyaltyTiers,
  type LoyaltyReward
} from '../../services/adminApi';

const TIERS = [
  { name: 'bronze', min: 0, max: 2999, color: 'text-[#CD7F32]', bg: 'bg-[#CD7F32]/10 border-[#CD7F32]/20' },
  { name: 'silver', min: 3000, max: 9999, color: 'text-slate-300', bg: 'bg-slate-300/10 border-slate-300/20' },
  { name: 'gold', min: 10000, max: 19999, color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/20' },
  { name: 'platinum', min: 20000, max: 49999, color: 'text-purple-400', bg: 'bg-purple-400/10 border-purple-400/20' },
  { name: 'diamond', min: 50000, max: Infinity, color: 'text-cyan-400', bg: 'bg-cyan-400/10 border-cyan-400/20' },
];

const rewardTypeOptions = [
  { value: 'credit', label: 'เครดิตเงิน' },
  { value: 'voucher', label: 'คูปอง' },
  { value: 'premium', label: 'สิทธิพิเศษ' },
  { value: 'free_ticket', label: 'สลากฟรี' },
];

const emptyReward: Partial<LoyaltyReward> = {
  name: '', description: '', points_required: 100,
  reward_type: 'credit', reward_value: 0, stock: -1,
  is_active: true, sort_order: 0,
};

export const AdminLoyalty = () => {
  const [activeTab, setActiveTab] = useState<'rewards' | 'points' | 'redemptions'>('rewards');
  const [rewards, setRewards] = useState<LoyaltyReward[]>([]);
  const [points, setPoints] = useState<any[]>([]);
  const [redemptions, setRedemptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editReward, setEditReward] = useState<Partial<LoyaltyReward> | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [recalculating, setRecalculating] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [r, p, red] = await Promise.all([
        getAllLoyaltyRewards(),
        getAllLoyaltyPoints(),
        getPendingRedemptions(),
      ]);
      setRewards(r);
      setPoints(p);
      setRedemptions(red);
    } catch (e: any) {
      toast.error('โหลดข้อมูลล้มเหลว: ' + e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleSaveReward = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editReward) return;
    const t = toast.loading(isCreating ? 'กำลังสร้าง...' : 'กำลังบันทึก...');
    try {
      if (isCreating) {
        await createLoyaltyReward(editReward);
        toast.success('สร้างของรางวัลสำเร็จ! 🎁', { id: t });
      } else {
        await updateLoyaltyReward((editReward as LoyaltyReward).id, editReward);
        toast.success('บันทึกสำเร็จ', { id: t });
      }
      setEditReward(null);
      setIsCreating(false);
      fetchAll();
    } catch (e: any) {
      toast.error(e.message, { id: t });
    }
  };

  const handleDeleteReward = async (id: string, name: string) => {
    if (!window.confirm(`ต้องการลบ "${name}" หรือไม่?`)) return;
    const t = toast.loading('กำลังลบ...');
    try {
      await deleteLoyaltyReward(id);
      toast.success('ลบสำเร็จ', { id: t });
      fetchAll();
    } catch (e: any) {
      toast.error(e.message, { id: t });
    }
  };

  const handleApproveRedemption = async (redId: string) => {
    const t = toast.loading('กำลังอนุมัติ...');
    try {
      await approveRedemption(redId);
      toast.success('อนุมัติสำเร็จ! ✅', { id: t });
      fetchAll();
    } catch (e: any) {
      toast.error(e.message, { id: t });
    }
  };

  const handleRecalculate = async () => {
    if (!window.confirm('คำนวณ Loyalty Tier ใหม่ทุกสมาชิก? (อาจใช้เวลาสักครู่)')) return;
    setRecalculating(true);
    const t = toast.loading('กำลังคำนวณ...');
    try {
      const result = await recalculateLoyaltyTiers();
      toast.success(`คำนวณ Tier สำเร็จ! อัปเดต ${result.updated} คน`, { id: t, duration: 5000 });
      fetchAll();
    } catch (e: any) {
      toast.error(e.message, { id: t });
    } finally {
      setRecalculating(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-sans font-black text-white  tracking-tighter uppercase">ระบบ Loyalty</h2>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">
            {rewards.length} ของรางวัล · {points.length} สมาชิก · {redemptions.length} รอแลก
          </p>
        </div>
        <div className="flex gap-3">
          {activeTab === 'rewards' && (
            <button onClick={() => { setEditReward({ ...emptyReward }); setIsCreating(true); }}
              className="bg-red-600 hover:bg-red-500 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-red-900/20">
              <Plus size={14} /> เพิ่มของรางวัล
            </button>
          )}
          <button onClick={handleRecalculate} disabled={recalculating}
            className="bg-slate-900 border border-slate-800 text-slate-400 hover:text-amber-400 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all disabled:opacity-40">
            <TrendingUp size={14} className={recalculating ? 'animate-pulse' : ''} /> คำนวณ Tier
          </button>
          <button onClick={fetchAll} className="bg-slate-900 border border-slate-800 text-slate-400 hover:text-white p-2.5 rounded-xl transition-all">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Tier Reference */}
      <div className="grid grid-cols-5 gap-2">
        {TIERS.map(tier => (
          <div key={tier.name} className={`border rounded-2xl p-3 text-center ${tier.bg}`}>
            <p className={`text-[10px] font-black uppercase tracking-widest ${tier.color}`}>ประเภทยอดสะสม {tier.name}</p>
            <p className="text-[8px] text-slate-500 font-black mt-1">
              ฿{tier.min.toLocaleString()}{tier.max === Infinity ? '+' : `–${tier.max.toLocaleString()}`}
            </p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-slate-900 border border-slate-800 rounded-2xl p-1.5">
        {(['rewards', 'points', 'redemptions'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
              activeTab === tab ? 'bg-red-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'
            }`}>
            {tab === 'rewards' ? `ของรางวัล (${rewards.length})` :
             tab === 'points' ? `คะแนนสมาชิก (${points.length})` :
             `รอแลกรางวัล (${redemptions.length})`}
          </button>
        ))}
      </div>

      {/* === TAB: REWARDS === */}
      {activeTab === 'rewards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {rewards.map(reward => (
            <div key={reward.id} className={`bg-slate-900 border rounded-[2rem] p-6 space-y-4 transition-all hover:shadow-xl ${reward.is_active ? 'border-slate-700' : 'border-slate-800 opacity-60'}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="size-11 bg-gradient-to-br from-amber-500 to-amber-700 rounded-xl flex items-center justify-center shadow-lg">
                    <Gift size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-black text-white text-sm leading-tight">{reward.name}</h3>
                    <p className="text-[9px] text-slate-500 mt-0.5">{rewardTypeOptions.find(o => o.value === reward.reward_type)?.label}</p>
                  </div>
                </div>
                <span className={`text-[9px] px-2 py-1 rounded-lg font-black uppercase ${reward.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-600'}`}>
                  {reward.is_active ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-2">
                  <p className="text-[8px] text-slate-500 font-black uppercase">แต้มที่ต้องใช้</p>
                  <p className="text-amber-400 font-black text-sm">{reward.points_required.toLocaleString()} แต้ม</p>
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-2">
                  <p className="text-[8px] text-slate-500 font-black uppercase">มูลค่า</p>
                  <p className="text-white font-black text-sm">฿{Number(reward.reward_value).toLocaleString()}</p>
                </div>
              </div>

              {reward.stock !== -1 && (
                <p className="text-[9px] text-slate-500 font-black">คลัง: {reward.stock} ชิ้น</p>
              )}

              <div className="flex gap-2 pt-1">
                <button onClick={() => { setEditReward({ ...reward }); setIsCreating(false); }}
                  className="flex-1 bg-slate-800 text-slate-400 hover:bg-blue-500/20 hover:text-blue-400 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all">
                  <Edit2 size={12} /> แก้ไข
                </button>
                <button onClick={() => handleDeleteReward(reward.id, reward.name)}
                  className="size-9 bg-slate-800 text-slate-400 hover:bg-red-500/20 hover:text-red-400 rounded-xl flex items-center justify-center transition-all">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
          {!loading && rewards.length === 0 && (
            <div className="col-span-full text-center py-20 border border-dashed border-slate-800 rounded-[3rem] text-slate-600 font-black uppercase text-xs tracking-widest">
              <Gift size={40} className="mx-auto mb-4 opacity-20" /> ยังไม่มีของรางวัล
            </div>
          )}
        </div>
      )}

      {/* === TAB: POINTS === */}
      {activeTab === 'points' && (
        <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-500 text-[9px] font-black uppercase tracking-[0.2em] border-b border-slate-800 bg-slate-950/30">
                  <th className="pb-5 pt-6 px-6">สมาชิก</th>
                  <th className="pb-5 pt-6 px-4 text-center">คะแนนคงเหลือ</th>
                  <th className="pb-5 pt-6 px-4 text-center">คะแนนทั้งหมด</th>
                  <th className="pb-5 pt-6 px-4 text-center">ใช้ไปแล้ว</th>
                  <th className="pb-5 pt-6 px-4 text-center">Tier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-bold">
                {points.map((p: any) => {
                  const tier = TIERS.find(t => t.name === p.profiles?.loyalty_tier) || TIERS[0];
                  return (
                    <tr key={p.id} className="hover:bg-slate-950/50 transition-colors">
                      <td className="py-4 px-6">
                        <p className="font-black text-white text-sm">{p.profiles?.full_name || 'ไม่ระบุ'}</p>
                        <p className="text-[9px] text-slate-500 font-mono">{p.profiles?.phone}</p>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="text-amber-400 font-black">{(p.points_balance || 0).toLocaleString()}</span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="text-white font-black">{(p.total_earned || 0).toLocaleString()}</span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="text-slate-400 font-black">{(p.total_spent || 0).toLocaleString()}</span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`text-[9px] px-2 py-1 rounded border font-black uppercase ${tier.bg} ${tier.color}`}>
                          ระดับ {p.profiles?.loyalty_tier || 'bronze'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {loading && <div className="text-center py-16 text-slate-500 font-black uppercase text-[10px] animate-pulse">กำลังโหลด...</div>}
            {!loading && points.length === 0 && <div className="text-center py-16 text-slate-700 font-black uppercase text-xs">ยังไม่มีข้อมูลคะแนน</div>}
          </div>
        </div>
      )}

      {/* === TAB: REDEMPTIONS === */}
      {activeTab === 'redemptions' && (
        <div className="space-y-4">
          {redemptions.map((r: any) => (
            <div key={r.id} className="bg-slate-900 border border-amber-500/20 rounded-2xl p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="size-10 bg-amber-500/10 rounded-xl flex items-center justify-center">
                  <Award size={18} className="text-amber-500" />
                </div>
                <div>
                  <p className="font-black text-white text-sm">{r.profiles?.full_name || 'ไม่ระบุ'}</p>
                  <p className="text-[9px] text-slate-400 mt-0.5">
                    แลก: <span className="text-amber-400 font-black">{r.loyalty_rewards?.name}</span>
                    {' · '}{r.points_used?.toLocaleString()} แต้ม · {new Date(r.created_at).toLocaleDateString('th-TH')}
                  </p>
                </div>
              </div>
              <button onClick={() => handleApproveRedemption(r.id)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all">
                <CheckCircle size={12} /> อนุมัติ
              </button>
            </div>
          ))}
          {!loading && redemptions.length === 0 && (
            <div className="text-center py-20 border border-dashed border-slate-800 rounded-[3rem] text-slate-600 font-black uppercase text-xs tracking-widest">
              <Star size={40} className="mx-auto mb-4 opacity-20" /> ไม่มีรายการรอแลก
            </div>
          )}
        </div>
      )}

      {/* Edit Modal */}
      {editReward && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-sm">
          <form onSubmit={handleSaveReward} className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 max-w-xl w-full max-h-[90vh] overflow-y-auto space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-sans font-black text-white  tracking-tighter uppercase">
                {isCreating ? '🎁 เพิ่มของรางวัล' : '✏️ แก้ไขของรางวัล'}
              </h3>
              <button type="button" onClick={() => setEditReward(null)} className="text-slate-500 hover:text-white"><X size={20} /></button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-[9px] font-black text-slate-500 uppercase block mb-1.5">ชื่อของรางวัล *</label>
                <input type="text" required value={editReward.name || ''} onChange={e => setEditReward({...editReward, name: e.target.value})}
                  placeholder="เช่น: เครดิต ฿50" className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:border-red-500 outline-none" />
              </div>
              <div className="md:col-span-2">
                <label className="text-[9px] font-black text-slate-500 uppercase block mb-1.5">คำอธิบาย</label>
                <textarea rows={2} value={editReward.description || ''} onChange={e => setEditReward({...editReward, description: e.target.value})}
                  placeholder="รายละเอียดของรางวัล..." className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:border-red-500 outline-none resize-none" />
              </div>
              <div>
                <label className="text-[9px] font-black text-slate-500 uppercase block mb-1.5">ประเภทรางวัล</label>
                <select value={editReward.reward_type || 'credit'} onChange={e => setEditReward({...editReward, reward_type: e.target.value as any})}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:border-red-500 outline-none">
                  {rewardTypeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[9px] font-black text-slate-500 uppercase block mb-1.5">มูลค่า (บาท)</label>
                <input type="number" min="0" value={editReward.reward_value || 0} onChange={e => setEditReward({...editReward, reward_value: parseFloat(e.target.value)})}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:border-red-500 outline-none" />
              </div>
              <div>
                <label className="text-[9px] font-black text-slate-500 uppercase block mb-1.5">แต้มที่ต้องใช้</label>
                <input type="number" min="1" required value={editReward.points_required || 0} onChange={e => setEditReward({...editReward, points_required: parseInt(e.target.value)})}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:border-red-500 outline-none" />
              </div>
              <div>
                <label className="text-[9px] font-black text-slate-500 uppercase block mb-1.5">จำนวนในคลัง (-1 = ไม่จำกัด)</label>
                <input type="number" min="-1" value={editReward.stock ?? -1} onChange={e => setEditReward({...editReward, stock: parseInt(e.target.value)})}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:border-red-500 outline-none" />
              </div>
              <div>
                <label className="text-[9px] font-black text-slate-500 uppercase block mb-1.5">ลำดับการแสดง</label>
                <input type="number" min="0" value={editReward.sort_order || 0} onChange={e => setEditReward({...editReward, sort_order: parseInt(e.target.value)})}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:border-red-500 outline-none" />
              </div>
              <div className="flex items-center gap-3">
                <label className="text-[9px] font-black text-slate-500 uppercase">สถานะ:</label>
                <button type="button" onClick={() => setEditReward({...editReward, is_active: !editReward.is_active})}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all border ${
                    editReward.is_active ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                  {editReward.is_active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                  {editReward.is_active ? 'เปิดใช้' : 'ปิดใช้'}
                </button>
              </div>
            </div>

            <button type="submit" className="w-full bg-red-600 hover:bg-red-500 text-white font-black uppercase text-[10px] tracking-[0.2em] py-4 rounded-2xl shadow-xl shadow-red-900/20 transition-all flex items-center justify-center gap-2">
              <Save size={14} /> {isCreating ? 'สร้างของรางวัล' : 'บันทึก'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

