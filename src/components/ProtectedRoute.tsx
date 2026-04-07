import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';

interface ProtectedRouteProps {
    requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requireAdmin = false }) => {
    const { user, profile, loading, profileLoading } = useAuth();
    const location = useLocation();

    // กรณีเป็นหน้า Admin: ใช้ Loading สไตล์ Admin (Dark/Red)
    if (requireAdmin && (loading || profileLoading)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950">
                <div className="flex flex-col items-center gap-6">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-red-500/20 border-t-red-600 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-2 h-2 bg-red-600 rounded-full animate-ping"></div>
                        </div>
                    </div>
                   <div className="space-y-1 text-center">
                      <p className="text-white font-black text-xs tracking-[0.4em] uppercase animate-pulse">กำลังตรวจสอบสิทธิ์</p>
                      <p className="text-slate-600 text-[9px] font-bold uppercase tracking-widest">กำลังเชื่อมต่อระบบ...</p>
                   </div>
                </div>
            </div>
        );
    }

    // กรณีหน้าบ้านปกติ: ใช้ Loading สไตล์เรียบง่าย ไม่รบกวนดีไซน์เดิม (User Interface)
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="w-10 h-10 border-2 border-slate-100 border-t-red-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    // ถ้ายังไม่ได้ล็อกอิน ให้เด้งไปหน้า login
    if (!user) {
        const loginPath = requireAdmin ? "/admin/login" : "/login";
        return <Navigate to={loginPath} state={{ from: location }} replace />;
    }

    // ถ้าหน้านี้ต้องการสิทธิ์ Admin
    if (requireAdmin) {
        if (!profile || profile.role !== 'admin') {
             console.warn('Unauthorized access attempt to admin area');
             return <Navigate to="/" replace />;
        }
    }

    // Logic จัดการความจำและความปลอดภัย (Security Gate & Persistence):
    if (profile && !requireAdmin) {
        // 1. ตรวจสอบสถานะ OTP (ต้องผ่านก่อนถึงจะไปหน้าอื่นได้)
        if (!profile.is_otp_verified && location.pathname !== '/otp') {
            return <Navigate to="/otp" replace />;
        }

        // 2. ถ้าผ่าน OTP แล้ว แต่ยังไม่ได้ตั้ง PIN (ต้องตั้งก่อนถึงจะไปหน้า Profile/Wallet ได้)
        if (profile.is_otp_verified && !profile.password && location.pathname !== '/security/pin') {
            return <Navigate to="/security/pin" replace />;
        }

        // 3. Skip หน้า OTP ถ้าทำเสร็จแล้ว
        if (location.pathname === '/otp' && profile.is_otp_verified) {
            return <Navigate to={profile.password ? "/profile" : "/security/pin"} replace />;
        }

        // 4. Skip หน้า PIN ถ้าทำเสร็จแล้ว
        if (location.pathname === '/security/pin' && profile.password) {
            return <Navigate to="/profile" replace />;
        }
    }

    return <Outlet />;
};

export default ProtectedRoute;