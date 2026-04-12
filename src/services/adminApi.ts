/**
 * ====================================================
 * Admin API Service - ล็อตเตอรี่โชคดี
 * ====================================================
 * ครอบคลุมทุก API ที่ระบบ Admin ต้องใช้:
 * - Dashboard Stats
 * - User Management
 * - Finance (Deposit/Withdrawal)
 * - KYC Management
 * - Lottery Rounds & Results
 * - Promotions
 * - Notifications
 * - Affiliate
 * - Site Settings / CMS
 * - Winners Management
 * - Loyalty System
 * ====================================================
 */

import { supabase } from '../lib/supabase';

// ============ TYPES ============

export interface AdminStats {
  total_sales: number;
  new_members: number;
  total_users: number;
  tickets_sold: number;
  net_profit: number;
  pending_withdrawals: number;
  pending_kyc: number;
  open_round_id: string | null;
  open_round_date: string | null;
  open_round_name: string | null;
  open_round_prize: number;
  total_deposit: number;
  total_withdraw: number;
}

export interface AdminUser {
  id: string;
  phone: string;
  full_name: string;
  role: string;
  kyc_status: string;
  loyalty_tier: string;
  total_spent: number;
  bank_code: string;
  bank_account: string;
  referral_code: string;
  referred_by: string;
  is_otp_verified: boolean;
  updated_at: string;
  balance: number;
  selfie_url?: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: 'deposit' | 'withdraw' | 'purchase' | 'bonus' | 'win' | 'refund' | 'affiliate';
  amount: number;
  status: 'pending' | 'completed' | 'approved' | 'rejected' | 'failed';
  details?: string;
  proof_url?: string;
  admin_remark?: string;
  approved_at?: string;
  approved_by?: string;
  created_at: string;
  profiles?: { full_name: string; phone: string };
}

export interface LotteryRound {
  id: string;
  name: string;
  draw_date: string;
  status: 'open' | 'closed' | 'settled';
  price_per_ticket: number;
  created_at: string;
  lottery_results?: Array<{ id: string; result_6digit: string }>;
  ticket_count?: number;
}

export interface KycDocument {
  id: string;
  user_id: string;
  id_card_number: string;
  id_card_front_url: string;
  id_card_back_url: string;
  selfie_url: string;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  submitted_at: string;
  profiles?: { full_name: string; phone: string; kyc_status: string };
}

export interface Promotion {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  badge?: string;
  promo_code?: string;
  type: 'bonus' | 'cashback' | 'referral' | 'deposit' | 'free_ticket';
  discount_type: 'fixed' | 'percent';
  discount_value: number;
  max_discount?: number;
  minimum_deposit: number;
  max_redemptions?: number;
  redemptions_count: number;
  is_active: boolean;
  start_date: string;
  end_date?: string;
  image_url?: string;
  bg_gradient: string;
  created_at: string;
}

export interface SiteSetting {
  key: string;
  value: string;
  type?: string;
}

export interface Winner {
  id: string;
  display_name: string;
  prize_type: string;
  amount: number;
  ticket_number?: string;
  round_name?: string;
  draw_date?: string;
  is_public: boolean;
  created_at: string;
}

export interface LoyaltyReward {
  id: string;
  name: string;
  description?: string;
  points_required: number;
  reward_type: 'credit' | 'voucher' | 'premium' | 'free_ticket';
  reward_value: number;
  image_url?: string;
  stock: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id?: string;
  title: string;
  body: string;
  type: 'info' | 'win' | 'deposit' | 'withdraw' | 'promo' | 'system';
  is_read: boolean;
  action_url?: string;
  created_at: string;
}

export interface Bank {
  id: string;
  code: string;
  name_th: string;
  name_en: string;
  logo_url?: string;
  is_active: boolean;
}

// ============================================================
// SECTION 1: DASHBOARD STATS
// ============================================================

/** ดึงสถิติ Dashboard ทั้งหมด */
export const getAdminStats = async (): Promise<AdminStats> => {
  const { data, error } = await supabase.rpc('get_admin_stats');
  if (error) throw error;
  return data as AdminStats;
};

