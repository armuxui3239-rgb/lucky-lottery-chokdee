import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useCart } from '../lib/CartContext';
import { ChevronLeft, Landmark, ArrowRight } from 'lucide-react';


const BANKS = [
  { id: 'kbank', name: 'ธนาคารกสิกรไทย', code: 'KBANK', color: '#138B42', logo: 'account_balance' },
  { id: 'scb', name: 'ธนาคารไทยพาณิชย์', code: 'SCB', color: '#4E2E7F', logo: 'account_balance' },
  { id: 'bbl', name: 'ธนาคารกรุงเทพ', code: 'BBL', color: '#1E4598', logo: 'account_balance' },
  { id: 'ktb', name: 'ธนาคารกรุงไทย', code: 'KTB', color: '#00A1E0', logo: 'account_balance' },
  { id: 'tuna', name: 'ธนาคารทหารไทยธนชาต', code: 'TTB', color: '#14279B', logo: 'account_balance' },
  { id: 'gsb', name: 'ธนาคารออมสิน', code: 'GSB', color: '#EC068D', logo: 'account_balance' },
  { id: 'bay', name: 'ธนาคารกรุงศรีอยุธยา', code: 'BAY', color: '#F1E5AC', logo: 'account_balance' },
];

const Payment: React.FC = () => {
  const navigate = useNavigate();
  const { totalPrice } = useCart();
  const [method, setMethod] = useState<'qr' | 'bank' | null>(null);
  const [selectedBank, setSelectedBank] = useState<typeof BANKS[0] | null>(null);
  const [step] = useState(1);

  // ป้องกันการเข้าหน้าชำระเงินหากยอดเงินเป็น 0 (เช่น ตะกร้าว่างเปล่า)
  if (totalPrice <= 0) {
    return <Navigate to="/cart" replace />;
  }

  const handleContinue = () => {
    if (method === 'qr') {
      navigate('/payment/qr', { state: { amount: totalPrice } });
    } else if (method === 'bank' && selectedBank) {
      navigate('/payment/slip', {
        state: {
          amount: totalPrice,
          method: 'bank',
          bank: selectedBank
        }
      });
    }
  };
  return (
    <div className="bg-white min-h-screen text-slate-900 font-prompt animate-in fade-in duration-500 w-full overflow-x-hidden">
      <div className="relative w-full flex flex-col min-h-screen">


        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-primary/95 backdrop-blur-2xl text-white py-6 px-8 shadow-2xl shadow-primary/20">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <button onClick={() => navigate(-1)} className="size-11 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-2xl transition-all active:scale-95 shadow-lg border border-white/5">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-sans font-black tracking-[0.2em] uppercase  drop-shadow-md">ชำระเงิน</h1>
            <div className="size-11"></div>
          </div>
        </header>


        <main className="flex-1 pt-32 pb-44">
          <div className="max-w-4xl mx-auto px-8 space-y-12">
            
            <div className="w-full bg-slate-50 border border-slate-100 h-2 rounded-full overflow-hidden shadow-inner">
              <div
                className="bg-primary h-full transition-all duration-700 ease-out shadow-[0_0_15px_rgba(236,19,30,0.5)]"
                style={{ width: `${(step / 3) * 100}%` }}
              ></div>
            </div>

        {step === 1 ? (
          <section className="animate-in slide-in-from-bottom-5 duration-500">
            <div className="mb-10 px-2 text-center">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase mb-3">เลือกช่องทางการชำระเงิน</h2>

              <p className="text-slate-400 text-[11px] font-bold uppercase tracking-[0.15em] leading-relaxed">
                เลือกช่องทางการชำระเงินที่คุณสะดวกที่สุด
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <button
                onClick={() => setMethod('qr')}
                className={`relative flex items-center gap-6 p-7 rounded-[2.5rem] transition-all duration-500 border-2 ${method === 'qr'
                    ? 'bg-white dark:bg-zinc-900 border-primary shadow-2xl shadow-primary/10 -translate-y-2'
                    : 'bg-slate-50 dark:bg-zinc-950 border-transparent hover:border-slate-200 dark:hover:border-zinc-800'
                  }`}
              >
                <div className={`size-20 rounded-[1.8rem] flex items-center justify-center transition-all duration-500 ${method === 'qr' ? 'bg-primary text-white rotate-6' : 'bg-white dark:bg-zinc-800 text-slate-300'
                  }`}>
                  <span className="material-symbols-outlined text-4xl font-black" style={{ fontVariationSettings: "'FILL' 1" }}>qr_code_2</span>
                </div>
                <div className="flex-1 text-left">
                  <p className={`text-xl font-black uppercase tracking-tighter transition-colors ${method === 'qr' ? 'text-primary' : 'text-slate-700 dark:text-slate-400'}`}>QR PromptPay</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">ตรวจสอบอัตโนมัติ</p>

                </div>
                {method === 'qr' && (
                  <div className="bg-primary size-8 rounded-full flex items-center justify-center text-white shadow-lg animate-in zoom-in duration-300">
                    <span className="material-symbols-outlined text-lg font-black">check</span>
                  </div>
                )}
              </button>

              <button
                onClick={() => setMethod('bank')}
                className={`relative flex items-center gap-6 p-7 rounded-[2.5rem] transition-all duration-500 border-2 ${method === 'bank'
                    ? 'bg-white dark:bg-zinc-900 border-primary shadow-2xl shadow-primary/10 -translate-y-2'
                    : 'bg-slate-50 dark:bg-zinc-950 border-transparent hover:border-slate-200 dark:hover:border-zinc-800'
                  }`}
              >
                <div className={`size-20 rounded-[1.8rem] flex items-center justify-center transition-all duration-500 ${method === 'bank' ? 'bg-primary text-white -rotate-6' : 'bg-white dark:bg-zinc-800 text-slate-300'
                  }`}>
                  <span className="material-symbols-outlined text-4xl font-black" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance</span>
                </div>
                <div className="flex-1 text-left">
                  <p className={`text-xl font-black uppercase tracking-tighter transition-colors ${method === 'bank' ? 'text-primary' : 'text-slate-700 dark:text-slate-400'}`}>โอนเงินผ่านธนาคาร</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">แนบสลิปด้วยตนเอง</p>

                </div>
                {method === 'bank' && (
                  <div className="bg-primary size-8 rounded-full flex items-center justify-center text-white shadow-lg animate-in zoom-in duration-300">
                    <span className="material-symbols-outlined text-lg font-black">check</span>
                  </div>
                )}
              </button>
            </div>

            {method === 'bank' && (
              <div className="mt-12 animate-in fade-in slide-in-from-top-4 duration-500">
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mb-6 px-2">เลือกธนาคารของคุณ</p>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {BANKS.map((bank) => (
                      <button
                        key={bank.id}
                        onClick={() => setSelectedBank(bank)}
                        className={`flex flex-col items-center gap-4 p-6 rounded-[2rem] border-2 transition-all duration-300 active:scale-95 ${selectedBank?.id === bank.id
                            ? 'bg-primary border-primary text-white shadow-2xl scale-105'
                            : 'bg-white border-slate-100'
                          }`}
                      >
                        <div
                          className="size-14 rounded-2xl flex items-center justify-center text-white shadow-lg overflow-hidden p-2 bg-white border border-slate-100"
                        >
                          <Landmark className="size-6 text-slate-300" />
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-tight text-center leading-none ${selectedBank?.id === bank.id ? 'text-white' : 'text-slate-400'}`}>
                          {bank.name}
                        </span>
                      </button>
                    ))}
                  </div>
              </div>
            )}
          </section>
        ) : (
          <section className="animate-in slide-in-from-right-5 duration-500">
            {/* Confirmation UI (if needed, or just auto-continue) */}
          </section>
        )}

        <div className="mt-12 bg-slate-50 dark:bg-zinc-950 rounded-[2.5rem] p-9 border border-slate-100 dark:border-zinc-800 relative overflow-hidden group">
          <div className="flex justify-between items-center mb-1 relative z-10">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">ยอดรวมที่ต้องชำระ</span>

            <span className="text-3xl font-black text-primary tracking-tighter transition-transform group-hover:scale-105 duration-500">
              ฿ {totalPrice.toLocaleString()}.00
            </span>
          </div>
          <p className="text-[9px] font-black text-slate-300 dark:text-zinc-600 uppercase tracking-[0.4em] text-right relative z-10">
            ธุรกรรมปลอดภัย 100%

          </p>
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
        </div>
          </div>
        </main>

        <footer className="fixed bottom-20 left-0 right-0 p-8 bg-white/95 backdrop-blur-2xl border-t border-slate-50 z-50">
           <div className="max-w-4xl mx-auto px-4 flex flex-col gap-4">
              <button
                onClick={handleContinue}
                disabled={!method || (method === 'bank' && !selectedBank)}
                className={`w-full h-18 font-sans font-black rounded-[2rem] shadow-2xl transition-all flex items-center justify-center gap-4 active:scale-95 uppercase tracking-[0.25em] text-sm group ${!method || (method === 'bank' && !selectedBank)
                    ? 'bg-slate-50 text-slate-200 cursor-not-allowed'
                    : 'bg-primary text-white shadow-primary/30'
                  }`}
              >
                 {method === 'bank' ? 'ยืนยันธนาคาร' : 'ดำเนินการชำระเงิน'}
                 <ArrowRight className="size-6 group-hover:translate-x-2 transition-transform" />
              </button>
           </div>
        </footer>
      </div>
    </div>

  );
};

export default Payment;

