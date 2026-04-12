import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { toast } from 'react-hot-toast';
import { 
  User, 
  Settings,
  ShieldCheck, 
  Headphones, 
  LogOut, 
  Plus, 
  Wallet, 
  ChevronRight,
  CreditCard,
  Crown,
  Zap,
  ArrowUpRight,
  Lock,
  Gift,
  Star,
  Users,
  Bell,
  Trophy,
  BookOpen,
  Scale,
  ShieldAlert
} from 'lucide-react';

const MENU_ITEMS = [
  { id: 'orders', label: 'คลังประวัติสลาก', sub: 'ตรวจสอบรายการจอง/ซื้อ', icon: CreditCard, path: '/history' },
  { id: 'promotions', label: 'โปรโมชั่น & กิจกรรม', sub: 'สิทธิพิเศษสำหรับคุณ', icon: Gift, path: '/promotions' },
  { id: 'winners', label: 'ประกาศผลรางวัล', sub: 'ตรวจสอบรายชื่อผู้โชคดี', icon: Trophy, path: '/winners' },
  { id: 'loyalty', label: 'คะแนนสะสม (Loyalty)', sub: 'แลกของรางวัล', icon: Star, path: '/loyalty' },
  { id: 'lucky-wheel', label: 'วงล้อเสี่ยงโชค', sub: 'หมุนวงล้อรับรางวัลฟรี', icon: Zap, path: '/lucky-wheel' },
  { id: 'affiliate', label: 'แนะนำเพื่อน', sub: 'รับค่าคอมมิชชั่น', icon: Users, path: '/affiliate' },
  { id: 'leaderboard', label: 'กระดานผู้นำ', sub: 'อันดับผู้ชนะ', icon: Crown, path: '/leaderboard' },
  { id: 'bank', label: 'บัญชีรับเงิน', sub: 'ตั้งค่าบัญชีรับเงินรางวัล', icon: Settings, path: '/bank-settings' },
  { id: 'security', label: 'รหัสผ่านทำรายการ', sub: 'จัดการรหัสความปลอดภัย', icon: Lock, path: '/security/pin' },
  { id: 'kyc', label: 'ยืนยันตัวตน (KYC)', sub: 'เพิ่มระดับความปลอดภัย', icon: ShieldCheck, path: '/kyc' },
  { id: 'notifications', label: 'การแจ้งเตือน', sub: 'ข่าวสารและอัปเดต', icon: Bell, path: '/notifications' },
  { id: 'guide', label: 'คู่มือการใช้งาน', sub: 'วิธีซื้อและขึ้นเงินรางวัล', icon: BookOpen, path: '/guide' },
  { id: 'rules', label: 'กฎกติกาการใช้งาน', sub: 'ข้อตกลงและเงื่อนไข', icon: Scale, path: '/rules' },
  { id: 'support', label: 'ศูนย์ช่วยเหลือ VIP', sub: 'ติดต่อเจ้าหน้าที่ดูแล 24 ชม.', icon: Headphones, path: '/support' },
];

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, balance, signOut } = useAuth();


  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('ออกจากระบบสำเร็จ - แล้วพบกันใหม่ครับ', {
        icon: '👋',
        style: { borderRadius: '1.5rem', background: '#ec131e', color: '#fff', fontFamily: 'Prompt', fontWeight: 'bold' }
      });
      navigate('/login');
    } catch (error) {
      toast.error('การออกจากระบบล้มเหลว');
    }
  };

  if (!user) {
    return (
      <div className="bg-white min-h-screen flex flex-col items-center justify-center p-12 text-center animate-in fade-in duration-700 font-prompt">
        <div className="size-24 bg-white rounded-[2.5rem] flex items-center justify-center mb-10 text-slate-200 border border-slate-100 shadow-inner">
          <User size={48} strokeWidth={1} />
        </div>
        <h2 className="text-3xl font-sans font-black text-slate-900 uppercase tracking-tighter  leading-none mb-4">ยังไม่ได้ <span className="text-primary">เข้าสู่ระบบ</span></h2>
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-12 max-w-[260px] leading-relaxed">กรุณาเข้าสู่ระบบเพื่อเข้าใช้งานระบบสมาชิกและประวัติการซื้อสลาก</p>
        <div className="w-full max-w-[300px] space-y-5">
          <button
            onClick={() => navigate('/login')}
            className="w-full h-18 bg-slate-900 text-white rounded-[1.8rem] font-sans font-black text-sm uppercase  tracking-[0.3em] shadow-2xl active:scale-95 transition-all"
          >
            เข้าสู่ระบบ
          </button>
          <button
            onClick={() => navigate('/register')}
            className="w-full h-18 bg-white text-slate-300 font-sans font-black text-xs uppercase  tracking-[0.3em] border-2 border-white rounded-[1.8rem] hover:bg-white transition-all shadow-sm"
          >
            สมัครสมาชิกใหม่
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col font-prompt pb-32 animate-in slide-in-from-bottom-4 duration-700 w-full overflow-x-hidden relative">
      {/* Sparkles Overlay (Light) */}
      <div className="absolute inset-0 sparks-light pointer-events-none opacity-20" />
      
      <div className="max-w-5xl mx-auto w-full">
        {/* Elite Profile Header */}
        <section className="px-8 pt-12 pb-14 relative overflow-hidden">

         <div className="absolute top-0 right-0 w-full h-full bg-white -z-10"></div>
         <div className="absolute top-[-5%] right-[-10%] size-64 bg-primary/5 rounded-full blur-[100px]"></div>

         <div className="flex flex-col gap-10">
            <div className="flex justify-between items-center relative z-50">
               <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em] leading-none  pointer-events-none">ข้อมูลสมาชิก</h3>
               <button onClick={handleSignOut} className="size-12 rounded-2xl bg-primary text-white hover:bg-primary-dark transition-all flex items-center justify-center shadow-lg shadow-primary/20 border border-white/10 active:scale-95 cursor-pointer relative z-50">
                  <LogOut size={20} />
               </button>
            </div>

            <div className="flex items-center gap-8">
               <div className="relative group">
                  <div className="absolute inset-0 bg-primary/10 rounded-[2.5rem] blur-2xl scale-125 group-hover:scale-150 transition-transform"></div>
                  <div className="relative size-28 rounded-[2.2rem] border-4 border-white/10 shadow-2xl overflow-hidden rotate-3 hover:rotate-0 transition-transform duration-500 bg-white/5">
                     <img 
                       src={user?.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} 
                       alt="Avatar" 
                       className="w-full h-full object-cover scale-110"
                     />
                  </div>
                  <div className="absolute -bottom-2 -right-2 size-10 bg-yellow-400 text-red-900 rounded-2xl flex items-center justify-center border-4 border-white shadow-xl animate-bounce">
                     <Crown size={20} fill="#7f1d1d" strokeWidth={1} />
                  </div>
               </div>

               <div className="flex flex-col gap-3">
                  <h2 className="text-3xl font-sans font-black text-slate-900 tracking-tighter uppercase  leading-none truncate max-w-[180px]">
                    {profile?.full_name || user?.email?.split('@')[0]}
                  </h2>
                  <div className="flex flex-col gap-1.5">
                     <div className="flex items-center gap-2.5">
                        <div className="size-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse"></div>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest ">{profile?.phone || 'เชื่อมต่อด้วยโทรศัพท์'}</span>
                     </div>
                     <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 text-white w-fit rounded-xl border border-white/10 shadow-lg">
                        <Zap size={10} className="text-primary fill-primary" />
                        <span className="text-[8px] font-black uppercase tracking-[0.2em]">{profile?.role === 'admin' ? 'ผู้ดูแลระบบ' : 'สมาชิกพรีเมียม'}</span>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* Global Balance Bento */}
      <section className="px-8 space-y-8 relative z-30">
         <div className="p-8 rounded-[3rem] bg-white border border-slate-100 shadow-[0_30px_60px_rgba(0,0,0,0.05)] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-full bg-white/50 skew-x-12 translate-x-12 pointer-events-none group-hover:translate-x-6 transition-transform duration-700"></div>
            
            <div className="flex flex-col gap-3 relative z-10">
               <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] ">ยอดเงินรวม</span>
               <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-sans font-black text-slate-900 tracking-tighter">{balance?.toLocaleString() || '0'}</span>
                  <span className="text-sm font-black text-primary uppercase ">บาท</span>
               </div>

               <div className="mt-6 flex items-center gap-3">
                  <button 
                    onClick={() => navigate('/deposit')}
                    className="flex-1 h-14 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest  shadow-xl shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-3"
                  >
                    เติมเงิน <Plus size={14} strokeWidth={3} />
                  </button>
                  <button 
                    onClick={() => navigate('/deposit')}
                    className="size-14 bg-white text-slate-300 hover:text-slate-900 rounded-2xl flex items-center justify-center border border-slate-100 transition-all active:scale-90"
                  >
                    <ArrowUpRight size={20} />
                  </button>
               </div>
            </div>
            <Wallet className="absolute -left-6 -bottom-6 size-32 text-slate-50 -rotate-12 opacity-50 pointer-events-none" />
         </div>

         {/* Elite Controls List */}
         <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
               <h3 className="text-lg font-sans font-black text-slate-900 uppercase  tracking-tighter leading-none">ความปลอดภัยและการตั้งค่า</h3>
               <div className="flex items-center gap-1.5 text-emerald-500 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100 ">
                  <ShieldCheck size={12} />
                  <span className="text-[8px] font-black uppercase tracking-widest  leading-none">ปกป้องอยู่</span>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pb-2">
               {MENU_ITEMS.map((item) => (
                 <button
                   key={item.id}
                   onClick={() => navigate(item.path)}
                   className="w-full flex items-center p-3 sm:p-4 bg-white rounded-[1.5rem] border border-slate-100 shadow-sm hover:shadow-md hover:border-red-100 transition-all group gap-3"
                 >
                   <div className="flex-shrink-0 size-10 sm:size-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-red-50 group-hover:text-primary transition-all border border-slate-100/50">
                      <item.icon size={18} strokeWidth={2} className="sm:scale-110" />
                   </div>
                   <div className="flex flex-col text-left overflow-hidden w-full">
                      <div className="flex items-center justify-between w-full gap-1">
                         <span className="text-[9px] sm:text-[10px] font-black text-slate-900 uppercase tracking-widest group-hover:text-primary transition-colors  leading-none truncate">{item.label}</span>
                         <ChevronRight size={12} className="text-slate-300 group-hover:text-slate-900 transition-all flex-shrink-0 -mr-1" />
                      </div>
                      <span className="text-[7px] sm:text-[8px] font-black text-slate-400 uppercase tracking-widest truncate mt-1 leading-none">{item.sub}</span>
                   </div>
                 </button>
               ))}
            </div>
         </div>

         {/* Support Node Bento (Premium White) */}
         <div className="p-8 rounded-[2.5rem] bg-white border border-slate-100 text-slate-900 flex items-center justify-between group overflow-hidden relative shadow-xl mt-8">
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            
            <div className="space-y-3 relative z-10">
               <h4 className="text-lg font-sans font-black text-slate-900  tracking-tighter uppercase leading-none">มีปัญหา <span className="text-primary">ปรึกษาเรา!</span></h4>
               <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.4em]  leading-none">ทีมงานช่วยเหลือพรีเมียมพร้อมดูแลตลอด 24 ชม.</p>
            </div>
            
            <button 
              onClick={() => navigate('/support')}
              className="size-14 bg-primary text-white rounded-[1.5rem] flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all relative z-10"
            >
               <Headphones size={24} strokeWidth={2.5} />
            </button>
         </div>
        </section>
      </div>
    </div>
  );
};


export default Profile;