/** ดึงสรุปการเงิน (ย้อนหลัง N วัน) */
export const getFinanceSummary = async (days = 30) => {
  const { data, error } = await supabase.rpc('admin_get_finance_summary', { p_days: days });
  if (error) throw error;
  return data;
};

/** ดึงกราฟยอดขายรายวัน */
export const getDailySalesChart = async (days = 30) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from('transactions')
    .select('amount, type, created_at')
    .in('type', ['purchase', 'deposit'])
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: true });

  if (error) throw error;

  // Group by date
  const grouped: Record<string, { sales: number; deposit: number }> = {};
  (data || []).forEach((tx) => {
    const date = new Date(tx.created_at).toLocaleDateString('th-TH', { day: '2-digit', month: 'short' });
    if (!grouped[date]) grouped[date] = { sales: 0, deposit: 0 };
    if (tx.type === 'purchase') grouped[date].sales += Number(tx.amount);
    if (tx.type === 'deposit') grouped[date].deposit += Number(tx.amount);
  });

  return Object.entries(grouped).map(([date, values]) => ({ date, ...values }));
};

// ============================================================
// SECTION 2: USER MANAGEMENT
// ============================================================

/** ดึงสมาชิกทั้งหมดพร้อม balance */
export const getAllUsers = async (search = '', role = 'user', limit = 50, offset = 0): Promise<AdminUser[]> => {
  const { data, error } = await supabase.rpc('admin_get_all_users', {
    p_search: search,
    p_role: role,
    p_limit: limit,
    p_offset: offset,
  });
  if (error) throw error;
  return (data || []) as AdminUser[];
};

/** อัปเดตข้อมูลสมาชิก */
export const updateUserProfile = async (userId: string, updates: Partial<AdminUser>) => {
  const { error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId);
  if (error) throw error;
};

/** ปรับยอด Wallet ของสมาชิก */
export const adjustUserWallet = async (userId: string, amount: number, type: 'add' | 'deduct', reason: string) => {
  const { data, error } = await supabase.rpc('admin_adjust_wallet', {
    p_user_id: userId,
    p_amount: amount,
    p_type: type,
    p_reason: reason,
  });
  if (error) throw error;
  return data;
};

/** ดึงประวัติ transaction ของสมาชิก */
export const getUserTransactions = async (userId: string, limit = 20): Promise<Transaction[]> => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data || []) as Transaction[];
};

/** ดึง wallet balance ของสมาชิก */
export const getUserWalletBalance = async (userId: string): Promise<number> => {
  const { data, error } = await supabase
    .from('wallets')
    .select('balance')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return Number(data?.balance) || 0;
};

/** ลบผู้ใช้ (Soft ban โดย disable) */
export const banUser = async (userId: string) => {
  const { error } = await supabase
    .from('profiles')
    .update({ role: 'banned' as any })
    .eq('id', userId);
  if (error) throw error;
};

// ============================================================
// SECTION 3: FINANCE - DEPOSIT & WITHDRAWAL
// ============================================================

/** ดึงรายการ Transactions ทั้งหมด */
export const getAllTransactions = async (
  types: string[] = ['deposit', 'withdraw'],
  statuses: string[] = ['pending', 'approved', 'completed', 'rejected'],
  limit = 50
): Promise<Transaction[]> => {
  // 1. Fetch Transactions
  const { data: txs, error: txError } = await supabase
    .from('transactions')
    .select('*')
    .in('type', types)
    .in('status', statuses)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (txError) throw txError;
  if (!txs || txs.length === 0) return [];

  // 2. Extract unique user IDs
  const userIds = [...new Set(txs.map(t => t.user_id))];

  // 3. Fetch Profiles for those users
  const { data: profiles, error: profError } = await supabase
    .from('profiles')
    .select('id, full_name, phone')
    .in('id', userIds);

  if (profError) {
    console.error('Error fetching profiles for transactions:', profError);
    return txs.map(tx => ({ ...tx })) as Transaction[];
  }

  // 4. Merge data manually
  return txs.map(tx => ({
    ...tx,
    profiles: profiles?.find(p => p.id === tx.user_id)
  })) as Transaction[];
};

