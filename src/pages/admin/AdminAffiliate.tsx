import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  Users, DollarSign, RefreshCw, CheckCircle,
  Clock, Award, Link2
} from 'lucide-react';
import {
  getAffiliateSummary, getAffiliateCommissions, approveCommission
} from '../../services/adminApi';

export const AdminAffiliate = () => {
  const [summary, setSummary] = useState<any[]>([]);
  const [commissions, setCommissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'summary' | 'commissions'>('summary');
  const [filterStatus, setFilterStatus] = useState('pending');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [sum, coms] = await Promise.all([
        getAffiliateSummary(),
        getAffiliateCommissions(filterStatus || undefined),
      ]);
      setSummary(sum || []);
      setCommissions(coms || []);
    } catch (e: any) {
      toast.error('โหลดข้อมูลล้มเหลว: ' + e.message);
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    const t = toast.loading('กำลังอนุมัติ...');
    try {
      await approveCommission(id);
      toast.success('อนุมัติค่าคอมมิชชั่นสำเร็จ! 💰', { id: t });
      fetchData();
    } catch (e: any) {
      toast.error(e.message, { id: t });
    } finally {
      setProcessingId(null);
    }
  };

  const totalCommission = summary.reduce((s: number, r: any) => s + Number(r.total_commission), 0);
  const totalPending = summary.reduce((s: number, r: any) => s + Number(r.pending_commission), 0);
  const totalReferrals = summary.reduce((s: number, r: any) => s + Number(r.total_referrals), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-sans font-black text-white  tracking-tighter uppercase">ระบบ Affiliate</h2>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">
            นักแนะนำ {summary.length} คน · แนะนำรวม {totalReferrals} คน
          </p>
        </div>
        <button onClick={fetchData} className="bg-slate-900 border border-slate-800 text-slate-400 hover:text-white p-2.5 rounded-xl transition-all self-start">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'ค่าคอมมิชชั่นรวม', value: `฿${totalCommission.toLocaleString()}`, icon: DollarSign, color: 'emerald' },
          { label: 'รอจ่าย', value: `฿${totalPending.toLocaleString()}`, icon: Clock, color: 'amber' },
          { label: 'ผู้แนะนำทั้งหมด', value: totalReferrals.toLocaleString() + ' คน', icon: Users, color: 'blue' },
        ].map((s, i) => (
          <div key={i} className={`bg-slate-900 border rounded-2xl p-5 ${
            s.color === 'emerald' ? 'border-emerald-500/20' :
            s.color === 'amber' ? 'border-amber-500/20' : 'border-blue-500/20'
          }`}>
            <s.icon size={18} className={`mb-3 ${s.color === 'emerald' ? 'text-emerald-500' : s.color === 'amber' ? 'text-amber-500' : 'text-blue-500'}`} />
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{s.label}</p>
            <p className={`text-xl font-black  mt-1 ${s.color === 'emerald' ? 'text-emerald-400' : s.color === 'amber' ? 'text-amber-400' : 'text-blue-400'}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-slate-900 border border-slate-800 rounded-2xl p-1.5">
        {(['summary', 'commissions'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
              activeTab === tab ? 'bg-red-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'
            }`}>
            {tab === 'summary' ? `ตัวแทน (${summary.length})` : `ค่าคอมมิชชั่น (${commissions.length})`}
          </button>
        ))}
      </div>

      {/* Summary Table */}
      {activeTab === 'summary' && (
        <div className="bg-slate-900 rounded-[2.5rem] border border-slate-800 shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-500 text-[9px] font-black uppercase tracking-[0.2em] border-b border-slate-800 bg-slate-950/30">
                  <th className="pb-5 pt-6 px-6">ตัวแทน</th>
                  <th className="pb-5 pt-6 px-4 text-center">รหัสแนะนำ</th>
                  <th className="pb-5 pt-6 px-4 text-center">ผู้ถูกแนะนำ</th>
                  <th className="pb-5 pt-6 px-4 text-center">ค่าคอมฯ รวม</th>
                  <th className="pb-5 pt-6 px-4 text-center">รอจ่าย</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-bold">
                {summary.map((r: any, i: number) => (
                  <tr key={r.referrer_id} className="hover:bg-slate-950/40 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="size-9 bg-gradient-to-br from-amber-500 to-amber-700 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-lg">
                          {i + 1}
                        </div>
                        <p className="font-black text-white text-sm">{r.referrer_name || 'ไม่ระบุ'}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="font-mono text-[11px] bg-slate-800 text-amber-400 px-3 py-1 rounded-lg font-black">
                        {r.referrer_code || '-'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="text-white font-black">{r.total_referrals}</span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="text-emerald-400 font-black ">฿{Number(r.total_commission).toLocaleString()}</span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`font-black  ${Number(r.pending_commission) > 0 ? 'text-amber-400' : 'text-slate-600'}`}>
                        ฿{Number(r.pending_commission).toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {loading && <div className="text-center py-16 text-slate-500 font-black uppercase text-[10px] animate-pulse">กำลังโหลด...</div>}
            {!loading && summary.length === 0 && (
              <div className="text-center py-16 text-slate-700 font-black uppercase text-xs">
                <Link2 size={32} className="mx-auto mb-4 opacity-20" /> ยังไม่มีข้อมูล Affiliate
              </div>
            )}
          </div>
        </div>
      )}

      {/* Commissions Table */}
      {activeTab === 'commissions' && (
        <div className="space-y-4">
          {/* Filter */}
          <div className="flex gap-2 bg-slate-900 border border-slate-800 rounded-2xl p-1.5">
            {[
              { value: 'pending', label: 'รอดำเนินการ' },
              { value: 'paid', label: 'จ่ายแล้ว' },
              { value: '', label: 'ทั้งหมด' },
            ].map(s => (
              <button key={s.value} onClick={() => setFilterStatus(s.value)}
                className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                  filterStatus === s.value ? 'bg-red-600 text-white' : 'text-slate-500 hover:text-white'
                }`}>
                {s.label}
              </button>
            ))}
          </div>

          {commissions.map((c: any) => (
            <div key={c.id} className={`bg-slate-900 border rounded-2xl p-5 flex items-center justify-between gap-4 ${
              c.status === 'pending' ? 'border-amber-500/20' : 'border-slate-800'
            }`}>
              <div className="flex items-center gap-4">
                <div className={`size-10 rounded-xl flex items-center justify-center ${
                  c.status === 'pending' ? 'bg-amber-500/10' : 'bg-emerald-500/10'
                }`}>
                  {c.status === 'pending' ? <Clock size={18} className="text-amber-500" /> : <CheckCircle size={18} className="text-emerald-500" />}
                </div>
                <div>
                  <p className="font-black text-white text-sm">
                    {c.referrer?.full_name || 'ตัวแทน'} <span className="text-slate-500">→</span> {c.referee?.full_name || 'ผู้ถูกแนะนำ'}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {c.status === 'pending' ? '⏳ รอจ่าย' : '✅ จ่ายแล้ว'} · {new Date(c.created_at).toLocaleDateString('th-TH')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-emerald-400 font-black  text-lg">฿{Number(c.amount).toLocaleString()}</span>
                {c.status === 'pending' && (
                  <button onClick={() => handleApprove(c.id)} disabled={processingId === c.id}
                    className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-all">
                    <CheckCircle size={12} /> จ่าย
                  </button>
                )}
              </div>
            </div>
          ))}
          {!loading && commissions.length === 0 && (
            <div className="text-center py-20 border border-dashed border-slate-800 rounded-[3rem] text-slate-600 font-black uppercase text-xs tracking-widest">
              <Award size={40} className="mx-auto mb-4 opacity-20" /> ไม่มีรายการค่าคอมมิชชั่น
            </div>
          )}
        </div>
      )}
    </div>
  );
};

