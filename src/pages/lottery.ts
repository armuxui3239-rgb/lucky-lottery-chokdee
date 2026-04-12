import { supabase } from '../lib/supabase';

/**
 * ฟังก์ชันสุ่มเลข 6 หลัก จำนวน N ใบ
 */
export const generateRandomTickets = (amount: number = 12): string[] => {
    const tickets: string[] = [];
    for (let i = 0; i < amount; i++) {
        // สุ่มเลขตั้งแต่ 000000 ถึง 999999
        const randomNum = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
        tickets.push(randomNum);
    }
    return tickets;
};

/**
 * ฟังก์ชันสั่งซื้อลอตเตอรี่
 * @param userId รหัสผู้ใช้งาน
 * @param drawId รหัสงวดที่เปิดขายอยู่
 * @param ticketNumber เลข 6 หลักที่ลูกค้าต้องการซื้อ
 */
export const buyTicket = async (userId: string, drawId: string, ticketNumber: string) => {
    try {
        const ticketPrice = 80.00;

        // 1. ดึงข้อมูล Profile เพื่อเช็คยอดเงิน (Wallet)
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('wallet_balance')
            .eq('id', userId)
            .single();

        if (profileError) throw new Error('ไม่พบข้อมูลผู้ใช้งาน');
        if (profile.wallet_balance < ticketPrice) throw new Error('ยอดเงินในกระเป๋าไม่เพียงพอ กรุณาเติมเงิน');

        // 2. หักเงินจากกระเป๋า
        const newBalance = profile.wallet_balance - ticketPrice;
        const { error: updateError } = await supabase
            .from('profiles')
            .update({ wallet_balance: newBalance })
            .eq('id', userId);

        if (updateError) throw new Error('เกิดข้อผิดพลาดในการตัดเงิน');

        // 3. บันทึกสลากลงตาราง tickets ของลูกค้า
        const { error: insertError } = await supabase
            .from('tickets')
            .insert([{ user_id: userId, draw_id: drawId, ticket_number: ticketNumber, price: ticketPrice }]);

        if (insertError) throw new Error('บันทึกสลากไม่สำเร็จ');

        return { success: true, message: 'ซื้อสลากสำเร็จ! ขอให้โชคดีครับ' };
    } catch (error: any) {
        return { success: false, message: error.message };
    }
};