import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, ArrowRight, Home, CreditCard } from 'lucide-react';
import { useSiteConfig } from '../lib/SiteConfigContext';

const TransactionSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { config } = useSiteConfig();
  const type = searchParams.get('type') || 'purchase'; // purchase, deposit, withdraw
  const txId = searchParams.get('id');

  const getContent = () => {
    switch (type) {
      case 'deposit':
        return {
          title: 'เติมเงินสำเร็จ!',
          desc: 'ระบบได้รับข้อมูลการเติมเงินของคุณแล้ว กำลังดำเนินการตรวจสอบยอดเงินภายใน 1-3 นาที',
          orderLabel: 'หมายเลขรายการ',
          method: 'โอนเงิน / พร้อมเพย์',
          action: 'ดูยอดเงินคงเหลือ',
          path: '/profile'
        };
      case 'withdraw':
        return {
          title: 'แจ้งถอนเงินสำเร็จ!',
          desc: 'เราได้รับคำขอถอนเงินของคุณแล้ว เงินจะถูกโอนเข้าบัญชีที่ผูกไว้ภายใน 15-30 นาที',
          orderLabel: 'หมายเลขรายการ',
          method: 'โอนเงินผ่านธนาคาร',
          action: 'ตรวจสอบประวัติ',
          path: '/history'
        };
      default:
        return {
          title: 'สั่งซื้อสำเร็จ!',
          desc: 'ส่งข้อมูลรายการเรียบร้อยแล้ว สลากของคุณพร้อมใช้งานแล้วในเมนู "สลากของฉัน"',
          orderLabel: 'เลขที่ใบสั่งซื้อ',
          method: 'ยอดเงินในวอลเล็ท',
          action: 'ดูสลากของฉัน',
          path: '/history'
        };
    }
  };

  const content = getContent();
  const orderId = txId ? `#SKL-${txId.slice(0, 8).toUpperCase()}` : `#TRX-${Math.floor(100000 + Math.random() * 900000)}`;
  const dateStr = new Intl.DateTimeFormat('th-TH', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date());

  return (
    <div className="bg-white min-h-screen text-slate-900 font-prompt animate-in fade-in duration-500 w-full overflow-x-hidden">
      <div className="relative w-full flex flex-col min-h-screen py-32 px-8">
        
        <div className="max-w-2xl mx-auto w-full flex flex-col items-center justify-center">
          
          {/* Success Icon Animation */}
          <div className="relative mb-16">
            <div className="absolute inset-0 bg-primary/10 rounded-full blur-3xl animate-pulse scale-150" />
            <div className="relative w-40 h-40 bg-white rounded-[3rem] flex items-center justify-center shadow-2xl rotate-3 border border-slate-50 overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-dark to-rose-950 opacity-10" />
               <CheckCircle size={80} className="text-primary animate-in zoom-in spin-in-12 duration-1000" strokeWidth={3} />
            </div>
            {/* Sparkles */}
            <div className="absolute -top-4 -right-4 w-10 h-10 rounded-full bg-amber-400 blur-xl opacity-50 animate-pulse" />
            <div className="absolute -bottom-2 -left-2 w-8 h-8 rounded-full bg-primary blur-lg opacity-30 animate-ping" />
          </div>

          <div className="text-center space-y-6 mb-16">
            <h1 className="text-5xl font-sans font-black text-slate-900 uppercase tracking-tight  leading-none">
              {content.title}
            </h1>
            <p className="text-sm font-black text-slate-400 leading-relaxed uppercase tracking-[0.3em] max-w-sm mx-auto">
              {content.desc}
            </p>
          </div>

          {/* Receipt Card */}
          <div className="w-full bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-50 overflow-hidden mb-16 animate-in slide-in-from-bottom-8 duration-1000">
            <div className="bg-slate-50/50 px-10 py-6 border-b border-slate-50 flex items-center justify-between">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">ใบเสร็จรับเงินออนไลน์</span>
               <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] flex items-center gap-2">
                 <div className="size-1.5 rounded-full bg-primary animate-pulse" />
                 ยืนยันรายการสำเร็จ
               </span>
            </div>
            
            <div className="p-10 space-y-10">
               <div className="flex justify-between items-start">
                   <div className="flex flex-col gap-2">
                      <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">{content.orderLabel}</span>
                      <span className="text-lg font-black text-slate-900 font-sans">{orderId}</span>
                   </div>
                   <div className="flex flex-col items-end gap-2">
                      <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">วันที่และเวลาที่ทำรายการ</span>
                      <span className="text-xs font-black text-slate-900 uppercase">{dateStr}</span>
                   </div>
               </div>

               <div className="flex justify-between items-center pt-10 border-t border-slate-50">
                   <div className="flex items-center gap-5">
                      <div className="size-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                         <CreditCard size={24} />
                      </div>
                      <div className="flex flex-col gap-1">
                         <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">ช่องทางการชำระเงิน</span>
                         <span className="text-sm font-black text-slate-900">{content.method}</span>
                      </div>
                   </div>
                   <div className="flex items-center gap-3 bg-green-50 px-6 py-3 rounded-2xl border border-green-100">
                      <span className="text-[11px] font-black text-green-600 uppercase tracking-widest ">สำเร็จ</span>
                   </div>
               </div>
            </div>
          </div>

          {/* Primary Action */}
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
             <button 
               onClick={() => navigate(content.path)}
               className="w-full bg-primary hover:bg-primary-dark text-white py-6 rounded-[2.5rem] font-sans font-black text-sm uppercase tracking-widest flex items-center justify-center gap-4 shadow-2xl shadow-red-200/50 active:scale-95 transition-all group"
             >
                <span>{content.action}</span>
                <ArrowRight size={22} className="group-hover:translate-x-2 transition-transform" />
             </button>
             
             <button 
               onClick={() => navigate('/')}
               className="w-full bg-white border-2 border-primary/20 text-primary font-black py-6 rounded-[2.5rem] flex items-center justify-center gap-4 hover:bg-primary/5 transition-all uppercase tracking-widest text-[11px]"
             >
                <Home size={18} /> กลับสู่หน้าหลัก
             </button>
          </div>

          <p className="text-[9px] text-center text-slate-300 font-bold uppercase tracking-[0.4em] mt-16 leading-relaxed">
            ระบบจัดเก็บข้อมูลปลอดภัยโดย {config.site_name} Official<br/>
            ขอบคุณที่ร่วมสนุกกับ {config.site_name || 'ล็อตเตอรี่ โชคดี'}
          </p>
        </div>
      </div>
    </div>
  );
};


export default TransactionSuccess;

