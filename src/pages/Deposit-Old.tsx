import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { useSiteConfig } from '../lib/SiteConfigContext';
import { toast } from 'react-hot-toast';

const Deposit: React.FC = () => {
  const { user } = useAuth();
  const { config } = useSiteConfig();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState('');
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    const fetchBalance = async () => {
      const { data, error } = await supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', user?.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching balance:', error);
      }
      if (data) setBalance(data.balance);
    };
    if (user) fetchBalance();
  }, [user]);

  const handleNext = () => {
    if (step === 1 && !amount) {
      toast.error('กรุณาระบุจำนวนเงิน');
      return;
    }
    setStep(step + 1);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('กรุณาอัปโหลดสลิป');
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('transactions')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('transactions')
        .getPublicUrl(filePath);

      const { error: dbError } = await supabase
        .from('transactions')
        .insert({
          user_id: user?.id,
          amount: parseFloat(amount),
          type: 'deposit',
          status: 'pending',
          proof_url: publicUrlData.publicUrl,
        });

      if (dbError) throw dbError;

      toast.success('ส่งคำขอแจ้งฝากเรียบร้อยแล้ว กรุณารอการตรวจสอบจากแอดมิน');
      navigate('/profile');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-[#f8f6f6] dark:bg-[#221011] font-sans text-slate-900 dark:text-slate-100 antialiased min-h-screen">
      <div className="relative flex min-h-screen w-full max-w-[430px] mx-auto flex-col bg-white dark:bg-[#1a1a1a] overflow-x-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center bg-white dark:bg-[#1a1a1a] p-4 pb-2 justify-between sticky top-0 z-50 border-b border-slate-100 dark:border-slate-800">
          <button onClick={() => navigate('/profile')} className="text-slate-900 dark:text-white flex size-12 shrink-0 items-center justify-center">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h2 className="text-slate-900 dark:text-white text-lg font-bold flex-1 text-center pr-12">เติมเงิน</h2>
        </div>

        {/* Balance Card */}
        <div className="p-4 pb-0">
          <div className="bg-gradient-to-br from-[#ec131e] to-red-800 rounded-3xl p-6 shadow-2xl shadow-red-500/20 relative overflow-hidden group">
             <div className="absolute -top-10 -right-10 size-32 bg-white/10 rounded-full group-hover:scale-110 transition-transform duration-700"></div>
             <p className="text-white/60 text-[9px] font-black uppercase tracking-[0.2em] mb-1">Current Balance</p>
             <h1 className="text-white text-3xl font-black tracking-tighter">฿{balance.toLocaleString()}</h1>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4">
          <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
            <span>Step {step} of 3</span>
            <span>{Math.round((step / 3) * 100)}% Complete</span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#ec131e] transition-all duration-500" 
              style={{ width: `${(step / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 px-6">
          {step === 1 && (
            <div className="py-6 space-y-6 animate-in slide-in-from-right-4 duration-300">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">ระบุจำนวนเงิน</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">เลือกหรือระบุจำนวนเงินที่ต้องการเติมเข้าวอลเล็ท</p>
              
              <div className="grid grid-cols-3 gap-3">
                {['100', '300', '500', '1000', '3000', '5000'].map(val => (
                  <button 
                    key={val}
                    onClick={() => setAmount(val)}
                    className={`py-3 rounded-xl font-bold border-2 transition-all ${amount === val ? 'bg-[#ec131e] border-[#ec131e] text-white shadow-lg shadow-red-500/20' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400'}`}
                  >
                    ฿{val}
                  </button>
                ))}
              </div>

              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-300 group-focus-within:text-[#ec131e]">฿</span>
                <input 
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="ระบุจำนวนเงินเอง"
                  className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl py-5 pl-10 pr-4 text-2xl font-black focus:ring-0 focus:border-[#ec131e] transition-all"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="py-6 space-y-6 animate-in slide-in-from-right-4 duration-300 flex flex-col items-center">
              <div className="text-center">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">สแกน QR Code</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">ใช้แอปธนาคารสแกนเพื่อโอนเงินยอด</p>
                <p className="text-3xl font-black text-[#ec131e] mt-2">฿{parseFloat(amount).toLocaleString()}</p>
              </div>

              <div className="bg-white p-4 rounded-3xl shadow-2xl border border-slate-100 relative group">
                <div className="absolute -top-2 -right-2 bg-[#ec131e] text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg">Official</div>
                <img 
                   src={`https://promptpay.io/${config.promptpay_id || '0812345678'}/${amount}.png`} 
                   alt="QR" 
                   className="w-56 h-56 object-contain"
                />
              </div>

              <div className="w-full bg-amber-50 dark:bg-amber-900/20 p-4 rounded-2xl border border-amber-100 dark:border-amber-900/30 flex gap-3">
                 <span className="material-symbols-outlined text-amber-600">info</span>
                 <p className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed font-medium">
                    โปรดโอนเงินยอด <strong>฿{amount}</strong> ให้ตรงเป๊ะเพื่อให้ระบบตรวจสอบอัตโนมัติ
                 </p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="py-6 space-y-6 animate-in slide-in-from-right-4 duration-300">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">อัปโหลดสลิป</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">กรุณาอัปโหลดหลักฐานการโอนเงินเพื่อยืนยันรายการ</p>

              <label className="flex flex-col items-center justify-center gap-4 rounded-[2.5rem] border-4 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 py-16 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-all group">
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                <div className="bg-[#ec131e] text-white p-6 rounded-full shadow-xl shadow-red-500/20 group-hover:scale-110 transition-transform">
                   <span className="material-symbols-outlined text-4xl">add_photo_alternate</span>
                </div>
                <div className="text-center">
                  <p className="text-slate-900 dark:text-white font-black text-lg">{file ? file.name : 'กดเพื่อเลือกรูปสลิป'}</p>
                  <p className="text-slate-400 text-xs mt-1 uppercase font-bold tracking-widest">Support JPG, PNG style</p>
                </div>
              </label>

              <div className="space-y-4">
                 <div className="flex justify-between items-center py-4 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Amount to deposit</span>
                    <span className="text-slate-900 dark:text-white font-black text-xl">฿{parseFloat(amount).toLocaleString()}</span>
                 </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800">
          {step < 3 ? (
            <button 
              onClick={handleNext}
              className="w-full bg-[#ec131e] text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-red-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              ดำเนินการต่อ
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          ) : (
            <button 
              onClick={handleUpload}
              disabled={uploading || !file}
              className={`w-full py-5 rounded-2xl font-black text-lg shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2 ${uploading || !file ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-[#ec131e] text-white shadow-red-500/20'}`}
            >
              {uploading ? 'กำลังส่งข้อมูล...' : 'ยืนยันและส่งสลิป'}
              <span className="material-symbols-outlined">check_circle</span>
            </button>
          )}
          <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-6">SakonLottery Secure Deposit</p>
        </div>
      </div>
    </div>
  );
};

export default Deposit;

