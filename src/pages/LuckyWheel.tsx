import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Sparkles, Dices, ChevronLeft, Coins, Trophy, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
      
      await supabase
         .from('loyalty_points')
         .update({ points_balance: points - 100 })
         .eq('user_id', user.id);
      
      setPoints(prev => prev - 100);

      const rand = Math.random();
      let prizeAmount = 0;
      let targetRotation = 0;

      // Prize angles (assuming 4 segments)
      // 0: 50B, 90: 100B, 180: 1000B, 270: Try again
      if (rand < 0.05) { prizeAmount = 1000; targetRotation = 180; }
      else if (rand < 0.2) { prizeAmount = 100; targetRotation = 90; }
      else if (rand < 0.5) { prizeAmount = 50; targetRotation = 0; }
      else { prizeAmount = 0; targetRotation = 270; }

      const extraSpins = 360 * 8; 
      const finalRotation = rotation + extraSpins + (360 - (rotation % 360)) + targetRotation;
      
      setRotation(finalRotation);

      setTimeout(async () => {
         setSpinning(false);
         if (prizeAmount > 0) {
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
      <div className="bg-[#0f0f12] min-h-screen text-slate-900 font-prompt animate-in fade-in duration-500 w-full overflow-x-hidden">
         <div className="relative w-full flex flex-col min-h-screen">

            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-[#0f0f12]/80 backdrop-blur-2xl border-b border-white/5 py-6 px-8">
               <div className="max-w-4xl mx-auto flex items-center justify-between">
                  <button onClick={() => navigate(-1)} className="text-white flex size-12 items-center justify-center hover:bg-white/5 rounded-2xl transition-all active:scale-95 border border-white/5">
                     <ChevronLeft className="w-6 h-6" />
                  </button>
                  <h1 className="text-xl font-sans font-black leading-tight flex-1 text-center pr-12 uppercase tracking-[0.2em] text-white">กงล้อนำโชค</h1>
               </div>
            </header>

            {/* Premium Background Effects */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
               <div className="absolute top-1/4 -right-20 size-[50rem] bg-primary rounded-full blur-[180px] opacity-10 animate-pulse"></div>
               <div className="absolute bottom-1/4 -left-20 size-[50rem] bg-amber-500 rounded-full blur-[180px] opacity-10 animate-pulse" style={{ animationDelay: '1s' }}></div>
               <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
            </div>

            <main className="relative z-10 flex-1 pt-32 pb-44">
               <div className="max-w-4xl mx-auto px-8 flex flex-col items-center justify-center space-y-20">

                  {/* Branding */}
                  <div className="text-center space-y-6">
                     <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-3 px-6 py-2 bg-amber-500/10 rounded-full border border-amber-500/20"
                     >
                        <Sparkles className="size-4 text-amber-500" />
                        <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em]">PRO SPIN SYSTEM V2.0</span>
                     </motion.div>
                     <motion.h2 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-6xl md:text-8xl font-sans font-black tracking-tighter uppercase leading-none text-white drop-shadow-2xl"
                     >
                        LUCKY <span className="text-primary tracking-tighter">WHEEL</span>
                     </motion.h2>
                  </div>

                  {/* 3D Wheel Section */}
                  <div className="relative perspective-[2000px] w-full flex justify-center py-10">
                     
                     {/* 3D Platform Base */}
                     <div className="absolute bottom-[-2rem] size-96 bg-black/40 rounded-full blur-3xl transform rotateX(75deg)"></div>

                     <motion.div 
                        className="relative z-10"
                        style={{ rotateX: 15 }}
                     >
                        {/* Outer Ring LED Effect */}
                        <div className="absolute inset-[-20px] rounded-full bg-gradient-to-br from-amber-400 via-primary to-rose-900 blur-md opacity-30 animate-pulse"></div>
                        
                        {/* Wheel Container */}
                        <div className="relative size-80 md:size-[36rem] rounded-full border-[15px] border-[#1a1a20] shadow-[0_45px_100px_rgba(0,0,0,0.8)] p-2 bg-[#0a0a0c] overflow-visible">
                           
                           {/* Decorative Golden Outer Rim */}
                           <div className="absolute inset-[-5px] rounded-full border-4 border-amber-500/30 z-10 pointer-events-none"></div>

                           {/* LEDs */}
                           {[...Array(36)].map((_, i) => (
                              <div
                                 key={i}
                                 className={`absolute size-1.5 rounded-full z-20 transition-all duration-300 ${spinning ? 'bg-white shadow-[0_0_15px_white]' : 'bg-white/20'}`}
                                 style={{
                                    left: '50%', top: '1%',
                                    transform: `translateX(-50%) rotate(${i * 10}deg)`,
                                    transformOrigin: '0 calc(18rem - 3.5px)',
                                    animation: spinning ? `blink 0.5s infinite ${i * 0.05}s` : 'none'
                                 }}
                              ></div>
                           ))}

                           {/* The Spinning Wheel */}
                           <motion.div
                              className="w-full h-full rounded-full overflow-hidden relative shadow-inner"
                              animate={{ rotate: rotation }}
                              transition={{ duration: 5, ease: [0.15, 0, 0.15, 1] }}
                           >
                              {/* Layered Slices with Premium Gradients */}
                              <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl">
                                 <defs>
                                    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                                       <stop offset="0%" stopColor="#ec131e" />
                                       <stop offset="100%" stopColor="#990000" />
                                    </linearGradient>
                                    <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
                                       <stop offset="0%" stopColor="#1a1a1e" />
                                       <stop offset="100%" stopColor="#000000" />
                                    </linearGradient>
                                    <linearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="100%">
                                       <stop offset="0%" stopColor="#ffc107" />
                                       <stop offset="100%" stopColor="#cc9900" />
                                    </linearGradient>
                                 </defs>
                                 <path d="M50 50 L50 0 A50 50 0 0 1 100 50 Z" fill="url(#grad1)" stroke="#ffffff0a" strokeWidth="0.2" />
                                 <path d="M50 50 L100 50 A50 50 0 0 1 50 100 Z" fill="url(#grad2)" stroke="#ffffff0a" strokeWidth="0.2" />
                                 <path d="M50 50 L50 100 A50 50 0 0 1 0 50 Z" fill="url(#grad3)" stroke="#ffffff0a" strokeWidth="0.2" />
                                 <path d="M50 50 L0 50 A50 50 0 0 1 50 0 Z" fill="#222228" stroke="#ffffff0a" strokeWidth="0.2" />
                              </svg>

                              {/* Prize Text with Depth */}
                              <div className="absolute inset-0 flex items-center justify-center">
                                 <div className="absolute top-16 md:top-24 font-sans font-black text-white text-2xl md:text-5xl uppercase tracking-tighter drop-shadow-md">100฿</div>
                                 <div className="absolute right-16 md:right-24 top-1/2 -translate-y-1/2 rotate-90 font-sans font-black text-white text-2xl md:text-5xl uppercase tracking-tighter drop-shadow-md">50฿</div>
                                 <div className="absolute bottom-16 md:bottom-24 font-sans font-black text-[#1a1a1e] text-2xl md:text-5xl uppercase tracking-tighter drop-shadow-md">1,000฿</div>
                                 <div className="absolute left-16 md:left-24 top-1/2 -translate-y-1/2 -rotate-90 font-sans font-black text-primary text-sm md:text-2xl uppercase tracking-tight leading-none text-center">SPIN<br />AGAIN</div>
                              </div>
                           </motion.div>

                           {/* Center Piece (3D Spherical Look) */}
                           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-24 md:size-36 z-30">
                              <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-200 to-slate-400 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-center border-[8px] border-[#1a1a20]">
                                 <div className="size-full rounded-full bg-gradient-to-tr from-transparent via-white/50 to-transparent absolute"></div>
                                 <Trophy className="size-10 md:size-16 text-primary drop-shadow-lg" />
                              </div>
                           </div>

                           {/* Pointer (Chrome Finish) */}
                           <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-40">
                              <div className="w-10 h-16 bg-gradient-to-b from-primary to-rose-950 clip-path-triangle shadow-[0_15px_30px_rgba(236,19,30,0.4)] border-t border-white/30 relative">
                                 <div className="absolute inset-0 bg-white/10 blur-[2px]"></div>
                              </div>
                           </div>
                        </div>
                     </motion.div>
                  </div>

                  {/* Points Counter & Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                     <motion.div 
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        className="bg-white/5 backdrop-blur-3xl p-10 rounded-[3rem] border border-white/5 shadow-2xl flex items-center gap-8 relative overflow-hidden group"
                     >
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="size-20 rounded-[2rem] bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                           <Coins className="size-10 text-amber-500" />
                        </div>
                        <div className="flex flex-col gap-2">
                           <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">YOU CURRENT BALANCE</p>
                           <p className="text-4xl font-sans font-black tracking-tighter text-white">{points.toLocaleString()} <span className="text-sm text-primary uppercase">PTS</span></p>
                        </div>
                     </motion.div>

                     <motion.div 
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        className="bg-primary p-10 rounded-[3rem] shadow-2xl shadow-primary/20 flex items-center gap-8 text-white relative overflow-hidden group"
                     >
                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="size-20 rounded-[2rem] bg-white/10 flex items-center justify-center relative z-10 border border-white/20">
                           <Info className="size-10 text-white" />
                        </div>
                        <div className="flex flex-col gap-2 relative z-10">
                           <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">SPIN PROTOCOL</p>
                           <p className="text-sm font-black uppercase tracking-[0.2em] text-white">100 POINTS PER SPIN <span className="text-white/30 mx-2">•</span> NO LIMITS</p>
                        </div>
                     </motion.div>
                  </div>
               </div>
            </main>

            <footer className="fixed bottom-0 left-0 right-0 p-8 pt-4 pb-12 bg-[#0f0f12]/95 backdrop-blur-2xl border-t border-white/5 z-50">
               <div className="max-w-4xl mx-auto">
                  <button
                     onClick={handleSpin}
                     disabled={spinning}
                     className={`w-full h-20 rounded-[2.5rem] font-sans font-black text-2xl uppercase tracking-[0.2em] shadow-[0_20px_60px_rgba(0,0,0,0.3)] transition-all active:scale-95 flex items-center justify-center gap-4 relative overflow-hidden group ${spinning
                           ? 'bg-white/5 text-white/20 cursor-not-allowed'
                           : 'bg-primary text-white shadow-primary/30 hover:shadow-primary/50'
                        }`}
                  >
                     {spinning ? (
                        <span className="flex items-center gap-4 animate-pulse">
                           SYSTEM SPINNING...
                        </span>
                     ) : (
                        <>
                           <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                           SPIN THE WHEEL
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
               @keyframes blink {
                  0%, 100% { opacity: 0.2; }
                  50% { opacity: 1; filter: brightness(1.5) blur(1px); }
               }
            `}</style>
         </div>
      </div>
   );
};

export default LuckyWheel;
