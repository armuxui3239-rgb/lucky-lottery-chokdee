import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { useSiteConfig } from '../lib/SiteConfigContext';
import {
  getActiveRounds,
  generateRandomTickets,
  purchaseTickets,
  getPopularNumbers,
  type LotteryRound,
} from '../services/lottery';
import { toast } from 'react-hot-toast';
import {
  Trophy, Sparkles,
  Flame, Star, Zap, TrendingUp, ChevronRight,
  Shuffle, ShoppingBag, X, Ticket as TicketIcon
} from 'lucide-react';

import WinnerTicker from '../components/WinnerTicker';

export default function Home() {
  const { user, balance, refreshProfile } = useAuth();
  const { config } = useSiteConfig();
  const navigate = useNavigate();

  const [activeRound, setActiveRound] = useState<LotteryRound | null>(null);
  const [suggestedNumbers, setSuggestedNumbers] = useState<string[]>([]);
  const [popularNumbers, setPopularNumbers] = useState<{ ticket_number: string; purchase_count: number }[]>([]);
  const [selectedNumbers, setSelectedNumbers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [activePill, setActivePill] = useState(0);

  const [currentSlide, setCurrentSlide] = useState(0);
  const banners = [
    config.banner_1_url || '/banner_lottery_horizontal_1.png',
    config.banner_2_url || '/banner_lottery_horizontal_2.png',
    config.banner_3_url || '/banner_lottery_horizontal_3.png'
  ].filter(url => url.trim() !== '');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const loadData = async () => {
    try {
      setFetching(true);
      const rounds = await getActiveRounds();
      if (rounds.length > 0) {
        const round = rounds[0];
        setActiveRound(round);

        // โหลดเลขยอดนิยม
        try {
          const popular = await getPopularNumbers(round.id, 12);
          setPopularNumbers(popular);
        } catch { /* ไม่มีข้อมูลยังไม่เป็นไร */ }
      }
      // สร้างเลขสุ่มแนะนำ 12 ใบ
      setSuggestedNumbers(generateRandomTickets(12));
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleShuffle = () => {
    setSuggestedNumbers(generateRandomTickets(12));
  };

  const toggleSelect = (number: string) => {
    setSelectedNumbers(prev =>
      prev.includes(number)
        ? prev.filter(n => n !== number)
        : [...prev, number]
    );
  };

  const handleBuySelected = async () => {
    if (!user) { toast.error('กรุณาเข้าสู่ระบบก่อนซื้อ'); navigate('/login'); return; }
    if (!activeRound) { toast.error('ขณะนี้ไม่มีงวดที่เปิดรับซื้อ'); return; }
    if (selectedNumbers.length === 0) { toast.error('กรุณาเลือกเลขก่อน'); return; }

    const price = activeRound.price_per_ticket;
    const total = price * selectedNumbers.length;

    if (balance < total) {
      toast.error(`ยอดเงินไม่เพียงพอ (มี ${balance.toFixed(0)} ฿ ต้องการ ${total} ฿)`);
      navigate('/deposit');
      return;
    }

    setLoading(true);
    try {
      const result = await purchaseTickets(user.id, selectedNumbers, activeRound.id, total);
      if (result.success) {
        toast.success(result.message);
        setSelectedNumbers([]);
        await refreshProfile();
      } else {
        toast.error(result.message);
      }
    } catch (err: any) {
      toast.error('เกิดข้อผิดพลาด: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const pills = [
    { label: 'ทั้งหมด', icon: <TicketIcon size={14} />, color: 'primary' },
    { label: 'เลขยอดนิยม', icon: <TrendingUp size={14} />, color: 'emerald' },
    { label: 'เลขเด็ดประจำวัน', icon: <Star size={14} />, color: 'amber' },
    { label: 'เลขแนะนำ', icon: <Zap size={14} />, color: 'orange' },
  ];

  const displayNumbers = activePill === 1 && popularNumbers.length > 0
    ? popularNumbers.map(p => p.ticket_number)
    : suggestedNumbers;

  return (
    <div className="flex flex-col min-h-screen bg-white animate-in fade-in duration-700 font-prompt relative overflow-hidden">
      {/* Sparkles Overlay (Subtle) */}
      <div className="absolute inset-0 sparks-light pointer-events-none opacity-20" />

      {/* Winner Ticker */}
      <WinnerTicker />

      {/* Hero Banner with Auto Slider (Horizontal 3:1) */}
      <section className="relative w-full aspect-[3/1] overflow-hidden shadow-2xl">
        {/* Slider Backgrounds */}
        {banners.map((banner, idx) => (
          <div 
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${currentSlide === idx ? 'opacity-100' : 'opacity-0'}`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/40 to-transparent z-10" />
            <img 
              src={banner} 
              alt={`แบนเนอร์ประชาสัมพันธ์ ${idx + 1}`} 
              className="w-full h-full object-cover transform scale-105 animate-slow-zoom"
            />
          </div>
        ))}

        <div className="max-w-7xl mx-auto px-8 h-full relative z-20 flex flex-col justify-center">
          <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12 pointer-events-none hidden md:block text-white">
            <Trophy size={250} />
          </div>
          
          <div className="flex flex-col items-start text-left space-y-8">
            <div className="animate-in slide-in-from-left duration-700">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-[9px] font-black uppercase tracking-[0.2em] text-amber-300">
                <Sparkles size={12} className="animate-pulse" />
                <span>{config.site_tagline || 'เปิดให้เลือกเลขแล้ว — ไม่มีเลขอั้น'}</span>
              </div>
              <h2 className="text-5xl md:text-7xl font-display font-black text-white italic tracking-tighter mt-6 leading-[0.95] drop-shadow-2xl" dangerouslySetInnerHTML={{ __html: config.hero_title.replace('\n', '<br />') || 'สลาก 6 หลัก<br /><span class="text-amber-300 drop-shadow-[0_0_15px_rgba(251,191,36,0.4)]">เลือกเองได้เลย!</span>' }} />
              {config.hero_subtitle && (
                <p className="text-white/60 text-[11px] font-black leading-relaxed mt-4 max-w-[85%]">{config.hero_subtitle}</p>
              )}
              {activeRound && (
                <div className="text-[11px] text-white/60 mt-6 font-black uppercase tracking-[0.3em] backdrop-blur-sm bg-black/10 px-4 py-2 rounded-xl w-fit border border-white/5">
                  งวดวันที่: {new Date(activeRound.draw_date).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}
                  {' · '}ราคาใบละ {activeRound.price_per_ticket} บาท
                </div>
              )}
            </div>
          </div>
        </div>
      </section>


      <main className="flex-1 bg-white pt-10 pb-32 relative z-30">
        <div className="max-w-7xl mx-auto space-y-12">
          
          {/* Selected Numbers Bar */}
          {selectedNumbers.length > 0 && (
            <div className="px-6 space-y-4 animate-in slide-in-from-top duration-300">

            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">
                เลขที่เลือก ({selectedNumbers.length} ใบ)
              </h3>
              <span className="text-primary font-black text-sm">
                {activeRound ? `${(activeRound.price_per_ticket * selectedNumbers.length).toLocaleString()} ฿` : ''}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedNumbers.map(num => (
                <div key={num} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-100 rounded-2xl">
                  <span className="font-black text-sm text-primary tracking-widest">{num}</span>
                  <button onClick={() => toggleSelect(num)} className="text-slate-400 hover:text-primary transition-colors">
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={handleBuySelected}
              disabled={loading}
              className="w-full h-14 bg-gradient-to-r from-[#FF0000] to-rose-600 text-white rounded-[1.5rem] font-display font-black text-sm uppercase tracking-widest shadow-xl shadow-red-200 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-60"
            >
              {loading ? (
                <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><ShoppingBag size={18} /> ซื้อเลยทันที {selectedNumbers.length} ใบ</>
              )}
            </button>
          </div>
        )}

        {/* Category Pills */}
        <div className="w-full overflow-x-auto no-scrollbar px-6 flex items-center gap-3">
          {pills.map((pill, i) => (
            <button
              key={i}
              onClick={() => {
                setActivePill(i);
                if (i === 0 || i === 2) handleShuffle();
              }}
              className={`flex items-center gap-2 px-5 py-3 whitespace-nowrap rounded-full shadow-md shadow-black/5 transition-all active:scale-95 ${
                activePill === i
                  ? 'bg-primary text-white border-primary shadow-primary/20'
                  : 'bg-white border border-slate-100 text-slate-700 hover:border-primary/30'
              }`}
            >
              <span className={activePill === i ? 'text-white' : `text-${pill.color}-500`}>{pill.icon}</span>
              <span className="text-xs font-black uppercase tracking-tight">{pill.label}</span>
            </button>
          ))}
        </div>

        {/* Lottery Grid */}
        <section className="px-6 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-sm font-display font-black text-slate-900 uppercase tracking-widest italic flex items-center gap-2">
              <Zap size={14} className="text-amber-500 fill-amber-500" />
              {activePill === 1 ? 'เลขยอดนิยมประจำงวด' : 'เลขแนะนำสำหรับคุณ'}
            </h3>
            <button onClick={handleShuffle} className="text-[10px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-1">
              <Shuffle size={12} /> สุ่มใหม่
            </button>
          </div>

          {!activeRound && !fetching ? (
            <div className="col-span-2 text-center py-12 rounded-[2rem] bg-slate-50 border border-dashed border-slate-200">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">ขณะนี้ยังไม่มีงวดที่เปิดรับซื้อ</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6 pb-12">

              {fetching ? (
                Array(8).fill(0).map((_, i) => (
                  <div key={i} className="h-44 rounded-[2rem] bg-slate-50 animate-pulse" />
                ))
              ) : (
                displayNumbers.map((number) => {
                  const isSelected = selectedNumbers.includes(number);
                  const popCount = popularNumbers.find(p => p.ticket_number === number)?.purchase_count;
                  return (
                    <button
                      key={number}
                      onClick={() => toggleSelect(number)}
                      className={`relative p-5 rounded-[2rem] flex flex-col group overflow-hidden transition-all duration-300 active:scale-95 ${
                        isSelected
                          ? 'bg-primary text-white border-2 border-primary shadow-xl shadow-red-200 scale-[1.02]'
                          : 'bg-white border border-slate-100 shadow-xl shadow-black/5 hover:border-primary/20'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-3 right-3 size-5 rounded-full bg-white flex items-center justify-center">
                          <Zap size={10} className="text-primary fill-primary" />
                        </div>
                      )}

                      <div className="flex justify-between items-start mb-4">
                        <div className={`px-2 py-0.5 rounded-md ${isSelected ? 'bg-white/20' : 'bg-red-50 border border-red-100'}`}>
                          <span className={`text-[8px] font-black uppercase ${isSelected ? 'text-white' : 'text-primary'}`}>
                            {popCount ? `นิยม ${popCount}x` : 'พร้อมซื้อ'}
                          </span>
                        </div>
                        <div className={`size-1.5 rounded-full ${isSelected ? 'bg-amber-300' : 'bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]'}`} />
                      </div>

                      <div className="text-center my-4">
                        <span className={`text-2xl font-display font-black tracking-[0.1em] leading-none ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                          {number}
                        </span>
                      </div>

                      <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/20">
                        <div className="flex flex-col">
                          <span className={`text-[8px] font-bold uppercase tracking-widest ${isSelected ? 'text-white/60' : 'text-slate-400'}`}>ราคา</span>
                          <span className={`text-lg font-black italic leading-none ${isSelected ? 'text-white' : 'text-primary'}`}>
                            {activeRound?.price_per_ticket || 80} ฿
                          </span>
                        </div>
                        <div className={`size-10 rounded-[1.2rem] flex items-center justify-center shadow-lg transition-all ${
                          isSelected ? 'bg-white text-primary' : 'bg-[#FF0000] text-white shadow-primary/20'
                        }`}>
                          {isSelected ? <X size={16} /> : <ChevronRight size={18} />}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          )}
        </section>

          {/* Footer Banner — ชวนเพื่อน */}
          <section className="px-6 pb-20">
            <div className="p-10 rounded-[3.5rem] bg-primary border border-white/5 relative overflow-hidden group shadow-2xl shadow-primary/20">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                <div className="space-y-4">
                  <div className="size-14 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10">
                    <TrendingUp className="text-emerald-400" size={28} />
                  </div>
                  <div>
                    <h4 className="text-2xl font-display font-black text-white italic tracking-tighter leading-none">สร้างรายได้ไปกับเรา</h4>
                    <p className="text-white/40 text-xs font-black uppercase tracking-[0.2em] mt-2">ชวนเพื่อน รับค่าแนะนำระดับพรีเมียมทันที 5-10%</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/affiliate')}
                  className="px-10 py-4 bg-white text-black rounded-2xl font-display font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all w-full md:w-auto"
                >
                  เริ่มสร้างรายได้ตอนนี้
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>

    </div>
  );
}