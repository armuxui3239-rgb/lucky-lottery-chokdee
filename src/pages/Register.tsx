import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { toast } from 'react-hot-toast';
import { User, Lock, Phone, UserPlus, Zap, CreditCard, ChevronLeft } from 'lucide-react';

interface Bank {
  code: string;
  name_th: string;
  logo_url: string;
}

const THAI_BANKS: Bank[] = [
  { code: 'KBANK', name_th: 'ธนาคารกสิกรไทย', logo_url: 'https://storage.googleapis.com/glide-prod.appspot.com/uploads-v2/eTZt9hleBEh0QLZXwUjZ/pub/gtF5IDygx1zHFrvTDBiu.png' },
  { code: 'SCB', name_th: 'ธนาคารไทยพาณิชย์', logo_url: 'https://storage.googleapis.com/glide-prod.appspot.com/uploads-v2/eTZt9hleBEh0QLZXwUjZ/pub/dGQJLcLaQtPtYTgIgJdd.png' },
  { code: 'BBL', name_th: 'ธนาคารกรุงเทพ', logo_url: 'https://storage.googleapis.com/glide-prod.appspot.com/uploads-v2/eTZt9hleBEh0QLZXwUjZ/pub/c3T2psxLLJtZwwDseqKG.png' },
  { code: 'KTB', name_th: 'ธนาคารกรุงไทย', logo_url: 'https://storage.googleapis.com/glide-prod.appspot.com/uploads-v2/eTZt9hleBEh0QLZXwUjZ/pub/4movMnyEyWRBPCaETXn4.png' },
  { code: 'BAY', name_th: 'ธนาคารกรุงศรีอยุธยา', logo_url: 'https://storage.googleapis.com/glide-prod.appspot.com/uploads-v2/eTZt9hleBEh0QLZXwUjZ/pub/maEffC5eZbdRU2P3Gdrx.png' },
  { code: 'TTB', name_th: 'ธนาคารทหารไทยธนชาต', logo_url: 'https://storage.googleapis.com/glide-prod.appspot.com/uploads-v2/eTZt9hleBEh0QLZXwUjZ/pub/WCWm131YEuE6DP34eQ4v.png' },
  { code: 'UOB', name_th: 'ธนาคารยูโอบี จำกัด (มหาชน)', logo_url: 'https://storage.googleapis.com/glide-prod.appspot.com/uploads-v2/eTZt9hleBEh0QLZXwUjZ/pub/wwEp4Vv5gC7z4GguQ3Cy.png' },
  { code: 'GSB', name_th: 'ธนาคารออมสิน', logo_url: 'https://storage.googleapis.com/glide-prod.appspot.com/uploads-v2/eTZt9hleBEh0QLZXwUjZ/pub/gFsfJZ3I3iPOU2N1S4Kb.png' },
  { code: 'BAAC', name_th: 'ธนาคารเพื่อการเกษตรและสหกรณ์การเกษตร', logo_url: 'https://storage.googleapis.com/glide-prod.appspot.com/uploads-v2/eTZt9hleBEh0QLZXwUjZ/pub/nwz3ja6Sr68cSIeNfMgf.png' },
  { code: 'LH', name_th: 'ธนาคารแลนด์ แอนด์ เฮาส์', logo_url: 'https://storage.googleapis.com/glide-prod.appspot.com/uploads-v2/eTZt9hleBEh0QLZXwUjZ/pub/zZQWJJw2WXtgxunLF0el.png' },
  { code: 'CITI', name_th: 'ธนาคารซิตี้แบงก์', logo_url: 'https://storage.googleapis.com/glide-prod.appspot.com/uploads-v2/eTZt9hleBEh0QLZXwUjZ/pub/HXSK7fWSB6c8CmXz6oDh.png' },
  { code: 'TISCO', name_th: 'ธนาคารทิสโก้', logo_url: 'https://www.dpa.or.th/storage/uploads/bank/dpa_bank_tisco@2x.png' },
  { code: 'CIMB', name_th: 'ธนาคารซีไอเอ็มบี ไทย', logo_url: 'https://storage.googleapis.com/glide-prod.appspot.com/uploads-v2/eTZt9hleBEh0QLZXwUjZ/pub/cEWEtvTGrWoGv0OvSBWa.png' },
  { code: 'UOB_TMRW', name_th: 'ยูโอบี ทูมอร์โรว์ (UOB TMRW)', logo_url: 'https://storage.googleapis.com/glide-prod.appspot.com/uploads-v2/eTZt9hleBEh0QLZXwUjZ/pub/yaPxU7sAG5PnSFwWD8s8.png' },
  { code: 'TCRB', name_th: 'ธนาคารไทยเครดิต', logo_url: 'https://storage.googleapis.com/glide-prod.appspot.com/uploads-v2/eTZt9hleBEh0QLZXwUjZ/pub/fIcX46U3BZWeQ0Vd06ZY.png' },
  { code: 'GHB', name_th: 'ธนาคารอาคารสงเคราะห์', logo_url: 'https://storage.googleapis.com/glide-prod.appspot.com/uploads-v2/eTZt9hleBEh0QLZXwUjZ/pub/y9T8zU40jwXzk1YxZhSc.png' },
  { code: 'ISBT', name_th: 'ธนาคารอิสลามแห่งประเทศไทย', logo_url: 'https://storage.googleapis.com/glide-prod.appspot.com/uploads-v2/eTZt9hleBEh0QLZXwUjZ/pub/BIBiBkYsPoqUOnxy5hR5.png' },
];

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [bankCode, setBankCode] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [banks, setBanks] = useState<Bank[]>(THAI_BANKS);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const { data } = await supabase.from('banks').select('code, name_th, logo_url').eq('is_active', true);
        if (data && data.length > 0) {
          setBanks(data);
        }
      } catch (err) {
      }
    };
    fetchBanks();
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) {
      toast.error('กรุณาระบุเบอร์โทรศัพท์ให้ถูกต้อง');
      return;
    }
    if (!bankCode) {
      toast.error('กรุณาเลือกธนาคาร');
      return;
    }
    if (!bankAccount || bankAccount.length < 10) {
      toast.error('กรุณาระบุเลขที่บัญชีธนาคาร 10-12 หลัก');
      return;
    }
    setLoading(true);
    try {
      await signUp(phone, password, { 
        full_name: fullName,
        phone: phone,
        bank_code: bankCode,
        bank_account: bankAccount
      });
      toast.success('ลงทะเบียนสำเร็จ - กำลังเข้าสู่ระบบ', {
        icon: '🔗',
        style: { borderRadius: '1.5rem', background: '#ec131e', color: '#fff', fontFamily: 'Prompt', fontWeight: 'bold' }
      });
      navigate('/otp'); 
    } catch (err: any) {
      toast.error(err.message || 'เกิดข้อผิดพลาดในการลงทะเบียน');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen text-slate-900 font-prompt animate-in fade-in duration-500 w-full overflow-x-hidden">
      <div className="relative w-full flex flex-col min-h-screen pb-10">

        <main className="flex-1 flex flex-col items-center pt-24 px-8 relative z-10 w-full max-w-2xl mx-auto">

          <div className="mb-10 text-center space-y-4">
             <div className="relative inline-block">
                <div className="absolute inset-0 bg-primary/10 rounded-[2.2rem] blur-3xl scale-125 animate-pulse" />
                <div className="relative size-20 bg-primary rounded-[1.8rem] flex items-center justify-center shadow-2xl -rotate-6 border border-white/5 active:rotate-0 transition-transform duration-700">
                   <UserPlus size={40} className="text-white" strokeWidth={1.5} />
                </div>
             </div>
             <h1 className="text-3xl font-sans font-black text-slate-900  tracking-tighter uppercase leading-none">
               สมัครสมาชิก <span className="text-primary">ใหม่</span>
             </h1>
          </div>

          <div className="w-full bg-slate-50/50 backdrop-blur-xl rounded-[2.5rem] border border-slate-100 p-10 shadow-inner space-y-10 animate-in slide-in-from-bottom-12 duration-1000 relative">
             
             <div className="flex items-center justify-center gap-8 mb-4">
                <div className="flex items-center gap-3">
                   <div className={`size-8 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${currentStep === 1 ? 'bg-primary text-white scale-125 shadow-lg shadow-primary/20' : 'bg-slate-200 text-slate-400'}`}>1</div>
                   <span className={`text-[10px] font-black uppercase tracking-widest ${currentStep === 1 ? 'text-slate-900' : 'text-slate-300'}`}>ข้อมูลส่วนตัว</span>
                </div>
                <div className="w-12 h-0.5 bg-slate-100 rounded-full" />
                <div className="flex items-center gap-3">
                   <div className={`size-8 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${currentStep === 2 ? 'bg-primary text-white scale-125 shadow-lg shadow-primary/20' : 'bg-slate-200 text-slate-400'}`}>2</div>
                   <span className={`text-[10px] font-black uppercase tracking-widest ${currentStep === 2 ? 'text-slate-900' : 'text-slate-300'}`}>ข้อมูลธนาคาร</span>
                </div>
             </div>

             <form onSubmit={handleRegister} className="space-y-10">
                
                {currentStep === 1 && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
                    <div className="space-y-4">
                       <label className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] px-4  leading-none text-center block">ระบุตัวตนสมาชิกใหม่</label>
                       <div className="grid gap-4">
                          <div className="relative group">
                             <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
                             <input 
                               type="text" placeholder="ชื่อ-นามสกุล (ตรงตามชื่อบัญชีธนาคาร)" value={fullName}
                               onChange={(e) => setFullName(e.target.value)}
                               className="w-full bg-white border-2 border-slate-50 focus:border-primary/30 rounded-[1.8rem] h-18 pl-18 pr-8 text-sm font-black outline-none transition-all shadow-sm" required
                             />
                          </div>
                          <div className="relative group">
                             <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
                             <input 
                               type="tel" placeholder="เบอร์โทรศัพท์มือถือ 10 หลัก" value={phone}
                               onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                               className="w-full bg-white border-2 border-slate-50 focus:border-primary/30 rounded-[1.8rem] h-18 pl-18 pr-8 text-sm font-black outline-none transition-all shadow-sm" required
                             />
                          </div>
                          <div className="relative group">
                             <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
                             <input 
                               type="password" placeholder="รหัสผ่านเข้าใช้งาน" value={password}
                               onChange={(e) => setPassword(e.target.value)}
                               className="w-full bg-white border-2 border-slate-50 focus:border-primary/30 rounded-[1.8rem] h-18 pl-18 pr-8 text-sm font-black outline-none transition-all shadow-sm" required
                             />
                          </div>
                       </div>
                    </div>

                    <button 
                      type="button"
                      onClick={() => {
                        if (!fullName || !phone || !password) { toast.error('กรุณากรอกข้อมูลให้ครบถ้วน'); return; }
                        if (phone.length < 10) { toast.error('เบอร์โทรศัพท์ต้องมี 10 หลัก'); return; }
                        setCurrentStep(2);
                      }}
                      className="w-full h-18 bg-primary text-white rounded-[2rem] font-sans font-black text-sm uppercase  tracking-[0.3em] flex items-center justify-center gap-4 shadow-2xl shadow-primary/30 active:scale-95 transition-all group overflow-hidden relative"
                    >
                      <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-700"></div>
                      ถัดไป: เลือกธนาคาร <Zap className="size-5 text-white fill-white animate-pulse" />
                    </button>
                  </div>
                )}

                {/* Step 2: Financial Node */}
                {currentStep === 2 && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-left-8 duration-500">
                    <div className="space-y-6">
                       <label className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] px-4  leading-none text-center block">เลือกธนาคารหลักที่ใช้รับเงิน</label>
                       
                       <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-4 p-2 max-h-[300px] overflow-y-auto no-scrollbar">
                          {banks.map((bank) => (
                            <button
                              key={bank.code} type="button"
                              onClick={() => setBankCode(bank.code)}
                              className={`p-5 rounded-[2.2rem] border-2 transition-all flex flex-col items-center gap-3 active:scale-90 relative overflow-hidden group ${
                                bankCode === bank.code 
                                ? 'bg-primary border-primary text-white shadow-2xl scale-105 ring-4 ring-primary/20' 
                                : 'bg-white border-slate-50 grayscale opacity-60 hover:opacity-100 hover:grayscale-0 hover:border-primary/20'
                              }`}
                            >
                               <div className="size-14 bg-white rounded-2xl p-1.5 shadow-md overflow-hidden border border-slate-100 flex items-center justify-center relative z-10">
                                  <img 
                                    src={bank.logo_url} 
                                    alt={bank.code} 
                                    className="w-full h-full object-contain"
                                  />
                               </div>
                               <span className="text-[8px] font-black uppercase tracking-tighter text-center leading-none  relative z-10">{bank.name_th}</span>
                               {bankCode === bank.code && (
                                 <div className="absolute top-2 right-2 size-4 bg-primary rounded-full flex items-center justify-center shadow-lg">
                                    <Zap className="size-2 text-white fill-white" />
                                 </div>
                               )}
                            </button>
                          ))}
                       </div>

                       <div className="relative group pt-4">
                          <CreditCard className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
                          <input 
                            type="text" placeholder="ระบุเลขที่บัญชีธนาคาร" value={bankAccount}
                            onChange={(e) => setBankAccount(e.target.value.replace(/\D/g, ''))}
                            className="w-full bg-white border-2 border-slate-50 focus:border-primary/30 rounded-[1.8rem] h-20 pl-18 pr-8 text-xl font-black font-prompt tracking-[0.1em] outline-none transition-all shadow-sm text-center" required
                          />
                       </div>
                    </div>

                    <div className="flex items-center gap-4 px-4 text-center">
                       <input type="checkbox" id="terms" required className="size-5 rounded-lg bg-white border-slate-200 text-primary shadow-sm" />
                       <label htmlFor="terms" className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">ข้าพเจ้ายืนยันว่าข้อมูลธนาคารและชื่อถูกต้องตรงกัน</label>
                    </div>

                    <div className="grid grid-cols-1 gap-4 pt-4">
                       <button 
                         type="submit" disabled={loading}
                         className="w-full h-20 bg-primary text-white rounded-[2.2rem] font-sans font-black text-base uppercase  tracking-[0.25em] flex items-center justify-center gap-4 shadow-2xl shadow-primary/20 active:scale-95 transition-all group overflow-hidden relative"
                       >
                         {loading ? (
                           <div className="size-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                         ) : (
                           <>ยืนยันสมัครสมาชิก <UserPlus className="size-6 text-white" /></>
                         )}
                         <div className="absolute inset-0 bg-white/20 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500"></div>
                       </button>

                       <button 
                         type="button" 
                         onClick={() => setCurrentStep(1)}
                         className="w-full py-4 text-[10px] font-black text-slate-300 uppercase tracking-widest hover:text-slate-900 transition-all  flex items-center justify-center gap-2"
                       >
                         <ChevronLeft size={14} /> ย้อนกลับไปแก้ไขข้อมูลส่วนตัว
                       </button>
                    </div>
                  </div>
                )}
             </form>
          </div>

          <div className="mt-6 text-center bg-white/50 backdrop-blur-xl px-10 py-6 rounded-[2.5rem] border border-slate-50/50 shadow-sm">
             <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest  leading-none">
                เป็นสมาชิกอยู่แล้ว? <Link to="/login" className="text-primary hover:text-slate-900 transition-all ml-2 underline decoration-2 underline-offset-8">เข้าสู่ระบบ</Link>
             </p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Register;

