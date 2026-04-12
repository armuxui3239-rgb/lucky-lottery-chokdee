import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { Gift, Zap, Sparkles, ChevronLeft, ArrowRight, Star, Clock, Tag, Copy, CheckCircle, Users, RefreshCw, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import PromotionSlider from '../components/PromotionSlider';

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

  useEffect(() => {
    fetchPromos();
  }, []);

  useEffect(() => {
    // Shared slider state removed in favor of PromotionSlider component
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
            <h1 className="text-base font-sans font-black tracking-tighter uppercase text-slate-900 dark:text-white leading-none">โปรโมชั่นพิเศษ</h1>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{promos.length} รายการที่เปิดใช้งาน</p>
          </div>
          <button onClick={fetchPromos} className="size-11 flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-primary rounded-2xl transition-all active:scale-90">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 pt-6 space-y-8">

        {/* Promotion Slider at Top (Replacing Hero) */}
        <PromotionSlider />

        <div className="grid grid-cols-2 gap-4">
          {/* Loyalty Section */}
          <div className="p-6 rounded-[2rem] bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/10 border border-amber-200 dark:border-amber-700/30 flex flex-col items-center gap-3 text-center shadow-lg">
            <div className="size-12 rounded-xl bg-white dark:bg-amber-900/30 text-amber-500 flex items-center justify-center shadow-inner">
              <Sparkles size={20} />
            </div>
            <div className="space-y-1">
              <h4 className="text-[11px] font-sans font-black text-slate-900 dark:text-white tracking-tighter uppercase">แต้มสะสม Loyalty</h4>
              <p className="text-[9px] font-black text-slate-500 dark:text-slate-400 leading-relaxed max-w-[120px]">
                สะสมแต้มทุกครั้งที่คุณซื้อสลาก แลกเครดิตฟรี
              </p>
            </div>
            <Link to="/loyalty" className="text-primary font-sans font-black text-[9px] uppercase tracking-widest border-b-2 border-primary/30 pb-0.5 hover:border-primary transition-colors">
              ดูแต้มสะสม →
            </Link>
          </div>

          {/* Affiliate Referral */}
          <div className="p-6 rounded-[2rem] bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/10 border border-purple-200 dark:border-purple-700/30 flex flex-col items-center gap-3 text-center shadow-lg">
            <div className="size-12 rounded-xl bg-white dark:bg-purple-900/30 text-purple-500 flex items-center justify-center shadow-inner">
              <Users size={20} />
            </div>
            <div className="space-y-1">
              <h4 className="text-[11px] font-sans font-black text-slate-900 dark:text-white tracking-tighter uppercase">แนะนำรับ ฿30</h4>
              <p className="text-[9px] font-black text-slate-500 dark:text-slate-400 leading-relaxed max-w-[120px]">
                แชร์ลิงก์ให้เพื่อนรับค่าแนะนำไม่จำกัดจำนวน
              </p>
            </div>
            <Link to="/affiliate" className="text-purple-600 dark:text-purple-400 font-sans font-black text-[9px] uppercase tracking-widest border-b-2 border-purple-300 pb-0.5 hover:border-purple-500 transition-colors">
              ลิงก์แนะนำ →
            </Link>
          </div>
        </div>

        {/* Section Label */}
        <div className="flex items-center justify-between px-1 mt-6">
          <div>
            <h3 className="text-xl font-sans font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">โปรโมชั่นทั้งหมด</h3>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">อัปเดตอัตโนมัติ · บันทึกโค้ดก่อนหมดเวลา</p>
          </div>
          <div className="flex items-center gap-2 text-primary bg-red-50 dark:bg-red-500/10 px-3 py-2 rounded-xl border border-red-100 dark:border-red-500/20">
            <Clock size={13} />
            <span className="text-[10px] font-black uppercase tracking-widest">3วิ</span>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="h-[28rem] rounded-[2.5rem] bg-slate-100 dark:bg-slate-900 animate-pulse" />
        )}

        {/* Single Item Grid for Remaining Promos */}
        <div className="grid grid-cols-1 gap-6">
          {promos.map((promo) => (
            <div key={promo.id} className="w-full animate-in fade-in duration-500">
              <div className={`group/card relative aspect-[1.8/1] rounded-[2.5rem] overflow-hidden shadow-2xl transition-all hover:shadow-black/10`}>
                
                {/* Background Image with Overlay */}
                <div className="absolute inset-0 z-0">
                  {promo.image_url ? (
                    <img 
                      src={promo.image_url} 
                      alt={promo.title} 
                      className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-1000"
                    />
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${promo.bg_gradient || 'from-slate-800 via-slate-900 to-black'}`} />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                </div>

                <div className="relative z-10 h-full p-8 flex flex-col justify-end">
                  {/* Badge */}
                  {promo.badge && (
                    <div className="absolute top-6 right-6 px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 shadow-xl">
                      <span className="text-[9px] font-black text-white uppercase tracking-[0.25em]">{promo.badge}</span>
                    </div>
                  )}

                  <div className="space-y-4">
                    {/* Icon + Type */}
                    <div className="flex items-center gap-2">
                      <div className="size-10 rounded-xl bg-white/20 flex items-center justify-center border border-white/20 backdrop-blur-md shadow-inner">
                        <Gift className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-[10px] font-black text-white/70 uppercase tracking-widest">
                        {typeLabel[promo.type] || promo.type}
                      </span>
                    </div>

                    {/* Title + Sub */}
                    <div>
                      <h4 className="text-3xl font-sans font-black text-white tracking-tighter uppercase leading-tight drop-shadow-2xl">{promo.title}</h4>
                      {promo.subtitle && <p className="text-amber-400 text-sm font-black mt-1 drop-shadow-lg">{promo.subtitle}</p>}
                    </div>

                    {/* Footer: Code + CTA */}
                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                      <div className="flex items-center gap-4">
                        {promo.code ? (
                          <button onClick={(e) => { e.stopPropagation(); copyCode(promo.code!); }}
                            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition-all border border-white/10 group/copy shadow-xl backdrop-blur-md">
                            {copiedCode === promo.code
                              ? <CheckCircle size={14} className="text-emerald-400" />
                              : <Tag size={14} className="text-amber-400" />
                            }
                            <span className="text-white font-sans font-black text-xs tracking-widest">{promo.code}</span>
                          </button>
                        ) : (
                          <div className="flex items-center gap-2 text-white/40 text-[9px] font-black uppercase tracking-widest">
                            <Star size={10} /> รับโบนัสอัตโนมัติ
                          </div>
                        )}
                      </div>

                      <Link to={user ? '/deposit' : '/register'}
                        className="h-10 px-6 bg-white text-slate-900 rounded-xl transition-all active:scale-95 flex items-center justify-center shadow-2xl hover:bg-amber-400 font-sans font-black text-[10px] uppercase tracking-widest">
                        รับสิทธิ์เลย
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

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

