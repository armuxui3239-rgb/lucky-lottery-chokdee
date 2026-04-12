import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../lib/AuthContext';
import toast from 'react-hot-toast';
import {
  DollarSign, Check, X, RefreshCw, Clock, AlertCircle,
  TrendingUp, TrendingDown, Eye, Download, Search,
  CheckCircle, XCircle, Receipt
} from 'lucide-react';
import {
  getAllTransactions,
  getPendingTransactions,
  approveDeposit,
  rejectDeposit,
  approveWithdrawal,
  rejectWithdrawal,
  addTransactionRemark,
  getFinanceSummary,
  exportTransactionsAsCSV,
  downloadCSV,
  subscribePendingTransactions,
  type Transaction,
} from '../../services/adminApi';

const typeLabel: Record<string, string> = {
  deposit: 'ฝากเงิน', withdraw: 'ถอนเงิน', purchase: 'ซื้อสลาก',
  bonus: 'โบนัส', win: 'ถูกรางวัล', refund: 'คืนเงิน', affiliate: 'ค่าแนะนำ',
};

const statusLabel: Record<string, string> = {
  pending: 'รอดำเนินการ', completed: 'เรียบร้อย', approved: 'อนุมัติแล้ว',
  rejected: 'ปฏิเสธแล้ว', failed: 'ล้มเหลว',
};

type FilterType = 'all' | 'pending' | 'deposit' | 'withdraw';

