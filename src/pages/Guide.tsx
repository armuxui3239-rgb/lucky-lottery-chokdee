import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Search, Ticket, Sparkles, ArrowRight, PlayCircle, Smartphone, MousePointer2, Star } from 'lucide-react';

const Guide: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-white min-h-screen text-slate-900 font-prompt animate-in fade-in duration-500 w-full overflow-x-hidden">
      <div className="relative w-full flex flex-col min-h-screen">
        
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-2xl border-b border-slate-50 py-6 px-8">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <button onClick={() => navigate(-1)} className="text-slate-900 flex size-10 items-center justify-center hover:bg-slate-50 rounded-full transition-all active:scale-95">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-sans font-black leading-tight flex-1 text-center pr-10  uppercase tracking-widest text-slate-900">วิธีเล่นสลาก</h1>
          </div>
        </header>

        <main className="flex-1 pt-32 pb-44 px-8">
          <div className="max-w-4xl mx-auto space-y-20">
            
            {/* Steps Indicator */}
            <div className="flex items-center justify-center gap-4">
              <div className="h-2 w-20 rounded-full bg-primary shadow-xl shadow-red-200"></div>
              <div className="h-2 w-12 rounded-full bg-slate-50"></div>
              <div className="h-2 w-8 rounded-full bg-slate-50"></div>
            </div>

            {/* Hero Section */}
            <div className="text-center space-y-8 animate-in slide-in-from-top-8 duration-1000">
               <div className="inline-flex items-center gap-3 px-6 py-2 bg-primary/5 rounded-full border border-primary/10">
                  <PlayCircle className="size-4 text-primary" />
                  <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">คู่มือการใช้งาน</span>
               </div>
               <h2 className="text-6xl font-sans font-black  tracking-tighter uppercase leading-none text-slate-900">ขั้นตอนการ <span className="text-primary ">เลือกเลขเด็ด</span></h2>
               <p className="text-slate-400 text-[11px] font-black uppercase tracking-[0.4em] max-w-lg mx-auto leading-loose">เริ่มต้นเส้นทางการเป็นเศรษฐีด้วย ล็อตเตอรี่โชคดี ง่ายๆ เพียง 3 ขั้นตอน</p>
            </div>

            {/* Visualization Area */}
            <div className="relative group p-8 max-w-2xl mx-auto">
               <div className="absolute inset-0 bg-primary/5 blur-[100px] opacity-10 group-hover:opacity-20 transition-opacity"></div>
               <div className="relative w-full aspect-[16/10] rounded-[3.5rem] border-[12px] border-slate-50 bg-white shadow-2xl overflow-hidden flex items-center justify-center transition-transform hover:scale-[1.02] duration-700">
                  <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #e5e7eb 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
                  <div className="relative z-10 flex flex-col items-center gap-8 group/ticket">
                     <div className="flex items-center gap-1">
                        <Star className="size-4 text-amber-400 fill-amber-400" />
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest ">ตัวอย่างสลากดิจิทัล</span>
                     </div>
                     <span className="text-7xl md:text-8xl font-sans font-black tracking-[0.2em] text-slate-900  transition-all group-hover/ticket:scale-110 group-hover/ticket:tracking-[0.4em] duration-1000">
                        832594
                     </span>
                     <div className="flex items-center gap-3 px-6 py-2 bg-emerald-50 text-emerald-500 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-emerald-100 shadow-xl shadow-emerald-500/10">
                        <div className="size-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        มีจำหน่ายแล้ว
                     </div>
                  </div>
               </div>
            </div>

            {/* Steps Detailed */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pt-10">
               <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-6 group">
                  <div className="size-16 rounded-[1.8rem] bg-primary text-white flex items-center justify-center font-sans font-black text-2xl  shadow-2xl shadow-primary/30 group-hover:-translate-y-2 group-hover:rotate-6 transition-all duration-700">1</div>
                  <div className="space-y-3">
                     <h4 className="text-xl font-sans font-black text-slate-900 uppercase ">เลือกเมนูหน้าหลัก</h4>
                     <p className="text-xs font-medium text-slate-400 leading-relaxed uppercase tracking-widest leading-loose">กดที่ปุ่มหน้าหลักเพื่อเข้าสู่ระบบค้นหาสลากที่ดีที่สุด</p>
                  </div>
                  <div className="hidden md:flex items-center gap-2 text-primary opacity-20 group-hover:opacity-100 transition-opacity">
                     <MousePointer2 className="size-6" />
                     <span className="text-[10px] font-black uppercase">เริ่มต้นทึ่นี่</span>
                  </div>
               </div>
               
               <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-6 group">
                  <div className="size-16 rounded-[1.8rem] bg-rose-800 text-white flex items-center justify-center font-sans font-black text-2xl  shadow-2xl shadow-rose-800/30 group-hover:-translate-y-2 group-hover:-rotate-6 transition-all duration-700">2</div>
                  <div className="space-y-3">
                     <h4 className="text-xl font-sans font-black text-slate-900 uppercase ">พิมพ์เลขที่ต้องการ</h4>
                     <p className="text-xs font-medium text-slate-400 leading-relaxed uppercase tracking-widest leading-loose">ระบุเลข 3 ตัว หรือ 6 ตัวในช่องค้นหาอัจฉริยะเพื่อกรองสลากที่คุณชื่นชอบ</p>
                  </div>
                  <div className="hidden md:flex items-center gap-2 text-slate-900 opacity-20 group-hover:opacity-100 transition-opacity">
                     <Search className="size-6" />
                     <span className="text-[10px] font-black uppercase">ค้นหาเลขเด็ด</span>
                  </div>
               </div>

               <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-6 group">
                  <div className="size-16 rounded-[1.8rem] bg-amber-400 text-slate-900 flex items-center justify-center font-sans font-black text-2xl  shadow-2xl shadow-amber-400/30 group-hover:-translate-y-2 group-hover:rotate-12 transition-all duration-700">3</div>
                  <div className="space-y-3">
                     <h4 className="text-xl font-sans font-black text-slate-900 uppercase ">กดเลือกใส่ตะกร้า</h4>
                     <p className="text-xs font-medium text-slate-400 leading-relaxed uppercase tracking-widest leading-loose">เลือกจากรายการที่แสดงเพื่อใส่ลงในตะกร้าและดำเนินการชำระเงิน</p>
                  </div>
                  <div className="hidden md:flex items-center gap-2 text-amber-500 opacity-20 group-hover:opacity-100 transition-opacity">
                     <Ticket className="size-6" />
                     <span className="text-[10px] font-black uppercase">พร้อมซื้อทันที</span>
                  </div>
               </div>
            </div>
            
            {/* Extra Info */}
            <div className="bg-slate-50 p-12 rounded-[4rem] text-center space-y-6 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-5">
                  <Smartphone className="size-40 rotate-12" />
               </div>
               <div className="relative z-10 flex flex-col items-center gap-6">
                  <div className="flex items-center gap-4 bg-white px-8 py-3 rounded-full border border-slate-100 shadow-sm">
                     <Sparkles className="size-5 text-amber-500" />
                     <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em]">สนับสนุนโดย ล็อตเตอรี่โชคดี Official</p>
                  </div>
                  <p className="text-xs text-slate-400 font-bold max-w-md mx-auto uppercase tracking-widest  line-height-relaxed">
                     ระบบรองรับการใช้งานผ่านมือถือ แท็บเล็ต และคอมพิวเตอร์อย่างเต็มรูปแบบ<br/>ขอบคุณที่เลือกใช้บริการ {window.location.hostname}
                  </p>
               </div>
            </div>
          </div>
        </main>

        <footer className="fixed bottom-20 left-0 right-0 p-8 bg-white/95 backdrop-blur-2xl border-t border-slate-50 z-50">
           <div className="max-w-4xl mx-auto px-4">
              <button 
                onClick={() => navigate('/')}
                className="w-full h-20 rounded-[2.5rem] font-sans font-black text-2xl uppercase  tracking-[0.15em] shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-4 bg-primary text-white shadow-primary/30 group"
              >
                 <span>เริ่มเสี่ยงโชคเลย</span>
                 <ArrowRight className="size-8 group-hover:translate-x-3 transition-transform duration-700" />
              </button>
           </div>
        </footer>
      </div>
    </div>
  );
};

export default Guide;

