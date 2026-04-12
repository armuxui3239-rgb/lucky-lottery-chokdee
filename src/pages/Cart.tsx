import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../lib/CartContext';
import { useAuth } from '../lib/AuthContext';
import { useSiteConfig } from '../lib/SiteConfigContext';
import { purchaseTickets } from '../services/lottery';
import { toast } from 'react-hot-toast';
import { ShoppingCart, Trash2, Minus, Plus, CheckCircle } from 'lucide-react';

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, balance, refreshProfile } = useAuth();
  const { config } = useSiteConfig();
  const { items, totalPrice, removeItem, updateQuantity, clearCart } = useCart();
  const [loading, setLoading] = useState(false);

  const totalItems = items.reduce((sum, item) => sum + (item.count || 1), 0);

  const handleCheckout = async () => {
    if (!user) {
      toast.error('กรุณาเข้าสู่ระบบก่อนสั่งซื้อ');
      navigate('/login');
      return;
    }

    if (balance < totalPrice) {
       toast.error('ยอดเงินคงเหลือไม่เพียงพอ กรุณาเติมเงิน');
       navigate('/deposit');
       return;
    }

    if (profile?.kyc_status !== 'verified') {
      toast.error('กรุณายืนยันตัวตน (KYC) ก่อนชำระเงิน', {
        icon: '🛡️',
        style: { borderRadius: '1.5rem', background: '#334155', color: '#fff', fontFamily: 'Prompt' }
      });
      navigate('/kyc');
      return;
    }

    setLoading(true);
    try {
      const roundId = items[0].lottery_id;
      const ticketNumbers = items.map(item => item.number);
      
      const result = await purchaseTickets(user.id, ticketNumbers, roundId, totalPrice);
      
      if (result.success) {
        toast.success(result.message);
        clearCart();
        await refreshProfile();
        navigate('/success');
      } else {
        toast.error(result.message);
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      toast.error('เกิดข้อผิดพลาดในการสั่งซื้อ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen text-slate-900 font-prompt animate-in fade-in duration-500 w-full overflow-x-hidden">
      <div className="relative w-full flex flex-col min-h-screen pt-32 pb-44 px-8">
        
        <div className="max-w-6xl mx-auto w-full space-y-12">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between border-l-8 border-primary pl-8 gap-4">
             <div className="flex flex-col space-y-2">
                <h2 className="text-4xl font-sans font-black text-slate-900 tracking-tighter uppercase leading-none">
                  ตะกร้าของฉัน
                </h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">
                  รายการรวมทั้งสิ้น {items.length} รายการ
                </p>
             </div>
             {items.length > 0 && (
               <button 
                 onClick={clearCart}
                 className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-red-50 text-primary hover:bg-primary hover:text-white transition-all font-black text-[10px] uppercase tracking-widest group"
               >
                  <Trash2 size={16} className="group-hover:scale-110 transition-transform" />
                  ล้างตะกร้า
               </button>
             )}
          </div>

          {items.length === 0 ? (
            <div className="py-32 flex flex-col items-center text-center space-y-10 bg-slate-50/50 rounded-[4rem] border border-slate-50">
              <div className="w-32 h-32 rounded-[3.5rem] bg-white flex items-center justify-center text-slate-200 shadow-2xl shadow-slate-200/50">
                <ShoppingCart size={56} />
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">ตะกร้าของคุณยังว่างอยู่</h3>
                <p className="text-sm text-slate-400 font-black uppercase tracking-widest">เริ่มเลือกเลขนำโชคที่คุณต้องการได้เลย</p>
              </div>
              <button 
                onClick={() => navigate('/')} 
                className="px-12 py-5 bg-primary text-white rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl shadow-red-200 hover:scale-105 active:scale-95 transition-all"
              >
                ไปเลือกเลขเด็ด
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
              
              {/* Items List */}
              <div className="lg:col-span-2 space-y-6">
                {items.map(item => (
                  <div key={item.id} className="group bg-white p-8 rounded-[3rem] border border-slate-100 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden transition-all hover:border-primary/20 hover:shadow-2xl hover:shadow-slate-200/50">
                    <div className="w-24 h-24 bg-red-50 rounded-[2rem] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-700">
                       <span className="text-primary font-black  text-sm tracking-widest uppercase">พรีเมียม</span>
                    </div>
                    
                    <div className="flex-1 flex flex-col items-center md:items-start space-y-2">
                      <span className="text-5xl font-black tracking-tighter text-slate-900 leading-none font-sans ">
                        {item.number}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-black text-red-600 ">฿ {item.price.toLocaleString()}</span>
                        <div className="h-1 w-1 rounded-full bg-slate-200" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">({item.setType})</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-center md:items-end gap-6 w-full md:w-auto">
                      <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                        <button
                          onClick={() => updateQuantity(item.id, Math.max(1, (item.count || 1) - 1))}
                          className="w-10 h-10 flex items-center justify-center rounded-xl bg-white text-slate-400 border border-slate-50 hover:text-primary hover:border-primary/20 active:scale-90 transition-all shadow-sm"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="text-base font-black text-slate-900 w-6 text-center tabular-nums">{item.count || 1}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, (item.count || 1) + 1)} 
                          className="w-10 h-10 flex items-center justify-center rounded-xl bg-primary text-white shadow-xl shadow-primary/20 active:scale-90 transition-all font-black"
                        >
                          <Plus size={16} strokeWidth={3} />
                        </button>
                      </div>
                      <button onClick={() => removeItem(item.id)} className="text-slate-300 hover:text-primary transition-all flex items-center gap-2 font-black text-[9px] uppercase tracking-widest px-4 py-2">
                        <Trash2 size={14} /> นำออก
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary Sidebar */}
              <div className="lg:col-span-1 lg:sticky lg:top-32 space-y-6">
                <div className="bg-primary rounded-[3.5rem] p-10 shadow-2xl shadow-primary/20 space-y-10 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-10 opacity-10">
                    <ShoppingCart size={120} />
                  </div>
                  
                  <div className="relative space-y-6">
                    <div className="flex items-center justify-between border-b border-white/10 pb-6">
                      <span className="text-[10px] font-black text-white/50 uppercase tracking-[0.4em]">สรุปรายการสั่งซื้อ</span>
                      <span className="bg-primary text-white text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest ">{totalItems} ใบ</span>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center text-white/70">
                         <span className="text-[11px] font-black uppercase tracking-widest ">ยอดรวมสลาก</span>
                         <span className="text-sm font-black ">฿ {totalPrice.toLocaleString()}.00</span>
                      </div>
                      <div className="flex justify-between items-center text-white/70">
                         <span className="text-[11px] font-black uppercase tracking-widest ">ค่าธรรมเนียมบริการ</span>
                         <span className="text-sm font-black ">฿ 0.00</span>
                      </div>
                    </div>

                    <div className="pt-8 border-t border-white/10 flex flex-col gap-2">
                       <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">ยอดชำระสุทธิ</p>
                       <div className="flex items-end gap-2">
                          <span className="text-5xl font-black text-primary tracking-tighter  font-sans">฿ {totalPrice.toLocaleString()}</span>
                          <span className="text-xs font-black text-white/50 mb-2 uppercase">.00</span>
                       </div>
                    </div>
                  </div>

                  <div className="relative">
                    <button 
                      onClick={handleCheckout} 
                      disabled={loading} 
                      className="w-full bg-white text-primary py-6 rounded-[2.5rem] font-sans font-black text-sm uppercase tracking-[0.3em] flex items-center justify-center gap-4 active:scale-95 shadow-2xl shadow-black/10 transition-all disabled:opacity-50 group hover:shadow-white/20"
                    >
                      {loading ? (
                        <div className="size-6 border-4 border-primary/30 border-t-primary animate-spin rounded-full" />
                      ) : (
                        <>ดำเนินการชำระ <CheckCircle size={22} className="group-hover:rotate-12 transition-transform" /></>
                      )}
                    </button>
                  </div>

                  <div className="relative pt-6 flex flex-col items-center gap-4 text-center">
                    <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                       <div className="size-1.5 rounded-full bg-green-400 animate-pulse" />
                       <span className="text-[9px] font-black text-white/50 uppercase tracking-widest">ระบบชำระเงินปลอดภัยสูงสุด</span>
                    </div>
                     <p className="text-[9px] text-white/30 font-bold uppercase tracking-[0.2em] leading-relaxed ">
                        ระบบจะคำนวณและตัดเงินจากวอลเล็ทของคุณโดยอัตโนมัติ<br/>
                        ลิขสิทธิ์ของ {config.site_name} อย่างเป็นทางการ
                     </p>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;
