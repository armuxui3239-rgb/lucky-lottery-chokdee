import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../lib/CartContext';
import { useAuth } from '../../lib/AuthContext';
import { useSiteConfig } from '../../lib/SiteConfigContext';
import { ArrowLeft, UserCircle, ShoppingBasket, Bell } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function Header() {
  const { totalItems } = useCart();
  const { user } = useAuth();
  const { config } = useSiteConfig();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  // ดึงจำนวนการแจ้งเตือนที่ยังไม่อ่าน
  useEffect(() => {
    if (!user) { setUnreadCount(0); return; }

    const fetchUnread = async () => {
      const { count } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false);
      setUnreadCount(count || 0);
    };

    fetchUnread();

    // Subscribe real-time
    const channel = supabase
      .channel(`header-notif-${user.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`,
      }, () => fetchUnread())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  return (
    <header className="sticky top-0 z-50 bg-primary shadow-2xl backdrop-blur-xl bg-opacity-95 border-b border-white/10 w-full overflow-x-hidden">
      <div className="flex items-center justify-between px-4 py-3.5 max-w-7xl mx-auto w-full">

        {/* Left - Back + Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 -ml-2 flex items-center justify-center rounded-2xl hover:bg-white/20 transition-all active:scale-90 text-white"
          >
            <ArrowLeft size={22} strokeWidth={3} />
          </button>
          <Link to="/" className="flex items-center gap-3 select-none group/logo">
            {config.site_logo ? (
              <img 
                src={config.site_logo} 
                alt={config.site_name} 
                className="h-10 w-auto object-contain group-hover/logo:scale-105 transition-all"
              />
            ) : (
              <div className="flex flex-col items-start">
                <h1 className="text-xl font-black italic tracking-tighter uppercase leading-none text-white group-hover/logo:scale-105 transition-all">
                  ล็อตเตอรี่
                  <span className="text-yellow-300 drop-shadow-[0_0_8px_rgba(255,215,0,0.5)]">
                    โชคดี
                  </span>
                </h1>
                <p className="text-[8px] font-black uppercase tracking-[0.3em] text-white/70 mt-0.5 flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-yellow-300 animate-pulse" />
                  {config.hero_subtitle || 'ซื้อง่าย จ่ายจริง ปลอดภัย 100%'}
                </p>
              </div>
            )}
          </Link>
        </div>

        {/* Right - Notification + Profile + Cart */}
        <div className="flex gap-1 -mr-2 items-center">
          {/* 🔔 Notification Bell */}
          {user && (
            <Link
              to="/notifications"
              className="relative w-10 h-10 flex items-center justify-center hover:bg-white/15 rounded-2xl transition-all group/notif text-white"
            >
              <Bell size={22} className="group-hover/notif:scale-110 transition-all" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-yellow-400 text-primary font-black text-[9px] rounded-full flex items-center justify-center border-2 border-primary shadow-lg animate-bounce">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
          )}

          {/* 👤 Profile */}
          {user ? (
            <Link to="/profile" className="p-2 hover:bg-white/15 rounded-2xl transition-all relative flex items-center gap-2 group/profile">
              <div className="w-9 h-9 rounded-2xl bg-white/10 border border-white/30 flex items-center justify-center text-white shadow-xl group-hover/profile:rotate-6 transition-all">
                <UserCircle size={18} strokeWidth={3} />
              </div>
            </Link>
          ) : (
            <Link to="/login" className="w-10 h-10 flex items-center justify-center hover:bg-white/15 rounded-2xl transition-all group/login text-white">
              <UserCircle size={22} className="group-hover:scale-110 transition-all" />
            </Link>
          )}

          {/* 🛒 Cart */}
          <Link to="/cart" className="w-10 h-10 flex items-center justify-center hover:bg-white/15 rounded-2xl transition-all relative group/cart text-white">
            <ShoppingBasket size={22} className="group-hover:rotate-12 transition-all" />
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-gradient-to-br from-yellow-300 to-yellow-500 text-primary font-black text-[9px] min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center border-2 border-primary shadow-2xl animate-bounce">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
