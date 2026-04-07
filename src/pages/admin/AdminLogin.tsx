import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/AuthContext';
import { Lock, Mail, Shield, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';

const AdminLogin = () => {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@chokdee.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(email, password);
      toast.success('เข้าสู่ระบบสำเร็จ! ✅', {
        style: { borderRadius: '1.5rem', background: '#1e293b', color: '#fff' }
      });
      // Important: even on success, we might want to clear loading if navigation is delayed
      setTimeout(() => navigate('/admin'), 600);
    } catch (error: any) {
      console.error('Admin Login Error:', error);
      toast.error('รหัสผ่านไม่ถูกต้อง: ' + error.message, {
        style: { background: '#1e293b', color: '#f87171', borderRadius: '1.5rem' }
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-prompt flex items-center justify-center p-6 w-full relative overflow-hidden">
      {/* BG Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/8 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-20 right-20 w-64 h-64 bg-red-900/10 blur-[80px] rounded-full pointer-events-none" />

      <div className="w-full max-w-sm relative z-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

        {/* Logo */}
        <div className="text-center space-y-4">
          <div className="size-20 bg-red-500/10 border border-red-500/20 rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl shadow-red-900/20">
            <Shield size={36} className="text-red-500" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-black tracking-tighter uppercase italic text-white">
              แอดมิน<span className="text-red-500">พอร์ทัล</span>
            </h1>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mt-2">
              🔒 เฉพาะผู้ดูแลระบบ
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleAdminLogin} className="bg-slate-900/60 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/5 shadow-2xl space-y-5">

          {/* Default credentials hint */}
          <div className="bg-slate-800/60 rounded-2xl p-4 border border-slate-700/50 space-y-1.5">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">ข้อมูลเข้าระบบ</p>
            <p className="text-[11px] text-slate-300 font-mono">📧 admin@chokdee.com</p>
            <p className="text-[11px] text-slate-300 font-mono">🔑 Admin@123456</p>
            <p className="text-[9px] text-amber-500 font-black mt-1">⚠️ เปลี่ยนรหัสผ่านหลังเข้าระบบครั้งแรก</p>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
              <Mail size={11} className="text-red-500" /> อีเมลแอดมิน
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@chokdee.com"
              className="w-full bg-slate-950/60 border border-white/10 focus:border-red-500/50 rounded-2xl px-5 py-4 text-sm outline-none transition-all text-white placeholder:text-slate-700"
              required
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
              <Lock size={11} className="text-red-500" /> รหัสผ่าน
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••"
                className="w-full bg-slate-950/60 border border-white/10 focus:border-red-500/50 rounded-2xl px-5 py-4 pr-12 text-sm outline-none transition-all text-white placeholder:text-slate-700 tracking-widest"
                required
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 bg-red-600 hover:bg-red-500 active:scale-95 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all disabled:opacity-50 shadow-xl shadow-red-900/30 mt-2"
          >
            {loading ? (
              <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>เข้าสู่ระบบแอดมิน <ArrowRight size={16} /></>
            )}
          </button>
        </form>

        <p className="text-center text-[10px] text-slate-700 font-black uppercase tracking-widest">
          ล็อตเตอรี่โชคดี © 2568 · Admin Portal v2.0
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
