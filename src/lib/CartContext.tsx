import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from './supabase';

export interface CartItem {
  id: string; // composite key or unique id
  lottery_id: string; // The UUID from lotteries table
  number: string;
  setType: string;
  price: number;
  count: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, count: number) => void;
  clearCart: () => void;
  checkout: () => Promise<{ success: boolean; message: string }>;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType>({
  items: [],
  addItem: () => {},
  removeItem: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  checkout: async () => ({ success: false, message: '' }),
  totalItems: 0,
  totalPrice: 0,
});

export const useCart = () => useContext(CartContext);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('sakon_cart');
    return saved ? JSON.parse(saved) : [];
  });

  // Effect to save cart to localStorage
  useEffect(() => {
    localStorage.setItem('sakon_cart', JSON.stringify(items));
  }, [items]);

  // Handle Cart Isolation: Clear cart on logout/user change
  useEffect(() => {
    // If user changes (login/logout), we might want to clear or fetch a saved cart from DB
    // For this MVP, we clear to prevent leakage
    const lastUserId = localStorage.getItem('sakon_cart_userid');
    if (user?.id !== lastUserId) {
      setItems([]);
      if (user?.id) {
        localStorage.setItem('sakon_cart_userid', user.id);
      } else {
        localStorage.removeItem('sakon_cart_userid');
      }
    }
  }, [user?.id]);

  const addItem = (item: CartItem) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, count: i.count + item.count } : i);
      }
      return [...prev, item];
    });
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const updateQuantity = (id: string, count: number) => {
    if (count <= 0) {
      removeItem(id);
      return;
    }
    setItems(prev => prev.map(i => i.id === id ? { ...i, count } : i));
  };

  const clearCart = () => setItems([]);

  const checkout = async (): Promise<{ success: boolean; message: string }> => {
    if (!user) return { success: false, message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ' };
    if (items.length === 0) return { success: false, message: 'ตะกร้าสินค้าว่างเปล่า' };

    try {
      // รวมเลขสลากทั้งหมดในตะกร้า (Unlimited Supply Model)
      const ticketNumbers = items.map(item => item.number);
      const roundId = items[0]?.lottery_id;
      const totalPrice = items.reduce((sum, item) => sum + (item.price * item.count), 0);

      const { data, error } = await supabase.rpc('purchase_lottery_tickets', {
        p_user_id: user.id,
        p_ticket_numbers: ticketNumbers,
        p_round_id: roundId,
        p_total_price: totalPrice,
      });

      if (error) throw error;

      const res = data as any;
      if (res && res.success) {
        clearCart();
        return { success: true, message: res.message || `ซื้อสลากสำเร็จ ${items.length} ใบ` };
      } else {
        return { success: false, message: (res && res.message) || 'เกิดข้อผิดพลาด กรุณาลองใหม่' };
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      return { success: false, message: err.message || 'ระบบขัดข้อง กรุณาลองใหม่ภายหลัง' };
    }
  };

  const totalItems = items.reduce((sum, item) => sum + item.count, 0);
  const totalPrice = items.reduce((sum, item) => sum + (item.price * item.count), 0);

  return (
    <CartContext.Provider value={{
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      checkout,
      totalItems,
      totalPrice
    }}>
      {children}
    </CartContext.Provider>
  );
};
