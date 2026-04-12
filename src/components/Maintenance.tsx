import React from 'react';
import { Settings, Wrench, Smartphone, Mail, Globe } from 'lucide-react';

const Maintenance: React.FC = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center font-prompt animate-in fade-in duration-1000">
      <div className="relative mb-12">
        <div className="absolute inset-0 bg-primary/10 blur-[100px] scale-150 rounded-full"></div>
        <div className="relative size-32 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-primary shadow-2xl border border-slate-100 rotate-12 animate-bounce-slow">
           <Settings size={64} strokeWidth={1} className="animate-spin-slow" />
        </div>
        <div className="absolute -bottom-4 -right-4 size-14 bg-amber-400 rounded-2xl flex items-center justify-center shadow-xl border-4 border-white rotate-[-12deg]">
           <Wrench size={24} className="text-amber-900" />
        </div>
      </div>

      <h1 className="text-4xl md:text-6xl font-sans font-black text-slate-900 tracking-tighter uppercase  leading-none mb-6">
        Under <span className="text-primary ">Maintenance</span>
      </h1>
      
      <p className="text-slate-400 text-xs font-black uppercase tracking-[0.4em] max-w-md mx-auto leading-loose mb-12">
        เรากำลังปรับปรุงระบบเพื่อเพิ่มประสิทธิภาพการใช้งาน<br/>
        ขออภัยในความไม่สะดวก และพบกับระบบใหม่เร็วๆ นี้
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl px-4">
         <div className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100 space-y-3">
            <Smartphone size={20} className="text-slate-400 mx-auto" />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-900">Mobile Ready</p>
         </div>
         <div className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100 space-y-3">
            <Globe size={20} className="text-slate-400 mx-auto" />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-900">Global Sync</p>
         </div>
         <div className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100 space-y-3">
            <Mail size={20} className="text-slate-400 mx-auto" />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-900">Support 24/7</p>
         </div>
      </div>

      <div className="mt-20 pt-10 border-t border-slate-50 w-full max-w-xs mx-auto">
         <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.5em] ">Lucky Lottery Official</p>
      </div>
    </div>
  );
};

export default Maintenance;

