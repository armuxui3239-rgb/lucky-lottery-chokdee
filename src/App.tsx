import { Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import History from './pages/History'
import Home from './pages/Home'
import Cart from './pages/Cart'
import LotteryGrid from './pages/LotteryGrid'
import Payment from './pages/Payment'
import PaymentQR from './pages/PaymentQR'
import PaymentSlip from './pages/PaymentSlip'
import TransactionSuccess from './pages/TransactionSuccess'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import BankSettings from './pages/BankSettings'
import KYC from './pages/KYC'
import Affiliate from './pages/Affiliate'
import Leaderboard from './pages/Leaderboard'
import Promotions from './pages/Promotions'
import LuckyWheel from './pages/LuckyWheel'
import AdminDashboard from './pages/AdminDashboard'
import AdminLogin from './pages/admin/AdminLogin'
import WalletPage from './pages/WalletPage'
import Loyalty from './pages/Loyalty'
import Guide from './pages/Guide'
import Rules from './pages/Rules'
import PinSetup from './pages/PinSetup'
import OTP from './pages/OTP'
import Results from './pages/Results'
import Support from './pages/Support'
import Notifications from './pages/Notifications'
import Winners from './pages/Winners'
import ProtectedRoute from './components/ProtectedRoute'
import { SiteConfigProvider } from './lib/SiteConfigContext'
import ClientLayout from './components/layout/ClientLayout'
import { Toaster } from 'react-hot-toast'

function App() {
  return (
    <SiteConfigProvider>
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        {/* === ส่วนของลูกค้า (Public & Customer) - Wrapped in ClientLayout === */}
        <Route element={<ClientLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/buy" element={<LotteryGrid />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/promotions" element={<Promotions />} />
          <Route path="/guide" element={<Guide />} />
          <Route path="/rules" element={<Rules />} />
          <Route path="/results" element={<Results />} />
          <Route path="/winners" element={<Winners />} />
          <Route path="/support" element={<Support />} />
          
          {/* === ส่วนที่ต้องเข้าระบบ (Protected Routes) === */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/history" element={<History />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/payment/qr" element={<PaymentQR />} />
            <Route path="/payment/slip" element={<PaymentSlip />} />
            <Route path="/success" element={<TransactionSuccess />} />
            <Route path="/deposit" element={<WalletPage />} />
            <Route path="/withdraw" element={<WalletPage />} />
            <Route path="/bank-settings" element={<BankSettings />} />
            <Route path="/kyc" element={<KYC />} />
            <Route path="/affiliate" element={<Affiliate />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/lucky-wheel" element={<LuckyWheel />} />
            <Route path="/loyalty" element={<Loyalty />} />
            <Route path="/security/pin" element={<PinSetup />} />
            <Route path="/security" element={<Navigate to="/security/pin" replace />} />
            <Route path="/otp" element={<OTP />} />
            <Route path="/notifications" element={<Notifications />} />
          </Route>
        </Route>

        {/* ระบบบัญชีผู้ใช้ (No Layout for Auth) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* === ส่วนของแอดมิน (Admin Only) === */}
        <Route element={<ProtectedRoute requireAdmin={true} />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/:tab" element={<AdminDashboard />} />
        </Route>
      </Routes>
    </SiteConfigProvider>
  )
}

export default App
