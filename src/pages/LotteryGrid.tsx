import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { useCart } from '../lib/CartContext';
import { toast } from 'react-hot-toast';
import { ShoppingCart, Ticket as TicketIcon, Filter, X, Sparkles } from 'lucide-react';
import { getActiveRounds, type Ticket, generateVirtualTickets } from '../services/lottery';
import NumberKeypad from '../components/lottery/NumberKeypad';

const LotteryGrid: React.FC = () => {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { profile } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [isKeypadOpen, setIsKeypadOpen] = useState(false);
  const [activeSlotIndex, setActiveSlotIndex] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q');
    if (q) {
       const initialDigits = q.split('').slice(0, 6).concat(Array(6).fill('')).slice(0, 6);
       setDigits(initialDigits);
       setSearchQuery(q);
    }
    fetchTickets(q || searchQuery);
  }, [location.search]);

  const handleSlotClick = (index: number) => {
    setActiveSlotIndex(index);
    setIsKeypadOpen(true);
  };

  const handleKeypadNumber = (num: string) => {
    const newDigits = [...digits];
    newDigits[activeSlotIndex] = num;
    setDigits(newDigits);

    const fullQuery = newDigits.filter(d => d !== '').join('');
    setSearchQuery(fullQuery);
    fetchTickets(fullQuery);

    if (activeSlotIndex < 5) {
      setActiveSlotIndex(prev => prev + 1);
    } else {
      setIsKeypadOpen(false);
      // Trigger Ticket Pop-up if 6 digits
      if (newDigits.every(d => d !== '')) {
        setShowPopup(true);
        setTimeout(() => setShowPopup(false), 3000);
      }
    }
  };

  const handleKeypadDelete = () => {
    const newDigits = [...digits];
    newDigits[activeSlotIndex] = '';
    setDigits(newDigits);

    const fullQuery = newDigits.filter(d => d !== '').join('');
    setSearchQuery(fullQuery);
    fetchTickets(fullQuery);

    if (activeSlotIndex > 0) {
      setActiveSlotIndex(prev => prev - 1);
    }
  };

  const clearSearch = () => {
    setDigits(['', '', '', '', '', '']);
    setSearchQuery('');
    fetchTickets('');
    setActiveSlotIndex(0);
    setIsKeypadOpen(false);
  };

  const fetchTickets = async (query?: string) => {
    setLoading(true);
    try {
      const rounds = await getActiveRounds();
      if (rounds.length === 0) {
        setTickets([]);
        return;
      }
      const activeRound = rounds[0];

      let results: Ticket[] = [];
      if (query && query.length > 0) {
         const { data: dbTickets } = await supabase
           .from('lottery_tickets')
           .select('*')
           .is('user_id', null)
           .eq('round_id', activeRound.id)
           .ilike('ticket_number', `${query}%`)
           .limit(20);
         results = (dbTickets || []) as Ticket[];
      }

      if (query && query.length === 6) {
        const exactMatch = results.find(t => t.ticket_number === query);
        if (!exactMatch) {
          const virtual = generateVirtualTickets([query], activeRound)[0];
          results = [virtual, ...results];
        }
      }

      if (results.length < 12) {
        const needed = 12 - results.length;
        const randoms = Array(needed).fill(0).map(() => {
          let num = query || '';
          while (num.length < 6) {
            num += Math.floor(Math.random() * 10).toString();
          }
          return num;
        });
        const virtuals = generateVirtualTickets(randoms, activeRound);
        results = [...results, ...virtuals];
      }

      const unique = results.filter((v, i, a) => a.findIndex(t => t.ticket_number === v.ticket_number) === i);
      setTickets(unique.slice(0, 24));
    } catch (error: any) {
      console.error('Inventory Logic Error:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const onAddToCart = (ticket: Ticket) => {
    if (profile?.kyc_status !== 'verified') {
      toast.error('กรุณายืนยันตัวตน (KYC) ก่อนเริ่มซื้อสลาก', {
        icon: '🛡️',
        style: { borderRadius: '1.5rem', background: '#334155', color: '#fff', fontFamily: 'Prompt' }
      });
      navigate('/kyc');
      return;
    }
    
    addItem({
      id: ticket.id,
      lottery_id: ticket.round_id,
      number: ticket.ticket_number,
      setType: 'ใบเดี่ยว',
      price: ticket.price,
      count: 1
    });
    toast.success(`เพิ่มเลข ${ticket.ticket_number} ลงตะกร้าแล้ว`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white font-prompt pb-24 overflow-x-hidden">
      
      {/* 6-Digit Search Strategy Header */}
      <section className="sticky top-[73px] z-30 bg-white border-b border-slate-100 shadow-sm w-full">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex flex-col items-center gap-8">
            
            <div className="flex flex-col items-center text-center gap-2">
               <h2 className="text-sm font-black text-slate-300 uppercase tracking-[0.4em] ">ระบุเลขนำโชคของคุณ</h2>
               <div className="h-1 w-12 bg-primary rounded-full"></div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-8 w-full max-w-2xl">
              <div className="flex gap-2 sm:gap-4 justify-center flex-1">
                {digits.map((digit, idx) => (
                  <motion.input
                    key={idx}
                    ref={(el) => { inputRefs.current[idx] = el; }}
                    type="text"
                    readOnly
                    value={digit}
                    onClick={() => handleSlotClick(idx)}
                    whileTap={{ scale: 0.95 }}
                    className={`size-12 sm:size-16 rounded-2xl border-[3px] flex items-center justify-center text-center text-2xl sm:text-4xl font-sans font-black transition-all duration-200 outline-none selection:bg-transparent cursor-pointer ${
                      activeSlotIndex === idx && isKeypadOpen
                      ? 'border-red-600 ring-8 ring-red-600/5 bg-white scale-110 z-10 shadow-2xl'
                      : digit 
                        ? 'bg-red-600 border-red-600 text-white shadow-xl shadow-red-200' 
                        : 'bg-slate-50 border-red-600/20 text-slate-400'
                    }`}
                    placeholder="•"
                  />
                ))}
              </div>
              
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="size-14 bg-slate-50 text-slate-300 hover:text-primary rounded-2xl transition-all border border-slate-100 flex items-center justify-center shrink-0 active:scale-90"
                >
                  <X size={24} />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Epic Ticket Pop-up Animation */}
      <AnimatePresence>
         {showPopup && (
           <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
              <motion.div 
                initial={{ scale: 0, rotate: -15, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                exit={{ scale: 1.5, opacity: 0, filter: 'blur(20px)' }}
                transition={{ type: 'spring', damping: 15, stiffness: 200 }}
                className="relative w-80 aspect-[2/1] bg-cover bg-center rounded-2xl shadow-[0_40px_100px_rgba(236,19,30,0.4)] flex flex-col items-end justify-center pr-10 border-4 border-white overflow-hidden"
                style={{ backgroundImage: "url('/ticket-bg.png')" }}
              >
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-transparent to-white/20 animate-pulse"></div>
                  <span className="text-4xl md:text-5xl font-sans font-black tracking-[0.3em] text-slate-800 drop-shadow-2xl z-10">
                    {digits.join('')}
                  </span>
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="absolute bottom-4 left-4 bg-red-600 px-3 py-1 rounded-lg text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg"
                  >
                    <Sparkles size={12} /> พบเลขนำโชคแล้ว
                  </motion.div>
              </motion.div>
           </div>
         )}
      </AnimatePresence>

      {/* Number Keypad Integration */}
      <NumberKeypad 
        isOpen={isKeypadOpen}
        onClose={() => setIsKeypadOpen(false)}
        onNumberClick={handleKeypadNumber}
        onDeleteClick={handleKeypadDelete}
        onClearClick={clearSearch}
      />

      {/* Grid Content */}
      <div className="max-w-7xl mx-auto px-6 py-12 w-full">
        <div className="flex items-center justify-between mb-10 border-l-4 border-red-600 pl-6">
           <div className="flex flex-col">
              <h3 className="text-2xl font-sans font-black text-slate-900 tracking-tight uppercase leading-none ">ผลการค้นหาสลาก</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-2">มีสลากพร้อมขาย {tickets.length} ใบ</p>
           </div>
           <button className="hidden sm:flex items-center gap-3 text-red-600 text-xs font-black uppercase tracking-widest bg-red-50 px-6 py-4 rounded-2xl border border-red-100 hover:bg-red-100 transition-all">
             <span>กรองตัวเลข</span>
             <Filter size={16} />
           </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-6">
          {loading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-white rounded-[2rem] border border-slate-100 animate-pulse shadow-sm" />
            ))
          ) : tickets.length > 0 ? (
            tickets.map((ticket) => (
              <motion.div
                key={ticket.id}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="relative overflow-hidden w-full aspect-[2/1] rounded-xl shadow-[0_10px_20px_rgba(0,0,0,0.15)] hover:shadow-[0_15px_30px_rgba(236,19,30,0.2)] bg-cover bg-center cursor-pointer group"
                style={{ backgroundImage: "url('/ticket-bg.png')" }}
                onClick={() => onAddToCart(ticket)}
              >
                <div className="absolute inset-0 flex flex-col items-end justify-center pr-[12%] pt-[2%] md:pt-[0%]">
                  <span className="text-[3vw] sm:text-xl lg:text-2xl font-sans font-black tracking-[0.3em] text-slate-800 drop-shadow-sm bg-white/70 px-2 py-1 rounded-sm backdrop-blur-sm">
                    {ticket.ticket_number}
                  </span>
                </div>
                <div className="absolute bottom-[10%] left-[5%]">
                  <span className="text-[3vw] sm:text-sm lg:text-base font-sans font-black text-white bg-[#ec131e] px-2 py-0.5 rounded shadow-lg border border-red-400">
                    {ticket.price.toLocaleString()} ฿
                  </span>
                </div>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                   <div className="size-10 sm:size-12 bg-red-600 text-white rounded-full flex items-center justify-center shadow-2xl transform scale-50 group-hover:scale-100 transition-transform duration-300">
                     <ShoppingCart size={20} />
                   </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-20 flex flex-col items-center text-center px-8 border-2 border-dashed border-slate-200 rounded-[3rem] bg-slate-50/50">
              <div className="size-24 rounded-[2rem] bg-white flex items-center justify-center text-slate-200 shadow-xl mb-6">
                <TicketIcon size={48} />
              </div>
              <h4 className="text-2xl font-black text-slate-900">ไม่พบเลขที่คุณตามหา</h4>
              <p className="text-sm text-slate-400 mt-3 font-medium">ลองเปลี่ยนเลขที่ค้นหา หรือเลือกดูจากหมวดหมู่เลขดัง</p>
              <button
                onClick={() => { setSearchQuery(''); fetchTickets(''); }}
                className="mt-10 bg-red-600 text-white px-10 py-3.5 rounded-[1.8rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:scale-105 active:scale-95 transition-all"
              >
                ดูเลขเด่นประจำงวด
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LotteryGrid;
