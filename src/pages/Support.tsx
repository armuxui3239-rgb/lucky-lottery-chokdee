import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, HelpCircle, ChevronLeft, ChevronRight, Send, ShieldCheck, Zap, Star } from 'lucide-react';
import { useSiteConfig } from '../lib/SiteConfigContext';

const LineIcon = () => (
  <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current">
    <path d="M24 10.304c0-4.579-5.383-8.304-12-8.304s-12 3.725-12 8.304c0 4.105 4.27 7.541 10.048 8.191.391.085.923.258 1.058.591.121.303.079.778.039 1.085l-.171 1.027c-.052.303-.242 1.186 1.046.648 1.284-.538 6.916-4.072 9.436-6.969 1.74-1.998 2.544-3.922 2.544-5.573zm-15.11 3.528h-1.637c-.31 0-.562-.252-.562-.561V9.456c0-.311.252-.562.562-.562.311 0 .563.251.563.562v3.251h1.074c.311 0 .562.252.562.563 0 .31-.251.562-.562.562zm2.981-.137c0 .324-.226.561-.561.561h-.01c-.316 0-.56-.237-.56-.561V9.433c0-.324.226-.562.56-.562h.01c.324 0 .561.238.561.562v4.262zm3.931 0c0 .178-.079.336-.208.441a.573.573 0 0 1-.353.12c-.172 0-.322-.078-.429-.199l-1.921-2.457v2.095c0 .311-.252.563-.563.563-.311 0-.562-.252-.562-.563V9.456c0-.311.251-.562.562-.562.179 0 .337.079.442.208.01.011.021.022.03.033l1.902 2.434V9.456c0-.311.252-.562.563-.562.311 0 .562.251.562.562v4.259zm4.073-2.585h-1.074v1.074c0 .311-.252.563-.562.563-.311 0-.562-.252-.562-.563V9.456c0-.311.251-.562.562-.562.311 0 1.636 0 1.636 0 .311 0 .563.251.563.562 0 .31-.252.562-.563.562h-1.074v1.074h1.074c.311 0 .563.251.563.562 0 .31-.252.563-.563.563z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const Support: React.FC = () => {
  const navigate = useNavigate();
  const { config } = useSiteConfig();

  const faqs = [
    { q: 'วิธีซื้อสลากต้องทำอย่างไร?', a: 'เลือกเลขที่คุณต้องการ เพิ่มลงตะกร้า และชำระเงินผ่านระบบ QR ได้ทันที' },
    { q: 'ใช้เวลานานเท่าไหร่ในการรับเงิน?', a: 'ระบบจ่ายรางวัลเป็นแบบอัตโนมัติ คุณจะได้รับเงินภายใน 1-5 นาทีหลังจากแจ้งถอน' },
    { q: 'ระบบมีความปลอดภัยแค่ไหน?', a: 'เราใช้ระบบรักษาความปลอดภัยระดับธนาคาร (AES-256) เพื่อปกป้องข้อมูลส่วนบุคคลและการเงินของคุณ' },
  ];

  return (
    <div className="bg-white min-h-screen text-slate-900 font-prompt animate-in fade-in duration-500 w-full overflow-x-hidden">
      <div className="relative w-full flex flex-col min-h-screen">
        
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-[60] bg-white/90 backdrop-blur-2xl border-b border-slate-50 py-6 px-8 shadow-sm">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <button onClick={() => navigate(-1)} className="size-12 flex items-center justify-center bg-slate-50 text-slate-400 hover:text-primary rounded-2xl transition-all active:scale-90 shadow-sm border border-slate-100">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-base font-sans font-black tracking-[0.2em] uppercase text-slate-900 leading-none">ศูนย์ช่วยเหลือ</h1>
            <div className="size-12"></div>
          </div>
        </header>

        <main className="flex-1 pt-32 pb-44">
          <div className="max-w-4xl mx-auto px-8 space-y-16">
            
            {/* Support Hero Section */}
            <section className="text-center space-y-6">
               <div className="flex justify-center flex-col items-center gap-6">
                  <div className="size-24 rounded-[2.5rem] bg-primary/5 flex items-center justify-center border border-primary/10 shadow-2xl relative">
                     <div className="absolute inset-0 bg-primary/5 blur-2xl rounded-full animate-pulse"></div>
                     <Send className="w-12 h-12 text-primary relative z-10" />
                  </div>
                  <div className="space-y-3">
                     <h2 className="text-3xl font-sans font-black tracking-tighter uppercase leading-none text-slate-900">ทีมงานผู้เชี่ยวชาญ</h2>
                     <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest max-w-[220px] mx-auto leading-relaxed">ทีมงานที่ผ่านการตรวจสอบของเราพร้อมดูแลคุณตลอด 24 ชั่วโมง</p>
                  </div>
               </div>
            </section>

            {/* High-Velocity Communication Nodes */}
            <section className="space-y-5 animate-in fade-in slide-in-from-bottom duration-700">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <button 
                    onClick={() => config.line_url && window.open(config.line_url, '_blank')}
                    className="p-10 rounded-[3rem] bg-slate-50 border border-slate-100 flex flex-col items-center gap-6 group transition-all hover:bg-primary active:scale-95 shadow-inner"
                  >
                     <div className="size-14 rounded-2xl bg-white text-[#06C755] flex items-center justify-center shadow-2xl group-hover:bg-white group-hover:text-[#06C755] transition-all group-hover:scale-110">
                        <LineIcon />
                     </div>
                      <div className="space-y-1">
                         <p className="text-[10px] font-black uppercase tracking-widest group-hover:text-white transition-colors leading-none text-slate-900">ช่องทางไลน์ทางการ</p>
                         <p className="text-[8px] font-black text-[#06C755] uppercase tracking-widest leading-none group-hover:text-white/60">@lottochokdee</p>
                      </div>
                  </button>
                  <button 
                    onClick={() => config.facebook_url && window.open(config.facebook_url, '_blank')}
                    className="p-10 rounded-[3rem] bg-slate-50 border border-slate-100 flex flex-col items-center gap-6 group transition-all hover:bg-primary active:scale-95 shadow-inner"
                  >
                     <div className="size-14 rounded-2xl bg-white text-[#1877F2] flex items-center justify-center shadow-2xl group-hover:bg-white group-hover:text-[#1877F2] transition-all group-hover:scale-110">
                        <FacebookIcon />
                     </div>
                      <div className="space-y-1">
                         <p className="text-[10px] font-black uppercase tracking-widest group-hover:text-white transition-colors leading-none text-slate-900">เฟซบุ๊กแฟนเพจ</p>
                         <p className="text-[8px] font-black text-[#1877F2] uppercase tracking-widest leading-none group-hover:text-white/60">{config.site_name || 'ล็อตเตอรี่ โชคดี'}</p>
                      </div>
                  </button>
               </div>
               
               <button 
                onClick={() => window.location.href = 'mailto:support@lotto-chokdee.com'}
                className="w-full h-18 bg-white border border-slate-100 rounded-[2.5rem] px-10 flex items-center gap-5 hover:bg-slate-50 transition-all active:scale-95 group shadow-xl shadow-black/5"
               >
                  <div className="size-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-white transition-colors shadow-inner shrink-0">
                    <Mail className="size-5 text-slate-300 group-hover:text-primary transition-colors" />
                  </div>
                  <div className="flex-1 text-left">
                     <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 leading-none">ติดต่อผ่านอีเมลทางการ</p>
                     <p className="text-[9px] font-black text-slate-800 uppercase tracking-widest mt-1.5 leading-none">support@lotto-chokdee.com</p>
                  </div>
                  <ChevronRight className="size-5 text-slate-100 group-hover:text-slate-900" />
               </button>
            </section>

            {/* Luxury Intelligence FAQ (White) */}
            <section className="space-y-8">
               <div className="flex items-center gap-4 px-1">
                  <div className="w-2 h-8 bg-primary rounded-full shadow-2xl shadow-primary/40"></div>
                  <div className="space-y-1">
                     <h3 className="text-xl font-sans font-black uppercase tracking-tighter text-slate-900 leading-none">ศูนย์ข้อมูลความรู้</h3>
                     <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest leading-none">คำถามที่พบบ่อย</p>
                  </div>
               </div>

               <div className="space-y-6">
                  {faqs.map((faq, i) => (
                     <div key={i} className="p-8 rounded-[3rem] bg-white border border-slate-50 space-y-4 shadow-sm hover:border-primary/20 transition-all group cursor-help">
                        <div className="flex items-start gap-5">
                           <div className="size-10 rounded-2xl bg-primary/5 text-primary flex items-center justify-center shrink-0 border border-primary/10 group-hover:scale-110 transition-transform">
                              <HelpCircle className="size-5" />
                           </div>
                           <div>
                              <h4 className="text-xs font-sans font-black text-slate-900 uppercase leading-relaxed tracking-tight">{faq.q}</h4>
                              <p className="text-[10px] font-black text-slate-800 leading-relaxed mt-3 uppercase tracking-widest group-hover:text-slate-500 transition-colors">{faq.a}</p>
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            </section>

            {/* Compliance & Trust Badges */}
            <section className="pt-10 pb-20 flex justify-between gap-6 border-t border-slate-100 mx-auto w-full max-w-sm">
               <div className="flex flex-col items-center gap-3 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer text-slate-900">
                  <ShieldCheck className="size-10 text-primary" strokeWidth={1} />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] leading-none">ปลอดภัย</span>
               </div>
               <div className="flex flex-col items-center gap-3 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer text-slate-900">
                  <Zap className="size-10 text-amber-500" strokeWidth={1} />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] leading-none">รวดเร็ว</span>
               </div>
               <div className="flex flex-col items-center gap-3 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer text-slate-900">
                  <Star className="size-10 text-slate-900" strokeWidth={1} />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] leading-none">มืออาชีพ</span>
               </div>
            </section>
          </div>
        </main>

        <footer className="fixed bottom-20 left-0 right-0 p-8 bg-white/95 backdrop-blur-2xl border-t border-slate-50 z-50">
           <div className="max-w-4xl mx-auto px-4">
              <button 
                onClick={() => config.line_url && window.open(config.line_url, '_blank')}
                className="w-full h-18 bg-primary text-white rounded-[2rem] font-sans font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-red-200 flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-95 transition-all"
              >
                 เริ่มแชทสดกับพนักงาน
                 <Send className="size-6 text-white/50" />
              </button>
           </div>
        </footer>
      </div>
    </div>
  );
};

export default Support;

