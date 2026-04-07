-- 13_rpc_functions.sql
-- ฟังก์ชันสำหรับระบบ

-- ดึงสถิติแอดมิน
CREATE OR REPLACE FUNCTION get_admin_stats()
RETURNS TABLE (
    total_sales NUMERIC, new_members BIGINT, total_users BIGINT,
    tickets_sold BIGINT, net_profit NUMERIC, pending_withdrawals BIGINT,
    pending_kyc BIGINT, open_round_id UUID, open_round_date DATE,
    open_round_name TEXT, open_round_prize NUMERIC, total_deposit NUMERIC, total_withdraw NUMERIC
) AS $$
BEGIN
    RETURN QUERY SELECT
        COALESCE((SELECT SUM(amount) FROM transactions WHERE type = 'purchase' AND status = 'completed'), 0),
        (SELECT COUNT(*) FROM profiles WHERE created_at >= NOW() - INTERVAL '30 days'),
        (SELECT COUNT(*) FROM profiles),
        (SELECT COUNT(*) FROM lottery_tickets WHERE user_id IS NOT NULL),
        COALESCE((SELECT SUM(amount) FROM transactions WHERE type = 'purchase' AND status = 'completed'), 0) - 
        COALESCE((SELECT SUM(amount) FROM transactions WHERE type = 'win' AND status = 'completed'), 0),
        (SELECT COUNT(*) FROM transactions WHERE type = 'withdraw' AND status = 'pending'),
        (SELECT COUNT(*) FROM kyc_documents WHERE status = 'pending'),
        (SELECT id FROM lottery_rounds WHERE status = 'open' LIMIT 1),
        (SELECT draw_date FROM lottery_rounds WHERE status = 'open' LIMIT 1),
        (SELECT name FROM lottery_rounds WHERE status = 'open' LIMIT 1),
        COALESCE((SELECT SUM(prize_amount) FROM lottery_tickets WHERE status = 'win'), 0),
        COALESCE((SELECT SUM(amount) FROM transactions WHERE type = 'deposit' AND status = 'approved'), 0),
        COALESCE((SELECT SUM(amount) FROM transactions WHERE type = 'withdraw' AND status = 'approved'), 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ซื้อสลาก
CREATE OR REPLACE FUNCTION purchase_lottery_tickets(p_user_id UUID, p_ticket_numbers TEXT[], p_round_id UUID, p_total_price NUMERIC)
RETURNS TABLE (success BOOLEAN, message TEXT, transaction_id UUID, tickets_purchased INTEGER) AS $$
DECLARE v_wallet NUMERIC; v_tx UUID; v_count INTEGER := 0; v_num TEXT; v_price NUMERIC;
BEGIN
    SELECT balance INTO v_wallet FROM wallets WHERE user_id = p_user_id;
    IF v_wallet < p_total_price THEN RETURN QUERY SELECT false, 'ยอดเงินไม่พอ', NULL::UUID, 0; RETURN; END IF;
    SELECT price_per_ticket INTO v_price FROM lottery_rounds WHERE id = p_round_id AND status = 'open';
    IF v_price IS NULL THEN RETURN QUERY SELECT false, 'งวดปิดแล้ว', NULL::UUID, 0; RETURN; END IF;
    INSERT INTO transactions (user_id, type, amount, status, details)
    VALUES (p_user_id, 'purchase', p_total_price, 'completed', 'ซื้อสลาก ' || array_length(p_ticket_numbers, 1) || ' ใบ')
    RETURNING id INTO v_tx;
    UPDATE wallets SET balance = balance - p_total_price WHERE user_id = p_user_id;
    FOREACH v_num IN ARRAY p_ticket_numbers LOOP
        INSERT INTO lottery_tickets (ticket_number, round_id, user_id, price, status)
        VALUES (LPAD(v_num, 6, '0'), p_round_id, p_user_id, v_price, 'pending');
        v_count := v_count + 1;
    END LOOP;
    UPDATE profiles SET total_spent = total_spent + p_total_price WHERE id = p_user_id;
    INSERT INTO loyalty_points (user_id, points_balance, lifetime_points)
    VALUES (p_user_id, FLOOR(p_total_price / 10), FLOOR(p_total_price / 10))
    ON CONFLICT (user_id) DO UPDATE SET points_balance = loyalty_points.points_balance + FLOOR(p_total_price / 10), lifetime_points = loyalty_points.lifetime_points + FLOOR(p_total_price / 10), updated_at = NOW();
    RETURN QUERY SELECT true, 'ซื้อสลากสำเร็จ!', v_tx, v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- อนุมัติฝากเงิน
CREATE OR REPLACE FUNCTION approve_deposit(p_transaction_id UUID, p_admin_id UUID, p_action TEXT)
RETURNS TABLE (success BOOLEAN, message TEXT, new_balance NUMERIC) AS $$
DECLARE v_tx RECORD;
BEGIN
    SELECT * INTO v_tx FROM transactions WHERE id = p_transaction_id AND type = 'deposit';
    IF v_tx IS NULL THEN RETURN QUERY SELECT false, 'ไม่พบรายการ', 0::NUMERIC; RETURN; END IF;
    IF p_action = 'approve' THEN
        UPDATE transactions SET status = 'approved', approved_at = NOW(), approved_by = p_admin_id WHERE id = p_transaction_id;
        UPDATE wallets SET balance = balance + v_tx.amount WHERE user_id = v_tx.user_id;
        INSERT INTO notifications (user_id, title, body, type) VALUES (v_tx.user_id, 'ฝากเงินสำเร็จ', 'เงิน ' || v_tx.amount || ' บาทเข้ากระเป๋าแล้ว', 'deposit');
        RETURN QUERY SELECT true, 'อนุมัติสำเร็จ', (SELECT balance FROM wallets WHERE user_id = v_tx.user_id);
    ELSE
        UPDATE transactions SET status = 'rejected', approved_at = NOW(), approved_by = p_admin_id WHERE id = p_transaction_id;
        RETURN QUERY SELECT true, 'ปฏิเสธสำเร็จ', 0::NUMERIC;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- อนุมัติถอนเงิน
CREATE OR REPLACE FUNCTION approve_withdrawal(p_transaction_id UUID, p_admin_id UUID, p_action TEXT)
RETURNS TABLE (success BOOLEAN, message TEXT) AS $$
DECLARE v_tx RECORD;
BEGIN
    SELECT * INTO v_tx FROM transactions WHERE id = p_transaction_id AND type = 'withdraw';
    IF v_tx IS NULL THEN RETURN QUERY SELECT false, 'ไม่พบรายการ'::TEXT; RETURN; END IF;
    IF p_action = 'approve' THEN
        UPDATE transactions SET status = 'approved', approved_at = NOW(), approved_by = p_admin_id WHERE id = p_transaction_id;
        INSERT INTO notifications (user_id, title, body, type) VALUES (v_tx.user_id, 'ถอนเงินสำเร็จ', 'เงิน ' || v_tx.amount || ' บาทถูกโอนแล้ว', 'withdraw');
        RETURN QUERY SELECT true, 'อนุมัติการถอนสำเร็จ'::TEXT;
    ELSE
        UPDATE transactions SET status = 'rejected', approved_at = NOW(), approved_by = p_admin_id WHERE id = p_transaction_id;
        UPDATE wallets SET balance = balance + v_tx.amount WHERE user_id = v_tx.user_id;
        INSERT INTO transactions (user_id, type, amount, status, details) VALUES (v_tx.user_id, 'refund', v_tx.amount, 'completed', 'คืนเงินจากการถอนที่ถูกปฏิเสธ');
        RETURN QUERY SELECT true, 'ปฏิเสธแล้ว (เงินคืนกระเป๋า)'::TEXT;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ออกรางวัลและจ่ายเงินอัตโนมัติ (ครบทุกรางวัลตามสลากรัฐบาล)
CREATE OR REPLACE FUNCTION settle_lottery_round(
    p_round_id UUID, 
    p_result_6digit TEXT, 
    p_6digit_near1 TEXT DEFAULT NULL,
    p_6digit_near2 TEXT DEFAULT NULL,
    p_r3top TEXT, 
    p_r3low TEXT, 
    p_r2bot TEXT,
    p_result_2nd JSONB DEFAULT NULL,
    p_result_3rd JSONB DEFAULT NULL,
    p_result_4th JSONB DEFAULT NULL,
    p_result_5th JSONB DEFAULT NULL
)
RETURNS TABLE (success BOOLEAN, message TEXT, winners_count INTEGER, total_payout NUMERIC) AS $$
DECLARE 
    v_ticket RECORD; 
    v_winner_count INTEGER := 0; 
    v_total_payout NUMERIC := 0; 
    v_prize NUMERIC; 
    v_type TEXT; 
    v_f3 TEXT[]; 
    v_b3 TEXT[];
    v_2nd TEXT[];
    v_3rd TEXT[];
    v_4th TEXT[];
    v_5th TEXT[];
BEGIN
    -- บันทึกผลรางวัล
    INSERT INTO lottery_results (
        round_id, result_6digit, result_6digit_near1, result_6digit_near2,
        result_2nd, result_3rd, result_4th, result_5th,
        r3top, r3low, r2bot
    ) VALUES (
        p_round_id, p_result_6digit, p_6digit_near1, p_6digit_near2,
        p_result_2nd, p_result_3rd, p_result_4th, p_result_5th,
        p_r3top, p_r3low, p_r2bot
    );
    
    -- แปลงข้อมูลเป็น array
    v_f3 := string_to_array(p_r3top, ','); 
    v_b3 := string_to_array(p_r3low, ',');
    v_2nd := ARRAY(SELECT jsonb_array_elements_text(p_result_2nd));
    v_3rd := ARRAY(SELECT jsonb_array_elements_text(p_result_3rd));
    v_4th := ARRAY(SELECT jsonb_array_elements_text(p_result_4th));
    v_5th := ARRAY(SELECT jsonb_array_elements_text(p_result_5th));

    -- ตรวจสอบทุกตั๋ว
    FOR v_ticket IN SELECT * FROM lottery_tickets 
                      WHERE round_id = p_round_id 
                      AND status = 'pending' 
                      AND user_id IS NOT NULL 
    LOOP
        v_prize := 0; 
        v_type := '';
        
        -- รางวัลที่ 1: 6 ล้าน
        IF v_ticket.ticket_number = p_result_6digit THEN 
            v_prize := v_prize + 6000000; 
            v_type := v_type || CASE WHEN v_type != '' THEN '+รางวัลที่ 1' ELSE 'รางวัลที่ 1' END;
        END IF;
        
        -- รางวัลข้างเคียงรางวัลที่ 1: 100,000 บาท (2 ใบ)
        IF v_ticket.ticket_number = p_6digit_near1 OR v_ticket.ticket_number = p_6digit_near2 THEN
            v_prize := v_prize + 100000;
            v_type := v_type || CASE WHEN v_type != '' THEN '+ข้างเคียงรางวัลที่ 1' ELSE 'ข้างเคียงรางวัลที่ 1' END;
        END IF;
        
        -- รางวัลที่ 2: 200,000 บาท (5 ใบ)
        IF v_ticket.ticket_number = ANY(v_2nd) THEN
            v_prize := v_prize + 200000;
            v_type := v_type || CASE WHEN v_type != '' THEN '+รางวัลที่ 2' ELSE 'รางวัลที่ 2' END;
        END IF;
        
        -- รางวัลที่ 3: 80,000 บาท (10 ใบ)
        IF v_ticket.ticket_number = ANY(v_3rd) THEN
            v_prize := v_prize + 80000;
            v_type := v_type || CASE WHEN v_type != '' THEN '+รางวัลที่ 3' ELSE 'รางวัลที่ 3' END;
        END IF;
        
        -- รางวัลที่ 4: 40,000 บาท (50 ใบ)
        IF v_ticket.ticket_number = ANY(v_4th) THEN
            v_prize := v_prize + 40000;
            v_type := v_type || CASE WHEN v_type != '' THEN '+รางวัลที่ 4' ELSE 'รางวัลที่ 4' END;
        END IF;
        
        -- รางวัลที่ 5: 20,000 บาท (100 ใบ)
        IF v_ticket.ticket_number = ANY(v_5th) THEN
            v_prize := v_prize + 20000;
            v_type := v_type || CASE WHEN v_type != '' THEN '+รางวัลที่ 5' ELSE 'รางวัลที่ 5' END;
        END IF;
        
        -- เลขหน้า 3 ตัว: 4,000 บาท
        IF v_ticket.ticket_number[:3] = ANY(v_f3) THEN 
            v_prize := v_prize + 4000; 
            v_type := v_type || CASE WHEN v_type != '' THEN '+เลขหน้า 3 ตัว' ELSE 'เลขหน้า 3 ตัว' END;
        END IF;
        
        -- เลขท้าย 3 ตัว: 4,000 บาท
        IF v_ticket.ticket_number[4:] = ANY(v_b3) THEN 
            v_prize := v_prize + 4000; 
            v_type := v_type || CASE WHEN v_type != '' THEN '+เลขท้าย 3 ตัว' ELSE 'เลขท้าย 3 ตัว' END;
        END IF;
        
        -- เลขท้าย 2 ตัว: 2,000 บาท
        IF v_ticket.ticket_number[5:] = p_r2bot THEN 
            v_prize := v_prize + 2000; 
            v_type := v_type || CASE WHEN v_type != '' THEN '+เลขท้าย 2 ตัว' ELSE 'เลขท้าย 2 ตัว' END;
        END IF;
        
        -- อัปเดตผลและจ่ายเงิน
        IF v_prize > 0 THEN
            UPDATE lottery_tickets SET status = 'paid', prize_type = v_type, prize_amount = v_prize, settled_at = NOW() WHERE id = v_ticket.id;
            UPDATE wallets SET balance = balance + v_prize WHERE user_id = v_ticket.user_id;
            INSERT INTO transactions (user_id, type, amount, status, details) 
            VALUES (v_ticket.user_id, 'win', v_prize, 'completed', 'ถูกรางวัล ' || v_type || ' เลข ' || v_ticket.ticket_number);
            INSERT INTO notifications (user_id, title, body, type) 
            VALUES (v_ticket.user_id, '🎉 ถูกรางวัล!', 'คุณถูกรางวัล ' || v_type || ' มูลค่า ' || v_prize::TEXT || ' บาท', 'win');
            v_winner_count := v_winner_count + 1; 
            v_total_payout := v_total_payout + v_prize;
        ELSE
            UPDATE lottery_tickets SET status = 'lose' WHERE id = v_ticket.id;
        END IF;
    END LOOP;
    
    UPDATE lottery_rounds SET status = 'settled' WHERE id = p_round_id;
    RETURN QUERY SELECT true, 'ประมวลผลรางวัลสำเร็จ', v_winner_count, v_total_payout;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- แอดมินปรับยอดเงิน
CREATE OR REPLACE FUNCTION admin_adjust_wallet(p_user_id UUID, p_amount NUMERIC, p_type TEXT, p_reason TEXT)
RETURNS TABLE (success BOOLEAN, message TEXT, new_balance NUMERIC) AS $$
DECLARE v_current NUMERIC; v_new NUMERIC;
BEGIN
    SELECT balance INTO v_current FROM wallets WHERE user_id = p_user_id;
    IF p_type = 'add' THEN
        UPDATE wallets SET balance = balance + p_amount WHERE user_id = p_user_id;
        INSERT INTO transactions (user_id, type, amount, status, details) VALUES (p_user_id, 'bonus', p_amount, 'completed', p_reason);
        v_new := v_current + p_amount;
    ELSE
        IF v_current < p_amount THEN RETURN QUERY SELECT false, 'ยอดเงินไม่พอ', v_current; RETURN; END IF;
        UPDATE wallets SET balance = balance - p_amount WHERE user_id = p_user_id;
        INSERT INTO transactions (user_id, type, amount, status, details) VALUES (p_user_id, 'refund', p_amount, 'completed', p_reason);
        v_new := v_current - p_amount;
    END IF;
    RETURN QUERY SELECT true, 'ปรับยอดสำเร็จ', v_new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
