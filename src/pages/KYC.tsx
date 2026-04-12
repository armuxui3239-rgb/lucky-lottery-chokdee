import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { toast } from 'react-hot-toast';
import { Shield, CreditCard, Camera, CheckCircle, ChevronLeft, Lock, Info, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

const KYC: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState<'guide' | 'upload'>('guide');
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState<{ idCard: File | null; selfie: File | null }>({
    idCard: null,
    selfie: null,
  });
  const [previews, setPreviews] = useState<{ idCard: string | null; selfie: string | null }>({
    idCard: null,
    selfie: null,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'idCard' | 'selfie') => {
    const file = e.target.files?.[0];
    if (file) {
      setFiles({ ...files, [type]: file });
      setPreviews({ ...previews, [type]: URL.createObjectURL(file) });
    }
  };

  const handleSubmit = async () => {
    if (!files.idCard || !files.selfie) {
      toast.error('กรุณาอัปโหลดรูปภาพให้ครบถ้วน');
      return;
    }

    setUploading(true);
    try {
      const idExt = files.idCard.name.split('.').pop();
      const idPath = `${user?.id}/id_card_${Date.now()}.${idExt}`;
      const { error: idError } = await supabase.storage
        .from('documents')
        .upload(idPath, files.idCard);
      if (idError) throw idError;

      const selfieExt = files.selfie.name.split('.').pop();
      const selfiePath = `${user?.id}/selfie_${Date.now()}.${selfieExt}`;
      const { error: selfieError } = await supabase.storage
        .from('documents')
        .upload(selfiePath, files.selfie);
      if (selfieError) throw selfieError;

      const { error: dbError } = await supabase
        .from('profiles')
        .update({ kyc_status: 'pending' })
        .eq('id', user?.id);

      if (dbError) throw dbError;
      
      toast.success('ส่งเอกสารยืนยันตัวตนเรียบร้อยแล้ว', {
        icon: '📤',
        style: { borderRadius: '1.5rem', background: '#ec131e', color: '#fff', fontFamily: 'Prompt', fontWeight: 'bold' }
      });
      navigate('/profile');
    } catch (error: any) {
      console.error('KYC Upload Error:', error);
      toast.error('เกิดข้อผิดพลาด: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const Header = ({ title, onBack }: { title: string; onBack: () => void }) => (
    <header className="fixed top-0 left-0 right-0 z-[60] bg-white/90 backdrop-blur-2xl border-b border-slate-50 py-6 px-8 shadow-sm">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <button onClick={onBack} className="size-12 flex items-center justify-center bg-slate-50 text-slate-400 hover:text-primary rounded-2xl transition-all active:scale-90 shadow-sm border border-slate-100">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-base font-sans font-black tracking-[0.2em] uppercase  text-slate-900 leading-none">{title}</h1>
        <div className="size-12"></div>
      </div>
    </header>
  );


  if (step === 'guide') {
    return (
      <div className="bg-white min-h-screen text-slate-900 font-prompt animate-in fade-in duration-500 w-full overflow-x-hidden">
        <div className="relative w-full flex flex-col min-h-screen">

          <Header title="ระบบยืนยันตัวตน" onBack={() => navigate(-1)} />
          
          <main className="flex-1 pt-32 pb-40">
            <div className="max-w-4xl mx-auto px-8 space-y-12">

            <div className="flex justify-center mb-12">
              <div className="relative group">
                <div className="absolute inset-0 bg-primary/10 rounded-[3.5rem] blur-3xl opacity-40 group-hover:opacity-60 transition-opacity"></div>
                <div className="relative size-40 bg-slate-900 rounded-[3rem] flex items-center justify-center shadow-2xl rotate-3 group-hover:rotate-0 transition-all duration-500 border border-white/5">
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent"></div>
                  <ShieldCheck className="w-20 h-20 text-white" strokeWidth={1} />
                </div>
                <div className="absolute -bottom-4 -right-4 size-16 bg-primary rounded-[1.5rem] flex items-center justify-center shadow-2xl border-4 border-white">
                   <Zap className="text-white w-8 h-8 fill-white" />
                </div>
              </div>
            </div>

            <div className="text-center mb-12">
              <h2 className="text-3xl font-sans font-black tracking-tighter mb-3 uppercase  leading-none">ความปลอดภัย <span className="text-primary font-sans">สูงสุด</span></h2>
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] leading-relaxed ">
                เข้ารหัสข้อมูลระดับสถาบันการเงิน (Bank-grade)<br/>
                ปกป้องข้อมูลส่วนบุคคลของคุณตลอด 24 ชั่วโมง
              </p>
            </div>

            <div className="grid gap-4">
              {[
                { icon: CreditCard, title: "บัตรประชาชน", desc: "ใช้บัตรประชาชนตัวจริงที่ยังไม่หมดอายุ" },
                { icon: Camera, title: "รูปถ่ายคู่บัตร", desc: "ถ่ายรูปใบหน้าคู่กับบัตรประชาชนให้ชัดเจน" },
                { icon: Shield, title: "ตรวจสอบโดยระบบ", desc: "เจ้าหน้าที่จะตรวจสอบข้อมูลภายใน 24 ชม." }
              ].map((item, idx) => (
                <div key={idx} className="p-6 rounded-[2.5rem] bg-slate-50 border border-slate-100 flex items-start gap-5 group hover:border-primary/20 transition-all">
                  <div className="size-14 rounded-2xl bg-white shadow-xl flex items-center justify-center shrink-0 group-hover:bg-slate-900 group-hover:text-white transition-all">
                    <item.icon className="w-6 h-6 text-primary group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <h3 className="font-sans font-black text-sm uppercase  text-slate-900 leading-none mb-2">{item.title}</h3>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-wide leading-relaxed opacity-60">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 flex items-center gap-4 p-6 bg-slate-50 border border-slate-100 rounded-[2rem] w-full group overflow-hidden relative shadow-inner">
               <div className="absolute inset-0 bg-primary/5 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-700"></div>
               <Info className="w-5 h-5 text-slate-300 relative z-10" />
               <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-relaxed relative z-10">
                 *ข้อมูลของคุณจะถูกใช้เพื่อการยืนยันสิทธิ์ในการรับรางวัลสลากกินแบ่งรัฐบาลเท่านั้น
               </p>
            </div>
            </div>
          </main>

          <footer className="fixed bottom-20 left-0 right-0 p-8 bg-white/95 backdrop-blur-2xl border-t border-slate-50 z-50">
            <div className="max-w-4xl mx-auto px-4">
              <button 
                onClick={() => setStep('upload')}
                className="w-full h-18 bg-primary text-white rounded-[2rem] font-sans font-black text-sm uppercase  tracking-[0.3em] shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4"
              >
                เริ่มต้นยืนยันตัวตน
                <ArrowRight className="w-5 h-5 text-white animate-bounce-horizontal" />
              </button>
            </div>
          </footer>
        </div>
      </div>

    );
  }

  return (
    <div className="bg-white min-h-screen text-slate-900 font-prompt animate-in slide-in-from-right-8 duration-500 w-full overflow-x-hidden">
      <div className="relative w-full flex flex-col min-h-screen">

        <Header title="อัปโหลดเอกสาร" onBack={() => setStep('guide')} />

        <main className="flex-1 pt-32 pb-40">
          <div className="max-w-4xl mx-auto px-8 space-y-12">

          {[
            { id: 'id-input', type: 'idCard', label: 'บัตรประจำตัวประชาชน', icon: CreditCard, step: '01' },
            { id: 'selfie-input', type: 'selfie', label: 'รูปถ่ายคู่กับบัตร', icon: Camera, step: '02' }
          ].map((field) => (
            <div key={field.id} className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-sans font-black text-[10px] shadow-xl  shrink-0">{field.step}</div>
                  <h3 className="font-sans font-black text-base uppercase  tracking-tight text-slate-900 leading-none">{field.label}</h3>
                </div>
                {previews[field.type as 'idCard' | 'selfie'] && <CheckCircle className="text-emerald-500 w-5 h-5 fill-emerald-500/10" />}
              </div>
              
              <div 
                onClick={() => document.getElementById(field.id)?.click()}
                className="group relative aspect-[16/10] rounded-[2.5rem] border-2 border-dashed border-slate-100 bg-slate-50/50 hover:border-primary/40 hover:bg-white transition-all overflow-hidden flex flex-col items-center justify-center cursor-pointer shadow-inner"
              >
                {previews[field.type as 'idCard' | 'selfie'] ? (
                  <div className="w-full h-full p-3 relative group">
                    <img src={previews[field.type as 'idCard' | 'selfie']!} alt="Preview" className="w-full h-full object-cover rounded-[1.8rem] shadow-2xl animate-in zoom-in duration-300" />
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-[1.8rem]">
                      <span className="text-white font-black text-[10px] uppercase tracking-[0.3em] ">เปลี่ยนรูปภาพ</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-slate-300 group-hover:text-primary transition-all duration-500">
                    <div className="size-16 rounded-2xl bg-white shadow-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <field.icon className="w-8 h-8" strokeWidth={1.5} />
                    </div>
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] ">แตะเพื่อถ่ายภาพหรือเลือกไฟล์</p>
                  </div>
                )}
                <input id={field.id} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, field.type as any)} />
              </div>
            </div>
          ))}

          <div className="p-8 rounded-[2.5rem] bg-slate-900 text-white relative overflow-hidden group shadow-2xl">
             <div className="absolute top-0 right-0 p-8 opacity-10 -rotate-12 group-hover:rotate-0 transition-transform duration-700">
                <Lock className="w-24 h-24" />
             </div>
             <div className="relative z-10 flex gap-5 items-start">
               <div className="p-3 bg-primary/20 rounded-2xl border border-primary/20">
                 <Shield className="w-6 h-6 text-primary shrink-0" />
               </div>
               <div>
                 <p className="text-[10px] font-black text-white uppercase tracking-[0.2em] leading-none mb-2 ">เข้ารหัสความปลอดภัย</p>
                 <p className="text-[9px] text-white/40 font-black leading-relaxed uppercase tracking-widest leading-relaxed">
                   เอกสารของคุณจะถูกจัดเก็บในระบบที่มีการเข้ารหัสสูงสุด AES-256 เพื่อความปลอดภัยของข้อมูลส่วนบุคคล
                 </p>
               </div>
             </div>
          </div>
          </div>
        </main>

        <footer className="fixed bottom-20 left-0 right-0 p-8 bg-white/95 backdrop-blur-2xl border-t border-slate-50 z-50">
          <div className="max-w-4xl mx-auto px-4">
            <button 
              onClick={handleSubmit}
              disabled={uploading || !files.idCard || !files.selfie}
              className={`w-full h-18 rounded-[2rem] font-sans font-black text-sm uppercase  tracking-[0.3em] shadow-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-4 ${
                uploading || !files.idCard || !files.selfie 
                  ? 'bg-slate-50 text-slate-200 cursor-not-allowed shadow-none' 
                  : 'bg-primary text-white shadow-primary/30 hover:scale-[1.02]'
              }`}
            >
              {uploading ? (
                <div className="size-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>ยืนยันข้อมูลเอกสาร</span>
                  <Zap className="w-5 h-5 fill-white" />
                </>
              )}
            </button>
          </div>
        </footer>
      </div>
    </div>

  );
};

export default KYC;

