import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ChevronLeft, Landmark, Clock, Save, Info, ArrowRight } from 'lucide-react';

const PaymentQR: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const amount = location.state?.amount || 0;
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes
  const [ppId, setPpId] = useState('0812345678'); // Default placeholder

  // ดักจับกรณีไม่มีข้อมูลยอดเงิน
  if (!amount || amount <= 0) {
    return <Navigate to="/cart" replace />;
  }

  useEffect(() => {
    const fetchPpId = async () => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'promptpay_id')
        .single();

      if (data && !error) {
        setPpId(data.value);
      }
    };
    fetchPpId();
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleNext = () => {
    navigate('/payment/slip', { state: { amount } });
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
            <h1 className="text-xl font-display font-black leading-tight flex-1 text-center pr-10 italic uppercase tracking-widest text-slate-900">ชำระเงินผ่าน QR</h1>

          </div>
        </header>

        <main className="flex-1 w-full pt-32 pb-44">
          <div className="max-w-4xl mx-auto px-8 space-y-12">
            
            {/* Steps */}
            <div className="flex items-center justify-center gap-4">
              <div className="h-2 w-12 rounded-full bg-slate-100"></div>
              <div className="h-2 w-20 rounded-full bg-primary shadow-xl shadow-primary/20"></div>
              <div className="h-2 w-12 rounded-full bg-slate-100"></div>
            </div>

            <div className="text-center space-y-4">
              <h2 className="text-3xl font-display font-black text-slate-900 tracking-tight uppercase">สแกนจ่ายด้วย PromptPay</h2>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">กรุณาโอนภายในเวลาที่กำหนด</p>
            </div>

            {/* QR Card Container - Responsive Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
              
              <div className="lg:col-span-3 bg-white rounded-[3rem] p-10 shadow-2xl shadow-slate-200/50 border border-slate-50 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8">
                  <span className="bg-slate-900 text-white text-[9px] font-black px-4 py-2 rounded-full uppercase tracking-widest">คิวอาร์โค้ดทางการ</span>

                </div>

                <div className="flex flex-col items-center justify-center space-y-10">
                  <div className="relative p-6 bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 group-hover:scale-105 transition-all duration-700">
                    <img
                      alt="PromptPay QR"
                      className="w-64 h-64 object-contain"
                      src={`https://promptpay.io/${ppId}/${amount}.png`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent pointer-events-none"></div>
                  </div>

                  <div className="flex flex-col items-center gap-2">
                    <div className={`flex items-center gap-3 font-black transition-all ${timeLeft < 120 ? 'text-primary animate-pulse scale-110' : 'text-slate-900'}`}>
                      <Clock className="size-6" />
                      <span className="text-4xl tracking-tighter font-display">{formatTime(timeLeft)}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.4em]">เวลาที่เหลือ</p>
                  </div>
                </div>

                <div className="mt-12 border-t border-slate-50 pt-10 space-y-8">
                  <div className="flex justify-between items-center px-2">
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">ยอดที่ต้องชำระ</span>
                    <span className="text-4xl font-black text-primary tracking-tighter italic">฿ {amount.toLocaleString()}.00</span>
                  </div>

                  <div className="bg-red-50/50 rounded-[2rem] p-6 flex items-start gap-4 border border-red-100">
                    <Info className="text-primary size-6 flex-shrink-0" />
                    <p className="text-[10px] text-slate-600 leading-relaxed font-black uppercase tracking-tight">
                      โปรดสแกนจ่ายยอดที่ระบุให้ครบถ้วนเพื่อให้ระบบอัปเดตยอดให้อัตโนมัติในทันที
                    </p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2 space-y-6">
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] px-4">ขั้นตอนการชำระ</h3>
                
                <div className="flex items-center gap-5 bg-white p-6 rounded-[2rem] border border-slate-100 hover:border-primary/20 transition-all cursor-pointer group shadow-xl shadow-slate-100/50 hover:-translate-y-1">
                  <div className="size-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 shadow-lg shadow-amber-200/20">
                    <Save className="size-6" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900 uppercase tracking-tight">1. บันทึกรูปภาพ</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">บันทึกรูปภาพลงเครื่อง</p>

                  </div>
                </div>

                <div className="flex items-center gap-5 bg-white p-6 rounded-[2rem] border border-slate-100 hover:border-primary/20 transition-all cursor-pointer group shadow-xl shadow-slate-100/50 hover:-translate-y-1">
                  <div className="size-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 shadow-lg shadow-indigo-200/20">
                    <Landmark className="size-6" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900 uppercase tracking-tight">2. สแกนด้วยแอป</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">เปิดแอปธนาคารเพื่อสแกน</p>

                  </div>
                </div>

                <div className="p-8 rounded-[2rem] bg-slate-900 text-white space-y-4">
                  <p className="text-[9px] font-black text-white/50 uppercase tracking-[0.3em]">ระบบชำระเงินมาตรฐานสากล</p>

                  <p className="text-xs font-black leading-relaxed">ระบบจะทำการตรวจสอบสลิปอัตโนมัติ ภายใน 1-3 นาที หลังจากชำระเงินเสร็จสิ้น</p>
                </div>
              </div>
            </div>
          </div>
        </main>

        <footer className="fixed bottom-20 left-0 right-0 p-8 bg-white/95 backdrop-blur-2xl border-t border-slate-50 z-50">
           <div className="max-w-4xl mx-auto px-4 flex flex-col gap-4">
              <button
                onClick={handleNext}
                className="w-full h-18 bg-primary hover:bg-rose-700 text-white font-display font-black rounded-[2rem] shadow-2xl shadow-primary/30 transition-all flex items-center justify-center gap-4 active:scale-95 uppercase tracking-[0.25em] text-sm group"
              >
                <span>ดำเนินการต่อ</span>
                <ArrowRight className="size-6 group-hover:translate-x-2 transition-transform" />
              </button>
           </div>
        </footer>
      </div>
    </div>
  );
};

export default PaymentQR;
