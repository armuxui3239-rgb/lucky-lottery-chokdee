import React from 'react';
import Header from './Header';

export default function MobileLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f0f2f5] dark:bg-[#0f0506] flex justify-center items-start font-sans overflow-x-hidden">
      {/* Background Decorative Elements for Desktop */}
      <div className="fixed inset-0 pointer-events-none opacity-20 dark:opacity-10 overflow-hidden hidden lg:block">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[60%] bg-[#ec131e] rounded-full blur-[150px]"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[60%] bg-orange-500 rounded-full blur-[150px]"></div>
      </div>

      <div className="relative w-full max-w-md min-h-screen bg-white dark:bg-[#1a0a0b] shadow-[0_0_100px_rgba(0,0,0,0.1)] dark:shadow-[0_0_100px_rgba(0,0,0,0.5)] flex flex-col border-x border-slate-100 dark:border-white/5 transition-all">
        <Header />
        
        <main className="flex-1 w-full flex flex-col relative pb-24 scrollbar-hide">
          {children}
        </main>

        {/* Global Toast / Notification Container would go here if needed, but we use react-hot-toast in App.tsx */}
      </div>
    </div>
  );
}