/** ดึงรายการ Pending ทั้งหมด (ฝาก + ถอน) */
export const getPendingTransactions = async (): Promise<Transaction[]> => {
  // 1. Fetch Pending
  const { data: txs, error: txError } = await supabase
    .from('transactions')
    .select('*')
    .in('type', ['deposit', 'withdraw'])
    .eq('status', 'pending')
    .order('created_at', { ascending: true });

  if (txError) throw txError;
  if (!txs || txs.length === 0) return [];

  // 2. Manual Profile Join
  const userIds = [...new Set(txs.map(t => t.user_id))];
  const { data: profiles, error: profError } = await supabase
    .from('profiles')
    .select('id, full_name, phone')
    .in('id', userIds);

  if (profError) {
    console.error('Error fetching profiles for pending:', profError);
    return txs.map(tx => ({ ...tx })) as Transaction[];
  }

  return txs.map(tx => ({
    ...tx,
    profiles: profiles?.find(p => p.id === tx.user_id)
  })) as Transaction[];
};

/** อนุมัติการฝากเงิน */
export const approveDeposit = async (transactionId: string, adminId: string): Promise<any> => {
  const { data, error } = await supabase.rpc('approve_deposit', {
    p_transaction_id: transactionId,
    p_admin_id: adminId,
    p_action: 'approve',
  });
  if (error) throw error;
  return data;
};

/** ปฏิเสธการฝากเงิน */
export const rejectDeposit = async (transactionId: string, adminId: string): Promise<any> => {
  const { data, error } = await supabase.rpc('approve_deposit', {
    p_transaction_id: transactionId,
    p_admin_id: adminId,
    p_action: 'reject',
  });
  if (error) throw error;
  return data;
};

/** อนุมัติการถอนเงิน */
export const approveWithdrawal = async (transactionId: string, adminId: string): Promise<any> => {
  const { data, error } = await supabase.rpc('approve_withdrawal', {
    p_transaction_id: transactionId,
    p_admin_id: adminId,
    p_action: 'approve',
  });
  if (error) throw error;
  return data;
};

/** ปฏิเสธการถอนเงิน */
export const rejectWithdrawal = async (transactionId: string, adminId: string): Promise<any> => {
  const { data, error } = await supabase.rpc('approve_withdrawal', {
    p_transaction_id: transactionId,
    p_admin_id: adminId,
    p_action: 'reject',
  });
  if (error) throw error;
  return data;
};

/** เพิ่ม Admin Remark ให้ Transaction */
export const addTransactionRemark = async (transactionId: string, remark: string) => {
  const { error } = await supabase
    .from('transactions')
    .update({ admin_remark: remark })
    .eq('id', transactionId);
  if (error) throw error;
};

// ============================================================
// SECTION 4: KYC MANAGEMENT
// ============================================================

/** ดึงรายการ KYC ทั้งหมด */
export const getAllKycDocuments = async (status?: string): Promise<KycDocument[]> => {
  // 1. Fetch Docs
  let query = supabase
    .from('kyc_documents')
    .select('*')
    .order('submitted_at', { ascending: true });

  if (status) query = query.eq('status', status);

  const { data: docs, error: docError } = await query;
  if (docError) throw docError;
  if (!docs || docs.length === 0) return [];

  // 2. Manual Join
  const userIds = [...new Set(docs.map(t => t.user_id))];
  const { data: profiles, error: profError } = await supabase
    .from('profiles')
    .select('id, full_name, phone, kyc_status')
    .in('id', userIds);

  return docs.map(doc => ({
    ...doc,
    profiles: profiles?.find(p => p.id === doc.user_id)
  })) as KycDocument[];
};

/** อนุมัติ KYC */
export const approveKyc = async (userId: string, adminId: string): Promise<any> => {
  const { data, error } = await supabase.rpc('admin_update_kyc', {
    p_user_id: userId,
    p_status: 'verified',
    p_rejection_reason: null,
    p_admin_id: adminId,
  });
  if (error) throw error;
  return data;
};

