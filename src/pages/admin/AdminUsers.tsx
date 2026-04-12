import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../lib/AuthContext';
import toast from 'react-hot-toast';
import {
  Users, Search, RefreshCw, Shield, ShieldCheck,
  Wallet, Star, X, Eye,
  Plus, Minus, Send, Camera
} from 'lucide-react';
import {
  getAllUsers,
  updateUserProfile,
  adjustUserWallet,
  getUserTransactions,
  sendNotificationToUser,
  type AdminUser,
  type Transaction,
} from '../../services/adminApi';

const tierColors: Record<string, string> = {
  bronze: 'bg-[#CD7F32]/20 text-[#CD7F32] border-[#CD7F32]/30',
  silver: 'bg-slate-300/20 text-slate-300 border-slate-300/30',
  gold: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
  platinum: 'bg-purple-400/20 text-purple-400 border-purple-400/30',
  diamond: 'bg-cyan-400/20 text-cyan-400 border-cyan-400/30',
};

const kycColors: Record<string, string> = {
  unverified: 'text-slate-400',
  pending: 'text-amber-500',
  verified: 'text-emerald-500',
};

export const AdminUsers = () => {
  useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [userTxs, setUserTxs] = useState<Transaction[]>([]);
  const [txLoading, setTxLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'wallet' | 'notify'>('info');

  // Wallet Adjust form
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustReason, setAdjustReason] = useState('');

  // Notify form
  const [notifyTitle, setNotifyTitle] = useState('');
  const [notifyBody, setNotifyBody] = useState('');

  // Image Preview
  const [previewImg, setPreviewImg] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllUsers(search, '', 100, 0);
      setUsers(data);
    } catch (e: any) {
      toast.error('โหลดข้อมูลสมาชิกล้มเหลว: ' + e.message);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(fetchUsers, 300);
    return () => clearTimeout(t);
  }, [fetchUsers]);

  const openUser = async (u: AdminUser) => {
    setSelectedUser(u);
    setActiveTab('info');
    setTxLoading(true);
    try {
      const txs = await getUserTransactions(u.id, 10);
      setUserTxs(txs);
    } catch {
      setUserTxs([]);
    } finally {
      setTxLoading(false);
    }
  };

  const handleUpdateKyc = async (status: 'verified' | 'unverified') => {
    if (!selectedUser) return;
    const t = toast.loading('กำลังอัปเดต...');
    try {
      await updateUserProfile(selectedUser.id, { kyc_status: status === 'verified' ? 'verified' : 'unverified' });
      toast.success('อัปเดต KYC สำเร็จ', { id: t });
      setSelectedUser({ ...selectedUser, kyc_status: status === 'verified' ? 'verified' : 'unverified' });
      fetchUsers();
    } catch (e: any) {
      toast.error(e.message, { id: t });
    }
  };

  const handleAdjustWallet = async (type: 'add' | 'deduct') => {
    if (!selectedUser || !adjustAmount || !adjustReason) {
      toast.error('กรุณากรอกจำนวนเงินและเหตุผล');
      return;
    }
    const amount = parseFloat(adjustAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('จำนวนเงินไม่ถูกต้อง');
      return;
    }
    const t = toast.loading(`กำลัง${type === 'add' ? 'เพิ่ม' : 'ตัด'}ยอด...`);
    try {
      const result = await adjustUserWallet(selectedUser.id, amount, type, adjustReason);
      if (!result.success) throw new Error(result.message);
      toast.success(`${type === 'add' ? 'เพิ่ม' : 'ตัด'}ยอดสำเร็จ! ยอดใหม่: ฿${Number(result.new_balance).toLocaleString()}`, { id: t, duration: 5000 });
      setSelectedUser({ ...selectedUser, balance: result.new_balance });
      setAdjustAmount('');
      setAdjustReason('');
      fetchUsers();
    } catch (e: any) {
      toast.error(e.message, { id: t });
    }
  };

  const handleSendNotify = async () => {
    if (!selectedUser || !notifyTitle || !notifyBody) {
      toast.error('กรุณากรอก Title และ Body');
      return;
    }
    const t = toast.loading('กำลังส่ง...');
    try {
      await sendNotificationToUser(selectedUser.id, notifyTitle, notifyBody, 'system');
      toast.success('ส่ง Notification สำเร็จ!', { id: t });
      setNotifyTitle('');
      setNotifyBody('');
    } catch (e: any) {
      toast.error(e.message, { id: t });
    }
  };

  const stats = {
    total: users.length,
    verified: users.filter(u => u.kyc_status === 'verified').length,
    pending: users.filter(u => u.kyc_status === 'pending').length,
    totalBalance: users.reduce((s, u) => s + (Number(u.balance) || 0), 0),
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-sans font-black text-white  tracking-tighter uppercase">จัดการสมาชิก</h2>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">
            ทั้งหมด {stats.total.toLocaleString()} คน · Verified {stats.verified} · KYC รอ {stats.pending}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="ค้นหา ชื่อ / เบอร์ / บัญชี..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-white rounded-xl pl-9 pr-4 py-2.5 w-64 focus:border-red-500 outline-none text-[11px] font-bold transition-all"
            />
          </div>
          <button onClick={fetchUsers} className="bg-slate-900 border border-slate-800 text-slate-400 hover:text-white p-2.5 rounded-xl transition-all">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'สมาชิกทั้งหมด', value: stats.total, color: 'slate' },
          { label: 'KYC ยืนยันแล้ว', value: stats.verified, color: 'emerald' },
          { label: 'KYC รอดำเนินการ', value: stats.pending, color: 'amber' },
          { label: 'เงินในระบบรวม', value: `฿${stats.totalBalance.toLocaleString()}`, color: 'blue' },
        ].map((s, i) => (
          <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{s.label}</p>
            <p className={`text-xl font-black  mt-1 ${
              s.color === 'emerald' ? 'text-emerald-400' :
              s.color === 'amber' ? 'text-amber-400' :
              s.color === 'blue' ? 'text-blue-400' : 'text-white'
            }`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-slate-900 rounded-[2.5rem] p-6 md:p-8 border border-slate-800 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-500 text-[9px] font-black uppercase tracking-[0.2em] border-b border-slate-800">
                <th className="pb-5 px-4">ชื่อสมาชิก</th>
                <th className="pb-5 px-4 text-center">รูปหน้า</th>
                <th className="pb-5 px-4">เบอร์โทร</th>
                <th className="pb-5 px-4">ยอดเงิน</th>
                <th className="pb-5 px-4">ระดับ</th>
                <th className="pb-5 px-4">KYC</th>
                <th className="pb-5 px-4">ธนาคาร</th>
                <th className="pb-5 px-4 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-bold">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-950/50 transition-colors group">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="size-9 bg-gradient-to-br from-red-500 to-red-700 rounded-xl flex items-center justify-center text-white text-xs font-black shadow-lg">
                        {u.full_name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="text-sm font-black text-white">{u.full_name || 'ไม่ระบุ'}</p>
                        <p className="text-[9px] text-slate-600 font-mono">{u.id.slice(0, 8)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="size-12 mx-auto rounded-xl overflow-hidden bg-slate-800 border border-slate-700 relative group/face">
                      {u.selfie_url ? (
                        <>
                          <img src={u.selfie_url} alt="Face" className="w-full h-full object-cover cursor-pointer hover:scale-110 transition-transform" 
                            onClick={() => setPreviewImg(u.selfie_url!)} />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/face:opacity-100 flex items-center justify-center transition-opacity pointer-events-none">
                            <Eye size={14} className="text-white" />
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-600">
                          <Camera size={16} />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4 font-mono text-slate-300 text-[11px]">{u.phone || '-'}</td>
                  <td className="py-4 px-4">
                    <span className="font-black text-white ">฿{Number(u.balance).toLocaleString()}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`text-[9px] px-2 py-1 rounded border uppercase font-black tracking-widest ${tierColors[u.loyalty_tier] || tierColors.bronze}`}>
                      {u.loyalty_tier}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`text-[10px] font-black uppercase ${kycColors[u.kyc_status]}`}>
                      {u.kyc_status === 'verified' ? '✅' : u.kyc_status === 'pending' ? '⏳' : '❌'} {u.kyc_status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-[10px] text-white font-black uppercase">{u.bank_code || '-'}</p>
                    <p className="text-[9px] text-slate-500 font-mono">{u.bank_account || '-'}</p>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <button
                      onClick={() => openUser(u)}
                      className="size-8 bg-slate-800 text-slate-400 hover:bg-red-500/20 hover:text-red-400 rounded-xl flex items-center justify-center mx-auto transition-all"
                    >
                      <Eye size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {loading && (
            <div className="text-center py-16 font-black text-slate-500 uppercase text-[10px] animate-pulse tracking-widest">
              กำลังโหลด...
            </div>
          )}
          {!loading && users.length === 0 && (
            <div className="text-center py-16 font-black text-slate-600 uppercase text-xs tracking-widest">
              <Users size={32} className="mx-auto mb-4 opacity-30" />
              ไม่พบสมาชิก
            </div>
          )}
        </div>
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6 bg-slate-950/90 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-t-[3rem] sm:rounded-[2.5rem] p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="size-12 bg-gradient-to-br from-red-500 to-red-800 rounded-2xl flex items-center justify-center text-white text-lg font-black shadow-xl shadow-red-900/30">
                  {selectedUser.full_name?.charAt(0) || '?'}
                </div>
                <div>
                  <h3 className="text-lg font-sans font-black text-white  tracking-tighter">{selectedUser.full_name}</h3>
                  <p className="text-[10px] text-slate-500 font-mono">{selectedUser.phone}</p>
                </div>
              </div>
              <button onClick={() => setSelectedUser(null)} className="text-slate-500 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Balance Banner */}
            <div className="bg-gradient-to-r from-red-600/20 to-slate-900 border border-red-500/20 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">ยอดเงินในกระเป๋า</p>
                <p className="text-2xl font-sans font-black text-white ">฿{Number(selectedUser.balance).toLocaleString()}</p>
              </div>
              <Wallet size={28} className="text-red-500 opacity-60" />
            </div>

            {/* Tabs */}
            <div className="flex gap-2 bg-slate-950 border border-slate-800 rounded-2xl p-1">
              {(['info', 'wallet', 'notify'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                    activeTab === tab ? 'bg-red-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'
                  }`}
                >
                  {tab === 'info' ? 'ข้อมูล' : tab === 'wallet' ? 'กระเป๋าเงิน' : 'แจ้งเตือน'}
                </button>
              ))}
            </div>

            {/* Tab: Info */}
            {activeTab === 'info' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-[11px]">
                  {[
                    { label: 'ระดับสมาชิก', value: selectedUser.loyalty_tier, icon: Star },
                    { label: 'สถานะ KYC', value: selectedUser.kyc_status, icon: ShieldCheck },
                    { label: 'ยืนยันเบอร์โทร', value: selectedUser.is_otp_verified ? 'ใช่' : 'ไม่ใช่', icon: Shield },
                    { label: 'รหัสแนะนำ', value: selectedUser.referral_code || '-', icon: Users },
                  ].map((item, i) => (
                    <div key={i} className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                      <p className="text-slate-500 text-[9px] uppercase font-black">{item.label}</p>
                      <p className="text-white font-black mt-1">{item.value}</p>
                    </div>
                  ))}
                </div>

                {/* Face Preview in Detail */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest text-center">รูปถ่ายหน้าสมาชิก (KYC)</p>
                  <div className="aspect-video rounded-xl overflow-hidden bg-slate-800 border border-slate-700 relative group/detailface">
                    {selectedUser.selfie_url ? (
                      <img src={selectedUser.selfie_url} alt="Selfie" className="w-full h-full object-cover cursor-pointer" 
                        onClick={() => setPreviewImg(selectedUser.selfie_url!)} />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-slate-600">
                        <Camera size={24} />
                        <p className="text-[10px] font-black uppercase">ยังไม่มีข้อมูลรูปภาพ</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* KYC Actions */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">จัดการ KYC</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdateKyc('verified')}
                      disabled={selectedUser.kyc_status === 'verified'}
                      className="flex-1 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 py-2 rounded-xl text-[9px] font-black uppercase transition-all disabled:opacity-30"
                    >
                      ✅ ยืนยัน KYC
                    </button>
                    <button
                      onClick={() => handleUpdateKyc('unverified')}
                      disabled={selectedUser.kyc_status === 'unverified'}
                      className="flex-1 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/20 py-2 rounded-xl text-[9px] font-black uppercase transition-all disabled:opacity-30"
                    >
                      ❌ ยกเลิก KYC
                    </button>
                  </div>
                </div>

                {/* Recent Transactions */}
                <div className="space-y-2">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">รายการล่าสุด</p>
                  {txLoading ? (
                    <div className="text-center py-4 text-slate-600 text-[10px] animate-pulse">กำลังโหลด...</div>
                  ) : userTxs.length === 0 ? (
                    <div className="text-center py-4 text-slate-700 text-[10px] font-black uppercase">ไม่มีรายการ</div>
                  ) : userTxs.slice(0, 5).map(tx => (
                    <div key={tx.id} className="flex justify-between items-center bg-slate-950 border border-slate-800 rounded-xl px-3 py-2">
                      <div>
                        <p className="text-[10px] font-black text-white capitalize">{tx.type}</p>
                        <p className="text-[8px] text-slate-600 font-mono">{new Date(tx.created_at).toLocaleDateString('th-TH')}</p>
                      </div>
                      <p className={`text-[11px] font-black  ${tx.type === 'deposit' || tx.type === 'win' || tx.type === 'bonus' ? 'text-emerald-400' : 'text-red-400'}`}>
                        {tx.type === 'deposit' || tx.type === 'win' || tx.type === 'bonus' ? '+' : '-'}฿{Number(tx.amount).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab: Wallet Adjust */}
            {activeTab === 'wallet' && (
              <div className="space-y-4">
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4">
                  <p className="text-[9px] font-black text-amber-500 uppercase">⚠️ ปรับแต่งยอดเงินวอลเล็ต - ใช้ด้วยความระมัดระวัง</p>
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-500 uppercase block mb-1">จำนวนเงิน (บาท)</label>
                  <input
                    type="number"
                    value={adjustAmount}
                    onChange={e => setAdjustAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:border-red-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-500 uppercase block mb-1">เหตุผล / หมายเหตุ</label>
                  <input
                    type="text"
                    value={adjustReason}
                    onChange={e => setAdjustReason(e.target.value)}
                    placeholder="เช่น: โบนัสพิเศษ, แก้ไขยอด..."
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:border-red-500 outline-none"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleAdjustWallet('add')}
                    className="flex-1 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
                  >
                    <Plus size={14} /> เพิ่มยอด
                  </button>
                  <button
                    onClick={() => handleAdjustWallet('deduct')}
                    className="flex-1 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/20 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
                  >
                    <Minus size={14} /> ตัดยอด
                  </button>
                </div>
              </div>
            )}

            {/* Tab: Notification */}
            {activeTab === 'notify' && (
              <div className="space-y-4">
                <div>
                  <label className="text-[9px] font-black text-slate-500 uppercase block mb-1">หัวข้อ</label>
                  <input
                    type="text"
                    value={notifyTitle}
                    onChange={e => setNotifyTitle(e.target.value)}
                    placeholder="หัวข้อการแจ้งเตือน..."
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:border-red-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-500 uppercase block mb-1">ข้อความ</label>
                  <textarea
                    value={notifyBody}
                    onChange={e => setNotifyBody(e.target.value)}
                    rows={3}
                    placeholder="ข้อความถึง..."
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:border-red-500 outline-none resize-none"
                  />
                </div>
                <button
                  onClick={handleSendNotify}
                  className="w-full bg-red-600 hover:bg-red-500 text-white font-black uppercase text-[10px] tracking-widest py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-red-900/20"
                >
                  <Send size={14} /> ส่ง Notification
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Image Preview Overlay */}
      {previewImg && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-md transition-all animate-in fade-in duration-300" onClick={() => setPreviewImg(null)}>
          <div className="relative max-w-[90vw] max-h-[90vh] animate-in zoom-in-95 duration-300">
            <img src={previewImg} alt="User Face Preview" className="rounded-2xl shadow-2xl object-contain w-full h-full border border-white/10" />
            <button onClick={() => setPreviewImg(null)} className="absolute -top-12 right-0 text-white/70 hover:text-white flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-white/10 px-4 py-2 rounded-full transition-all">
              <X size={16} /> ปิดหน้าต่าง
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

