import { supabase } from '../lib/supabase';

/**
 * Admin Service
 * จัดการการอนุมัติ/ปฏิเสธ Transactions และดูสถิติ
 */

export interface PendingTransaction {
  id: string;
  user_id: string;
  type: 'deposit' | 'withdraw';
  amount: number;
  status: 'pending';
  proof_url?: string;
  admin_remark?: string;
  details?: string;
  created_at: string;
  // Join data
  profiles?: {
    full_name: string;
    phone: string;
  };
}

export interface AdminStats {
  total_sales: number;
  new_members: number;
  tickets_sold: number;
  net_profit: number;
  pending_withdrawals: number;
  pending_kyc: number;
  open_round_date: string | null;
  open_round_prize: number;
}

/**
 * ดึงสถิติ Admin
 */
export const getAdminStats = async (): Promise<AdminStats> => {
  const { data, error } = await supabase.rpc('get_admin_stats');
  if (error) throw error;
  return data as AdminStats;
};

/**
 * ดึงรายการ Deposit ที่รอ Approve
 */
export const getPendingDeposits = async (): Promise<PendingTransaction[]> => {
  const { data, error } = await supabase
    .from('transactions')
    .select(`
      *,
      profiles:user_id (full_name, phone)
    `)
    .eq('type', 'deposit')
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as PendingTransaction[];
};

/**
 * ดึงรายการ Withdraw ที่รอ Approve
 */
export const getPendingWithdrawals = async (): Promise<PendingTransaction[]> => {
  const { data, error } = await supabase
    .from('transactions')
    .select(`
      *,
      profiles:user_id (full_name, phone)
    `)
    .eq('type', 'withdraw')
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as PendingTransaction[];
};

/**
 * อนุมัติหรือปฏิเสธ Deposit
 */
export const processDeposit = async (
  transactionId: string,
  adminId: string,
  action: 'approve' | 'reject'
): Promise<{ success: boolean; message: string }> => {
  const { data, error } = await supabase.rpc('approve_deposit', {
    p_transaction_id: transactionId,
    p_admin_id: adminId,
    p_action: action,
  });

  if (error) throw error;
  return data as { success: boolean; message: string };
};

/**
 * อนุมัติหรือปฏิเสธ Withdraw
 */
export const processWithdrawal = async (
  transactionId: string,
  adminId: string,
  action: 'approve' | 'reject'
): Promise<{ success: boolean; message: string }> => {
  const { data, error } = await supabase.rpc('approve_withdrawal', {
    p_transaction_id: transactionId,
    p_admin_id: adminId,
    p_action: action,
  });

  if (error) throw error;
  return data as { success: boolean; message: string };
};

/**
 * ดึงสมาชิกทั้งหมด (Admin only)
 */
export const getAllMembers = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      *,
      wallets:user_id (balance)
    `)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

/**
 * ตั้งค่า KYC status
 */
export const updateKycStatus = async (
  userId: string,
  status: 'verified' | 'rejected'
): Promise<void> => {
  const { error } = await supabase
    .from('profiles')
    .update({ kyc_status: status })
    .eq('id', userId);

  if (error) throw error;
};

/**
 * ดึงสลากทั้งหมดในงวด
 */
export const getTicketsByRound = async (roundId: string) => {
  const { data, error } = await supabase
    .from('lottery_tickets')
    .select('*')
    .eq('round_id', roundId)
    .order('ticket_number', { ascending: true });

  if (error) throw error;
  return data || [];
};

/**
 * ประกาศผลรางวัล (Admin only)
 */
export const settleRound = async (
  roundId: string,
  result6digit: string,
  f3_1: string,
  f3_2: string,
  b3_1: string,
  b3_2: string,
  b2: string
) => {
  const { data, error } = await supabase.rpc('settle_lottery_round_v2', {
    p_round_id: roundId,
    p_result_6digit: result6digit,
    p_f3_1: f3_1,
    p_f3_2: f3_2,
    p_b3_1: b3_1,
    p_b3_2: b3_2,
    p_b2: b2,
  });

  if (error) throw error;
  return data;
};