/** ปฏิเสธ KYC */
export const rejectKyc = async (userId: string, adminId: string, reason: string): Promise<any> => {
  const { data, error } = await supabase.rpc('admin_update_kyc', {
    p_user_id: userId,
    p_status: 'rejected',
    p_rejection_reason: reason,
    p_admin_id: adminId,
  });
  if (error) throw error;
  return data;
};

// ============================================================
// SECTION 5: LOTTERY ROUNDS
// ============================================================

/** ดึงงวดสลากทั้งหมด */
export const getAllLotteryRounds = async (limit = 20): Promise<LotteryRound[]> => {
  const { data, error } = await supabase
    .from('lottery_rounds')
    .select(`
      *,
      lottery_results(id, result_6digit),
      lottery_tickets(count)
    `)
    .order('draw_date', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data || []) as LotteryRound[];
};

/** สร้างงวดใหม่ */
export const createLotteryRound = async (name: string, drawDate: string, pricePerTicket = 80) => {
  const { data, error } = await supabase
    .from('lottery_rounds')
    .insert({ name, draw_date: drawDate, status: 'open', price_per_ticket: pricePerTicket })
    .select()
    .single();
  if (error) throw error;
  return data;
};

/** ปิดงวด (ไม่ให้ซื้อเพิ่ม) */
export const closeLotteryRound = async (roundId: string) => {
  const { error } = await supabase
    .from('lottery_rounds')
    .update({ status: 'closed' })
    .eq('id', roundId);
  if (error) throw error;
};

/** ประกาศผลรางวัล (เรียก Edge Function) */
export const settleRoundAuto = async (roundId: string, dateStr: string) => {
  // แปลงวันที่ "2026-04-01" -> "01042569"
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const yearBC = date.getFullYear() + 543;
  const formattedDate = `${day}${month}${yearBC}`;

  const { data, error } = await supabase.functions.invoke('settle-lotto', {
    body: { roundId, dateStr: formattedDate },
  });
  if (error) throw error;
  return data;
};

/** ดึงสลากทั้งหมดในงวด */
export const getTicketsByRound = async (roundId: string) => {
  // 1. Fetch Tickets
  const { data: tickets, error: ticketError } = await supabase
    .from('lottery_tickets')
    .select('*')
    .eq('round_id', roundId)
    .order('ticket_number', { ascending: true });

  if (ticketError) throw ticketError;
  if (!tickets || tickets.length === 0) return [];

  // 2. Manual Profile Join
  const userIds = [...new Set(tickets.map(t => t.user_id))];
  const { data: profiles, error: profError } = await supabase
    .from('profiles')
    .select('id, full_name, phone')
    .in('id', userIds);

  if (profError) {
    console.error('Error fetching profiles for tickets:', profError);
    return tickets.map(t => ({ ...t }));
  }

  return tickets.map(t => ({
    ...t,
    profiles: profiles?.find(p => p.id === t.user_id)
  }));
};

// ============================================================
// SECTION 6: WINNERS MANAGEMENT
// ============================================================

/** ดึงรายชื่อผู้ถูกรางวัลทั้งหมด */
export const getAllWinners = async (roundId?: string, limit = 50): Promise<Winner[]> => {
  const { data, error } = await supabase.rpc('admin_get_winners_list', {
    p_round_id: roundId || null,
    p_limit: limit,
  });
  if (error) throw error;
  return (data || []) as Winner[];
};

/** เพิ่มผู้ถูกรางวัล (manual) */
export const addWinner = async (winner: Partial<Winner> & { round_id?: string }) => {
  const { data, error } = await supabase
    .from('winners')
    .insert(winner)
    .select()
    .single();
  if (error) throw error;
  return data;
};

/** ปิด/เปิดการแสดงผู้ถูกรางวัล */
export const toggleWinnerVisibility = async (winnerId: string, isPublic: boolean) => {
  const { error } = await supabase
    .from('winners')
    .update({ is_public: isPublic })
    .eq('id', winnerId);
  if (error) throw error;
};

/** ลบผู้ถูกรางวัล */
export const deleteWinner = async (winnerId: string) => {
  const { error } = await supabase
    .from('winners')
    .delete()
    .eq('id', winnerId);
  if (error) throw error;
};

