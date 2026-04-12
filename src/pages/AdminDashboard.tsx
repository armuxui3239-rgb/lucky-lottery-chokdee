import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import {
  LayoutDashboard, Ticket, Users, DollarSign, Database, Settings,
  LogOut, Bell, Search, Shield, Tag, Star, Users2, MessageSquare,
  Trophy, Building2, ChevronDown, Menu, X, Headphones, Activity, 
  BarChart3, Layout
} from 'lucide-react';
import { AdminOverview } from './admin/AdminOverview';
import { AdminLottery } from './admin/AdminLottery';
import { AdminUsers } from './admin/AdminUsers';
import { AdminFinance } from './admin/AdminFinance';
import { AdminSettings } from './admin/AdminSettings';
import { AdminDatabase } from './admin/AdminDatabase';
import { AdminKYC } from './admin/AdminKYC';
import { AdminNotifications } from './admin/AdminNotifications';
import { AdminWinners } from './admin/AdminWinners';
import { AdminBanks } from './admin/AdminBanks';
import AdminSupport from './admin/AdminSupport';
import AdminLogs from './admin/AdminLogs';
import AdminBanners from './admin/AdminBanners';
import AdminReports from './admin/AdminReports';
import { AdminPromotions } from './admin/AdminPromotions';
import { AdminLoyalty } from './admin/AdminLoyalty';
import { AdminAffiliate } from './admin/AdminAffiliate';

// Nav groups
const NAV_GROUPS = [
  {
    label: 'หลัก',
    items: [
      { id: 'overview',      icon: LayoutDashboard, label: 'ภาพรวมระบบ' },
      { id: 'lottery',       icon: Ticket,          label: 'จัดการสลาก' },
      { id: 'winners',       icon: Trophy,          label: 'ผู้ถูกรางวัล' },
    ]
  },
  {
    label: 'สมาชิก',
    items: [
      { id: 'users',         icon: Users,           label: 'จัดการสมาชิก' },
      { id: 'kyc',           icon: Shield,          label: 'ยืนยันตัวตน KYC' },
      { id: 'loyalty',       icon: Star,            label: 'Loyalty & แต้มสะสม' },
      { id: 'affiliate',     icon: Users2,          label: 'ระบบ Affiliate' },
    ]
  },
  {
    label: 'การเงิน',
    items: [
      { id: 'finance',       icon: DollarSign,      label: 'ฝาก-ถอนเงิน' },
      { id: 'banks',         icon: Building2,       label: 'จัดการธนาคาร' },
    ]
  },
  {
    label: 'การตลาด',
    items: [
      { id: 'banners',       icon: Layout,          label: 'จัดการแบนเนอร์' },
      { id: 'promotions',    icon: Tag,             label: 'โปรโมชั่น' },
      { id: 'notifications', icon: MessageSquare,   label: 'การแจ้งเตือน' },
    ]
  },
  {
    label: 'ซัพพอร์ต & ตรวจสอบ',
    items: [
      { id: 'support',       icon: Headphones,      label: 'ช่วยเหลือผู้ใช้' },
      { id: 'logs',          icon: Activity,        label: 'Audit Logs' },
      { id: 'reports',       icon: BarChart3,       label: 'รายงานการเงิน' },
    ]
  },
  {
    label: 'ระบบ',
    items: [
      { id: 'database',      icon: Database,        label: 'ฐานข้อมูล (CRUD)' },
      { id: 'settings',      icon: Settings,        label: 'ตั้งค่า & CMS' },
    ]
  },
];

// All flat nav items for mobile
const ALL_NAV = NAV_GROUPS.flatMap(g => g.items);

