import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { useSiteConfig } from '../lib/SiteConfigContext';
import { toast } from 'react-hot-toast';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  History as HistoryIcon, 
  Plus, 
  Minus,
  ArrowLeft,
  CheckCircle2,
  Clock,
  AlertCircle,
  UploadCloud,
  ChevronRight,
  ShieldCheck,
  Zap
} from 'lucide-react';

const WalletPage = () => {
  const { user, balance: authBalance, refreshProfile } = useAuth();
  const { config } = useSiteConfig();
  const navigate = useNavigate();
  const location = useLocation();

  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'deposit' | 'withdraw'>('all');
  
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositStep, setDepositStep] = useState(1);
  const [depositAmount, setDepositAmount] = useState('');
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [bankInfo, setBankInfo] = useState({ name: '', account: '' });
  const [submittingWithdraw, setSubmittingWithdraw] = useState(false);
  const [withdrawStep, setWithdrawStep] = useState(1); // 1: Amount, 2: Security Password
  const [securityPasswordInput, setSecurityPasswordInput] = useState('');
  const { verifyPin } = useAuth();

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  // Sync internal balance with authBalance when it changes
  useEffect(() => {
    setBalance(authBalance);
  }, [authBalance]);

  // Handle auto-opening modals based on path
  useEffect(() => {
    if (location.pathname === '/deposit') {
      setShowDepositModal(true);
    } else if (location.pathname === '/withdraw') {
      setShowWithdrawModal(true);
    }
  }, [location.pathname]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Profile and Bank Info
      const { data: profileData } = await supabase
        .from('profiles')
        .select(`
          bank_account,
          bank_code
        `)
        .eq('id', user?.id)
        .single();
      
      if (profileData) {
        if (profileData.bank_code) {
           const { data: bankData } = await supabase
             .from('banks')
             .select('name_th')
             .eq('code', profileData.bank_code)
             .single();
           
           setBankInfo({
             name: bankData?.name_th || '',
             account: profileData.bank_account || ''
           });
        }
      }

      // 2. Fetch Balance and update global state
      await refreshProfile();

      // 3. Fetch Transactions
      const { data: txData } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (txData) setTransactions(txData);
    } catch (error) {
      console.error('Error fetching wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async () => {
    if (!file) {
      toast.error('กรุณาอัปโหลดหลักฐานการโอน');
      return;
    }
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('transactions')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('transactions')
        .getPublicUrl(fileName);

      const { error: dbError } = await supabase
        .from('transactions')
        .insert({
          user_id: user?.id,
          amount: parseFloat(depositAmount),
          type: 'deposit',
          status: 'pending',
          proof_url: publicUrlData.publicUrl,
        });

      if (dbError) throw dbError;

      toast.success('แจ้งฝากข้อมูลสำเร็จ อดใจรอเจ้าหน้าที่ตรวจสอบสักครู่');
      setShowDepositModal(false);
      setDepositStep(1);
      setDepositAmount('');
      setFile(null);
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    
    if (withdrawStep === 1) {
      if (isNaN(amount) || amount < 100) {
        toast.error('ถอนขั้นต่ำ 100 บาท');
        return;
      }
      if (amount > balance) {
        toast.error('ยอดเงินไม่เพียงพอ');
        return;
      }
      setWithdrawStep(2);
      return;
    }

    // Step 2: Verification
    if (!securityPasswordInput) {
      toast.error('กรุณาระบุรหัสผ่านความปลอดภัย');
      return;
    }

    setSubmittingWithdraw(true);
    try {
      const isCorrect = await verifyPin(securityPasswordInput);
      if (!isCorrect) {
        toast.error('รหัสผ่านความปลอดภัยไม่ถูกต้อง');
        setSubmittingWithdraw(false);
        return;
      }

      const { error } = await supabase
        .from('transactions')
        .insert({
          user_id: user?.id,
          amount: amount,
          type: 'withdraw',
          status: 'pending',
          admin_remark: `ถอนเงินไปยัง ${bankInfo.name}: ${bankInfo.account}`
        });

      if (error) throw error;
      toast.success('ส่งคำขอถอนเงินสำเร็จ');
      setShowWithdrawModal(false);
      setWithdrawAmount('');
      setSecurityPasswordInput('');
      setWithdrawStep(1);
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSubmittingWithdraw(false);
    }
  };

  const filteredTransactions = transactions.filter(tx => 
    activeTab === 'all' ? true : tx.type === activeTab
  );

  if (loading && !transactions.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="size-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-prompt pb-24 selection:bg-red-50 relative overflow-hidden">
      {/* Sparkles Overlay (Light) */}
      <div className="absolute inset-0 sparks-light pointer-events-none opacity-20" />

      {/* 1. High-End Wallet Header */}
      <header className="bg-gradient-to-br from-primary via-primary-dark to-rose-950 text-white pt-12 pb-28 shadow-2xl relative overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] p-16 opacity-5 rotate-12 scale-150">
          <Wallet size={200} />
        </div>
        
        <div className="max-w-5xl mx-auto px-8 relative z-10">
          <div className="flex items-center justify-between mb-12">
            <button onClick={() => navigate(-1)} className="size-12 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-2xl backdrop-blur-xl border border-white/10 transition-all active:scale-90">
              <ArrowLeft size={24} />
            </button>
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">บัญชีการเงินพรีเมียม</span>
              <h1 className="text-2xl font-sans font-black uppercase  tracking-tighter">กระเป๋าเงินพรีเมียม</h1>
            </div>
            <button onClick={() => fetchData()} className="size-12 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-2xl backdrop-blur-xl border border-white/10 transition-all active:scale-90">
              <HistoryIcon size={20} />
            </button>
          </div>

          <div className="text-center animate-in zoom-in duration-500">
            <p className="text-white/40 text-xs font-black uppercase tracking-[0.3em] mb-6">ยอดเงินคงเหลือทั้งหมด</p>
            <div className="flex items-baseline justify-center gap-3">
              <span className="text-white/40 text-3xl font-black  tracking-tighter">฿</span>
              <span className="text-7xl md:text-8xl font-sans font-black tracking-tighter ">
                {balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="mt-8 inline-flex items-center gap-3 px-6 py-2 bg-white/10 rounded-full border border-white/5 text-xs font-black uppercase tracking-widest text-emerald-400">
               <ShieldCheck size={14} />
               <span>ธุรกรรมปลอดภัย 100%</span>
            </div>
          </div>
        </div>
      </header>


      {/* 2. Professional Action Bento Grid */}
      <div className="max-w-5xl mx-auto px-8 -mt-16 relative z-20 grid grid-cols-2 gap-8">
        <button 
          onClick={() => setShowDepositModal(true)}
          className="bg-white rounded-[3rem] p-10 shadow-2xl shadow-black/5 border border-slate-50 flex flex-col items-center gap-6 hover:border-primary/20 transition-all group active:scale-95"
        >
          <div className="size-20 bg-slate-50 text-slate-400 rounded-[2rem] flex items-center justify-center group-hover:bg-primary group-hover:text-white group-hover:shadow-xl group-hover:shadow-primary/20 transition-all duration-500">
            <Plus size={40} />
          </div>
          <span className="font-sans font-black text-sm uppercase tracking-widest text-slate-900 ">ฝากเงินเข้าระบบ</span>
        </button>
        <button 
          onClick={() => setShowWithdrawModal(true)}
          className="bg-white rounded-[3rem] p-10 shadow-2xl shadow-black/5 border border-slate-50 flex flex-col items-center gap-6 hover:border-primary/20 transition-all group active:scale-95"
        >
          <div className="size-20 bg-slate-50 text-slate-400 rounded-[2rem] flex items-center justify-center group-hover:bg-primary group-hover:text-white group-hover:shadow-xl group-hover:shadow-primary/20 transition-all duration-500">
            <Minus size={40} />
          </div>
          <span className="font-sans font-black text-sm uppercase tracking-widest text-slate-900 ">ถอนเงินรางวัล</span>
        </button>
      </div>


      {/* 3. Refined History Master log */}
      <main className="mt-16 px-8 animate-in fade-in slide-in-from-bottom duration-700">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <h3 className="text-2xl font-sans font-black text-slate-900 uppercase  tracking-tighter">ประวัติธุรกรรม</h3>
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none">บันทึกความเคลื่อนไหวทั้งหมด</p>
            </div>
            <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 text-[10px] font-black uppercase tracking-widest">
              {['all', 'deposit', 'withdraw'].map(tab => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-6 py-2 rounded-xl transition-all ${activeTab === tab ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  {tab === 'all' ? 'ทั้งหมด' : tab === 'deposit' ? 'ฝาก' : 'ถอน'}
                </button>
              ))}
            </div>
          </div>


        <div className="space-y-4">
          {filteredTransactions.map((tx) => (
            <div key={tx.id} className="bg-white p-6 rounded-[2.5rem] shadow-xl shadow-black/5 border border-slate-50 flex items-center justify-between group hover:border-primary/10 transition-all">
              <div className="flex items-center gap-5">
                <div className={`size-14 rounded-2xl flex items-center justify-center transition-all ${
                  tx.type === 'deposit' ? 'bg-emerald-50 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white' : 'bg-red-50 text-red-500 group-hover:bg-red-500 group-hover:text-white'
                }`}>
                  {tx.type === 'deposit' ? <ArrowDownLeft size={24} /> : <ArrowUpRight size={24} />}
                </div>
                <div>
                  <p className="font-sans font-black text-sm text-slate-900 uppercase  leading-none">{tx.type === 'deposit' ? 'รายการฝากเงิน' : 'รายการถอนเงิน'}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">
                    {new Date(tx.created_at).toLocaleString('th-TH', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              <div className="text-right flex flex-col items-end gap-1">
                <p className={`font-sans font-black text-xl  ${tx.type === 'deposit' ? 'text-emerald-500 underline decoration-emerald-200 decoration-2 underline-offset-4' : 'text-primary underline decoration-red-200 decoration-2 underline-offset-4'}`}>
                  {tx.type === 'deposit' ? '+' : '-'} {tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                    tx.status === 'pending' ? 'bg-amber-50 text-amber-500 border-amber-100' : 
                    tx.status === 'approved' ? 'bg-emerald-50 text-emerald-500 border-emerald-100' : 
                    'bg-red-50 text-red-500 border-red-100'
                  }`}>
                  {tx.status === 'pending' ? <Clock size={12} className="animate-pulse" /> : 
                   tx.status === 'approved' ? <CheckCircle2 size={12} /> : 
                   <AlertCircle size={12} />}
                  <span>{tx.status === 'pending' ? 'รอตรวจสอบ' : tx.status === 'approved' ? 'สำเร็จ' : 'ถูกปฏิเสธ'}</span>
                </div>
              </div>
            </div>
          ))}

          {filteredTransactions.length === 0 && (
            <div className="py-24 text-center flex flex-col items-center gap-6 animate-in slide-in-from-bottom duration-500">
              <div className="size-20 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-200 border border-slate-50 border-dashed">
                <Zap size={32} />
              </div>
              <div className="space-y-1">
                 <p className="text-slate-400 font-black text-xs uppercase tracking-widest">ยังไม่มีรายการบันทึก</p>
                 <p className="text-[10px] text-slate-300 uppercase tracking-[0.2em]">รายการทั้งหมดจะแสดงที่นี่</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>



      {/* 4. Pro Modals: Clean, High-End UX */}
      {showDepositModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-6 transition-all duration-500">
          <div className="bg-white w-full max-w-md rounded-t-[4rem] sm:rounded-[3.5rem] p-10 max-h-[95vh] overflow-y-auto shadow-2xl border border-white/20 animate-in slide-in-from-bottom duration-500">
            <div className="flex items-center justify-between mb-10">
               <div className="flex flex-col">
                  <h2 className="text-2xl font-sans font-black text-slate-900  tracking-tighter uppercase leading-none">ระบุบยอดเงินที่จะฝาก</h2>
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mt-2">ขั้นตอนที่ {depositStep} จาก 3</p>
               </div>
              <button onClick={() => setShowDepositModal(false)} className="size-11 flex items-center justify-center bg-slate-50 text-slate-300 hover:text-slate-600 rounded-2xl transition-all active:scale-90">
                <Plus size={20} className="rotate-45" />
              </button>
            </div>

            {depositStep === 1 ? (
              <div className="space-y-8">
                <div className="grid grid-cols-3 gap-4">
                  {['300', '500', '1000', '3000', '5000', '10000'].map(val => (
                    <button 
                      key={val}
                      onClick={() => setDepositAmount(val)}
                      className={`h-14 rounded-2xl font-black text-sm uppercase tracking-widest border-2 transition-all ${depositAmount === val ? 'bg-primary border-primary text-white shadow-xl shadow-primary/20 scale-105' : 'bg-white border-slate-50 text-slate-400 hover:border-primary/20'}`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
                <div className="relative">
                   <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 font-sans font-black text-xl  pr-2 border-r border-slate-100">฿</span>
                   <input 
                     type="number"
                     placeholder="ระบุจำนวนเงินด้วยตัวเอง"
                     value={depositAmount}
                     onChange={(e) => setDepositAmount(e.target.value)}
                     className="w-full bg-slate-50 border-none rounded-2xl py-5 pl-16 pr-6 text-2xl font-sans font-black  focus:ring-4 focus:ring-primary/5 transition-all text-slate-900"
                   />
                </div>
                <button 
                  disabled={!depositAmount}
                  onClick={() => setDepositStep(2)}
                  className="w-full h-16 bg-gradient-to-r from-primary to-rose-600 text-white rounded-3xl font-sans font-black text-sm uppercase tracking-widest shadow-2xl shadow-primary/20 disabled:opacity-30 disabled:grayscale transition-all active:scale-95"
                >
                  ถัดไป
                </button>
              </div>
            ) : depositStep === 2 ? (
              <div className="space-y-10 text-center">
                 <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">แสกนเพื่อโอนเงินเข้าสู่ระบบ</p>
                    <p className="text-5xl font-sans font-black text-primary  tracking-tighter">฿{parseFloat(depositAmount).toLocaleString()}</p>
                 </div>
                
                <div className="p-8 rounded-[3rem] bg-white border border-slate-100 shadow-2xl relative group mx-auto w-fit">
                   <div className="absolute inset-0 bg-primary/5 rounded-[3rem] blur-2xl group-hover:bg-primary/10 transition-all"></div>
                   <img 
                      src={`https://promptpay.io/${config?.promptpay_id || '0000000000'}/${depositAmount}.png`} 
                      alt="QR Node" 
                      className="size-56 relative z-10 rounded-2xl shadow-inner"
                   />
                </div>
                
                <div className="bg-amber-50 p-6 rounded-[2rem] border border-amber-100/50 text-left flex gap-5">
                   <div className="size-10 bg-amber-500 text-white rounded-xl flex items-center justify-center shrink-0">
                      <AlertCircle size={22} className="animate-pulse" />
                   </div>
                   <div>
                      <p className="text-[11px] text-amber-900 font-bold uppercase tracking-tight leading-relaxed">โปรดตรวจสอบจำนวนเงิน</p>
                      <p className="text-[10px] text-amber-900/60 font-medium leading-relaxed mt-1">กรุณาโอนเงินให้ตรงกับจำนวนที่ระบุ เพื่อความรวดเร็วในการตรวจสอบและปรับยอดเงินอัตโนมัติ</p>
                   </div>
                </div>

                <button 
                  onClick={() => setDepositStep(3)}
                  className="w-full h-16 bg-primary text-white rounded-3xl font-sans font-black text-sm uppercase tracking-widest shadow-2xl shadow-primary/30 transition-all active:scale-95"
                >
                  โอนเงินเรียบร้อยแล้ว
                </button>
              </div>
            ) : (
              <div className="space-y-8 text-center">
                <h3 className="text-xl font-sans font-black text-slate-900 uppercase  tracking-tighter">อัปโหลดหลักฐานการโอน</h3>
                <label className="flex flex-col items-center justify-center h-60 border-4 border-dashed border-slate-100 bg-slate-50 rounded-[3rem] cursor-pointer hover:bg-slate-100 transition-all duration-500 group relative overflow-hidden">
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                  {file ? (
                    <div className="relative z-10 flex flex-col items-center gap-3">
                       <CheckCircle2 className="text-emerald-500" size={40} />
                       <p className="font-sans font-black text-xs text-slate-900 uppercase  truncate px-8 max-w-full">{file.name}</p>
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">เลือกไฟล์เรียบร้อย</p>
                    </div>
                  ) : (
                    <>
                      <UploadCloud size={48} className="text-slate-200 mb-4 group-hover:text-primary transition-colors" />
                      <div className="space-y-1">
                         <p className="text-slate-400 font-black text-xs uppercase tracking-widest">แตะเพื่ออัปโหลดสลิป</p>
                         <p className="text-slate-300 text-[9px] font-black uppercase tracking-[0.2em]">รองรับ JPG, PNG (ไม่เกิน 5MB)</p>
                      </div>
                    </>
                  )}
                </label>
                <div className="flex gap-4">
                   <button onClick={() => setDepositStep(2)} className="h-16 px-6 bg-slate-50 text-slate-400 rounded-3xl font-black uppercase text-[10px] tracking-widest">ย้อนกลับ</button>
                   <button 
                    disabled={uploading || !file}
                    onClick={handleDeposit}
                    className="flex-1 h-16 bg-[#FF0000] text-white rounded-3xl font-sans font-black text-sm uppercase tracking-widest shadow-2xl shadow-primary/20 disabled:opacity-30 disabled:grayscale transition-all active:scale-95 flex items-center justify-center gap-3"
                   >
                    {uploading ? (
                      <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Zap size={18} className="fill-white" />
                        <span>ยืนยันการแจ้งฝาก</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. Professional Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-6 transition-all duration-500">
          <div className="bg-white w-full max-w-md rounded-t-[4rem] sm:rounded-[3.5rem] p-10 max-h-[95vh] overflow-y-auto shadow-2xl border border-white/20 animate-in slide-in-from-bottom duration-500">
            <div className="flex items-center justify-between mb-10">
               <div className="flex flex-col">
                  <h2 className="text-2xl font-sans font-black text-slate-900  tracking-tighter uppercase leading-none">
                    {withdrawStep === 1 ? 'แจ้งถอนเงิน' : 'ยืนยันรหัสผ่าน'}
                  </h2>
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mt-2">
                    {withdrawStep === 1 ? 'ระบุจำนวนที่ต้องการถอน' : 'ระบุรหัสผ่านความปลอดภัยเพื่อถอนเงิน'}
                  </p>
               </div>
              <button onClick={() => { setShowWithdrawModal(false); setWithdrawStep(1); }} className="size-11 flex items-center justify-center bg-slate-50 text-slate-400 hover:text-slate-600 rounded-2xl transition-all active:scale-90">
                <Plus size={20} className="rotate-45" />
              </button>
            </div>

            <div className="space-y-10">
              <div className="p-8 rounded-[2.5rem] bg-primary text-white relative overflow-hidden group shadow-2xl">
                 <div className="absolute top-0 right-0 p-6 opacity-10">
                    <ShieldCheck size={80} />
                 </div>
                 <div className="relative z-10">
                    <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em] mb-4">บัญชีที่ใช้รับเงิน</p>
                    {bankInfo.account ? (
                      <div className="flex items-center gap-5">
                         <div className="size-14 bg-white/10 rounded-2xl flex items-center justify-center text-emerald-400 border border-white/5 backdrop-blur-xl">
                           <CheckCircle2 size={28} />
                         </div>
                         <div>
                           <p className="font-sans font-black text-lg text-white uppercase  tracking-tighter leading-none">{bankInfo.name}</p>
                           <p className="text-[11px] font-mono text-white/40 tracking-[0.25em] mt-2">{bankInfo.account}</p>
                         </div>
                      </div>
                    ) : (
                      <button onClick={() => navigate('/bank-settings')} className="text-primary font-black text-[11px] uppercase tracking-widest flex items-center gap-2 group/btn">
                         ตั้งค่าบัญชีธนาคาร <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                      </button>
                    )}
                 </div>
              </div>

              <div className="space-y-4">
              {withdrawStep === 1 ? (
                <div className="space-y-4">
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 font-sans font-black text-xl  pr-2 border-r border-slate-100">฿</span>
                    <input 
                      type="number"
                      placeholder="0.00"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className="w-full bg-slate-50 border-none rounded-2xl py-5 pl-16 pr-6 text-2xl font-sans font-black  focus:ring-4 focus:ring-primary/5 transition-all text-slate-900"
                    />
                  </div>
                  <div className="flex justify-between items-center px-4">
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest ">ยอดสูงสุดที่ถอนได้</span>
                    <span className="text-sm font-black text-slate-900  tracking-tighter">฿{balance.toLocaleString()}</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative">
                     <ShieldCheck className="absolute left-6 top-1/2 -translate-y-1/2 text-primary" size={20} />
                     <input 
                       type="password"
                       placeholder="ระบุรหัสผ่านความปลอดภัย"
                       value={securityPasswordInput}
                       onChange={(e) => setSecurityPasswordInput(e.target.value)}
                       className="w-full bg-slate-50 border-none rounded-2xl py-5 pl-16 pr-6 text-2xl font-sans font-black  focus:ring-4 focus:ring-primary/5 transition-all text-slate-900 text-center"
                     />
                  </div>
                   <div className="flex justify-center px-4">
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest ">ขั้นตอนการยืนยันรหัสความปลอดภัย</span>
                  </div>
                </div>
              )}
              </div>

              <button 
                disabled={submittingWithdraw || (withdrawStep === 1 && !withdrawAmount) || (withdrawStep === 2 && !securityPasswordInput) || !bankInfo.account}
                onClick={handleWithdraw}
                className="w-full h-16 bg-gradient-to-r from-primary to-rose-600 text-white rounded-3xl font-sans font-black text-sm uppercase tracking-widest shadow-2xl shadow-primary/20 disabled:opacity-30 transition-all active:scale-95 flex items-center justify-center gap-3"
              >
                {submittingWithdraw ? (
                   <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                   <>
                     <ShieldCheck size={18} />
                     <span>{withdrawStep === 1 ? 'ยืนยันจำนวนเงิน' : 'ยืนยันรหัสผ่านและแจ้งถอน'}</span>
                   </>
                )}
              </button>
              <div className="text-center">
                 <p className="text-[9px] font-black text-slate-200 uppercase tracking-[0.2em]">รายการถอนจะถูกดำเนินการภายใน 24 ชม.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletPage;