// ============================================================
// SECTION 7: PROMOTIONS
// ============================================================

/** ดึงโปรโมชั่นทั้งหมด */
export const getAllPromotions = async (): Promise<Promotion[]> => {
  const { data, error } = await supabase
    .from('promotions')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as Promotion[];
};

/** สร้างโปรโมชั่นใหม่ */
export const createPromotion = async (promo: Partial<Promotion>) => {
  const { data, error } = await supabase
    .from('promotions')
    .insert(promo)
    .select()
    .single();
  if (error) throw error;
  return data;
};

/** แก้ไขโปรโมชั่น */
export const updatePromotion = async (promoId: string, updates: Partial<Promotion>) => {
  const { data, error } = await supabase
    .from('promotions')
    .update(updates)
    .eq('id', promoId)
    .select()
    .single();
  if (error) throw error;
  return data;
};

/** เปิด/ปิดโปรโมชั่น */
export const togglePromotion = async (promoId: string, isActive: boolean) => {
  const { data, error } = await supabase.rpc('admin_toggle_promotion', {
    p_promo_id: promoId,
    p_is_active: isActive,
  });
  if (error) throw error;
  return data;
};

/** ลบโปรโมชั่น */
export const deletePromotion = async (promoId: string) => {
  const { error } = await supabase
    .from('promotions')
    .delete()
    .eq('id', promoId);
  if (error) throw error;
};

// ============================================================
// SECTION 8: NOTIFICATIONS
// ============================================================

/** ดึง Notification ทั้งหมดในระบบ */
export const getAllNotifications = async (userId?: string, limit = 50): Promise<Notification[]> => {
  let query = supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (userId) query = query.eq('user_id', userId);

  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as Notification[];
};

/** ส่ง Notification ถึงผู้ใช้คนเดียว */
export const sendNotificationToUser = async (
  userId: string,
  title: string,
  body: string,
  type: Notification['type'] = 'info',
  actionUrl?: string
) => {
  const { data, error } = await supabase.rpc('admin_send_notification', {
    p_user_id: userId,
    p_title: title,
    p_body: body,
    p_type: type,
    p_action_url: actionUrl || null,
  });
  if (error) throw error;
  return data;
};

/** ส่ง Notification Broadcast ถึงทุกคน */
export const broadcastNotification = async (
  title: string,
  body: string,
  type: Notification['type'] = 'system',
  actionUrl?: string
) => {
  const { data, error } = await supabase.rpc('admin_send_notification', {
    p_user_id: null,
    p_title: title,
    p_body: body,
    p_type: type,
    p_action_url: actionUrl || null,
  });
  if (error) throw error;
  return data;
};

/** ลบ Notification */
export const deleteNotification = async (notificationId: string) => {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId);
  if (error) throw error;
};

// ============================================================
// SECTION 9: SITE SETTINGS / CMS
// ============================================================

/** ดึงการตั้งค่าทั้งหมด */
export const getAllSiteSettings = async (): Promise<SiteSetting[]> => {
  const { data, error } = await supabase
    .from('site_settings')
    .select('*')
    .order('key');
  if (error) throw error;
  return (data || []) as SiteSetting[];
};

/** ดึงการตั้งค่าตาม key */
export const getSiteSettingByKey = async (key: string): Promise<string> => {
  const { data, error } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', key)
    .maybeSingle();
  if (error) throw error;
  return data?.value || '';
};

/** บันทึกการตั้งค่าหลายค่าพร้อมกัน */
export const saveSiteSettings = async (settings: Record<string, string>) => {
  const upsertData = Object.entries(settings).map(([key, value]) => ({
    key,
    value,
    type: 'text',
  }));

  const { error } = await supabase
    .from('site_settings')
    .upsert(upsertData, { onConflict: 'key' });
  if (error) throw error;
};

/** บันทึกการตั้งค่าค่าเดียว */
export const saveSiteSetting = async (key: string, value: string) => {
  const { error } = await supabase
    .from('site_settings')
    .upsert({ key, value, type: 'text' }, { onConflict: 'key' });
  if (error) throw error;
};

