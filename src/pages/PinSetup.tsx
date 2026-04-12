import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { toast } from 'react-hot-toast';
import { ChevronLeft, ShieldCheck, Lock, Shield, Zap } from 'lucide-react';

const PinSetup: React.FC = () => {
  const navigate = useNavigate();
  const { setPin, profile } = useAuth();
  const [securityPassword, setSecurityPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [loading, setLoading] = useState(false);
  
  // Instant Persistence Check
  React.useEffect(() => {
    if (profile?.password) {
      navigate('/profile', { replace: true });
    }
  }, [profile, navigate]);
  
  const handleConfirm = async () => {
    if (!securityPassword || securityPassword.length < 4) {
      toast.error('กรุณาระบุรหัสผ่านความปลอดภัยอย่างน้อย 4 หลัก');
      return;
    }
    if (securityPassword !== confirmPassword) {
      toast.error('รหัสผ่านไม่ตรงกัน กรุณาตรวจสอบอีกครั้ง');
      return;
    }
    
    setLoading(true);
    try {
      await setPin(securityPassword);
      toast.success('ตั้งค่ารหัสผ่านความปลอดภัยสำเร็จ', {
        icon: '🛡️',
        style: { borderRadius: '1.5rem', background: '#ec131e', color: '#fff', fontFamily: 'Prompt', fontWeight: 'bold' }
      });
      navigate('/profile');
    } catch (err: any) {
      toast.error(err.message || 'เกิดข้อผิดพลาดในการบันทึกรหัสผ่าน');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen text-slate-900 font-prompt animate-in fade-in duration-500 w-full overflow-x-hidden">
      <div className="relative w-full flex flex-col min-h-screen">
        
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-2xl border-b border-slate-50 py-6 px-8">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <button onClick={() => navigate(-1)} className="text-slate-900 flex size-10 items-center justify-center hover:bg-slate-50 rounded-full transition-all active:scale-95">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-sans font-black leading-tight flex-1 text-center pr-10  uppercase tracking-widest text-slate-900">ความปลอดภัย</h1>
          </div>
        </header>

        <main className="flex-1 pt-32 pb-44 px-8">
          <div className="max-w-2xl mx-auto flex flex-col items-center justify-center space-y-12">
            
            {/* Branding & Status */}
            <div className="text-center space-y-6 animate-in slide-in-from-top-8 duration-1000 w-full">
               <div className="relative mb-8 flex justify-center">
                  <div className="absolute inset-0 bg-primary/10 blur-[80px] rounded-full scale-150 animate-pulse"></div>
                  <div className="relative size-24 bg-primary rounded-[2.5rem] flex items-center justify-center shadow-2xl border border-white/5 transition-transform hover:scale-110 duration-700">
                     <ShieldCheck className="text-white w-10 h-10" strokeWidth={1.5} />
                  </div>
               </div>
               <h3 className="text-5xl md:text-6xl font-sans font-black  tracking-tighter uppercase leading-none text-slate-900">
                  ตั้งค่ารหัส <span className="text-primary ">ผ่านรายการ</span>
               </h3>
               <p className="text-slate-400 text-[11px] font-black uppercase tracking-[0.4em] max-w-sm mx-auto leading-relaxed">กรุณากำหนดรหัสผ่านความปลอดภัย เพื่อใช้ยืนยันการทำธุรกรรมทางการเงิน</p>
            </div>

            {/* Password Input Form */}
            <div className="w-full space-y-8 animate-in zoom-in duration-500 bg-slate-50/50 p-10 rounded-[3.5rem] border border-slate-100 shadow-inner">
               <div className="space-y-6">
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] px-6">รหัสผ่านความปลอดภัยใหม่</label>
                     <div className="relative group">
                        <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
                        <input 
                           type="password"
                           placeholder="ระบุรหัสผ่านใหม่"
                           value={securityPassword}
                           onChange={(e) => setSecurityPassword(e.target.value)}
                           className="w-full bg-white border-2 border-slate-50 focus:border-primary/30 rounded-[1.8rem] h-20 pl-18 pr-8 text-xl font-black font-prompt outline-none transition-all shadow-sm text-center"
                        />
                     </div>
                  </div>

                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] px-6">ยืนยันรหัสผ่านอีกครั้ง</label>
                     <div className="relative group">
                        <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
                        <input 
                           type="password"
                           placeholder="ยืนยันรหัสผ่านอีกครั้ง"
                           value={confirmPassword}
                           onChange={(e) => setConfirmPassword(e.target.value)}
                           className="w-full bg-white border-2 border-slate-50 focus:border-primary/30 rounded-[1.8rem] h-20 pl-18 pr-8 text-xl font-black font-prompt outline-none transition-all shadow-sm text-center"
                        />
                     </div>
                  </div>
               </div>

               <div className="bg-primary p-8 rounded-[2.5rem] shadow-2xl shadow-primary/20 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-6 opacity-10">
                     <Shield className="text-white size-20" />
                  </div>
                  <div className="relative z-10 flex flex-col gap-4">
                     <div className="flex items-center gap-3">
                        <Zap className="size-4 text-amber-400 fill-amber-400" />
                        <span className="text-[9px] font-black text-white uppercase tracking-widest ">ระดับการป้องกัน: สูงสุด</span>
                     </div>
                     <p className="text-white/60 text-[9px] font-black uppercase tracking-widest leading-none">รหัสผ่านนี้จะถูกเข้ารหัสและใช้ยืนยันการทำธุรกรรมเท่านั้น</p>
                  </div>
               </div>
            </div>

          </div>
        </main>

        <footer className="fixed bottom-20 left-0 right-0 p-8 bg-white/95 backdrop-blur-2xl border-t border-slate-50 z-50">
           <div className="max-w-2xl mx-auto px-4">
              <button 
                onClick={handleConfirm}
                disabled={loading || !securityPassword || securityPassword !== confirmPassword}
                className={`w-full h-20 rounded-[2.5rem] font-sans font-black text-2xl uppercase  tracking-[0.15em] shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-4 ${
                  loading || !securityPassword || securityPassword !== confirmPassword
                    ? 'bg-slate-50 text-slate-200 cursor-not-allowed shadow-none' 
                    : 'bg-primary text-white shadow-primary/30 group'
                }`}
              >
                {loading ? (
                   <div className="size-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>บันทึกรหัสผ่าน</span>
                    <Zap className="size-6 transition-transform group-hover:scale-125" />
                  </>
                )}
              </button>
           </div>
        </footer>
      </div>
    </div>
  );
};

export default PinSetup;

