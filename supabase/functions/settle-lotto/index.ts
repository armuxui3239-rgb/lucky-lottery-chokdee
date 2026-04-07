// supabase/functions/settle-lotto/index.ts
// Edge Function: ดึงผลรางวัลจาก API รัฐบาล (ครบทุกรางวัลตามสลากกินแบ่งรัฐบาล) และประมวลผลจ่ายเงินอัตโนมัติ

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

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { roundId, dateStr } = await req.json();
    
    if (!roundId || !dateStr) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing roundId or dateStr' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service role
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );

    // 1. Fetch lottery results from Sanook API (GLO - Government Lottery Office)
    // Format date: DDMMYYYY (Buddhist year)
    const apiUrl = `https://www.sanook.com/lotto/api/result/${dateStr}`;
    
    console.log(`Fetching lottery results from: ${apiUrl}`);
    
    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}: ${response.statusText}`);
    }

    const data: LottoResult = await response.json();
    
    if (data.status !== 'success' || !data.response) {
      throw new Error('Invalid API response format');
    }

    console.log('Lottery API response:', JSON.stringify(data.response, null, 2));

    // Parse all prizes
    let result6digit = '';
    let result6digitNear1 = '';
    let result6digitNear2 = '';
    const result2nd: string[] = [];
    const result3rd: string[] = [];
    const result4th: string[] = [];
    const result5th: string[] = [];
    let r3top: string[] = [];
    let r3low: string[] = [];
    let r2bot = '';

    // Parse main prizes
    for (const prize of data.response.prizes) {
      switch (prize.id) {
        case 'prizeFirst':
          result6digit = prize.number[0] || '';
          break;
        case 'prizeFirstNear':
          // ข้างเคียงรางวัลที่ 1 (2 ใบ)
          if (prize.number && prize.number.length >= 2) {
            result6digitNear1 = prize.number[0];
            result6digitNear2 = prize.number[1];
          }
          break;
        case 'prizeSecond':
          // รางวัลที่ 2 (5 ใบ)
          result2nd.push(...prize.number);
          break;
        case 'prizeThird':
          // รางวัลที่ 3 (10 ใบ)
          result3rd.push(...prize.number);
          break;
        case 'prizeFourth':
          // รางวัลที่ 4 (50 ใบ)
          result4th.push(...prize.number);
          break;
        case 'prizeFifth':
          // รางวัลที่ 5 (100 ใบ)
          result5th.push(...prize.number);
          break;
      }
    }

    // Parse running numbers
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

    // Validate required data
    if (!result6digit || r3top.length === 0 || r3low.length === 0 || !r2bot) {
      throw new Error('Incomplete lottery results from API');
    }

    console.log('Parsed results:', {
      firstPrize: result6digit,
      nearPrizes: [result6digitNear1, result6digitNear2],
      secondPrizes: result2nd,
      thirdPrizes: result3rd,
      fourthPrizes: result4th,
      fifthPrizes: result5th,
      front3: r3top,
      back3: r3low,
      back2: r2bot
    });

    // Call database function with all prizes
    const { data: settleResult, error: settleError } = await supabase.rpc(
      'settle_lottery_round',
      {
        p_round_id: roundId,
        p_result_6digit: result6digit,
        p_6digit_near1: result6digitNear1,
        p_6digit_near2: result6digitNear2,
        p_r3top: r3top.join(','),
        p_r3low: r3low.join(','),
        p_r2bot: r2bot,
        p_result_2nd: result2nd,
        p_result_3rd: result3rd,
        p_result_4th: result4th,
        p_result_5th: result5th
      }
    );

    if (settleError) {
      throw new Error(`Settle error: ${settleError.message}`);
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: 'ประมวลผลรางวัลสำเร็จ',
        results: {
          firstPrize: result6digit,
          nearPrizes: [result6digitNear1, result6digitNear2],
          secondPrizes: result2nd,
          thirdPrizes: result3rd,
          fourthPrizes: result4th,
          fifthPrizes: result5th,
          front3: r3top,
          back3: r3low,
          back2: r2bot,
          apiDate: data.response.date
        },
        settlement: settleResult,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Settle lotto error:', error);
    
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
