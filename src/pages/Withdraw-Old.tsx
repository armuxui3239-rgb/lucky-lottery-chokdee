import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { toast } from 'react-hot-toast';
import {
  ArrowLeft,
  Wallet,
  CreditCard,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ShieldCheck,
  History,
  Send
} from 'lucide-react';

interface Transaction {
  id: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  admin_remark?: string;
}

const Withdraw: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState('');
  const [bankInfo, setBankInfo] = useState({ name: '', account: '' });
  const [pendingRequests, setPendingRequests] = useState<Transaction[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('wallet_balance, bank_name, bank_account')
        .eq('id', user?.id)
        .maybeSingle();

      if (profileData) {
        setBalance(profileData.wallet_balance || 0);
        setBankInfo({
          name: profileData.bank_name || '',
          account: profileData.bank_account || ''
        });
      }

      const { data: txData } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user?.id)
        .eq('type', 'withdraw')
        .order('created_at', { ascending: false })
        .limit(5);

      if (txData) setPendingRequests(txData as Transaction[]);

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!bankInfo.account) {
      toast.error('กรุณาตั้งค่าบัญชีธนาคารก่อนถอนเงิน');
      navigate('/bank-settings');
      return;
    }
    const withdrawAmount = parseFloat(amount);
    if (isNaN(withdrawAmount) || withdrawAmount < 100) {
      toast.error('ถอนขั้นต่ำ 100 บาท');
      return;
    }
    if (withdrawAmount > balance) {
      toast.error('ยอดเงินคงเหลือไม่เพียงพอ');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('transactions')
        .insert({
          user_id: user?.id,
          amount: withdrawAmount,
          type: 'withdraw',
          status: 'pending',
          admin_remark: `Withdraw to ${bankInfo.name}: ${bankInfo.account}`
        });

      if (error) throw error;

      toast.success('ส่งคำขอถอนเงินสำเร็จ! กรุณารอการตรวจสอบ');
      setAmount('');
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 rounded-full border-t-2 border-orange-500 animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-orange-500/30 overflow-x-hidden pb-24">
      {/* Premium Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[60%] bg-gradient-to-b from-orange-500/10 to-transparent"></div>
        <div className="absolute -top-[10%] -right-[10%] w-[50%] h-[50%] bg-orange-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>
      </div>

      <div className="max-w-md mx-auto relative z-10">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white/60 backdrop-blur-3xl border-b border-slate-200 px-6 py-5 flex items-center justify-between">
          <button onClick={() => navigate('/profile')} className="p-2 hover:bg-slate-200 rounded-xl transition-colors">
            <ArrowLeft className="w-6 h-6 text-slate-600" />
          </button>
          <div className="text-center">
            <h1 className="text-xl font-black italic tracking-tighter uppercase leading-none text-slate-900">ถอนเงิน</h1>
            <p className="text-[8px] font-bold text-orange-500/80 uppercase tracking-[0.3em] mt-1">รหัสธุรกรรม 777</p>
          </div>
          <button onClick={() => navigate('/history')} className="p-2 hover:bg-slate-200 rounded-xl transition-colors">
            <History className="w-5 h-5 text-slate-600" />
          </button>
        </header>

        <main className="p-6 space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
          {/* Balance Spotlight */}
          <div className="p-10 rounded-[3rem] bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 shadow-2xl relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 size-40 bg-orange-500/5 rounded-full group-hover:scale-125 transition-transform duration-1000"></div>
            <div className="flex items-center gap-3 mb-4">
              <Wallet className="w-4 h-4 text-orange-500" />
              <span className="text-[10px] font-black text-orange-500/80 uppercase tracking-[0.4em]">ยอดเงินที่ถอนได้</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black text-slate-900 italic tracking-tighter">฿{balance.toLocaleString()}</span>
              <span className="text-xs font-bold text-slate-500">THB</span>
            </div>
            {/* Liquid Decoration */}
            <div className="mt-6 flex flex-wrap gap-2">
              {['100%', 'Verified', 'Secure'].map(tag => (
                <span key={tag} className="px-3 py-1 bg-white shadow-sm rounded-lg text-[8px] font-black text-slate-500 uppercase tracking-widest border border-slate-200">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Amount Input Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center px-2">
              <label className="text-[10px] font-black text-orange-500/80 uppercase tracking-[0.3em]">Quantum Amount</label>
              <span className="text-[10px] font-bold text-slate-600 uppercase">Min: ฿100.00</span>
            </div>
            <div className="relative group">
              <div className="absolute inset-0 bg-orange-500/10 rounded-[2.5rem] blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-white shadow-sm border-2 border-slate-200 focus:border-orange-500/50 rounded-[2.5rem] py-8 px-10 text-4xl font-black text-slate-900 italic tracking-tighter outline-none transition-all placeholder:text-slate-300 focus:shadow-2xl focus:shadow-orange-500/10 relative z-10"
              />
              <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col items-end">
                <span className="text-xs font-black text-orange-500 italic">฿</span>
                <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest mt-1">THB</span>
              </div>
            </div>

            {/* Quick Chips */}
            <div className="grid grid-cols-4 gap-3">
              {[500, 1000, 5000, 10000].map(v => (
                <button
                  key={v}
                  onClick={() => setAmount(v.toString())}
                  className="py-3 bg-white hover:bg-orange-500/10 rounded-2xl text-[10px] font-black text-slate-500 hover:text-orange-500 border border-slate-200 hover:border-orange-500/30 transition-all font-mono active:scale-95 shadow-sm"
                >
                  +{v}
                </button>
              ))}
            </div>
          </div>

          {/* Bank Destination Card */}
          <div className="space-y-4">
            <div className="flex justify-between items-center px-2">
              <label className="text-[10px] font-black text-emerald-500/70 uppercase tracking-[0.3em]">Destination Node</label>
              <button
                onClick={() => navigate('/bank-settings')}
                className="text-[10px] font-bold text-slate-500 hover:text-amber-500 flex items-center gap-1.5 transition-colors"
              >
                ตั้งค่าบัญชี <ChevronRight size={10} />
              </button>
            </div>

            {bankInfo.account ? (
              <div className="p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/5 relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-700">
                <div className="absolute top-0 right-0 p-6 pointer-events-none">
                  <ShieldCheck className="w-5 h-5 text-emerald-500/30 group-hover:text-emerald-500 transition-colors" />
                </div>
                <div className="flex items-center gap-6">
                  <div className="size-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 shadow-inner group-hover:rotate-12 transition-transform">
                    <CreditCard className="w-8 h-8 text-emerald-500" />
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-white tracking-tighter uppercase italic">{bankInfo.name}</h4>
                    <p className="text-sm font-bold text-slate-500 tracking-[0.3em] font-mono mt-2">{bankInfo.account}</p>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => navigate('/bank-settings')}
                className="w-full py-10 rounded-[2.5rem] border-2 border-dashed border-white/5 hover:border-amber-500/30 bg-white/[0.01] hover:bg-amber-500/5 flex flex-col items-center gap-4 text-slate-600 hover:text-amber-500 transition-all group"
              >
                <div className="p-4 bg-white/5 rounded-2xl group-hover:scale-110 transition-transform">
                  <AlertCircle className="w-8 h-8 opacity-40 group-hover:opacity-100" />
                </div>
                <div className="text-center">
                  <p className="text-xs font-black uppercase tracking-widest">ยังไม่ได้เชื่อมต่อบัญชีธนาคาร</p>
                  <p className="text-[9px] font-bold text-slate-700 mt-1 uppercase">กรุณาเพิ่มบัญชีที่ปลอดภัยเพื่อดำเนินการต่อ</p>
                </div>
              </button>
            )}
          </div>

          {/* Action Button */}
          <div className="pt-4">
            <button
              disabled={submitting || !bankInfo.account || !amount}
              onClick={handleWithdraw}
              className={`w-full py-7 rounded-[2.5rem] font-black text-xl italic uppercase tracking-widest shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-4 relative overflow-hidden group ${submitting || !bankInfo.account || !amount ? 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-orange-500/30 hover:from-orange-400 hover:to-red-400'}`}
            >
              {submitting ? 'กำลังตรวจสอบสิทธิ์...' : (
                <>
                  ยืนยันการถอนเงิน
                  <Send className="w-6 h-6 group-hover:translate-x-2 transition-transform shadow-xl" />
                </>
              )}
            </button>
          </div>

          {/* Recent Queue Section */}
          <div className="space-y-6 pt-10">
            <div className="flex items-center gap-4 mb-2">
              <div className="h-[1px] flex-1 bg-slate-200"></div>
              <h4 className="text-[10px] font-black text-slate-700 uppercase tracking-[0.5em] italic">รายการที่อยู่ระหว่างดำเนินการ</h4>
              <div className="h-[1px] flex-1 bg-slate-200"></div>
            </div>

            <div className="space-y-3">
              {pendingRequests.map(req => (
                <div key={req.id} className="bg-white shadow-sm border border-slate-200 p-6 rounded-[2rem] flex items-center justify-between hover:bg-slate-50 transition-all">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${req.status === 'pending' ? 'bg-orange-500/10 text-orange-500' : req.status === 'approved' ? 'bg-green-500/10 text-green-500' : 'bg-rose-500/10 text-rose-500'}`}>
                      {req.status === 'pending' ? <Clock size={16} /> : req.status === 'approved' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900 italic tracking-tighter uppercase transition-colors">฿{Number(req.amount).toLocaleString()}</p>
                      <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mt-1 font-mono">{new Date(req.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className={`text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest border ${req.status === 'pending' ? 'bg-orange-500/5 text-orange-500 border-orange-500/20' : req.status === 'approved' ? 'bg-green-500/5 text-green-500 border-green-500/20' : 'bg-rose-500/5 text-rose-500 border-rose-500/20'}`}>
                    {req.status}
                  </span>
                </div>
              ))}
              {pendingRequests.length === 0 && (
                <div className="py-10 text-center opacity-20 italic text-[10px] font-bold tracking-[0.3em] uppercase">
                  ไม่พบรายการเคลื่อนไหวล่าสุด
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Security Footer */}
        <footer className="mt-20 py-10 px-8 text-center bg-gradient-to-t from-slate-100 to-transparent">
          <p className="text-[9px] font-black text-slate-700 uppercase tracking-[0.4em] mb-4">Secured by SakonNode Defense</p>
          <div className="flex justify-center gap-6 opacity-40">
            <ShieldCheck size={18} />
            <History size={18} />
            <Wallet size={18} />
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Withdraw;
