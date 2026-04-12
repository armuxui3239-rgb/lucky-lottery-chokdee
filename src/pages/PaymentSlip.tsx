import React, { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { useCart } from '../lib/CartContext';
import { toast } from 'react-hot-toast';
import { ChevronLeft, Landmark, Calendar, Clock, Info, UploadCloud, Edit3, ArrowRight } from 'lucide-react';

const PaymentSlip: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { totalPrice, items, clearCart } = useCart();

  const amount = location.state?.amount || totalPrice;
  const initialDate = new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
  const initialTime = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', hour12: false });

  // ดักจับกรณีไม่มีข้อมูลยอดเงิน
  if (!amount || amount <= 0) {
    return <Navigate to="/cart" replace />;
  }

  const [date, setDate] = useState(initialDate);
  const [time, setTime] = useState(initialTime);
  const [uploading, setUploading] = useState(false);
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSlipFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!slipFile) {
      toast.error('กรุณาอัปโหลดสลิปเพื่อยืนยันการชำระเงิน');
      return;
    }

    setUploading(true);
    try {
      // 1. Upload Slip to Storage
      const fileExt = slipFile.name.split('.').pop();
      const fileName = `${user?.id}/${Date.now()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('transactions')
        .upload(fileName, slipFile);

      if (uploadError) throw uploadError;

      // 2. Create Transaction Record
      const { error: txError } = await supabase.from('transactions').insert({
        user_id: user?.id,
        amount: amount,
        type: 'purchase',
        status: 'pending',
        slip_url: uploadData.path,
        metadata: {
          items: items.map(i => ({ id: i.lottery_id || i.id, num: i.number, count: i.count })),
          transfer_date: date,
          transfer_time: time
        }
      });

      if (txError) throw txError;

      toast.success('ส่งหลักฐานการชำระเงินเรียบร้อยแล้ว');
      clearCart();
      navigate('/success?type=purchase');
    } catch (error: any) {
      console.error('Error processing payment:', error);
      toast.error('เกิดข้อผิดพลาดในการส่งหลักฐาน: ' + error.message);
    } finally {
      setUploading(false);
    }
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
            <h1 className="text-xl font-sans font-black leading-tight flex-1 text-center pr-10  uppercase tracking-widest text-slate-900">อัปโหลดสลิป</h1>
          </div>
        </header>

        <main className="flex-1 w-full pt-32 pb-44">
          <div className="max-w-4xl mx-auto px-8 space-y-12">
            
            {/* Steps */}
            <div className="flex items-center justify-center gap-4">
              <div className="h-2 w-12 rounded-full bg-slate-100"></div>
              <div className="h-2 w-12 rounded-full bg-slate-100"></div>
              <div className="h-2 w-20 rounded-full bg-primary shadow-xl shadow-primary/20"></div>
            </div>

            {/* Header Content */}
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-sans font-black text-slate-900 tracking-tight uppercase">ยืนยันรายการ</h2>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">อัปโหลดสลิปเพื่อแจ้งชำระเงิน</p>
            </div>

            {/* Content Body Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
              
              {/* Slip Area (Left/Main) */}
              <div className="lg:col-span-3 space-y-8">
                <div
                  onClick={() => document.getElementById('slip-input')?.click()}
                  className={`group relative flex flex-col items-center justify-center rounded-[3rem] border-2 border-dashed transition-all duration-700 min-h-[400px] cursor-pointer overflow-hidden shadow-2xl ${previewUrl ? 'border-primary shadow-red-100/50 scale-[1.02]' : 'border-slate-100 bg-slate-50 hover:bg-red-50/30 hover:border-primary/20 hover:-translate-y-1'}`}
                >
                  {previewUrl ? (
                    <div className="absolute inset-0 p-4">
                      <img src={previewUrl} alt="Slip" className="w-full h-full object-contain rounded-[2rem]" />
                      <div className="absolute bottom-10 right-10 flex items-center gap-3 bg-primary/90 backdrop-blur-xl text-white px-6 py-3 rounded-2xl shadow-2xl transition-all hover:scale-105">
                        <Edit3 className="size-5" />
                        <span className="text-xs font-black uppercase">เปลี่ยนสลิป</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-center px-10 py-20 space-y-8">
                       <div className="size-20 rounded-[2rem] bg-white flex items-center justify-center text-primary shadow-xl shadow-slate-200/50 group-hover:scale-110 group-hover:rotate-6 transition-all duration-700">
                          <UploadCloud className="size-10" />
                       </div>
                       <div className="space-y-3">
                          <p className="text-lg font-black text-slate-900 uppercase">อัปโหลดสลิปที่นี่</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em]">รองรับ JPG, PNG (ไม่เกิน 5MB)</p>
                       </div>
                    </div>
                  )}
                  <input id="slip-input" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                </div>
              </div>

              {/* Form Side (Right) */}
              <div className="lg:col-span-2 space-y-10">
                
                <div className="space-y-6">
                  <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] px-4">ตรวจสอบข้อมูล</h3>
                  
                  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-100/50 space-y-8">
                    
                    <div className="flex flex-col gap-3">
                       <label className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] px-2">จำนวนเงิน (บาท)</label>
                       <div className="flex items-center gap-4 bg-slate-50 p-6 rounded-[1.8rem] border border-slate-50">
                          <div className="bg-primary p-3 rounded-xl shadow-lg shadow-red-200">
                            <Landmark className="size-5 text-white" />
                          </div>
                          <span className="text-2xl font-sans font-black text-slate-900 tracking-tighter ">฿ {amount.toLocaleString()}.00</span>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="flex flex-col gap-3">
                          <label className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] px-2">วันที่</label>
                          <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-3">
                            <Calendar className="size-4 text-slate-400" />
                            <input type="text" value={date} onChange={(e) => setDate(e.target.value)} className="bg-transparent border-none p-0 text-xs font-black focus:ring-0 w-full font-sans" />
                          </div>
                       </div>
                       <div className="flex flex-col gap-3">
                          <label className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] px-2">เวลา</label>
                          <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-3">
                            <Clock className="size-4 text-slate-400" />
                            <input type="text" value={time} onChange={(e) => setTime(e.target.value)} className="bg-transparent border-none p-0 text-xs font-black focus:ring-0 w-full font-sans" />
                          </div>
                       </div>
                    </div>

                    <div className="p-6 rounded-2xl bg-amber-50/50 border border-amber-100 flex items-start gap-4">
                      <Info className="size-5 text-amber-500 shrink-0" />
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-tight leading-loose">โปรดตรวจสอบยอดเงินและวันเวลาให้ตรงตามสลิปเพื่อความรวดเร็วในการยืนยัน</p>
                    </div>

                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        <footer className="fixed bottom-20 left-0 right-0 p-8 bg-white/95 backdrop-blur-2xl border-t border-slate-50 z-50">
           <div className="max-w-4xl mx-auto px-4 flex flex-col gap-4">
              <button
                onClick={handleSubmit}
                disabled={uploading || !slipFile}
                className={`w-full h-18 font-sans font-black rounded-[2rem] shadow-2xl transition-all flex items-center justify-center gap-4 active:scale-95 uppercase tracking-[0.25em] text-sm group ${uploading || !slipFile
                    ? 'bg-slate-50 text-slate-200 cursor-not-allowed'
                    : 'bg-primary text-white shadow-primary/30'
                  }`}
              >
                 {uploading ? (
                   <div className="size-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                 ) : (
                   <>ยืนยันและส่งสลิป <ArrowRight className="size-6 group-hover:translate-x-2 transition-transform" /></>
                 )}
              </button>
           </div>
        </footer>
      </div>
    </div>
  );
};

export default PaymentSlip;

