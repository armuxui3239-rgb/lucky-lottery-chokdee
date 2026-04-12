import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSiteConfig } from '../lib/SiteConfigContext';
import { supabase } from '../lib/supabase';
import { searchLotteryResults } from '../services/lottery';
import { Calendar, Search, ChevronLeft, Trophy, Star, ArrowRight, Share2, Zap, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Results: React.FC = () => {
  const navigate = useNavigate();
  const { config: _config } = useSiteConfig();
  const [latestResult, setLatestResult] = useState<any>(null);
  const [dateFilter, setDateFilter] = useState('');
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const fetchLatestResult = async () => {
      try {
        const { data, error } = await supabase
          .from('lottery_results')
          .select('*, lottery_rounds(*)')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) throw error;
        if (data) setLatestResult(data);
      } catch (err) {
        console.warn('Using fallback data - Results not yet published to database');
      }
    };

    fetchLatestResult();
  }, []);

  const handleSearch = async () => {
    if (!dateFilter) {
      toast.error('กรุณาเลือกวันที่ต้องการค้นหา');
      return;
    }
    setSearching(true);
    try {
      const result = await searchLotteryResults(dateFilter);
      if (result) {
        setLatestResult(result);
        toast.success(`พบข้อมูลการออกรางวัลของงวดวันที่ ${dateFilter}`);
      } else {
        toast.error('ไม่พบข้อมูลการออกรางวัลในวันที่ระบุ');
      }
    } catch (error) {
       toast.error('เกิดข้อผิดพลาดในการค้นหา');
    } finally {
      setSearching(false);
    }
  };

  // Sync state with UI structure
  const drawDate = latestResult?.lottery_rounds?.name || "ยังไม่มีข้อมูลการออกรางวัล";
  const l6Result = latestResult?.result_6digit || "------";
  const n3Result = latestResult?.result_6digit?.slice(-3) || "---";
  const r3top = latestResult?.r3top?.split(',') || ["---", "---"];
  const r3low = latestResult?.r3low?.split(',') || ["---", "---"];
  const r2bot = latestResult?.r2bot || "--";
  const specialPrize = latestResult?.result_special || "---";

  const getPermutations = (str: string) => {
    if (str.includes('-') || str.includes(' ')) return [];
    const results: string[] = [];
    const digits = str.split('');

    const permute = (arr: string[], m: string[] = []) => {
      if (arr.length === 0) {
        results.push(m.join(''));
      } else {
        for (let i = 0; i < arr.length; i++) {
          const curr = arr.slice();
          const next = curr.splice(i, 1);
          permute(curr.slice(), m.concat(next));
        }
      }
    };

    permute(digits);
    return Array.from(new Set(results)); // Unique permutations
  };

  const toadNumbers = getPermutations(n3Result);

  const prizeResults = [
    { name: 'รางวัลที่ 1', numbers: l6Result.split(''), prize: '6,000,000 ฿' },
    { name: 'เลขหน้า 3 ตัว', numbers: [...r3top], prize: '4,000 ฿' },
    { name: 'เลขท้าย 3 ตัว', numbers: [...r3low], prize: '4,000 ฿' },
    { name: 'เลขท้าย 2 ตัว', numbers: [r2bot[0], r2bot[1]], prize: '2,000 ฿' },
  ];

  return (
    <div className="bg-white min-h-screen text-slate-900 font-prompt animate-in fade-in duration-500 w-full overflow-x-hidden">
      <div className="relative w-full flex flex-col min-h-screen">

        
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-[60] bg-white/90 backdrop-blur-2xl border-b border-slate-50 py-6 px-8 shadow-sm">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <button onClick={() => navigate(-1)} className="size-12 flex items-center justify-center bg-slate-50 text-slate-400 hover:text-primary rounded-2xl transition-all active:scale-90 shadow-sm border border-slate-100">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-base font-sans font-black tracking-[0.2em] uppercase text-slate-900 leading-none">ผลการออกรางวัล</h1>
            <button className="size-12 flex items-center justify-center bg-slate-50 text-slate-400 hover:text-primary rounded-2xl transition-all active:scale-90 shadow-sm border border-slate-100">
              <Share2 size={20} />
            </button>
          </div>
        </header>


        <main className="flex-1 pt-32 pb-40">
          <div className="max-w-5xl mx-auto space-y-16">

          {/* Compact Government Official Header - Borderless */}
          <section className="px-4 sm:px-8 -mt-24 mb-6">
            <div className="flex items-center gap-6 w-full py-6">
              <div className="w-[80px] sm:w-[120px] flex items-center justify-center shrink-0">
                <img src="/glo-logo.png" className="w-full h-auto object-contain" alt="GLO Logo" />
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <h2 className="text-lg sm:text-2xl font-sans font-black text-slate-900 tracking-tighter leading-tight">
                  ผลการออกรางวัลสลากกินแบ่งรัฐบาล
                </h2>
                <p className="text-[10px] sm:text-xs font-black text-primary uppercase tracking-[0.25em] mt-1">
                  {drawDate}
                </p>
              </div>
            </div>
          </section>

          {/* Main Results Container */}
          <section className="px-4 sm:px-8 space-y-10 relative">
            {searching && (
              <div className="absolute inset-x-4 sm:inset-x-8 inset-y-0 bg-white/60 backdrop-blur-sm z-50 rounded-[2rem] sm:rounded-[3rem] flex items-center justify-center">
                <Loader2 className="size-12 text-primary animate-spin" />
              </div>
            )}
            <div className="bg-white rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-12 shadow-xl shadow-slate-100/50 space-y-10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-12 opacity-[0.02] group-hover:opacity-[0.04] transition-opacity pointer-events-none">
                <Trophy size={200} className="rotate-12" />
              </div>

              {/* L6 Result Section */}
              <div className="space-y-10 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="h-10 px-4 bg-primary rounded-xl flex items-center justify-center text-white font-sans font-black text-sm tracking-widest shadow-lg shadow-red-200">
                    L6
                  </div>
                  <h3 className="text-2xl font-sans font-black text-slate-900 tracking-tighter uppercase">สลากหกหลัก</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                  <div className="space-y-4">
                    <div className="flex flex-col">
                       <span className="text-xs font-black text-slate-900 leading-none">รางวัลที่ 1</span>
                       <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-loose">รางวัลละ 6,000,000 บาท</span>
                    </div>
                    <div className="h-24 bg-red-50 rounded-[2rem] flex items-center justify-center text-5xl font-sans font-black tracking-tighter text-slate-900 shadow-inner">
                      {l6Result}
                    </div>
                  </div>

                  <div className="space-y-4 md:border-l border-slate-100 md:pl-12">
                    <div className="flex flex-col">
                       <span className="text-xs font-black text-slate-900 leading-none">รางวัลเลขหน้า 3 ตัว</span>
                       <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-loose">รางวัลละ 4,000 บาท</span>
                    </div>
                    <div className="h-24 flex items-center gap-6 text-4xl font-sans font-black text-slate-800  tracking-tighter">
                      {r3top.join('  ')}
                    </div>
                  </div>

                  <div className="space-y-4 lg:border-l border-slate-100 lg:pl-12">
                    <div className="flex flex-col">
                       <span className="text-xs font-black text-slate-900 leading-none">รางวัลเลขท้าย 3 ตัว</span>
                       <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-loose">รางวัลละ 4,000 บาท</span>
                    </div>
                    <div className="h-24 flex items-center gap-6 text-4xl font-sans font-black text-slate-800  tracking-tighter">
                      {r3low.join('  ')}
                    </div>
                  </div>

                  <div className="space-y-4 lg:border-l border-slate-100 lg:pl-12">
                    <div className="flex flex-col">
                       <span className="text-xs font-black text-slate-900 leading-none">รางวัลเลขท้าย 2 ตัว</span>
                       <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-loose">รางวัลละ 2,000 บาท</span>
                    </div>
                    <div className="h-24 flex items-center text-4xl font-sans font-black text-slate-900 tracking-tighter">
                      {r2bot}
                    </div>
                  </div>
                </div>
              </div>

              <div className="h-px bg-slate-50 w-full" />

              {/* N3 Result Section */}
              <div className="space-y-10 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="h-10 px-4 bg-primary rounded-xl flex items-center justify-center text-white font-sans font-black text-sm tracking-widest shadow-xl shadow-red-200">
                    N3
                  </div>
                  <h3 className="text-2xl font-sans font-black text-slate-900 tracking-tighter uppercase">สลากตัวเลขสามหลัก</h3>
                  <div className="flex items-center gap-2 bg-red-600 px-4 py-1.5 rounded-full shadow-lg shadow-red-200 animate-pulse">
                     <Star size={12} className="text-white fill-white" />
                     <span className="text-[10px] font-black text-white uppercase tracking-widest leading-none">ใหม่</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                  <div className="space-y-4">
                    <div className="flex flex-col">
                       <span className="text-xs font-black text-slate-900 leading-none">รางวัลสามตรง</span>
                       <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-loose">รางวัลละ 2,644 บาท</span>
                    </div>
                    <div className="h-24 bg-[#F2E8A1] rounded-[2rem] flex items-center justify-center text-5xl font-sans font-black tracking-tighter text-slate-800  shadow-inner">
                      {n3Result}
                    </div>
                  </div>

                  <div className="space-y-4 md:border-l border-slate-100 md:pl-12">
                    <div className="flex flex-col">
                       <span className="text-xs font-black text-slate-900 leading-none">รางวัลสามสลับหลัก</span>
                       <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-loose">รางวัลละ 598 บาท</span>
                    </div>
                    <div className="h-24 flex flex-wrap items-center gap-x-6 gap-y-2 text-2xl font-sans font-black text-slate-700  tracking-tighter">
                      {toadNumbers.length > 0 ? (
                        toadNumbers.map((num, i) => <span key={i}>{num}</span>)
                      ) : (
                        <span>---</span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4 lg:border-l border-slate-100 lg:pl-12">
                    <div className="flex flex-col">
                       <span className="text-xs font-black text-slate-900 leading-none">รางวัลสองตรง</span>
                       <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-loose">รางวัลละ 500 บาท</span>
                    </div>
                    <div className="h-24 flex items-center text-4xl font-sans font-black text-slate-900 tracking-tighter">
                      {r2bot}
                    </div>
                  </div>

                  <div className="space-y-4 lg:border-l border-slate-100 lg:pl-12">
                    <div className="flex flex-col">
                       <span className="text-xs font-black text-slate-900 leading-none">รางวัลพิเศษ</span>
                       <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-loose">รางวัลละ 724,332 บาท</span>
                    </div>
                    <div className="h-24 flex items-center text-3xl font-sans font-black text-slate-800  tracking-tighter truncate max-w-[200px]">
                      {specialPrize}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Secondary Prize Grid */}
          <section className="px-8 space-y-8 animate-in fade-in slide-in-from-bottom duration-700">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-2xl font-sans font-black text-slate-900 uppercase tracking-tighter leading-none">รางวัลอื่นประจำงวด</h3>
              <div className="flex items-center gap-3 text-primary bg-red-50 px-4 py-2 rounded-xl border border-red-100">
                <Calendar size={16} />
                <span className="text-xs font-black uppercase tracking-widest">งวดล่าสุด</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {prizeResults.slice(1).map((prize, idx) => (
                <div key={idx} className="p-8 rounded-[3rem] bg-slate-50 flex flex-col items-center justify-center text-center space-y-6 relative overflow-hidden group hover:bg-white hover:shadow-xl hover:shadow-black/5 transition-all">
                  <div className="absolute top-6 left-6 size-10 bg-white rounded-xl shadow-sm flex items-center justify-center opacity-40 group-hover:opacity-100 transition-opacity">
                    <Star className="text-amber-500 fill-amber-500 size-4" />
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] leading-none ">{prize.name}</p>
                    <p className="text-[9px] font-black text-primary uppercase tracking-widest">เงินรางวัลรวม: {prize.prize}</p>

                  </div>
                  
                  <div className="flex items-center gap-3">
                    {prize.numbers.map((n: string, i: number) => (
                      n === '|' ? <div key={i} className="w-1 h-10 bg-slate-200 rounded-full mx-3" /> :
                      <div key={i} className="size-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-2xl font-sans font-black text-slate-900  shadow-2xl group-hover:scale-110 transition-transform">
                        {n}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Precision Search Console */}
          <section className="px-8 pb-10">
            <div className="p-10 rounded-[3rem] bg-primary text-white flex flex-col items-center gap-10 shadow-2xl shadow-primary/20 relative overflow-hidden group">
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity blur-3xl"></div>
              <div className="size-20 rounded-[2rem] bg-white text-primary flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform relative z-10">
                <Search size={32} />
              </div>
              <div className="text-center relative z-10 space-y-3">
                <h3 className="text-2xl font-sans font-black text-white  tracking-tighter uppercase leading-none">ค้นหาประวัติย้อนหลัง</h3>
                <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em]  leading-relaxed">เข้าถึงข้อมูลการออกรางวัลย้อนหลัง</p>

              </div>
              <div className="w-full relative px-2 z-10">
                <input 
                  type="date" 
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full h-16 bg-white/5 border border-white/10 rounded-3xl px-8 text-sm font-black focus:ring-4 focus:ring-primary/20 outline-none transition-all uppercase tracking-widest text-white"
                />
              </div>
              <button 
                onClick={handleSearch}
                disabled={searching}
                className="text-primary text-[10px] font-sans font-black uppercase tracking-[0.3em] flex items-center gap-3 hover:text-primary transition-colors relative z-10 leading-none disabled:opacity-50 px-6 py-4 bg-red-50 rounded-2xl border border-red-100 hover:bg-red-100"
              >
                {searching ? 'กำลังค้นหา...' : 'ดูประวัติการออกรางวัลทั้งหมด'}
                {!searching && <ArrowRight size={16} />}
              </button>
            </div>
          </section>
        </div>
      </main>


        <footer className="fixed bottom-20 left-0 right-0 p-8 bg-white/95 backdrop-blur-2xl border-t border-slate-50 z-50">
           <div className="max-w-5xl mx-auto px-4">
              <button 
                onClick={() => navigate('/history')}
                className="w-full h-18 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-[2rem] font-sans font-black text-sm uppercase tracking-widest shadow-2xl shadow-red-200 flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-95 transition-all"
              >
                 ตรวจสอบสลากของฉัน
                 <Zap className="w-6 h-6 fill-white" />
              </button>
           </div>
        </footer>

      </div>
    </div>
  );
};

export default Results;

