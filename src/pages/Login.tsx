import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { useSiteConfig } from '../lib/SiteConfigContext';
import { toast } from 'react-hot-toast';
import { Smartphone, Lock, ShieldCheck, Ticket, Zap } from 'lucide-react';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const { config } = useSiteConfig();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(identifier, password);
      // Wait a slight moment for context to grab latest state
      toast.success(`ยืนยันตัวตนสำเร็จ`, {
        icon: '🛡️',
        style: { borderRadius: '1.5rem', background: '#ec131e', color: '#fff', fontFamily: 'Prompt', fontWeight: 'bold' }
      });
      setTimeout(() => {
        navigate('/otp'); 
      }, 500);
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'ข้อมูลการเข้าใช้งานไม่ถูกต้อง');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen text-slate-900 font-prompt animate-in fade-in duration-500 w-full overflow-x-hidden">
      <div className="relative w-full flex flex-col min-h-screen">

        
        {/* Decorative Background */}
        <div className="absolute top-0 right-0 w-full h-[50vh] bg-gradient-to-b from-slate-50 to-white -z-10"></div>
        <div className="absolute top-[-5%] right-[-10%] size-64 bg-primary/5 rounded-full blur-[100px] animate-pulse"></div>

        <main className="flex-1 flex flex-col items-center justify-center px-8 py-24 relative z-10 w-full max-w-2xl mx-auto">

          
          {/* Elite Branding Area */}
          <div className="mb-16 text-center space-y-6">
             <div className="relative inline-block">
                <div className="absolute inset-0 bg-primary/10 rounded-[2.5rem] blur-3xl scale-150 animate-pulse" />
                <div className="relative size-24 bg-slate-900 rounded-[2.2rem] flex items-center justify-center shadow-2xl rotate-6 border border-white/5 group hover:rotate-0 transition-all duration-700">
                   <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent"></div>
                   <Ticket size={48} className="text-white group-hover:scale-110 transition-transform" strokeWidth={1.5} />
                </div>
             </div>
             <div>
                <h1 className="text-4xl font-display font-black text-slate-900 italic tracking-tighter uppercase leading-none">
                  {config.site_name.split(' ')[0]} <span className="text-primary">{config.site_name.split(' ')[1] || 'หวยดี'}</span>
                </h1>
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] mt-3 italic leading-none">ระบบสมาชิกพรีเมียม</p>
             </div>
          </div>

          {/* Luxury Login Core */}
          <div className="w-full space-y-8 animate-in slide-in-from-bottom-12 duration-1000">
             <form onSubmit={handleLogin} className="space-y-8">
                
                <div className="space-y-4">
                   <label className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] px-4 flex items-center gap-2">
                      <Smartphone className="size-3 text-primary" />
                      เบอร์โทรศัพท์
                   </label>
                   <div className="relative group">
                      <input 
                        type="text" 
                        placeholder="08XXXXXXXX"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        className="w-full bg-slate-50 border-2 border-slate-100 focus:border-primary/40 focus:bg-white rounded-[1.8rem] px-8 py-5 text-sm font-black text-slate-900 outline-none transition-all shadow-inner placeholder:text-slate-200"
                        required
                      />
                   </div>
                </div>

                <div className="space-y-4">
                   <label className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] px-4 flex items-center gap-2">
                      <Lock className="size-3 text-primary" />
                      รหัสผ่านความปลอดภัย
                   </label>
                   <div className="relative group">
                      <input 
                        type="password" 
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-slate-50 border-2 border-slate-100 focus:border-primary/40 focus:bg-white rounded-[1.8rem] px-8 py-5 text-sm font-black text-slate-900 outline-none transition-all shadow-inner placeholder:text-slate-200"
                        required
                      />
                   </div>
                </div>

                <div className="flex justify-end px-4">
                   <button type="button" className="text-[9px] font-black text-primary uppercase tracking-widest hover:text-slate-900 transition-colors italic border-b border-primary/20 pb-0.5">ลืมรหัสผ่าน?</button>
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full h-18 bg-primary hover:bg-rose-700 text-white rounded-[2rem] font-display font-black text-sm uppercase italic tracking-[0.25em] flex items-center justify-center gap-4 shadow-2xl shadow-primary/30 active:scale-95 transition-all group overflow-hidden relative"
                >
                  <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-700"></div>
                  {loading ? (
                    <div className="size-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      เข้าสู่ระบบ
                      <Zap className="size-5 text-white fill-white group-hover:scale-125 transition-transform" />
                    </>
                  )}
                </button>

                <div className="pt-6 text-center">
                   <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-relaxed">
                      ยังไม่มีบัญชี? <Link to="/register" className="text-primary font-black hover:text-slate-900 transition-all ml-2 underline decoration-2 underline-offset-8">สมัครสมาชิกใหม่</Link>
                   </p>
                </div>
             </form>
          </div>
        </main>

        <footer className="p-12 mt-auto flex flex-col items-center gap-6 relative z-10">
           <div className="flex items-center gap-4 px-6 py-3 bg-slate-50 rounded-full border border-slate-100 shadow-sm transition-all hover:bg-white hover:shadow-xl">
              <ShieldCheck size={18} className="text-emerald-500" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic leading-none">ความปลอดภัยขั้นสูง: <span className="text-slate-900">เข้ารหัสข้อมูลระดับสากล SSL 256-BIT</span></p>
           </div>
           <p className="text-[9px] text-slate-100 font-black uppercase tracking-[0.5em] italic">ขับเคลื่อนด้วยระบบเครือข่ายคุณภาพสูง</p>
        </footer>

      </div>
    </div>
  );
};

export default Login;
