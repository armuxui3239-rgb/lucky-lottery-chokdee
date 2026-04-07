import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Sparkles, Dices, ChevronLeft, Coins, Trophy, Info } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabase';

const LuckyWheel: React.FC = () => {
   const navigate = useNavigate();
   const { user, refreshProfile } = useAuth();
   const [spinning, setSpinning] = useState(false);
   const [rotation, setRotation] = useState(0);
   const [points, setPoints] = useState(0);

   useEffect(() => {
      if (user) {
         fetchPoints();
      }
   }, [user]);

   const fetchPoints = async () => {
      const { data } = await supabase
         .from('loyalty_points')
         .select('points_balance')
         .eq('user_id', user?.id)
         .maybeSingle();
      if (data) setPoints(data.points_balance);
   };

   const handleSpin = async () => {
      if (spinning) return;
      if (!user) {
         toast.error('กรุณาเข้าสู่ระบบก่อน');
         return;
      }
      if (points < 100) {
         toast.error('แต้มไม่พอ (ต้องการ 100 แต้ม)');
         return;
      }

      setSpinning(true);
      
      // หักแต้ม
      await supabase
         .from('loyalty_points')
         .update({ points_balance: points - 100 })
         .eq('user_id', user.id);
      
      setPoints(prev => prev - 100);

      // สุ่มรางวัล 0, 50, 100, 1000
      const rand = Math.random();
      let prizeAmount = 0;
      let targetRotation = 0;

      if (rand < 0.05) { prizeAmount = 1000; targetRotation = 180; }
      else if (rand < 0.2) { prizeAmount = 100; targetRotation = 90; }
      else if (rand < 0.5) { prizeAmount = 50; targetRotation = 0; }
      else { prizeAmount = 0; targetRotation = 270; }

      const extraSpins = 360 * 5; 
      const finalRotation = rotation - (rotation % 360) + extraSpins + targetRotation;
      
      setRotation(finalRotation);

      setTimeout(async () => {
         setSpinning(false);
         if (prizeAmount > 0) {
            // เพิ่มเงินในกระเป๋า
            const { data: walletData } = await supabase
               .from('wallets')
               .select('balance')
               .eq('user_id', user.id)
               .maybeSingle();
            if (walletData) {
               await supabase
                  .from('wallets')
                  .update({ balance: walletData.balance + prizeAmount })
                  .eq('user_id', user.id);
               refreshProfile();
            }

            toast.success(`ยินดีด้วย! คุณได้รับเครดิตฟรี ${prizeAmount}฿`, {
               icon: '🎉',
               style: {
                  borderRadius: '1.5rem',
                  background: '#ec131e',
                  color: '#fff',
                  fontWeight: 'bold',
                  fontFamily: 'Prompt'
               }
            });
         } else {
            toast('พยายามใหม่อีกครั้ง!', { icon: '😢', style: { fontFamily: 'Prompt' } });
         }
      }, 5000);
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
                  <h1 className="text-xl font-display font-black leading-tight flex-1 text-center pr-10 italic uppercase tracking-widest text-slate-900">กงล้อนำโชค</h1>
               </div>
            </header>

            {/* Hero BG Effect */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
               <div className="absolute top-1/4 -right-20 size-[40rem] bg-primary rounded-full blur-[160px] opacity-10"></div>
               <div className="absolute bottom-1/4 -left-20 size-[40rem] bg-amber-500 rounded-full blur-[160px] opacity-10"></div>
            </div>

            <main className="relative z-10 flex-1 pt-32 pb-44">
               <div className="max-w-4xl mx-auto px-8 flex flex-col items-center justify-center space-y-16">

                  {/* Branding */}
                  <div className="text-center space-y-6 animate-in slide-in-from-top-8 duration-1000">
                     <div className="inline-flex items-center gap-3 px-6 py-2 bg-amber-500/10 rounded-full border border-amber-500/20">
                        <Sparkles className="size-4 text-amber-500" />
                        <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em]">ระบบของรางวัลพรีเมียม</span>
                     </div>
                     <h2 className="text-6xl font-display font-black italic tracking-tighter uppercase leading-none text-slate-900">กงล้อ <span className="text-primary italic">นำโชค</span></h2>
                     <p className="text-slate-400 text-[11px] font-black uppercase tracking-[0.4em]">หมุนกงล้อเพื่อรับโบนัสสุดพิเศษ</p>
                  </div>

                  {/* The Wheel Visual */}
                  <div className="relative group p-8">
                     {/* Outer Glow */}
                     <div className="absolute inset-0 bg-gradient-to-br from-primary via-amber-500 to-primary rounded-full blur-[100px] opacity-10 group-hover:opacity-30 transition-opacity animate-pulse"></div>

                     {/* Spinning Container */}
                     <div className="relative size-80 md:size-[32rem] rounded-full border-[12px] border-amber-400 shadow-2xl p-2 bg-rose-950 shadow-amber-500/20">
                        {/* Decorative LEDs */}
                        {[...Array(24)].map((_, i) => (
                           <div
                              key={i}
                              className="absolute size-2 bg-white rounded-full shadow-[0_0_12px_white] z-20"
                              style={{
                                 left: '50%', top: '2%',
                                 transform: `translateX(-50%) rotate(${i * 15}deg)`,
                                 transformOrigin: '0px calc(16rem - 4px)'
                              }}
                           ></div>
                        ))}

                        {/* The Actual Wheel Content */}
                        <div
                           className="w-full h-full rounded-full overflow-hidden relative border-8 border-white/5"
                           style={{
                              transform: `rotate(${rotation}deg)`,
                              transition: spinning ? 'transform 5s cubic-bezier(0.15, 0, 0.15, 1)' : 'none'
                           }}
                        >
                           {/* Slices */}
                           <svg viewBox="0 0 100 100" className="w-full h-full">
                              <path d="M50 50 L50 0 A50 50 0 0 1 100 50 Z" fill="#ec131e" />
                              <path d="M50 50 L100 50 A50 50 0 0 1 50 100 Z" fill="#1e1b1b" />
                              <path d="M50 50 L50 100 A50 50 0 0 1 0 50 Z" fill="#ffc107" />
                              <path d="M50 50 L0 50 A50 50 0 0 1 50 0 Z" fill="#2d2d2d" />
                           </svg>

                           {/* Text overlays */}
                           <div className="absolute inset-0 flex items-center justify-center">
                              <div className="absolute top-12 font-display font-black text-white text-xl md:text-3xl uppercase italic tracking-tighter">100฿</div>
                              <div className="absolute right-12 top-1/2 -translate-y-1/2 rotate-90 font-display font-black text-white text-xl md:text-3xl uppercase italic tracking-tighter">50฿</div>
                              <div className="absolute bottom-12 font-display font-black text-white text-xl md:text-3xl uppercase italic tracking-tighter">1,000฿</div>
                              <div className="absolute left-12 top-1/2 -translate-y-1/2 -rotate-90 font-display font-black text-primary text-xs md:text-xl uppercase tracking-tighter leading-none text-center italic">ลองดู<br />อีกครั้ง</div>
                           </div>
                        </div>

                        {/* Center Piece */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-20 md:size-28 z-30">
                           <div className="absolute inset-0 bg-white rounded-full shadow-2xl flex items-center justify-center border-[6px] border-amber-400">
                              <Trophy className="size-10 md:size-14 text-primary" />
                           </div>
                        </div>

                        {/* Pointer */}
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-40">
                           <div className="w-8 h-12 bg-primary clip-path-triangle shadow-2xl shadow-primary/40 border-t-2 border-white/20"></div>
                        </div>
                     </div>
                  </div>

                  {/* Points Counter & Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full animate-in slide-in-from-bottom-8 duration-1000">
                     <div className="bg-white p-10 rounded-[3rem] border border-slate-50 shadow-xl shadow-slate-100/50 flex items-center gap-8">
                        <div className="size-16 rounded-[1.5rem] bg-amber-500/10 flex items-center justify-center">
                           <Coins className="size-8 text-amber-500" />
                        </div>
                        <div className="flex flex-col gap-2">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">ยอดแต้มสะสมของคุณ</p>
                           <p className="text-4xl font-display font-black tracking-tighter italic text-slate-900">{points.toLocaleString()} <span className="text-sm text-primary uppercase not-italic">แต้ม</span></p>
                        </div>
                     </div>

                     <div className="bg-primary p-10 rounded-[3rem] shadow-2xl shadow-primary/20 flex items-center gap-8 text-white relative overflow-hidden group">
                        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="size-16 rounded-[1.5rem] bg-white/10 flex items-center justify-center relative z-10">
                           <Info className="size-8 text-white" />
                        </div>
                        <div className="flex flex-col gap-2 relative z-10">
                           <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">กติกาการหมุน</p>
                           <p className="text-sm font-black uppercase tracking-widest italic text-white/80">หมุนละ 100 แต้ม <span className="text-white">•</span> ไม่จำกัดจำนวน</p>
                        </div>
                     </div>
                  </div>
               </div>
            </main>

        <footer className="fixed bottom-20 left-0 right-0 p-8 bg-white/95 backdrop-blur-2xl border-t border-slate-50 z-50">
           <div className="max-w-4xl mx-auto px-4">
                  <button
                     onClick={handleSpin}
                     disabled={spinning}
                     className={`w-full h-20 rounded-[2.5rem] font-display font-black text-2xl uppercase italic tracking-[0.15em] shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-4 relative overflow-hidden group ${spinning
                           ? 'bg-slate-50 text-slate-200 cursor-not-allowed shadow-none'
                           : 'bg-primary text-white shadow-primary/30'
                        }`}
                  >
                     {spinning ? (
                        <span className="flex items-center gap-4">
                           <div className="size-6 border-4 border-white/30 border-t-white animate-spin rounded-full"></div>
                           กำลังหมุน...
                        </span>
                     ) : (
                        <>
                           <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                           เริ่มหมุนกงล้อ
                           <Dices className="size-8 group-hover:rotate-12 transition-transform" />
                        </>
                     )}
                  </button>
               </div>
            </footer>

            <style>{`
          .clip-path-triangle {
            clip-path: polygon(100% 0, 0 0, 50% 100%);
          }
        `}</style>
         </div>
      </div>
   );
};

export default LuckyWheel;
