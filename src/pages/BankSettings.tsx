import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { toast } from 'react-hot-toast';
import { ChevronLeft, CreditCard, Trash2, Lock as LockIcon, CheckCircle2, Zap } from 'lucide-react';

interface Bank {
  id: string;
  code: string;
  name_th: string;
  name_en: string;
  logo_url: string;
}

interface ProfileData {
  full_name: string;
  phone: string;
  bank_code: string;
  bank_account: string;
}

const BankSettings: React.FC = () => {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [profile, setProfile] = useState<ProfileData>({
    full_name: '',
    phone: '',
    bank_code: '',
    bank_account: '',
  });

  useEffect(() => {
    if (user) {
      fetchBanks();
      fetchProfile();
    }
  }, [user]);

  const fetchBanks = async () => {
    const { data } = await supabase.from('banks').select('*').eq('is_active', true);
    if (data) setBanks(data);
  };

  const fetchProfile = async () => {
    try {
      // CORRECT TABLE: profiles (not users)
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, phone, bank_code, bank_account')
        .eq('id', user?.id)
        .single();
      
      if (error) throw error;
      if (data) {
        setProfile({
          full_name: data.full_name || '',
          phone: data.phone || '',
          bank_code: data.bank_code || '',
          bank_account: data.bank_account || '',
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleSave = async () => {
    if (!profile.full_name || !profile.bank_account || !profile.bank_code) {
      toast.error('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          phone: profile.phone,
          bank_code: profile.bank_code,
          bank_account: profile.bank_account,
        })
        .eq('id', user?.id);

      if (error) throw error;
      await refreshProfile();
      toast.success('อัปเดตข้อมูลระบบสำเร็จ', {
        icon: '💎',
        style: { borderRadius: '1.5rem', background: '#ec131e', color: '#fff', fontFamily: 'Prompt', fontWeight: 'bold' }
      });
    } catch (error: any) {
      toast.error('ไม่สามารถบันทึกข้อมูลได้');
    } finally {
      setSaving(false);
    }
  };

  const selectedBank = banks.find(b => b.code === profile.bank_code);

  return (
    <div className="bg-white min-h-screen text-slate-900 font-prompt animate-in fade-in duration-500 w-full overflow-x-hidden">
      <div className="relative w-full flex flex-col min-h-screen pb-20">

        
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-[60] bg-white/90 backdrop-blur-2xl border-b border-slate-50 py-6 px-8 shadow-sm">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <button onClick={() => navigate(-1)} className="size-12 flex items-center justify-center bg-slate-50 text-slate-400 hover:text-primary rounded-2xl transition-all active:scale-95 shadow-sm border border-slate-100">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-base font-sans font-black tracking-[0.2em] uppercase  text-slate-900 leading-none">ตั้งค่าบัญชีธนาคาร</h1>
            <div className="size-12"></div>
          </div>
        </header>


        <main className="flex-1 pt-32 pb-40">
          <div className="max-w-3xl mx-auto px-8 space-y-16">

          
          {/* Section: Identity */}
          <section className="space-y-8">
            <div className="flex items-center justify-between px-2">
               <h2 className="text-xl font-sans font-black uppercase  tracking-tighter text-slate-900 leading-none">ข้อมูลยืนยันตัวตน</h2>
               {profile.kyc_status === 'verified' ? (
                 <span className="text-[8px] font-black uppercase text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100  tracking-widest">ยืนยันตัวตนแล้ว</span>
               ) : profile.kyc_status === 'pending' ? (
                 <span className="text-[8px] font-black uppercase text-amber-500 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100  tracking-widest">รอตรวจสอบ</span>
               ) : (
                 <span className="text-[8px] font-black uppercase text-slate-400 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100  tracking-widest">ยังไม่ยืนยัน</span>
               )}
            </div>

            <div className="space-y-6">
               <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] px-4 ">ชื่อ-นามสกุล (ต้องตรงกับหน้าสมุดบัญชี)</label>
                  <input 
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl h-16 px-6 text-sm font-black focus:border-primary/20 outline-none transition-all placeholder:text-slate-200"
                    placeholder="กรุณากรอกชื่อ-นามสกุล จริง"
                    value={profile.full_name}
                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  />
               </div>
               <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] px-4 ">เบอร์โทรศัพท์สำหรับติดต่อ</label>
                  <input 
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl h-16 px-6 text-sm font-black focus:border-primary/20 outline-none transition-all placeholder:text-slate-200"
                    placeholder="เบอร์โทรศัพท์ 10 หลัก"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  />
               </div>
            </div>
          </section>

          {/* Section: Banking Assets */}
          <section className="space-y-8 pt-4">
             <div className="flex items-center justify-between px-2">
                <h2 className="text-xl font-sans font-black uppercase  tracking-tighter text-slate-900 leading-none">บัญชีรับเงินรางวัล</h2>
             </div>

             {profile.bank_account && profile.bank_code ? (
               <div className="relative group overflow-hidden bg-primary text-white p-10 rounded-[3rem] shadow-2xl shadow-primary/20 border border-white/5 space-y-10 group">
                  <div className="flex justify-between items-start relative z-10">
                     <div className="space-y-4">
                        <div className="size-16 bg-white rounded-3xl p-3 shadow-xl flex items-center justify-center border-4 border-slate-900 relative">
                           <img src={selectedBank?.logo_url} alt="Bank Logo" className="w-full h-full object-contain" />
                        </div>
                        <div>
                           <p className="text-white/40 text-[9px] font-black uppercase tracking-[0.4em] mb-2 leading-none ">ช่องทางรับเงินที่ยืนยันแล้ว</p>
                           <h4 className="text-xl font-sans font-black  uppercase leading-none tracking-tighter">{selectedBank?.name_th}</h4>
                        </div>
                     </div>
                     <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-xl border border-white/10  text-[8px] font-black uppercase tracking-widest text-emerald-400">
                        <CheckCircle2 size={12} /> เชื่อมต่อสำเร็จ
                     </div>
                  </div>
                  
                  <div className="relative z-10 space-y-4">
                     <p className="text-3xl font-black font-mono tracking-[0.2em] leading-none  group-hover:tracking-[0.3em] transition-all">
                        {profile.bank_account.replace(/(\d{3})(\d{1})(\d{5})(\d{1})/, '$1-$2-$3-$4')}
                     </p>
                     <div className="flex items-center gap-2">
                        <LockIcon size={12} className="text-white/20" />
                        <span className="text-white/20 text-[8px] font-black uppercase tracking-[0.3em] ">ระบบเข้ารหัสความปลอดภัยขั้นสูง (E2EE)</span>
                     </div>
                  </div>

                  <button 
                    onClick={() => setProfile({ ...profile, bank_account: '', bank_code: '' })}
                    className="absolute bottom-8 right-8 size-12 bg-white/5 hover:bg-primary rounded-2xl transition-all active:scale-90 flex items-center justify-center border border-white/5"
                  >
                    <Trash2 className="size-5" />
                  </button>
               </div>
             ) : (
               <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-700">
                  <div className="space-y-6">
                     <label className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] px-4">เลือกธนาคารของคุณ</label>
                     <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">

                        {banks.map((bank) => (
                          <button
                            key={bank.code}
                            onClick={() => setProfile({ ...profile, bank_code: bank.code })}
                            className={`p-4 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 active:scale-95 ${
                              profile.bank_code === bank.code 
                              ? 'bg-primary border-primary text-white shadow-2xl shadow-primary/20 scale-105' 
                              : 'bg-slate-50 border-slate-50 text-slate-400 grayscale hover:grayscale-0 hover:bg-white hover:border-primary/20'
                            }`}
                          >
                             <div className="size-10 bg-white rounded-xl p-1.5 shadow-sm border border-slate-100 items-center justify-center flex overflow-hidden">
                                <img src={bank.logo_url} alt={bank.code} className="w-full h-full object-contain" />
                             </div>
                             <span className="text-[8px] font-black uppercase tracking-widest text-center leading-none">{bank.name_th}</span>
                          </button>
                        ))}
                     </div>
                  </div>

                  <div className="space-y-4 pt-4">
                     <label className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] px-4 ">หมายเลขเลขที่บัญชีรับเงินรางวัล</label>
                     <div className="relative">
                        <CreditCard className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-200" size={20} />
                        <input 
                          className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl h-18 pl-16 pr-6 text-lg font-black font-mono tracking-widest focus:border-primary/20 outline-none transition-all placeholder:text-slate-200" 
                          placeholder="ระบุเลขที่บัญชีของท่าน" 
                          type="text"
                          value={profile.bank_account}
                          onChange={(e) => setProfile({ ...profile, bank_account: e.target.value.replace(/\D/g, '') })}
                        />
                     </div>
                  </div>
               </div>
             )}
          </section>
          </div>
        </main>

        <footer className="fixed bottom-20 left-0 right-0 p-8 bg-white/95 backdrop-blur-xl border-t border-slate-50 z-50">
          <div className="max-w-3xl mx-auto">
            <button 
              onClick={handleSave}
              disabled={saving}
              className={`w-full h-18 rounded-[2rem] font-sans font-black text-sm uppercase  tracking-widest shadow-2xl transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-4 ${
                saving 
                  ? 'bg-slate-50 text-slate-200 cursor-not-allowed' 
                  : 'bg-primary text-white shadow-primary/20'
              }`}
            >
              {saving ? (
                <div className="size-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  บันทึกข้อมูลธนาคาร
                  <Zap className="size-5 fill-white" />
                </>
              )}
            </button>
          </div>
        </footer>

      </div>
    </div>
  );
};

export default BankSettings;