// ============================================================
// SECTION 10: BANKS
// ============================================================

/** ดึงธนาคารทั้งหมด */
export const getAllBanks = async (): Promise<Bank[]> => {
  const { data, error } = await supabase
    .from('banks')
    .select('*')
    .order('name_th');
  if (error) throw error;
  return (data || []) as Bank[];
};

/** เปิด/ปิดธนาคาร */
export const toggleBank = async (bankId: string, isActive: boolean) => {
  const { error } = await supabase
    .from('banks')
    .update({ is_active: isActive })
    .eq('id', bankId);
  if (error) throw error;
};

/** แก้ไขข้อมูลธนาคาร */
export const updateBank = async (bankId: string, updates: Partial<Bank>) => {
  const { data, error } = await supabase
    .from('banks')
    .update(updates)
    .eq('id', bankId)
    .select()
    .single();
  if (error) throw error;
  return data;
};

// ============================================================
// SECTION 11: AFFILIATE
// ============================================================

/** ดึงสรุป Affiliate */
export const getAffiliateSummary = async () => {
  const { data, error } = await supabase.rpc('admin_get_affiliate_summary');
  if (error) throw error;
  return data || [];
};

/** ดึงรายการ Commission ทั้งหมด */
export const getAffiliateCommissions = async (status?: string) => {
  // 1. Fetch Commissions
  let query = supabase
    .from('affiliate_commissions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  if (status) query = query.eq('status', status);

  const { data: comms, error: commError } = await query;
  if (commError) throw commError;
  if (!comms || comms.length === 0) return [];

  // 2. Manual Joins for BOTH Referrer and Referee
  const userIds = [...new Set([
    ...comms.map(c => c.referrer_id),
    ...comms.map(c => c.referee_id)
  ])];

  const { data: profiles, error: profError } = await supabase
    .from('profiles')
    .select('id, full_name, phone')
    .in('id', userIds);

  if (profError) {
    console.error('Error fetching profiles for commissions:', profError);
    return comms;
  }

  return comms.map(comm => ({
    ...comm,
    referrer: profiles?.find(p => p.id === comm.referrer_id),
    referee: profiles?.find(p => p.id === comm.referee_id)
  }));
};

/** อนุมัติ Commission */
export const approveCommission = async (commissionId: string) => {
  const { error } = await supabase
    .from('affiliate_commissions')
    .update({ status: 'paid', paid_at: new Date().toISOString() })
    .eq('id', commissionId);
  if (error) throw error;
};

// ============================================================
// SECTION 12: LOYALTY SYSTEM
// ============================================================

/** ดึง Loyalty Points ทั้งหมด */
export const getAllLoyaltyPoints = async () => {
  // 1. Fetch Points
  const { data: pts, error: ptError } = await supabase
    .from('loyalty_points')
    .select('*')
    .order('points_balance', { ascending: false })
    .limit(100);

  if (ptError) throw ptError;
  if (!pts || pts.length === 0) return [];

  // 2. Manual Join Profile
  const userIds = [...new Set(pts.map(t => t.user_id))];
  const { data: profiles, error: profError } = await supabase
    .from('profiles')
    .select('id, full_name, phone, loyalty_tier')
    .in('id', userIds);

  if (profError) {
    console.error('Error fetching profiles for loyalty:', profError);
    return pts.map(pt => ({ ...pt }));
  }

  return pts.map(pt => ({
    ...pt,
    profiles: profiles?.find(p => p.id === pt.user_id)
  }));
};

/** ดึง Loyalty Rewards ทั้งหมด */
export const getAllLoyaltyRewards = async (): Promise<LoyaltyReward[]> => {
  const { data, error } = await supabase
    .from('loyalty_rewards')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return (data || []) as LoyaltyReward[];
};

/** สร้าง Reward ใหม่ */
export const createLoyaltyReward = async (reward: Partial<LoyaltyReward>) => {
  const { data, error } = await supabase
    .from('loyalty_rewards')
    .insert(reward)
    .select()
    .single();
  if (error) throw error;
  return data;
};

/** แก้ไข Reward */
export const updateLoyaltyReward = async (rewardId: string, updates: Partial<LoyaltyReward>) => {
  const { data, error } = await supabase
    .from('loyalty_rewards')
    .update(updates)
    .eq('id', rewardId)
    .select()
    .single();
  if (error) throw error;
  return data;
};

/** ลบ Reward */
export const deleteLoyaltyReward = async (rewardId: string) => {
  const { error } = await supabase
    .from('loyalty_rewards')
    .delete()
    .eq('id', rewardId);
  if (error) throw error;
};

/** ดึงรายการ Redemptions ที่รอดำเนินการ */
export const getPendingRedemptions = async () => {
  // 1. Fetch Redemptions with Reward data (Reward link should be fine)
  const { data: rd, error: rdError } = await supabase
    .from('loyalty_redemptions')
    .select('*, loyalty_rewards(name, reward_type, reward_value)')
    .eq('status', 'pending')
    .order('created_at', { ascending: true });

  if (rdError) throw rdError;
  if (!rd || rd.length === 0) return [];

  // 2. Manual Join Profile
  const userIds = [...new Set(rd.map(t => t.user_id))];
  const { data: profiles, error: profError } = await supabase
    .from('profiles')
    .select('id, full_name, phone')
    .in('id', userIds);

  if (profError) {
    console.error('Error fetching profiles for redemptions:', profError);
    return rd.map(r => ({ ...r }));
  }

  return rd.map(r => ({
    ...r,
    profiles: profiles?.find(p => p.id === r.user_id)
  }));
};

/** อนุมัติ Redemption */
export const approveRedemption = async (redemptionId: string) => {
  const { error } = await supabase
    .from('loyalty_redemptions')
    .update({ status: 'completed' })
    .eq('id', redemptionId);
  if (error) throw error;
};

/** คำนวณ Tier ใหม่ทุกคน */
export const recalculateLoyaltyTiers = async () => {
  const { data, error } = await supabase.rpc('admin_recalculate_loyalty');
  if (error) throw error;
  return data;
};

// ============================================================
// SECTION 13: REAL-TIME SUBSCRIPTIONS
// ============================================================

/** Subscribe real-time รายการ Pending Transaction */
export const subscribePendingTransactions = (callback: (payload: any) => void) => {
  return supabase
    .channel('admin-pending-transactions')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'transactions',
        filter: 'status=eq.pending',
      },
      callback
    )
    .subscribe();
};

