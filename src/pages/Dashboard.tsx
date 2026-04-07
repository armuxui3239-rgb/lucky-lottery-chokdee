import { Navigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';

/**
 * Dashboard - Redirect based on user role
 * Admin → /admin/overview
 * User → /profile (or home)
 */
const Dashboard = () => {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-red-500/20 border-t-red-500 rounded-full animate-spin" />
          <p className="text-slate-500 text-xs font-black uppercase tracking-widest">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  // Admin redirect to admin panel
  if (profile?.role === 'admin') {
    return <Navigate to="/admin/overview" replace />;
  }

  // User redirect to profile
  return <Navigate to="/profile" replace />;
};

export default Dashboard;
