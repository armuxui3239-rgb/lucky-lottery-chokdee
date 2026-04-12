import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../lib/AuthContext';
import toast from 'react-hot-toast';
import {
  Bell, Send, BellOff, Users, User, Megaphone,
  RefreshCw, Trash2, Clock, CheckCircle, Info,
  DollarSign, Trophy, Gift, X, AlertCircle
} from 'lucide-react';
import {
  getAllNotifications,
  sendNotificationToUser,
  broadcastNotification,
  deleteNotification,
  getAllUsers,
  type Notification,
  type AdminUser,
} from '../../services/adminApi';

const typeConfig: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  info: { label: 'ข้อมูลทั่วไป', icon: Info, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  win: { label: 'ถูกรางวัล', icon: Trophy, color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
  deposit: { label: 'ฝากเงิน', icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  withdraw: { label: 'ถอนเงิน', icon: DollarSign, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
  promo: { label: 'โปรโมชั่น', icon: Gift, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
  system: { label: 'ประกาศระบบ', icon: Megaphone, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
};

export const AdminNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'list' | 'send'>('send');

  // Send form
  const [sendMode, setSendMode] = useState<'broadcast' | 'single'>('broadcast');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [type, setType] = useState<Notification['type']>('system');
  const [actionUrl, setActionUrl] = useState('');
  const [sending, setSending] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [notifs, userList] = await Promise.all([
        getAllNotifications(undefined, 100),
        getAllUsers('', '', 200, 0),
      ]);
      setNotifications(notifs);
      setUsers(userList);
    } catch (e: any) {
      toast.error('โหลดข้อมูลล้มเหลว: ' + e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) { toast.error('กรุณากรอกหัวข้อและข้อความ'); return; }
    if (sendMode === 'single' && !selectedUserId) { toast.error('กรุณาเลือกผู้ใช้'); return; }

    setSending(true);
    const t = toast.loading(sendMode === 'broadcast' ? 'กำลังส่งถึงทุกคน...' : 'กำลังส่ง...');
    try {
      let result;
      if (sendMode === 'broadcast') {
        result = await broadcastNotification(title, body, type, actionUrl || undefined);
      } else {
        result = await sendNotificationToUser(selectedUserId, title, body, type, actionUrl || undefined);
      }
      toast.success(`ส่งสำเร็จ! ถึง ${result.sent_to} คน 🔔`, { id: t, duration: 5000 });
      setTitle(''); setBody(''); setActionUrl(''); setSelectedUserId('');
      fetchData();
    } catch (e: any) {
      toast.error(e.message, { id: t });
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('ต้องการลบการแจ้งเตือนนี้หรือไม่?')) return;
    try {
      await deleteNotification(id);
      toast.success('ลบแล้ว');
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const quickMessages = [
    { title: '🎉 โปรโมชั่นใหม่!', body: 'เรามีโปรโมชั่นพิเศษสำหรับคุณ! รีบอ่านรายละเอียดก่อนหมดเวลา', type: 'promo' as const },
    { title: '⚠️ แจ้งปิดปรับปรุงระบบ', body: 'ระบบจะปิดปรับปรุงชั่วคราว กรุณาวางแผนล่วงหน้า ขออภัยในความไม่สะดวก', type: 'system' as const },
    { title: '🔔 เตือน: ผลสลากออกแล้ว!', body: 'ผลสลากงวดล่าสุดออกแล้ว กรุณาตรวจรายการของคุณ', type: 'win' as const },
    { title: '💰 เครดิตพิเศษ', body: 'เราได้เพิ่มเครดิตพิเศษเข้ากระเป๋าของคุณแล้ว', type: 'deposit' as const },
  ];

  const readCount = notifications.filter(n => n.is_read).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-sans font-black text-white  tracking-tighter uppercase">ระบบการแจ้งเตือน</h2>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">
            ทั้งหมด {notifications.length} รายการ · อ่านแล้ว {readCount} · ยังไม่อ่าน {notifications.length - readCount}
          </p>
        </div>
        <button onClick={fetchData} className="bg-slate-900 border border-slate-800 text-slate-400 hover:text-white p-2.5 rounded-xl transition-all self-start">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-slate-900 border border-slate-800 rounded-2xl p-1.5">
        {(['send', 'list'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
              activeTab === tab ? 'bg-red-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'
            }`}>
            {tab === 'send' ? <><Send size={12} /> ส่งการแจ้งเตือน</> : <><Bell size={12} /> ประวัติทั้งหมด ({notifications.length})</>}
          </button>
        ))}
      </div>

      {/* === TAB: SEND === */}
      {activeTab === 'send' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSend} className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 space-y-6">
              <h3 className="text-lg font-sans font-black text-white  tracking-tighter uppercase flex items-center gap-3">
                <Megaphone size={22} className="text-red-500" /> ส่งการแจ้งเตือน
              </h3>

              {/* Mode Toggle */}
              <div className="flex gap-2 bg-slate-950 border border-slate-800 rounded-2xl p-1">
                <button type="button" onClick={() => setSendMode('broadcast')}
                  className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all ${
                    sendMode === 'broadcast' ? 'bg-amber-600 text-white' : 'text-slate-500 hover:text-white'
                  }`}>
                  <Users size={12} /> Broadcast ทุกคน
                </button>
                <button type="button" onClick={() => setSendMode('single')}
                  className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 transition-all ${
                    sendMode === 'single' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-white'
                  }`}>
                  <User size={12} /> ส่งถึงคนเดียว
                </button>
              </div>

              {/* User Select (single mode) */}
              {sendMode === 'single' && (
                <div>
                  <label className="text-[9px] font-black text-slate-500 uppercase block mb-1.5">เลือกผู้ใช้ *</label>
                  <select value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)} required
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:border-red-500 outline-none">
                    <option value="">-- เลือกสมาชิก --</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.full_name || 'ไม่ระบุชื่อ'} ({u.phone})</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Type */}
              <div>
                <label className="text-[9px] font-black text-slate-500 uppercase block mb-1.5">ประเภทการแจ้งเตือน</label>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.entries(typeConfig) as [Notification['type'], typeof typeConfig.info][]).map(([key, cfg]) => (
                    <button type="button" key={key} onClick={() => setType(key)}
                      className={`py-2 rounded-xl text-[9px] font-black uppercase tracking-tight flex items-center justify-center gap-1 border transition-all ${
                        type === key ? `${cfg.bg} ${cfg.color}` : 'border-slate-800 text-slate-600 hover:border-slate-700'
                      }`}>
                      <cfg.icon size={11} /> {cfg.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="text-[9px] font-black text-slate-500 uppercase block mb-1.5">หัวข้อ *</label>
                <input type="text" required value={title} onChange={e => setTitle(e.target.value)}
                  placeholder="หัวข้อการแจ้งเตือน..."
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:border-red-500 outline-none" />
              </div>

              {/* Body */}
              <div>
                <label className="text-[9px] font-black text-slate-500 uppercase block mb-1.5">ข้อความ *</label>
                <textarea rows={3} required value={body} onChange={e => setBody(e.target.value)}
                  placeholder="รายละเอียดการแจ้งเตือน..."
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:border-red-500 outline-none resize-none" />
              </div>

              {/* Action URL */}
              <div>
                <label className="text-[9px] font-black text-slate-500 uppercase block mb-1.5">ลิงก์ปลายทาง (ไม่บังคับ)</label>
                <input type="text" value={actionUrl} onChange={e => setActionUrl(e.target.value)}
                  placeholder="เช่น /promotions, /results, /deposit"
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:border-red-500 outline-none" />
              </div>

              <button type="submit" disabled={sending}
                className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white font-black uppercase text-[10px] tracking-[0.2em] py-5 rounded-2xl shadow-xl shadow-red-900/20 transition-all flex items-center justify-center gap-3">
                <Send size={16} className={sending ? 'animate-pulse' : ''} />
                {sending ? 'กำลังส่ง...' : sendMode === 'broadcast' ? `🔔 ส่งถึงสมาชิกทุกคน (${users.length} คน)` : 'ส่งการแจ้งเตือน'}
              </button>
            </form>
          </div>

          {/* Quick Messages */}
          <div className="space-y-4">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">ข้อความสำเร็จรูป</h3>
            {quickMessages.map((qm, i) => (
              <button key={i} onClick={() => { setTitle(qm.title); setBody(qm.body); setType(qm.type); }}
                className="w-full text-left bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 space-y-1.5 transition-all hover:shadow-lg group">
                <p className="text-[11px] font-black text-white group-hover:text-red-400 transition-colors leading-snug">{qm.title}</p>
                <p className="text-[10px] text-slate-500 leading-relaxed line-clamp-2">{qm.body}</p>
                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${typeConfig[qm.type]?.bg} ${typeConfig[qm.type]?.color}`}>
                  {typeConfig[qm.type]?.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* === TAB: LIST === */}
      {activeTab === 'list' && (
        <div className="space-y-3">
          {notifications.map(n => {
            const cfg = typeConfig[n.type] || typeConfig.info;
            const NIcon = cfg.icon;
            return (
              <div key={n.id} className={`bg-slate-900 border rounded-2xl p-4 flex items-start gap-4 transition-all hover:shadow-lg ${n.is_read ? 'border-slate-800 opacity-70' : 'border-slate-700'}`}>
                <div className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${cfg.bg}`}>
                  <NIcon size={18} className={cfg.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-black text-white text-[13px] leading-tight">{n.title}</p>
                    {!n.is_read && <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shrink-0" />}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{n.body}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
                    <span className="text-[9px] text-slate-600 flex items-center gap-1">
                      <Clock size={9} /> {new Date(n.created_at).toLocaleString('th-TH', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {n.user_id && <span className="text-[9px] text-slate-700 font-mono">ID: {n.user_id.slice(0, 8)}</span>}
                  </div>
                </div>
                <button onClick={() => handleDelete(n.id)}
                  className="size-8 shrink-0 bg-slate-800 text-slate-500 hover:bg-red-500/20 hover:text-red-400 rounded-xl flex items-center justify-center transition-all">
                  <Trash2 size={13} />
                </button>
              </div>
            );
          })}
          {loading && <div className="text-center py-16 text-slate-500 font-black uppercase text-[10px] animate-pulse tracking-widest">กำลังโหลด...</div>}
          {!loading && notifications.length === 0 && (
            <div className="text-center py-20 border border-dashed border-slate-800 rounded-[3rem] text-slate-600 font-black uppercase text-xs tracking-widest">
              <BellOff size={40} className="mx-auto mb-4 opacity-20" /> ยังไม่มีการแจ้งเตือน
            </div>
          )}
        </div>
      )}
    </div>
  );
};

