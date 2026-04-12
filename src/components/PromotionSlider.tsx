import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { Gift, Zap, Star, Clock, Tag, CheckCircle, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

interface Promotion {
  id: string;
  title: string;
  subtitle?: string;
  badge?: string;
  type: string;
  code?: string;
  bg_gradient?: string;
  image_url?: string;
}

const typeLabel: Record<string, string> = {
  bonus: '🎁 โบนัส',
  cashback: '💰 เงินคืน',
  referral: '👥 แนะนำเพื่อน',
  deposit: '💳 ฝากเงิน',
  special: '⭐ พิเศษ',
};

const PromotionSlider: React.FC = () => {
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
    try {
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setPromos(data || []);
    } catch (e: any) {
      console.error('Slider Error:', e.message);
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

  if (loading) return (
    <div className="w-full aspect-[2.5/1] rounded-[2.5rem] bg-slate-50 animate-pulse" />
  );

  if (promos.length === 0) return null;

  return (
    <div className="relative overflow-hidden rounded-[2.5rem] bg-white group shadow-2xl shadow-black/5 animate-in fade-in duration-500">
      <div 
        className="flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${slideIndex * 100}%)` }}
      >
        {promos.map((promo) => (
          <div key={promo.id} className="w-full flex-shrink-0">
            <div className="mx-4 relative aspect-[2.5/1] rounded-[2.5rem] overflow-hidden group/card shadow-xl">
              {/* Background */}
              <div className="absolute inset-0">
                {promo.image_url ? (
                  <img 
                    src={promo.image_url} 
                    alt={promo.title} 
                    className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-1000"
                  />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-br ${promo.bg_gradient || 'from-[#B22222] via-[#8B0000] to-black'}`} />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              </div>

              <div className="relative z-10 h-full p-8 flex flex-col justify-end">
                {/* Badge */}
                {promo.badge && (
                  <div className="absolute top-6 left-6 px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                    <span className="text-[9px] font-black text-white uppercase tracking-[0.2em]">{promo.badge}</span>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="size-8 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md">
                      <Gift className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-[9px] font-black text-white/70 uppercase tracking-widest">
                      {typeLabel[promo.type] || promo.type}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-2xl font-black text-white uppercase tracking-tighter leading-tight drop-shadow-lg">{promo.title}</h4>
                    {promo.subtitle && <p className="text-amber-400 text-xs font-black mt-1">{promo.subtitle}</p>}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div className="flex items-center gap-4">
                      {promo.code ? (
                        <button 
                          onClick={(e) => { e.stopPropagation(); copyCode(promo.code!); }}
                          className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-xl transition-all border border-white/10 group/copy"
                        >
                          {copiedCode === promo.code
                            ? <CheckCircle size={14} className="text-emerald-400" />
                            : <Tag size={14} className="text-amber-400" />
                          }
                          <span className="text-white font-black text-xs tracking-widest">{promo.code}</span>
                        </button>
                      ) : (
                        <div className="flex items-center gap-2 text-white/90 text-[10px] font-black uppercase tracking-widest bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                          <Star size={12} className="text-amber-400 fill-amber-400" /> รับโบนัสอัตโนมัติ
                        </div>
                      )}
                    </div>

                    <Link to={user ? '/deposit' : '/register'}
                      className="h-10 px-6 bg-white text-slate-900 rounded-xl transition-all active:scale-95 flex items-center justify-center font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-amber-400"
                    >
                      รับสิทธิ์เลย
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {promos.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
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
  );
};

export default PromotionSlider;

