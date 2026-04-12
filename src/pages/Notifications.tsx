import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabase';
import { BellOff, Check, ChevronRight, Package, DollarSign, Trophy, Gift, Info, Megaphone, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface UserNotification {
  id: string;
  title: string;
  body: string;
  type: 'info' | 'win' | 'deposit' | 'withdraw' | 'promo' | 'system';
  is_read: boolean;
  action_url?: string;
  created_at: string;
}

const typeConfig: Record<string, { icon: any; color: string; bg: string }> = {
  info:    { icon: Info,      color: 'text-blue-500',   bg: 'bg-blue-500/10' },
  win:     { icon: Trophy,    color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  deposit: { icon: DollarSign,color: 'text-emerald-500',bg: 'bg-emerald-500/10' },
  withdraw:{ icon: Package,   color: 'text-red-400',    bg: 'bg-red-500/10' },
  promo:   { icon: Gift,      color: 'text-purple-500', bg: 'bg-purple-500/10' },
  system:  { icon: Megaphone, color: 'text-amber-500',  bg: 'bg-amber-500/10' },
};

export default function Notifications() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    if (!user) return;
    fetchNotifications();
    // Subscribe real-time
    const channel = supabase
      .channel('user-notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        (payload) => setNotifications(prev => [payload.new as UserNotification, ...prev])
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);
      setNotifications(data || []);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const markAllRead = async () => {
    if (!user) return;
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const displayed = filter === 'unread' ? notifications.filter(n => !n.is_read) : notifications;
  const unreadCount = notifications.filter(n => !n.is_read).length;

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    const h = Math.floor(m / 60);
    const d = Math.floor(h / 24);
    if (d > 0) return `${d} วันที่แล้ว`;
    if (h > 0) return `${h} ชั่วโมงที่แล้ว`;
    if (m > 0) return `${m} นาทีที่แล้ว`;
    return 'เมื่อกี้';
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 pb-28 font-prompt">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-primary shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="size-10 flex items-center justify-center rounded-2xl hover:bg-white/20 text-white transition-all">
              <ArrowLeft size={22} strokeWidth={3} />
            </button>
            <div>
              <h1 className="text-lg font-black text-white  tracking-tighter uppercase">การแจ้งเตือน</h1>
              {unreadCount > 0 && (
                <p className="text-[9px] font-black text-white/70 uppercase tracking-widest">ยังไม่อ่าน {unreadCount} รายการ</p>
              )}
            </div>
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-[10px] font-black uppercase px-3 py-2 rounded-xl transition-all">
              <Check size={12} /> อ่านทั้งหมด
            </button>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-4 space-y-4">
        {/* Filter Tabs */}
        <div className="flex gap-2 bg-slate-100 dark:bg-slate-900 rounded-2xl p-1.5">
          {[
            { key: 'all', label: `ทั้งหมด (${notifications.length})` },
            { key: 'unread', label: `ยังไม่อ่าน (${unreadCount})` },
          ].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key as any)}
              className={`flex-1 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                filter === f.key ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Notification Cards */}
        {loading ? (
          <div className="space-y-3">
            {[1,2,3,4].map(i => (
              <div key={i} className="bg-slate-100 dark:bg-slate-900 rounded-3xl p-5 animate-pulse h-20" />
            ))}
          </div>
        ) : displayed.length === 0 ? (
          <div className="text-center py-24 space-y-4">
            <div className="size-20 bg-slate-100 dark:bg-slate-900 rounded-[2rem] flex items-center justify-center mx-auto">
              <BellOff size={36} className="text-slate-400" />
            </div>
            <p className="font-black text-slate-500 uppercase text-sm tracking-widest">ยังไม่มีการแจ้งเตือน</p>
          </div>
        ) : (
          <div className="space-y-2">
            {displayed.map(n => {
              const cfg = typeConfig[n.type] || typeConfig.info;
              const NIcon = cfg.icon;
              const content = (
                <div key={n.id}
                  onClick={() => { if (!n.is_read) markAsRead(n.id); }}
                  className={`flex items-start gap-4 p-4 rounded-3xl border transition-all active:scale-[0.98] ${
                    n.is_read
                      ? 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800'
                      : 'bg-primary/5 dark:bg-red-500/5 border-primary/20 shadow-sm'
                  }`}>
                  {/* Icon */}
                  <div className={`size-11 rounded-2xl flex items-center justify-center shrink-0 ${cfg.bg}`}>
                    <NIcon size={20} className={cfg.color} />
                  </div>
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`font-black text-[13px] leading-snug ${n.is_read ? 'text-slate-700 dark:text-slate-300' : 'text-slate-900 dark:text-white'}`}>
                        {n.title}
                      </p>
                      {!n.is_read && <span className="size-2 bg-primary rounded-full shrink-0 mt-1.5 animate-pulse" />}
                    </div>
                    <p className="text-[12px] text-slate-500 mt-1 leading-relaxed line-clamp-2">{n.body}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
                        {n.type === 'info' ? 'ข้อมูล' : n.type === 'win' ? 'รางวัล' : n.type === 'deposit' ? 'ฝากเงิน' : n.type === 'withdraw' ? 'ถอนเงิน' : n.type === 'promo' ? 'โปรโมชั่น' : 'ระบบ'}
                      </span>
                      <span className="text-[10px] text-slate-400">{timeAgo(n.created_at)}</span>
                    </div>
                  </div>
                  {n.action_url && <ChevronRight size={16} className="text-slate-400 shrink-0 mt-1" />}
                </div>
              );

              return n.action_url ? (
                <Link key={n.id} to={n.action_url} onClick={() => !n.is_read && markAsRead(n.id)}>
                  {content}
                </Link>
              ) : content;
            })}
          </div>
        )}
      </div>
    </div>
  );
}

