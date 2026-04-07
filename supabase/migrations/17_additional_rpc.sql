-- 17_additional_rpc.sql
-- RPC Functions เพิ่มเติมที่ใช้ใน frontend

-- 1. ดึงเลขยอดนิยม
CREATE OR REPLACE FUNCTION get_popular_numbers(p_round_id UUID, p_limit INTEGER DEFAULT 10)
RETURNS TABLE (ticket_number TEXT, purchase_count BIGINT) AS $$
BEGIN
    RETURN QUERY
    SELECT lt.ticket_number, COUNT(*) as purchase_count
    FROM lottery_tickets lt
    WHERE lt.round_id = p_round_id
    GROUP BY lt.ticket_number
    ORDER BY purchase_count DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. ดึงผลรางวัลของ user
CREATE OR REPLACE FUNCTION get_my_results(p_user_id UUID)
RETURNS TABLE (
    ticket_id UUID,
    ticket_number TEXT,
    round_name TEXT,
    draw_date DATE,
    status TEXT,
    prize_type TEXT,
    prize_amount NUMERIC,
    settled_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        lt.id as ticket_id,
        lt.ticket_number,
        lr.name as round_name,
        lr.draw_date,
        lt.status,
        lt.prize_type,
        lt.prize_amount,
        lt.settled_at
    FROM lottery_tickets lt
    JOIN lottery_rounds lr ON lt.round_id = lr.id
    WHERE lt.user_id = p_user_id
    AND lr.status = 'settled'
    ORDER BY lr.draw_date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. สรุปการเงิน (ย้อนหลัง N วัน)
CREATE OR REPLACE FUNCTION admin_get_finance_summary(p_days INTEGER DEFAULT 30)
RETURNS TABLE (
    total_deposit NUMERIC,
    total_withdraw NUMERIC,
    total_purchase NUMERIC,
    total_win NUMERIC,
    net_profit NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(CASE WHEN type = 'deposit' AND status = 'approved' THEN amount ELSE 0 END), 0) as total_deposit,
        COALESCE(SUM(CASE WHEN type = 'withdraw' AND status = 'approved' THEN amount ELSE 0 END), 0) as total_withdraw,
        COALESCE(SUM(CASE WHEN type = 'purchase' AND status = 'completed' THEN amount ELSE 0 END), 0) as total_purchase,
        COALESCE(SUM(CASE WHEN type = 'win' AND status = 'completed' THEN amount ELSE 0 END), 0) as total_win,
        COALESCE(SUM(CASE WHEN type = 'purchase' THEN amount ELSE 0 END), 0) - 
        COALESCE(SUM(CASE WHEN type = 'win' THEN amount ELSE 0 END), 0) as net_profit
    FROM transactions
    WHERE created_at >= NOW() - (p_days || ' days')::INTERVAL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. ดึงสมาชิกทั้งหมดพร้อม balance
CREATE OR REPLACE FUNCTION admin_get_all_users(
    p_search TEXT DEFAULT '',
    p_role TEXT DEFAULT 'user',
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    phone TEXT,
    full_name TEXT,
    role TEXT,
    kyc_status TEXT,
    loyalty_tier TEXT,
    total_spent NUMERIC,
    bank_code TEXT,
    bank_account TEXT,
    referral_code TEXT,
    referred_by UUID,
    is_otp_verified BOOLEAN,
    updated_at TIMESTAMPTZ,
    balance NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.phone,
        p.full_name,
        p.role,
        p.kyc_status,
        p.loyalty_tier,
        p.total_spent,
        p.bank_code,
        p.bank_account,
        p.referral_code,
        p.referred_by,
        p.is_otp_verified,
        p.updated_at,
        COALESCE(w.balance, 0) as balance
    FROM profiles p
    LEFT JOIN wallets w ON p.id = w.user_id
    WHERE (p_search = '' OR p.phone ILIKE '%' || p_search || '%' OR p.full_name ILIKE '%' || p_search || '%')
    AND (p_role = 'all' OR p.role = p_role)
    ORDER BY p.created_at DESC
    LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. อัปเดตสถานะ KYC
CREATE OR REPLACE FUNCTION admin_update_kyc(
    p_user_id UUID,
    p_status TEXT,
    p_rejection_reason TEXT DEFAULT NULL,
    p_admin_id UUID DEFAULT NULL
)
RETURNS TABLE (success BOOLEAN, message TEXT) AS $$
BEGIN
    UPDATE kyc_documents 
    SET status = p_status, 
        rejection_reason = p_rejection_reason,
        reviewed_by = p_admin_id,
        reviewed_at = NOW()
    WHERE user_id = p_user_id;
    
    UPDATE profiles SET kyc_status = p_status WHERE id = p_user_id;
    
    IF p_status = 'verified' THEN
        INSERT INTO notifications (user_id, title, body, type) 
        VALUES (p_user_id, 'ยืนยันตัวตนสำเร็จ', 'เอกสาร KYC ของคุณได้รับการอนุมัติแล้ว', 'system');
    END IF;
    
    RETURN QUERY SELECT true, 'อัปเดตสถานะ KYC สำเร็จ';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. ดึงรายชื่อผู้ถูกรางวัล
CREATE OR REPLACE FUNCTION admin_get_winners_list(
    p_round_id UUID DEFAULT NULL,
    p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
    id UUID,
    display_name TEXT,
    prize_type TEXT,
    amount NUMERIC,
    ticket_number TEXT,
    round_name TEXT,
    draw_date DATE,
    is_public BOOLEAN,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        w.id,
        w.display_name,
        w.prize_type,
        w.amount,
        w.ticket_number,
        lr.name as round_name,
        w.draw_date,
        w.is_public,
        w.created_at
    FROM winners w
    LEFT JOIN lottery_rounds lr ON w.round_id = lr.id
    WHERE (p_round_id IS NULL OR w.round_id = p_round_id)
    ORDER BY w.created_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. เปิด/ปิดโปรโมชั่น
CREATE OR REPLACE FUNCTION admin_toggle_promotion(
    p_promo_id UUID,
    p_is_active BOOLEAN
)
RETURNS TABLE (success BOOLEAN, message TEXT) AS $$
BEGIN
    UPDATE promotions SET is_active = p_is_active WHERE id = p_promo_id;
    RETURN QUERY SELECT true, 'อัปเดตสถานะโปรโมชั่นสำเร็จ';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. ส่งแจ้งเตือน
CREATE OR REPLACE FUNCTION admin_send_notification(
    p_user_id UUID DEFAULT NULL,
    p_title TEXT,
    p_body TEXT,
    p_type TEXT DEFAULT 'info',
    p_action_url TEXT DEFAULT NULL
)
RETURNS TABLE (success BOOLEAN, message TEXT) AS $$
BEGIN
    IF p_user_id IS NULL THEN
        -- Broadcast ถึงทุกคน
        INSERT INTO notifications (user_id, title, body, type, action_url)
        SELECT id, p_title, p_body, p_type, p_action_url FROM profiles WHERE role = 'user';
    ELSE
        -- ส่งถึงคนเดียว
        INSERT INTO notifications (user_id, title, body, type, action_url)
        VALUES (p_user_id, p_title, p_body, p_type, p_action_url);
    END IF;
    
    RETURN QUERY SELECT true, 'ส่งแจ้งเตือนสำเร็จ';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. สรุป Affiliate
CREATE OR REPLACE FUNCTION admin_get_affiliate_summary()
RETURNS TABLE (
    total_referrals BIGINT,
    total_commissions NUMERIC,
    paid_commissions NUMERIC,
    pending_commissions NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_referrals,
        COALESCE(SUM(amount), 0) as total_commissions,
        COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0) as paid_commissions,
        COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END), 0) as pending_commissions
    FROM affiliate_commissions;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. คำนวณ Tier ใหม่
CREATE OR REPLACE FUNCTION admin_recalculate_loyalty()
RETURNS TABLE (success BOOLEAN, users_updated INTEGER) AS $$
DECLARE v_count INTEGER := 0;
BEGIN
    UPDATE profiles SET 
        loyalty_tier = CASE 
            WHEN total_spent >= 100000 THEN 'diamond'
            WHEN total_spent >= 50000 THEN 'platinum'
            WHEN total_spent >= 20000 THEN 'gold'
            WHEN total_spent >= 5000 THEN 'silver'
            ELSE 'bronze'
        END
    WHERE role = 'user';
    
    GET DIAGNOSTICS v_count = ROW_COUNT;
    
    RETURN QUERY SELECT true, v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
