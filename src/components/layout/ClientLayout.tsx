import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import BottomNav from './BottomNav';
import { useAuth } from '../../lib/AuthContext';

const ClientLayout: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-white flex flex-col relative w-full overflow-x-hidden">
      <Header />
      <main className="flex-1 pb-24 w-full">
        <Outlet />
      </main>
      {user && <BottomNav />}
    </div>
  );
};


export default ClientLayout;
