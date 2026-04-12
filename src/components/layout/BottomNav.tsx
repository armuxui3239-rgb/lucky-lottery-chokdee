import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingBasket, Trophy, History, User, Gift } from 'lucide-react';

const BottomNav: React.FC = () => {
  const location = useLocation();
  
  const navItems = [
    { id: 'home', label: 'หน้าแรก', icon: Home, path: '/' },
    { id: 'buy', label: 'ซื้อสลาก', icon: ShoppingBasket, path: '/buy' },
    { id: 'promotions', label: 'กิจกรรม', icon: Gift, path: '/promotions' },
    { id: 'results', label: 'ผลรางวัล', icon: Trophy, path: '/results' },
    { id: 'history', label: 'คลังบิล', icon: History, path: '/history' },
    { id: 'profile', label: 'โปรไฟล์', icon: User, path: '/profile' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 w-full bg-white/80 backdrop-blur-3xl border-t border-slate-100 px-4 py-2 z-50 safe-bottom transition-all duration-300 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
      <div className="flex justify-around items-center h-16 max-w-5xl mx-auto relative px-2">

        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link 
              key={item.id}
              to={item.path} 
              className={`flex flex-col items-center justify-center gap-1.5 transition-all duration-300 relative group flex-1 ${isActive ? 'text-primary' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <div className={`size-10 rounded-2xl flex items-center justify-center transition-all duration-300 ${isActive ? 'bg-primary/10 scale-110' : 'group-hover:bg-slate-50 group-hover:scale-105'}`}>
                <Icon size={22} className={isActive ? 'fill-primary/20' : ''} />
              </div>
              <span className={`text-[9px] font-black uppercase tracking-wider transition-all duration-300 ${isActive ? 'opacity-100 scale-100' : 'opacity-60 scale-95'}`}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-primary animate-pulse" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;

