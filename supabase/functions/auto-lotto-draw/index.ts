// supabase/functions/auto-lotto-draw/index.ts
// Edge Function: ออกรางวัลอัตโนมัติตามเวลารัฐบาล (1 และ 16 เวลา 16:00)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface LottoResult {
  status: string;
  response: {
    date: string;
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

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ตรวจสอบว่าวันนี้ต้องออกรางวัลหรือไม่ (1 หรือ 16 ของเดือน)
function shouldDrawToday(): boolean {
  const now = new Date();
  const day = now.getDate();
  return day === 1 || day === 16;
}

// ฟอร์แมตวันที่เป็น DDMMYYYY (พ.ศ.)
function formatThaiDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear() + 543; // แปลงเป็นพ.ศ.
  return `${day}${month}${year}`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // ตรวจสอบว่าวันนี้ต้องออกรางวัลหรือไม่
    if (!shouldDrawToday()) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'วันนี้ไม่ใช่วันออกรางวัล (ต้องเป็นวันที่ 1 หรือ 16 เท่านั้น)',
          today: new Date().toISOString(),
          nextDraw: getNextDrawDate()
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );

    // หางวดที่ต้องออกรางวัล (draw_date = วันนี้ และ status = 'open')
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { data: round, error: roundError } = await supabase
      .from('lottery_rounds')
      .select('*')
      .eq('draw_date', today.toISOString().split('T')[0])
      .eq('status', 'open')
      .single();

    if (roundError || !round) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'ไม่พบงวดที่ต้องออกรางวัลสำหรับวันนี้',
          date: today.toISOString().split('T')[0]
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ดึงผลรางวัลจาก API
    const dateStr = formatThaiDate(today);
    const apiUrl = `https://www.sanook.com/lotto/api/result/${dateStr}`;
    
    console.log(`[Auto Draw] กำลังดึงผลรางวัลงวด ${dateStr}...`);
    
    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`API สลากฯ ไม่ตอบสนอง: ${response.status}`);
    }

    const data: LottoResult = await response.json();
    
    if (data.status !== 'success') {
      throw new Error('ผลรางวัลยังไม่พร้อม (รอประกาศ 16:00 น.)');
    }

    // แยกผลรางวัล
    let result6digit = '';
    let r3top: string[] = [];
    let r3low: string[] = [];
    let r2bot = '';

    for (const prize of data.response.prizes) {
      if (prize.id === 'prizeFirst') {
        result6digit = prize.number[0] || '';
      }
    }

    for (const running of data.response.runningNumbers) {
      switch (running.id) {
        case 'runningNumberFrontThree':
          r3top = running.number || [];
          break;
        case 'runningNumberBackThree':
          r3low = running.number || [];
          break;
        case 'runningNumberBackTwo':
          r2bot = running.number[0] || '';
          break;
      }
    }

    if (!result6digit || r3top.length === 0 || r3low.length === 0 || !r2bot) {
      throw new Error('ผลรางวัลจาก API ไม่สมบูรณ์');
    }

    console.log(`[Auto Draw] พบผลรางวัล: รางวัลที่ 1 = ${result6digit}`);

    // เรียก RPC สำหรับประมวลผลรางวัลและจ่ายเงิน
    const { data: result, error: settleError } = await supabase.rpc(
      'settle_lottery_round',
      {
        p_round_id: round.id,
        p_result_6digit: result6digit,
        p_r3top: r3top.join(','),
        p_r3low: r3low.join(','),
        p_r2bot: r2bot
      }
    );

    if (settleError) {
      throw new Error(`การประมวลผลล้มเหลว: ${settleError.message}`);
    }

    // บันทึก Log
    await supabase.from('admin_activity_logs').insert({
      action: 'auto_lotto_draw',
      details: `ออกรางวัลงวด ${dateStr}: รางวัลที่ 1 = ${result6digit}, ผู้ถูกรางวัล ${result.winners_count} คน, จ่ายรวม ${result.total_payout} บาท`,
      created_at: new Date().toISOString()
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'ออกรางวัลและจ่ายเงินสำเร็จ!',
        draw_date: dateStr,
        results: {
          firstPrize: result6digit,
          front3: r3top,
          back3: r3low,
          back2: r2bot
        },
        winners: result.winners_count,
        totalPayout: result.total_payout,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[Auto Draw Error]', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// คำนวณวันออกรางวัลครั้งถัดไป
function getNextDrawDate(): string {
  const now = new Date();
  const currentDay = now.getDate();
  
  let nextDraw: Date;
  
  if (currentDay < 1) {
    nextDraw = new Date(now.getFullYear(), now.getMonth(), 1);
  } else if (currentDay < 16) {
    nextDraw = new Date(now.getFullYear(), now.getMonth(), 16);
  } else {
    // ไปเดือนหน้า วันที่ 1
    nextDraw = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  }
  
  return nextDraw.toISOString().split('T')[0];
}