export const AdminFinance = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('pending');
  const [search, setSearch] = useState('');
  const [summary, setSummary] = useState<any>(null);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [remark, setRemark] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const channelRef = useRef<any>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      let data: Transaction[];
      if (filter === 'pending') {
        data = await getPendingTransactions();
      } else if (filter === 'deposit') {
        data = await getAllTransactions(['deposit']);
      } else if (filter === 'withdraw') {
        data = await getAllTransactions(['withdraw']);
      } else {
        data = await getAllTransactions(['deposit', 'withdraw', 'purchase', 'bonus', 'win']);
      }
      setTransactions(data);

      const fin = await getFinanceSummary(30);
      setSummary(fin);
    } catch (e: any) {
      toast.error('โหลดข้อมูลล้มเหลว: ' + e.message);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchData();

    // Real-time subscription
    channelRef.current = subscribePendingTransactions(() => {
      toast('📥 มีรายการใหม่เข้ามา!', { icon: '🔔' });
      fetchData();
    });

    return () => {
      if (channelRef.current) channelRef.current.unsubscribe();
    };
  }, [fetchData]);

  const handleApprove = async (tx: Transaction) => {
    if (!user?.id) return;
    if (!window.confirm(`ยืนยันอนุมัติ${typeLabel[tx.type]} ฿${Number(tx.amount).toLocaleString()} หรือไม่?`)) return;

    setProcessingId(tx.id);
    const t = toast.loading('กำลังประมวลผล...');
    try {
      if (tx.type === 'deposit') {
        const result = await approveDeposit(tx.id, user.id);
        if (!result.success) throw new Error(result.message);
      } else if (tx.type === 'withdraw') {
        const result = await approveWithdrawal(tx.id, user.id);
        if (!result.success) throw new Error(result.message);
      }
      toast.success('อนุมัติสำเร็จ! แจ้งเตือนผู้ใช้แล้ว ✅', { id: t });
      fetchData();
    } catch (e: any) {
      toast.error(e.message || 'เกิดข้อผิดพลาด', { id: t });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (tx: Transaction) => {
    if (!user?.id) return;
    if (!window.confirm(`ยืนยันปฏิเสธรายการนี้หรือไม่? ${tx.type === 'withdraw' ? '(เงินจะถูกคืนเข้ากระเป๋า)' : ''}`)) return;

    setProcessingId(tx.id);
    const t = toast.loading('กำลังประมวลผล...');
    try {
      if (tx.type === 'deposit') {
        await rejectDeposit(tx.id, user.id);
      } else if (tx.type === 'withdraw') {
        await rejectWithdrawal(tx.id, user.id);
      }
      toast.success('ปฏิเสธรายการเรียบร้อย', { id: t });
      fetchData();
    } catch (e: any) {
      toast.error(e.message, { id: t });
    } finally {
      setProcessingId(null);
    }
  };

  const handleSaveRemark = async () => {
    if (!selectedTx) return;
    const t = toast.loading('บันทึก remark...');
    try {
      await addTransactionRemark(selectedTx.id, remark);
      toast.success('บันทึก remark สำเร็จ', { id: t });
      setSelectedTx(null);
      fetchData();
    } catch (e: any) {
      toast.error(e.message, { id: t });
    }
  };

  const handleExport = async () => {
    const t = toast.loading('กำลัง Export...');
    try {
      const csv = await exportTransactionsAsCSV(30);
      downloadCSV(csv, `transactions_${new Date().toISOString().slice(0,10)}.csv`);
      toast.success('Export สำเร็จ', { id: t });
    } catch (e: any) {
      toast.error(e.message, { id: t });
    }
  };

  const filtered = transactions.filter(tx =>
    !search ||
    (tx.profiles as any)?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    (tx.profiles as any)?.phone?.includes(search) ||
    tx.id.includes(search)
  );

  const pendingCount = transactions.filter(t => t.status === 'pending').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-sans font-black text-white  tracking-tighter uppercase">
            ระบบการเงิน
          </h2>
          {pendingCount > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <AlertCircle size={14} className="text-amber-500 animate-pulse" />
              <span className="text-amber-500 text-[10px] font-black uppercase">
                {pendingCount} รายการรอดำเนินการ
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleExport} className="flex items-center gap-2 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
            <Download size={14} /> ส่งออกข้อมูล CSV
          </button>
          <button onClick={fetchData} className="bg-slate-900 border border-slate-800 text-slate-400 hover:text-white p-2.5 rounded-xl transition-all">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Finance Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'ฝากรวม (30 วัน)', value: summary.total_deposit, icon: TrendingUp, color: 'emerald' },
            { label: 'ถอนรวม (30 วัน)', value: summary.total_withdraw, icon: TrendingDown, color: 'red' },
            { label: 'รอฝากอนุมัติ', value: summary.pending_deposit, icon: Clock, color: 'amber' },
            { label: 'รอถอนอนุมัติ', value: summary.pending_withdraw, icon: Clock, color: 'orange' },
          ].map((s, i) => (
            <div key={i} className={`bg-slate-900 border rounded-2xl p-5 ${
              s.color === 'emerald' ? 'border-emerald-500/20' :
              s.color === 'red' ? 'border-red-500/20' : 'border-amber-500/20'
            }`}>
              <s.icon size={18} className={
                s.color === 'emerald' ? 'text-emerald-500 mb-3' :
                s.color === 'red' ? 'text-red-500 mb-3' : 'text-amber-500 mb-3'
              } />
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{s.label}</p>
              <p className={`text-xl font-black  mt-1 ${
                s.color === 'emerald' ? 'text-emerald-400' :
                s.color === 'red' ? 'text-red-400' : 'text-amber-400'
              }`}>฿{Number(s.value).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filter Tabs + Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-2 bg-slate-900 border border-slate-800 rounded-2xl p-1.5">
          {(['pending', 'deposit', 'withdraw', 'all'] as FilterType[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                filter === f ? 'bg-red-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'
              }`}
            >
              {f === 'pending' ? `รอดำเนินการ${pendingCount > 0 ? ` (${pendingCount})` : ''}` :
               f === 'deposit' ? 'ฝาก' : f === 'withdraw' ? 'ถอน' : 'ทั้งหมด'}
            </button>
          ))}
        </div>
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="ค้นหา ชื่อ / เบอร์ / รหัสธุรกรรม..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 text-white rounded-2xl pl-9 pr-4 py-3 text-[11px] font-bold focus:border-red-500 outline-none transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 rounded-[2.5rem] border border-slate-800 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-500 text-[9px] font-black uppercase tracking-[0.2em] border-b border-slate-800 bg-slate-950/30">
                <th className="pb-5 pt-6 px-6">ผู้ใช้ / รหัส</th>
                <th className="pb-5 pt-6 px-4 text-center">ประเภท</th>
                <th className="pb-5 pt-6 px-4">จำนวนเงิน</th>
                <th className="pb-5 pt-6 px-4 text-center">สถานะ</th>
                <th className="pb-5 pt-6 px-4">หลักฐาน</th>
                <th className="pb-5 pt-6 px-4">วันที่</th>
                <th className="pb-5 pt-6 px-4 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-bold">
              {filtered.map((tx) => {
                const isProcessing = processingId === tx.id;
                return (
                  <tr key={tx.id} className="hover:bg-slate-950/50 transition-colors group">
                    <td className="py-4 px-6">
                      <p className="text-sm font-black text-white truncate max-w-[140px]">
                        {(tx.profiles as any)?.full_name || 'ไม่ระบุ'}
                      </p>
                      <p className="text-[9px] text-slate-500 font-mono mt-0.5"># {tx.id.slice(0, 12)}</p>
                      <p className="text-[9px] text-slate-600 font-mono">{(tx.profiles as any)?.phone}</p>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`text-[9px] px-3 py-1 font-black rounded-lg uppercase  border ${
                        tx.type === 'deposit' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        tx.type === 'withdraw' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                        tx.type === 'win' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                        'bg-slate-500/10 text-slate-400 border-slate-500/20'
                      }`}>
                        {typeLabel[tx.type] || tx.type}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-black text-white ">฿{Number(tx.amount).toLocaleString()}</p>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`text-[9px] px-2 py-1 rounded font-black uppercase ${
                        tx.status === 'approved' || tx.status === 'completed' ? 'text-emerald-500' :
                        tx.status === 'pending' ? 'text-amber-500' :
                        tx.status === 'rejected' ? 'text-red-400' : 'text-slate-400'
                      }`}>
                        {statusLabel[tx.status] || tx.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {tx.proof_url ? (
                        <a href={tx.proof_url} target="_blank" rel="noreferrer"
                          className="text-[9px] font-black text-emerald-500 uppercase hover:underline flex items-center gap-1">
                          <Eye size={11} /> ดูสลิป
                        </a>
                      ) : (
                        <span className="text-[9px] text-slate-700 font-black">- ไม่มี -</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-[10px] text-slate-400">
                        {new Date(tx.created_at).toLocaleDateString('th-TH', { day: '2-digit', month: 'short' })}
                      </p>
                      <p className="text-[9px] text-slate-600">
                        {new Date(tx.created_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </td>
                    <td className="py-4 px-4 text-center">
                      {tx.status === 'pending' ? (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleApprove(tx)}
                            disabled={isProcessing}
                            title="อนุมัติ"
                            className="size-8 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-xl flex items-center justify-center transition-all disabled:opacity-40"
                          >
                            {isProcessing ? <RefreshCw size={12} className="animate-spin" /> : <Check size={14} />}
                          </button>
                          <button
                            onClick={() => handleReject(tx)}
                            disabled={isProcessing}
                            title="ปฏิเสธ"
                            className="size-8 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl flex items-center justify-center transition-all disabled:opacity-40"
                          >
                            <X size={14} />
                          </button>
                          <button
                            onClick={() => { setSelectedTx(tx); setRemark(tx.admin_remark || ''); }}
                            title="เพิ่มหมายเหตุ"
                            className="size-8 bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white rounded-xl flex items-center justify-center transition-all"
                          >
                            <Receipt size={12} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-1">
                          {tx.status === 'approved' || tx.status === 'completed' ? (
                            <CheckCircle size={16} className="text-emerald-500" />
                          ) : (
                            <XCircle size={16} className="text-red-400" />
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {loading && (
          <div className="text-center py-16 font-black text-slate-500 uppercase text-[10px] animate-pulse tracking-widest">
            กำลังโหลดรายการ...
          </div>
        )}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-16 font-black text-slate-600 uppercase text-[10px] tracking-widest">
            <DollarSign size={32} className="mx-auto mb-4 opacity-30" />
            ไม่พบรายการ
          </div>
        )}
      </div>

      {/* Remark Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-8 max-w-md w-full space-y-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-sans font-black text-white  tracking-tighter uppercase">
              บันทึกจากผู้ดูแล
            </h3>
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-[11px] font-black space-y-1">
              <p className="text-slate-400">รหัส: <span className="text-white font-mono">{selectedTx.id.slice(0, 12)}</span></p>
              <p className="text-slate-400">ประเภท: <span className="text-white">{typeLabel[selectedTx.type]}</span></p>
              <p className="text-slate-400">จำนวน: <span className="text-emerald-400">฿{Number(selectedTx.amount).toLocaleString()}</span></p>
            </div>
            <textarea
              value={remark}
              onChange={e => setRemark(e.target.value)}
              rows={3}
              placeholder="หมายเหตุ (เฉพาะผู้ดูแล)..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-red-500 outline-none resize-none"
            />
            <div className="flex gap-3">
              <button
                onClick={handleSaveRemark}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white font-black uppercase text-[10px] tracking-widest py-3 rounded-xl transition-all"
              >
                บันทึก
              </button>
              <button
                onClick={() => setSelectedTx(null)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-400 font-black uppercase text-[10px] tracking-widest py-3 rounded-xl transition-all"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