/** Subscribe real-time KYC submissions */
export const subscribeKycSubmissions = (callback: (payload: any) => void) => {
  return supabase
    .channel('admin-kyc-submissions')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'kyc_documents',
      },
      callback
    )
    .subscribe();
};

/** Unsubscribe จาก channel */
export const unsubscribeChannel = async (channel: ReturnType<typeof supabase.channel>) => {
  await supabase.removeChannel(channel);
};

// ============================================================
// SECTION 14: UTILITY
// ============================================================

/** Export ข้อมูล Transaction เป็น CSV */
export const exportTransactionsAsCSV = async (days = 30): Promise<string> => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // 1. Fetch
  const { data: txs, error: txError } = await supabase
    .from('transactions')
    .select('*')
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: false });

  if (txError) throw txError;
  if (!txs || txs.length === 0) return '';

  // 2. Manual Join
  const userIds = [...new Set(txs.map(t => t.user_id))];
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, phone')
    .in('id', userIds);

  const enriched = txs.map(tx => ({
    ...tx,
    profiles: profiles?.find(p => p.id === tx.user_id)
  }));

  const rows = [
    ['ID', 'ชื่อ', 'เบอร์', 'ประเภท', 'จำนวนเงิน', 'สถานะ', 'วันที่'],
    ...enriched.map((tx: any) => [
      tx.id.slice(0, 8),
      tx.profiles?.full_name || '-',
      tx.profiles?.phone || '-',
      tx.type,
      tx.amount,
      tx.status,
      new Date(tx.created_at).toLocaleString('th-TH'),
    ]),
  ];

  return rows.map((row) => row.join(',')).join('\n');
};

