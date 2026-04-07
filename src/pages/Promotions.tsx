import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { Gift, Zap, Sparkles, ChevronLeft, ArrowRight, Star, Clock, Tag, Copy, CheckCircle, Users, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

interface Promotion {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  badge?: string;
  type: string;
  discount_type?: string;
  discount_value?: number;
  minimum_deposit?: number;
  code?: string;
  is_active: boolean;
  bg_gradient?: string;
  image_url?: string;
  end_date?: string;
  start_date?: string;
}

const typeLabel: Record<string, string> = {
  bonus: '🎁 โบนัส',
  cashback: '💰 เงินคืน',
  referral: '👥 แนะนำเพื่อน',
  deposit: '💳 ฝากเงิน',
  special: '⭐ พิเศษ',
};

const Promotions: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [promos, setPromos] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    fetchPromos();
  }, []);

  useEffect(() => {
    if (promos.length > 1) {
      const interval = setInterval(() => {
        setSlideIndex((prev) => (prev + 1) % promos.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [promos.length]);

  const fetchPromos = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setPromos(data || []);
    } catch (e: any) {
      toast.error('โหลดโปรโมชั่นไม่ได้: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedCode(code);
      toast.success(`คัดลอก "${code}" แล้ว! 📋`);
      setTimeout(() => setCopiedCode(null), 3000);
    });
  };

  const timeLeft = (endDate?: string) => {
    if (!endDate) return null;
    const diff = new Date(endDate).getTime() - Date.now();
    if (diff <= 0) return 'หมดอายุแล้ว';
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    if (d > 0) return `เหลือ ${d} วัน ${h} ชั่วโมง`;
    return `เหลือ ${h} ชั่วโมง`;
  };

  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen text-slate-900 font-prompt animate-in fade-in duration-500 w-full overflow-x-hidden pb-32">

      {/* Fixed Header */}
      <header className="sticky top-0 left-0 right-0 z-[60] bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border-b border-slate-100 dark:border-slate-800 py-4 px-5 shadow-sm">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="size-11 flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-primary rounded-2xl transition-all active:scale-90">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <h1 className="text-base font-display font-black tracking-tighter uppercase italic text-slate-900 dark:text-white leading-none">โปรโมชั่นพิเศษ</h1>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{promos.length} รายการที่เปิดใช้งาน</p>
          </div>
          <button onClick={fetchPromos} className="size-11 flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-primary rounded-2xl transition-all active:scale-90">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 pt-6 space-y-6">

        {/* Hero Banner */}
        <div className="relative rounded-[2.5rem] bg-gradient-to-br from-red-700 via-red-900 to-slate-900 overflow-hidden shadow-2xl shadow-red-900/30 p-8 group">
          <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 scale-150 group-hover:scale-125 transition-transform duration-700">
            <Zap className="w-40 h-40 text-white" />
          </div>
          <div className="relative z-10 space-y-5">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-xl bg-white/10 flex items-center justify-center">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              </div>
              <p className="text-[9px] font-black text-white/80 uppercase tracking-[0.3em]">โปรโมชั่นพิเศษ 2568</p>
            </div>
            <h2 className="text-3xl font-display font-black text-white italic tracking-tighter leading-none uppercase">
              สมัครวันนี้<br /><span className="text-amber-400">รับโบนัสทันที!</span>
            </h2>
            <p className="text-white/60 text-[11px] font-black leading-relaxed max-w-[85%]">
              สมาชิกใหม่รับโบนัสต้อนรับ 100% สูงสุด ฿500 · ฝากครั้งแรกรับทันที ไม่ต้องรอ
            </p>
            {!user ? (
              <Link to="/register" className="inline-flex items-center gap-2 px-8 h-12 bg-white text-red-700 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl hover:bg-amber-400 transition-all active:scale-95">
                สมัครสมาชิกฟรี <ArrowRight size={16} />
              </Link>
            ) : (
              <Link to="/deposit" className="inline-flex items-center gap-2 px-8 h-12 bg-white text-red-700 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl hover:bg-amber-400 transition-all active:scale-95">
                ฝากเงินรับโบนัส <ArrowRight size={16} />
              </Link>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Loyalty Section */}
          <div className="p-6 rounded-[2rem] bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/10 border border-amber-200 dark:border-amber-700/30 flex flex-col items-center gap-3 text-center shadow-lg">
            <div className="size-12 rounded-xl bg-white dark:bg-amber-900/30 text-amber-500 flex items-center justify-center shadow-inner">
              <Sparkles size={20} />
            </div>
            <div className="space-y-1">
              <h4 className="text-[11px] font-display font-black text-slate-900 dark:text-white italic tracking-tighter uppercase">แต้มสะสม Loyalty</h4>
              <p className="text-[9px] font-black text-slate-500 dark:text-slate-400 leading-relaxed max-w-[120px]">
                สะสมแต้มทุกครั้งที่คุณซื้อสลาก แลกเครดิตฟรี
              </p>
            </div>
            <Link to="/loyalty" className="text-primary font-display font-black text-[9px] uppercase tracking-widest border-b-2 border-primary/30 pb-0.5 hover:border-primary transition-colors">
              ดูแต้มสะสม →
            </Link>
          </div>

          {/* Affiliate Referral */}
          <div className="p-6 rounded-[2rem] bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/10 border border-purple-200 dark:border-purple-700/30 flex flex-col items-center gap-3 text-center shadow-lg">
            <div className="size-12 rounded-xl bg-white dark:bg-purple-900/30 text-purple-500 flex items-center justify-center shadow-inner">
              <Users size={20} />
            </div>
            <div className="space-y-1">
              <h4 className="text-[11px] font-display font-black text-slate-900 dark:text-white italic tracking-tighter uppercase">แนะนำรับ ฿30</h4>
              <p className="text-[9px] font-black text-slate-500 dark:text-slate-400 leading-relaxed max-w-[120px]">
                แชร์ลิงก์ให้เพื่อนรับค่าแนะนำไม่จำกัดจำนวน
              </p>
            </div>
            <Link to="/affiliate" className="text-purple-600 dark:text-purple-400 font-display font-black text-[9px] uppercase tracking-widest border-b-2 border-purple-300 pb-0.5 hover:border-purple-500 transition-colors">
              ลิงก์แนะนำ →
            </Link>
          </div>
        </div>

        {/* Section Label */}
        <div className="flex items-center justify-between px-1 mt-6">
          <div>
            <h3 className="text-xl font-display font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none">โปรโมชั่นทั้งหมด</h3>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">อัปเดตอัตโนมัติ · บันทึกโค้ดก่อนหมดเวลา</p>
          </div>
          <div className="flex items-center gap-2 text-primary bg-red-50 dark:bg-red-500/10 px-3 py-2 rounded-xl border border-red-100 dark:border-red-500/20">
            <Clock size={13} />
            <span className="text-[10px] font-black uppercase tracking-widest">เลื่อนตามเวลา 3วิ</span>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="h-[28rem] rounded-[2.5rem] bg-slate-100 dark:bg-slate-900 animate-pulse" />
        )}

        {/* Promo Cards Auto Slider */}
        {!loading && promos.length > 0 && (
          <div className="relative overflow-hidden rounded-[2.5rem] shadow-2xl group pb-10">
            <div 
              className="flex transition-transform duration-700 ease-in-out h-full"
              style={{ transform: `translateX(-${slideIndex * 100}%)` }}
            >
              {promos.map((promo) => (
                <div key={promo.id} className="w-full flex-shrink-0 animate-in fade-in duration-500 min-h-[32rem]">
                  <div className={`p-8 h-full rounded-[3rem] bg-gradient-to-br ${promo.bg_gradient || 'from-slate-800 via-slate-900 to-black'} border border-white/10 relative overflow-hidden group/card`}>
                    
                    {/* Background Image with Overlay */}
                    {promo.image_url && (
                      <div className="absolute inset-0 z-0">
                        <img 
                          src={promo.image_url} 
                          alt={promo.title} 
                          className="w-full h-full object-cover opacity-40 group-hover/card:scale-110 transition-transform duration-1000"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                      </div>
                    )}

                    <div className="relative z-10 h-full flex flex-col">
                      {/* Badge */}
                      {promo.badge && (
                        <div className="absolute top-0 right-0 px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/10 shadow-xl">
                          <span className="text-[9px] font-black text-white uppercase tracking-[0.25em]">{promo.badge}</span>
                        </div>
                      )}

                      <div className="space-y-6 flex-1">
                        {/* Icon + Type */}
                        <div className="flex items-center gap-2">
                          <div className="size-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10 group-hover/card:scale-110 transition-transform shadow-inner">
                            <Gift className="w-6 h-6 text-white" />
                          </div>
                          <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">
                            {typeLabel[promo.type] || promo.type}
                          </span>
                        </div>

                        {/* Title + Sub */}
                        <div>
                          <h4 className="text-3xl font-display font-black text-white italic tracking-tighter uppercase leading-none drop-shadow-2xl">{promo.title}</h4>
                          {promo.subtitle && <p className="text-amber-400 text-sm font-black mt-2 drop-shadow-lg">{promo.subtitle}</p>}
                        </div>

                        {promo.description && (
                          <p className="text-white/70 text-[11px] font-black leading-relaxed line-clamp-3">{promo.description}</p>
                        )}

                        {/* Details Row */}
                        <div className="grid grid-cols-2 gap-4">
                          {promo.discount_value && (
                            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 text-center border border-white/10 shadow-xl">
                              <p className="text-[8px] text-white/40 font-black uppercase tracking-widest">ส่วนลดคูปอง</p>
                              <p className="text-white font-black text-xl mt-1">
                                {promo.discount_type === 'percent' ? `${promo.discount_value}%` : `฿${promo.discount_value.toLocaleString()}`}
                              </p>
                            </div>
                          )}
                          {promo.minimum_deposit && promo.minimum_deposit > 0 && (
                            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 text-center border border-white/10 shadow-xl">
                              <p className="text-[8px] text-white/40 font-black uppercase tracking-widest">ฝากขั้นต่ำ</p>
                              <p className="text-white font-black text-xl mt-1">฿{promo.minimum_deposit.toLocaleString()}</p>
                            </div>
                          )}
                        </div>

                        {/* End Date */}
                        {promo.end_date && (
                          <div className="flex items-center gap-2 text-amber-300 text-[10px] font-black uppercase tracking-widest bg-amber-400/10 w-fit px-3 py-1.5 rounded-lg border border-amber-400/20">
                            <Clock size={12} className="animate-pulse" /> {timeLeft(promo.end_date)}
                          </div>
                        )}
                      </div>

                      {/* Footer: Code + CTA */}
                      <div className="flex items-center justify-between pt-6 border-t border-white/10 mt-6">
                        {promo.code ? (
                          <button onClick={() => copyCode(promo.code!)}
                            className="flex items-center gap-3 bg-white/10 hover:bg-white/20 px-5 py-2.5 rounded-2xl transition-all border border-white/10 group/copy shadow-xl">
                            {copiedCode === promo.code
                              ? <CheckCircle size={16} className="text-emerald-400" />
                              : <Tag size={16} className="text-amber-400 group-hover/copy:rotate-12 transition-transform" />
                            }
                            <span className="text-white font-display font-black text-base tracking-widest">{promo.code}</span>
                          </button>
                        ) : (
                          <div className="flex items-center gap-2 text-white/30 text-[10px] font-black uppercase tracking-widest">
                            <Star size={12} /> ไม่ต้องใช้โค้ด
                          </div>
                        )}
                        <Link to={user ? '/deposit' : '/register'}
                          className="size-14 bg-white text-slate-900 rounded-2xl transition-all active:scale-90 flex items-center justify-center shadow-2xl hover:bg-amber-400 hover:scale-105">
                          <ArrowRight size={24} strokeWidth={3} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Pagination Dots */}
            {promos.length > 1 && (
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
                {promos.map((_, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setSlideIndex(idx)}
                    className={`h-1.5 rounded-full transition-all ${slideIndex === idx ? 'w-6 bg-amber-400' : 'w-2 bg-white/30'}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {!loading && promos.length === 0 && (
          <div className="text-center py-20 space-y-4">
            <div className="size-20 bg-slate-100 dark:bg-slate-900 rounded-[2rem] flex items-center justify-center mx-auto">
              <Tag size={36} className="text-slate-400" />
            </div>
            <p className="font-black text-slate-500 uppercase text-sm tracking-widest">ยังไม่มีโปรโมชั่นในขณะนี้</p>
            <p className="text-slate-400 text-sm">กลับมาใหม่เร็วๆ นี้!</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default Promotions;
