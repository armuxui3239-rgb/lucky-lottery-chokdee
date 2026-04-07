import { supabase } from '../lib/supabase';

export interface SanookLottoResult {
  status: string;
  response: {
    date: string;
    endpoint: string;
    prizes: Array<{
      id: string;
      name: string;
      reward: string;
      amount: number;
      number: string[];
    }>;
    runningNumbers: Array<{
      id: string;
      name: string;
      reward: string;
      amount: number;
      number: string[];
    }>;
  };
}

export interface FormattedLottoResult {
  round_date: string;
  result_6digit: string;
  f3_1: string;
  f3_2: string;
  b3_1: string;
  b3_2: string;
  b2: string;
}

/**
 * ฟังก์ชันสำหรับค้นหางวดตามวันที่ เพื่อดึง round_id และแปลงวันที่
 */
export const syncAndSettleRound = async (roundId: string, dateStr: string) => {
  // แปลงวันที่ "2026-04-01" -> "01042569"
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const yearBC = date.getFullYear() + 543;
  const formattedDate = `${day}${month}${yearBC}`;

  const { data, error } = await supabase.functions.invoke('settle-lotto', {
    body: { roundId, dateStr: formattedDate }
  });

  if (error) throw error;
  return data;
};