// ============================================================
// SECTION 15: ADMIN ACTIVITY LOGS
// ============================================================

export interface AdminActivityLog {
  id: string;
  action: string;
  details?: string;
  created_at: string;
}

/** ดึง Admin Activity Logs */
export const getAdminActivityLogs = async (limit = 50): Promise<AdminActivityLog[]> => {
  const { data, error } = await supabase
    .from('admin_activity_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data || []) as AdminActivityLog[];
};

/** บันทึก Admin Activity Log */
export const logAdminActivity = async (action: string, details?: string) => {
  const { error } = await supabase
    .from('admin_activity_logs')
    .insert({ action, details, created_at: new Date().toISOString() });
  if (error) console.error('Error logging admin activity:', error);
};

// ============================================================
// SECTION 16: AUTO DRAW STATUS
// ============================================================

export interface AutoDrawStatus {
  isEnabled: boolean;
  nextDrawDate: string | null;
  lastDrawDate: string | null;
  lastDrawResult: {
    winners: number;
    totalPayout: number;
  } | null;
}

/** ดึงสถานะ Auto Draw */
export const getAutoDrawStatus = async (): Promise<AutoDrawStatus> => {
  // หางวดถัดไปที่ต้องออกรางวัล
  const today = new Date();
  const { data: nextRound } = await supabase
    .from('lottery_rounds')
    .select('draw_date')
    .eq('status', 'open')
    .gte('draw_date', today.toISOString().split('T')[0])
    .order('draw_date', { ascending: true })
    .maybeSingle();

  // หางวดล่าสุดที่ออกรางวัลแล้ว
  const { data: lastRound } = await supabase
    .from('lottery_rounds')
    .select('draw_date, lottery_results(winners_count, total_payout)')
    .eq('status', 'settled')
    .order('draw_date', { ascending: false })
    .maybeSingle();

  return {
    isEnabled: true, // ระบบอัตโนมัติเปิดใช้งานเสมอ
    nextDrawDate: nextRound?.draw_date || null,
    lastDrawDate: lastRound?.draw_date || null,
    lastDrawResult: lastRound ? {
      winners: lastRound.lottery_results?.[0]?.winners_count || 0,
      totalPayout: lastRound.lottery_results?.[0]?.total_payout || 0
    } : null
  };
};

/** Export ข้อมูลผู้ถูกรางวัลเป็น CSV */
export const exportWinnersAsCSV = async (roundId?: string): Promise<string> => {
  // 1. Fetch
  const { data: winners, error } = await supabase.rpc('admin_get_winners_list', {
    p_round_id: roundId || null,
    p_limit: 1000,
  });

  if (error) throw error;
  if (!winners || winners.length === 0) return '';

  const rows = [
    ['ID', 'ชื่อผู้ถูกรางวัล', 'เลขสลาก', 'ประเภทรางวัล', 'จำนวนเงิน', 'งวด', 'สถานะการแสดงผล', 'วันที่บันทึก'],
    ...(winners as any[]).map((w) => [
      w.id.slice(0, 8),
      w.display_name || '-',
      w.ticket_number || '-',
      w.prize_type,
      w.amount,
      w.round_name || '-',
      w.is_public ? 'Public' : 'Hidden',
      new Date(w.created_at).toLocaleString('th-TH'),
    ]),
  ];

  return rows.map((row) => row.join(',')).join('\n');
};

/** ล้างข้อมูลผู้ถูกรางวัลที่เก่ากว่า 30 วัน */
export const deleteOldWinners = async (): Promise<number> => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { error, count } = await supabase
    .from('winners')
    .delete({ count: 'exact' })
    .lt('created_at', thirtyDaysAgo.toISOString());

  if (error) throw error;
  return count || 0;
};

/** Utility: ดาวน์โหลดไล์ CSV */
export const downloadCSV = (content: string, fileName: string) => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};


/** รัน Auto Draw ด้วยมือ (สำหรับทดสอบ) */
export const triggerManualDraw = async () => {
  const { data, error } = await supabase.functions.invoke('auto-lotto-draw', {});
  if (error) throw error;
  return data;
};
