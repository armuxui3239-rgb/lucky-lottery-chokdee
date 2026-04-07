import { supabase } from '../lib/supabase';

export interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: 'deposit' | 'withdraw' | 'purchase' | 'bonus';
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  details?: string;
  created_at: string;
}

/**
 * ดึงข้อมูลกระเป๋าเงินของผู้ใช้
 */
export const getMyWallet = async (userId: string): Promise<Wallet | null> => {
  const { data, error } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
};

/**
 * ดึงรายการเดินบัญชี (Transactions)
 */
export const getMyTransactions = async (userId: string): Promise<Transaction[]> => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

/**
 * ขอรับ Welcome Bonus (เรียกใช้ Postgres RPC)
 */
export const getWelcomeBonus = async (userId: string) => {
  const { data, error } = await supabase.rpc('grant_welcome_bonus', {
    p_user_id: userId
  });

  if (error) throw error;
  return data;
};
