import { supabase } from '../lib/supabase';

/**
 * Lottery Service — Unlimited Supply Model
 * ทุกเลข 6 หลัก (000000-999999) สามารถซื้อได้เสมอ ไม่มีของหมด
 */

export interface LotteryRound {
  id: string;
  draw_date: string;
  name: string;
  status: 'open' | 'closed' | 'settled' | 'upcoming';
  price_per_ticket: number;
}

export interface Ticket {
  id: string;
  ticket_number: string;
  price: number;
  round_id: string;
  user_id: string;
  status: 'pending' | 'win' | 'lose' | 'paid';
  created_at: string;
}

export interface LotteryResult {
  id: string;
  round_id: string;
  result_6digit: string;
  r3top: string;   // เลขหน้า 3 ตัว (comma-separated: "123,456")
  r3low: string;   // เลขท้าย 3 ตัว (comma-separated: "789,012")
  r2bot: string;   // เลขท้าย 2 ตัว
  created_at: string;
}

/**
 * ดึงงวดที่เปิดรับซื้ออยู่
 */
export const getActiveRounds = async (): Promise<LotteryRound[]> => {
  const { data, error } = await supabase
    .from('lottery_rounds')
    .select('*')
    .eq('status', 'open')
    .order('draw_date', { ascending: true });

  if (error) throw error;
  return data || [];
};

/**
 * ดึงงวดทั้งหมด (สำหรับ Results page)
 */
export const getAllRounds = async (): Promise<LotteryRound[]> => {
  const { data, error } = await supabase
    .from('lottery_rounds')
    .select('*')
    .order('draw_date', { ascending: false })
    .limit(12);

  if (error) throw error;
  return data || [];
};

/**
 * แปลงเลข 6 หลักให้เป็น Object Ticket (Virtual Ticket)
 */
export const generateVirtualTickets = (numbers: string[], round: LotteryRound): Ticket[] => {
  return numbers.map(num => ({
    id: `v-${num}-${Math.random().toString(36).substr(2, 9)}`,
    ticket_number: num,
    price: round.price_per_ticket,
    round_id: round.id,
    user_id: '', 
    status: 'pending',
    created_at: new Date().toISOString()
  } as Ticket));
};


/**
 * สุ่มเลข 6 หลัก N ใบ (Unlimited Supply — generate on demand)
 */
export const generateRandomTickets = (count: number): string[] => {
  const tickets: string[] = [];
  const seen = new Set<string>();
  while (tickets.length < count) {
    const num = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    if (!seen.has(num)) {
      seen.add(num);
      tickets.push(num);
    }
  }
  return tickets;
};

/**
 * สร้างเลขแนะนำหลายชุด (Featured Numbers)
 */
export const getFeaturedNumbers = (): { category: string; numbers: string[] }[] => {
  const lucky = generateRandomTickets(6);
  const trending = generateRandomTickets(6);
  const hot = generateRandomTickets(6);
  return [
    { category: 'เลขเด็ดแนะนำ', numbers: lucky },
    { category: 'เลขมาแรง', numbers: trending },
    { category: 'เลขมงคล', numbers: hot },
  ];
};

/**
 * ซื้อสลาก — รองรับ Unlimited Supply (เรียก RPC ที่ INSERT ทุกครั้ง)
 */
export const purchaseTickets = async (
  userId: string,
  ticketNumbers: string[],
  roundId: string,
  totalPrice: number
): Promise<{ success: boolean; message: string; transaction_id?: string; tickets_purchased?: number }> => {
  const { data, error } = await supabase.rpc('purchase_lottery_tickets', {
    p_user_id: userId,
    p_ticket_numbers: ticketNumbers,
    p_round_id: roundId,
    p_total_price: totalPrice,
  });

  if (error) throw error;
  return data as { success: boolean; message: string; transaction_id?: string; tickets_purchased?: number };
};

/**
 * ดึงสลากที่ผู้ใช้ซื้อทั้งหมด (ใช้ใน History)
 */
export const getMyTickets = async (userId: string): Promise<Ticket[]> => {
  const { data, error } = await supabase
    .from('lottery_tickets')
    .select(`
      *,
      lottery_rounds (name, draw_date, status)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as Ticket[];
};

/**
 * ดึงเลขยอดนิยมในงวดปัจจุบัน (จาก DB)
 */
export const getPopularNumbers = async (roundId: string, limit = 10) => {
  const { data, error } = await supabase.rpc('get_popular_numbers', {
    p_round_id: roundId,
    p_limit: limit,
  });

  if (error) throw error;
  return (data || []) as { ticket_number: string; purchase_count: number }[];
};

/**
 * ดึงผลรางวัลล่าสุด
 */
export const getLatestResults = async (): Promise<LotteryResult[]> => {
  const { data, error } = await supabase
    .from('lottery_results')
    .select(`
      *,
      lottery_rounds (name, draw_date)
    `)
    .order('created_at', { ascending: false })
    .limit(6);

  if (error) throw error;
  return (data || []) as LotteryResult[];
};

/**
 * ดึงผลรางวัลและสถานะสลากของ user
 */
export const getMyResults = async (userId: string) => {
  const { data, error } = await supabase.rpc('get_my_results', {
    p_user_id: userId,
  });

  if (error) throw error;
  return data || [];
};

/**
 * ตรวจเลข: คำนวณรางวัลจากผลจริงกับ ticket ที่ถือ (Client-side preview)
 */
export const checkPrize = (
  ticketNumber: string,
  result: LotteryResult
): { won: boolean; prizeType: string; amount: number } => {
  const num = ticketNumber.padStart(6, '0');
  const r6 = result.result_6digit?.padStart(6, '0') || '';
  const f3s = (result.r3top || '').split(',').map(s => s.trim());
  const b3s = (result.r3low || '').split(',').map(s => s.trim());
  const b2 = result.r2bot?.trim() || '';

  let amount = 0;
  const prizes: string[] = [];

  if (num === r6) { amount += 6000000; prizes.push('รางวัลที่ 1'); }
  if (f3s.some(f => num.slice(0, 3) === f)) { amount += 4000; prizes.push('เลขหน้า 3 ตัว'); }
  if (b3s.some(b => num.slice(-3) === b)) { amount += 4000; prizes.push('เลขท้าย 3 ตัว'); }
  if (b2 && num.slice(-2) === b2) { amount += 2000; prizes.push('เลขท้าย 2 ตัว'); }

  return {
    won: amount > 0,
    prizeType: prizes.join(' + ') || 'ไม่ถูกรางวัล',
    amount,
  };
};

/**
 * ค้นหาผลรางวัลตามวันที่ (สำหรับระบบค้นหาย้อนหลัง)
 */
export const searchLotteryResults = async (dateStr: string): Promise<LotteryResult | null> => {
  const { data, error } = await supabase
    .from('lottery_rounds')
    .select('*, lottery_results(*)')
    .eq('draw_date', dateStr)
    .single();

  if (error || !data || !data.lottery_results) return null;

  // Flatten the result to match LotteryResult interface
  const res = data.lottery_results[0]; // assuming 1:1 for settled rounds
  return {
    ...res,
    lottery_rounds: {
      name: data.name,
      draw_date: data.draw_date
    }
  } as any;
};
