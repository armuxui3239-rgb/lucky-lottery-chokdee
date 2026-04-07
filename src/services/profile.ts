import { supabase } from '../lib/supabase';

export interface ProfileUpdateData {
  full_name?: string;
  phone?: string;
  bank_code?: string;
  bank_account?: string;
  password?: string;
}

/**
 * อัปเดตข้อมูล Profile
 */
export const updateProfile = async (
  userId: string,
  data: ProfileUpdateData
): Promise<void> => {
  const { error } = await supabase
    .from('profiles')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (error) throw error;
};

/**
 * ดึงข้อมูล Profile แบบเต็ม (รวม wallet balance)
 */
export const getFullProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select(`
      *,
      wallets:user_id (balance)
    `)
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
};

/**
 * ดึงรายชื่อธนาคารที่ active
 */
export const getActiveBanks = async () => {
  const { data, error } = await supabase
    .from('banks')
    .select('code, name_th, name_en, logo_url')
    .eq('is_active', true)
    .order('name_th', { ascending: true });

  if (error) throw error;
  return data || [];
};

/**
 * ตั้งค่าข้อมูลธนาคาร
 */
export const setBankInfo = async (
  userId: string,
  bankCode: string,
  bankAccount: string
): Promise<void> => {
  const { error } = await supabase
    .from('profiles')
    .update({
      bank_code: bankCode,
      bank_account: bankAccount,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) throw error;
};

/**
 * ส่งข้อมูล KYC
 */
export const submitKycData = async (
  userId: string,
  data: { full_name: string; bank_code: string; bank_account: string }
): Promise<void> => {
  const { error } = await supabase
    .from('profiles')
    .update({
      ...data,
      kyc_status: 'pending',
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) throw error;
};

/**
 * ดึง Referral Stats
 */
export const getReferralStats = async (referralCode: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, created_at')
    .eq('referred_by', referralCode);

  if (error) throw error;
  return data || [];
};
/**
 * ดึงสถิติ Affiliate
 */
export const getAffiliateStats = async (userId: string) => {
  // 1. จํานวนลูกทีมทั้งหมด
  const { count: totalReferrals } = await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .eq('referred_by', userId);

  // 2. จํานวนลูกทีมที่ยืนยันตัวตนแล้ว (Active)
  const { count: activeReferrals } = await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .eq('referred_by', userId)
    .eq('kyc_status', 'verified');

  // 3. ยอดคอมมิชชั่นรวม
  const { data: commissions } = await supabase
    .from('affiliate_commissions')
    .select('amount')
    .eq('referrer_id', userId)
    .eq('status', 'completed');

  const totalCommission = commissions?.reduce((sum, item) => sum + (Number(item.amount) || 0), 0) || 0;

  return {
    total_referrals: totalReferrals || 0,
    active_referrals: activeReferrals || 0,
    total_commission: totalCommission
  };
};

/**
 * ดึงประวัติคอมมิชชั่น
 */
export const getCommissionLogs = async (userId: string) => {
  const { data, error } = await supabase
    .from('affiliate_commissions')
    .select(`
      *,
      profiles:referee_id (full_name)
    `)
    .eq('referrer_id', userId)
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) throw error;
  return data || [];
};