const AdminDashboard = () => {
  const { tab } = useParams();
  const [activeTab, setActiveTab] = useState(tab || 'overview');
  const [dbStats, setDbStats] = useState<any>(null);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [kycCount, setKycCount] = useState(0);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { fetchAdminData(); }, []);
  
  useEffect(() => {
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [tab]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const { data: statsData } = await supabase.rpc('get_admin_stats');
      setDbStats(statsData);
      setPendingCount(statsData?.pending_withdrawals || 0);
      setKycCount(statsData?.pending_kyc || 0);

      const { data: txData } = await supabase
        .from('transactions')
        .select('id, amount, type, status, created_at, profiles!user_id(full_name)')
        .order('created_at', { ascending: false })
        .limit(8);
      setRecentTransactions(txData || []);
    } catch (error) {
      console.error('Admin Dashboard Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  const activeItem = ALL_NAV.find(n => n.id === activeTab);
  const totalBadge = pendingCount + kycCount;

  return (
    <div className="min-h-screen bg-slate-950 flex font-prompt selection:bg-red-500 text-white">

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 lg:w-64`}>
        {/* Logo */}
        <div className="p-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-red-600 rounded-xl flex items-center justify-center shadow-xl shadow-red-900/30">
              <LayoutDashboard size={20} className="text-white" />
            </div>
            <div>
              <span className="font-sans font-black text-lg tracking-tighter uppercase  text-white">Lucky</span>
              <span className="font-sans font-black text-lg tracking-tighter uppercase  text-red-500">Admin</span>
              <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest">ระบบจัดการหลังบ้าน</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-500 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Nav Groups */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {NAV_GROUPS.map(group => (
            <div key={group.label}>
              <p className="px-3 mb-2 text-[8px] font-black text-slate-600 uppercase tracking-[0.3em]">{group.label}</p>
              <div className="space-y-1">
                {group.items.map(item => (
                  <NavItem
                    key={item.id}
                    icon={item.icon}
                    label={item.label}
                    active={activeTab === item.id}
                    badge={item.id === 'finance' ? pendingCount : item.id === 'kyc' ? kycCount : 0}
                    onClick={() => { navigate(`/admin/${item.id}`); setSidebarOpen(false); }}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-3 py-2 mb-3">
            <div className="size-9 rounded-xl bg-slate-800 overflow-hidden">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`} className="w-full h-full" alt="admin" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black text-white truncate">ผู้ดูแลระบบสูงสุด</p>
              <p className="text-[9px] text-slate-500 truncate font-mono">{user?.email?.slice(0, 20)}</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 text-slate-500 hover:text-red-400 transition-all px-3 py-2.5 rounded-xl hover:bg-red-500/10 font-bold text-sm group">
            <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[11px] font-black uppercase tracking-wider">ออกจากระบบ</span>
          </button>
        </div>
      </aside>

      {/* Overlay mobile */}
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <main className="flex-1 overflow-y-auto min-w-0">
        {/* Header */}
        <header className="bg-slate-900/80 backdrop-blur-xl sticky top-0 z-30 px-4 md:px-8 py-4 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all">
              <Menu size={20} />
            </button>
            <div>
              <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">หน้าปัจจุบัน</p>
              <p className="text-sm font-black text-white">{activeItem?.label || 'ภาพรวมระบบ'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Pending Badge */}
            {totalBadge > 0 && (
              <button onClick={() => navigate(`/admin/${pendingCount > 0 ? 'finance' : 'kyc'}`)}
                className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest animate-pulse">
                <Bell size={12} /> {totalBadge} รอดำเนินการ
              </button>
            )}
            <button onClick={fetchAdminData}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all hidden md:flex">
              <Search size={18} />
            </button>
            <div className="size-9 rounded-xl bg-slate-800 overflow-hidden hidden sm:block">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id}`} className="w-full h-full" alt="admin" />
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <div className="p-4 md:p-8 pb-28 lg:pb-10">
          {activeTab === 'overview' && (
            <AdminOverview dbStats={dbStats} recentTransactions={recentTransactions} loading={loading} />
          )}
          {activeTab === 'lottery'       && <AdminLottery />}
          {activeTab === 'winners'       && <AdminWinners />}
          {activeTab === 'users'         && <AdminUsers />}
          {activeTab === 'kyc'           && <AdminKYC />}
          {activeTab === 'loyalty'       && <AdminLoyalty />}
          {activeTab === 'affiliate'     && <AdminAffiliate />}
          {activeTab === 'finance'       && <AdminFinance />}
          {activeTab === 'banks'         && <AdminBanks />}
          {activeTab === 'promotions'    && <AdminPromotions />}
          {activeTab === 'notifications' && <AdminNotifications />}
          {activeTab === 'database'      && <AdminDatabase />}
          {activeTab === 'settings'      && <AdminSettings />}
          {activeTab === 'support'       && <AdminSupport />}
          {activeTab === 'logs'          && <AdminLogs />}
          {activeTab === 'banners'       && <AdminBanners />}
          {activeTab === 'reports'       && <AdminReports />}
        </div>
      </main>

      {/* Mobile Bottom Nav (แสดงแค่ main items) */}
      <nav className="fixed bottom-0 left-0 right-0 w-full bg-slate-900/95 backdrop-blur-2xl border-t border-slate-800 px-2 py-2 z-30 lg:hidden">
        <div className="flex justify-around items-center h-14 max-w-lg mx-auto">
          {[
            { id: 'overview', icon: LayoutDashboard, label: 'หลัก' },
            { id: 'finance',  icon: DollarSign,      label: 'การเงิน', badge: pendingCount },
            { id: 'users',    icon: Users,           label: 'สมาชิก' },
            { id: 'kyc',      icon: Shield,          label: 'KYC', badge: kycCount },
            { id: 'settings', icon: Settings,        label: 'ระบบ' },
          ].map(item => (
            <button key={item.id} onClick={() => navigate(`/admin/${item.id}`)}
              className={`flex flex-col items-center justify-center gap-1 flex-1 relative transition-all ${activeTab === item.id ? 'text-red-500' : 'text-slate-500'}`}>
              <div className="relative">
                <item.icon size={20} />
                {(item as any).badge > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 size-4 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center">
                    {(item as any).badge}
                  </span>
                )}
              </div>
              <span className="text-[8px] font-black uppercase tracking-wider leading-none">{item.label}</span>
              {activeTab === item.id && <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-red-500 animate-pulse" />}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

const NavItem = ({ icon: Icon, label, active = false, badge = 0, onClick }: any) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group text-left ${
    active ? 'bg-red-500/10 text-red-500 border border-red-500/20 shadow-sm' : 'text-slate-500 hover:bg-slate-800/60 hover:text-slate-300'
  }`}>
    <Icon size={17} className={active ? 'text-red-500' : 'group-hover:text-slate-300 transition-colors'} />
    <span className={`font-black text-[11px] uppercase tracking-wider flex-1 ${active ? 'text-red-500' : 'group-hover:text-slate-300'}`}>{label}</span>
    {badge > 0 && (
      <span className="size-5 bg-red-600 text-white text-[9px] font-black rounded-full flex items-center justify-center animate-pulse">
        {badge > 9 ? '9+' : badge}
      </span>
    )}
    {active && <div className="w-1.5 h-1.5 bg-red-500 rounded-full shadow-[0_0_8px_rgba(255,0,0,0.5)]" />}
  </button>
);

export default AdminDashboard;

