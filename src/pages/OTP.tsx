import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { toast } from 'react-hot-toast';
import { ShieldCheck, ChevronLeft, Zap, Smartphone, ArrowRight, Lock } from 'lucide-react';

const OTP: React.FC = () => {
  const navigate = useNavigate();
  const { verifyOtp, profile, user } = useAuth();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [isAutoRunning, setIsAutoRunning] = useState(true);

  // Auto-fill and Auto-verify logic as requested
  useEffect(() => {
    if (!user) return;
    
    // Safety check: If already verified, get out!
    if (profile?.is_otp_verified) {
      navigate(profile.password ? "/profile" : "/security/pin", { replace: true });
      return;
    }

    // Guaranteed exactly 6 chars
    const rawId = user.id.replace(/[^a-zA-Z0-9]/g, '');
    const userCode = (rawId.slice(-6) || '000000').toUpperCase().padEnd(6, '0');
    
    // Fill the exact 6 boxes immediately to prevent layout shifts or array expanding
    setOtp(userCode.split(''));
    
    // Auto verify once
    if (isAutoRunning) {
       setLoading(true);
       setTimeout(() => {
         handleVerify(userCode);
       }, 800); // 800ms to let user see the 6 digits beautifully before redirect
    }
  }, [user, profile]);

  const handleVerify = async (fullOtp: string) => {
    setIsAutoRunning(false);
    try {
      const success = await verifyOtp(fullOtp);
      if (success) {
        toast.success('ตรวจสอบความปลอดภัยสำเร็จ - กรุณาตั้งรหัสผ่านความปลอดภัย', {
          icon: '✅',
          style: { borderRadius: '1.5rem', background: '#ec131e', color: '#fff', fontFamily: 'Prompt', fontWeight: 'bold' }
        });
        navigate('/security/pin');
      } else {
        toast.error('รหัสเข้าใช้งานไม่ถูกต้อง');
      }
    } catch (error: any) {
      toast.error('เกิดข้อผิดพลาดในการตรวจสอบ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen text-slate-900 font-prompt animate-in fade-in duration-500 w-full overflow-x-hidden">
      <div className="relative w-full flex flex-col min-h-screen">

        
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-[60] bg-white/90 backdrop-blur-2xl border-b border-slate-50 py-6 px-8 shadow-sm">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <button onClick={() => navigate(-1)} className="size-12 flex items-center justify-center bg-slate-50 text-slate-400 hover:text-primary rounded-2xl transition-all active:scale-90 shadow-sm border border-slate-100">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-base font-sans font-black tracking-[0.2em] uppercase  text-slate-900 leading-none">ยืนยันตัวตนระบบ</h1>
            <div className="size-12"></div>
          </div>
        </header>


        <main className="flex-1 pt-32 pb-44">
          <div className="max-w-2xl mx-auto px-8 flex flex-col items-center justify-center space-y-16">

          
          {/* Animated Verification Shield */}
          <div className="relative">
            <div className={`absolute inset-0 bg-primary/10 blur-3xl rounded-full transition-all duration-1000 ${isAutoRunning ? 'scale-150 opacity-100' : 'scale-100 opacity-0'}`}></div>
            <div className="relative size-32 bg-primary rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-primary/20 group border border-white/5 overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent"></div>
               {loading ? (
                 <div className="size-12 border-4 border-white/10 border-t-primary rounded-full animate-spin"></div>
               ) : (
                 <ShieldCheck className={`w-16 h-16 text-white transition-all duration-500 ${isAutoRunning ? 'animate-pulse' : ''}`} strokeWidth={1} />
               )}
            </div>
            <div className="absolute -bottom-4 right-0 size-10 bg-primary rounded-2xl flex items-center justify-center shadow-xl border-4 border-white">
               <Zap className="size-5 text-white fill-white" />
            </div>
          </div>

          <div className="text-center space-y-3">
            <h2 className="text-3xl font-sans font-black  tracking-tighter uppercase leading-none">รหัสผ่าน <span className="text-primary">OTP</span></h2>
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] leading-relaxed ">
              กำลังเชื่อมต่อกับระบบรักษาความปลอดภัย...<br/>
              เบอร์โทรศัพท์: {profile?.phone || 'เชื่อมต่อด้วยโทรศัพท์'}
            </p>
          </div>

          {/* Luxury OTP Inputs */}
          <div className="flex gap-3 justify-center">
            {otp.map((digit, idx) => (
              <div 
                key={idx}
                className={`size-14 rounded-2xl border-2 flex items-center justify-center text-2xl font-sans font-black  transition-all duration-300 ${
                  digit 
                  ? 'bg-primary border-primary text-white shadow-xl shadow-primary/20 scale-110' 
                  : 'bg-slate-50 border-slate-100 text-slate-200'
                }`}
              >
                {digit}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4 p-6 bg-slate-50 border border-slate-100 rounded-[2rem] w-full group overflow-hidden relative shadow-inner">
             <div className="absolute inset-0 bg-primary/5 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-700"></div>
             <Smartphone className="size-6 text-slate-300 relative z-10" />
             <div className="relative z-10 flex-1">
                <p className="text-[9px] font-black text-slate-900 uppercase tracking-[0.2em] leading-none mb-1">การตรวจสอบภายใน</p>
                <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest leading-none">กำลังพิสูจน์สิทธิ์การเข้าถึงข้อมูล...</p>
             </div>
             <Lock className={`size-4 transition-colors relative z-10 ${loading ? 'text-primary' : 'text-slate-200'}`} />
          </div>
          </div>
        </main>

        <footer className="fixed bottom-20 left-0 right-0 p-8 bg-white/95 backdrop-blur-2xl border-t border-slate-50 z-50">
           <div className="max-w-2xl mx-auto px-4">
              <button 
                disabled={loading}
                className={`w-full h-18 rounded-[2rem] font-sans font-black text-sm uppercase  tracking-[0.3em] shadow-2xl transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-4 ${
                  loading ? 'bg-slate-50 text-slate-200 cursor-not-allowed' : 'bg-primary text-white shadow-primary/20'
                }`}
              >
                 {loading ? 'กำลังตรวจสอบ...' : 'เข้ารหัสความปลอดภัยขั้นสูง'}
                 <ArrowRight className="size-6 text-white" />
              </button>
           </div>
        </footer>

      </div>
    </div>
  );
};

export default OTP;

