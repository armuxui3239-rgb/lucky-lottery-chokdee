-- =====================================================
-- ล็อตลี่ โชคดี - Complete Database Schema
-- สำหรับ Supabase PostgreSQL
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- TABLE: banks (ธนาคารสำหรับระบบฝาก-ถอน)
-- =====================================================
CREATE TABLE IF NOT EXISTS banks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL, -- e.g., 'SCB', 'KBANK'
    name_th TEXT NOT NULL,
    name_en TEXT,
    logo_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default Thai banks
INSERT INTO banks (code, name_th, name_en) VALUES
    ('SCB', 'ไทยพาณิชย์', 'Siam Commercial Bank'),
    ('KBANK', 'กสิกรไทย', 'Kasikorn Bank'),
    ('BBL', 'กรุงเทพ', 'Bangkok Bank'),
    ('KTB', 'กรุงไทย', 'Krung Thai Bank'),
    ('TMB', 'ทหารไทย', 'TMB Bank'),
    ('BAAC', 'ธ.ก.ส.', 'Bank for Agriculture'),
    ('GSB', 'ออมสิน', 'Government Savings Bank'),
    ('CIMB', 'ซีไอเอ็มบี', 'CIMB Thai'),
    ('UOB', 'ยูโอบี', 'UOB Thailand'),
    ('LHFG', 'แลนด์ แอนด์ เฮาส์', 'Land and Houses Bank'),
    ('ICBC', 'ไอซีบีซี', 'ICBC Thailand'),
    ('TCRB', 'ไทยเครดิต', 'Thai Credit Retail Bank')
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- TABLE: profiles (ข้อมูลผู้ใช้)
-- =====================================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    phone TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'banned')),
    
    -- Bank info
    bank_code TEXT REFERENCES banks(code),
    bank_account TEXT,
    
    -- KYC
    kyc_status TEXT DEFAULT 'unverified' CHECK (kyc_status IN ('unverified', 'pending', 'verified', 'rejected')),
    
    -- Referral
    referral_code TEXT UNIQUE,
    referred_by UUID REFERENCES profiles(id),
    
    -- Loyalty
    loyalty_tier TEXT DEFAULT 'bronze' CHECK (loyalty_tier IN ('bronze', 'silver', 'gold', 'platinum', 'diamond')),
    total_spent NUMERIC DEFAULT 0,
    
    -- Security
    is_otp_verified BOOLEAN DEFAULT false,
    password TEXT, -- security PIN/password for withdrawals
    
    -- Profile
    avatar_url TEXT, -- URL รูปโปรไฟล์
    
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for profiles
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone);
CREATE INDEX IF NOT EXISTS idx_profiles_referral ON profiles(referral_code);
CREATE INDEX IF NOT EXISTS idx_profiles_kyc ON profiles(kyc_status);

-- Trigger to auto-generate referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.referral_code IS NULL THEN
        NEW.referral_code := UPPER(SUBSTRING(MD5(NEW.id::TEXT || NOW()::TEXT), 1, 8));
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_referral
    BEFORE INSERT ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION generate_referral_code();

-- =====================================================
-- TABLE: wallets (กระเป๋าเงิน)
-- =====================================================
CREATE TABLE IF NOT EXISTS wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    balance NUMERIC DEFAULT 0 CHECK (balance >= 0),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_wallets_user ON wallets(user_id);

-- Trigger: Auto-create wallet on profile insert
CREATE OR REPLACE FUNCTION create_wallet_on_profile()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO wallets (user_id, balance) VALUES (NEW.id, 0);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_wallet
    AFTER INSERT ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION create_wallet_on_profile();

-- =====================================================
-- TABLE: transactions (ธุรกรรมทั้งหมด)
-- =====================================================
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    type TEXT NOT NULL CHECK (type IN (
        'deposit', 'withdraw', 'purchase', 'bonus', 'win', 'refund', 'affiliate', 'loyalty'
    )),
    amount NUMERIC NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN (
        'pending', 'completed', 'approved', 'rejected', 'failed'
    )),
    
    -- Details
    details TEXT,
    proof_url TEXT, -- for deposit slip
    admin_remark TEXT,
    
    -- For tracking
    approved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES profiles(id),
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created ON transactions(created_at DESC);

-- =====================================================
-- TABLE: lottery_rounds (งวดสลาก)
-- =====================================================
CREATE TABLE IF NOT EXISTS lottery_rounds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL, -- e.g., "งวดประจำวันที่ 1 เม.ย. 2568"
    draw_date DATE NOT NULL,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed', 'settled')),
    price_per_ticket NUMERIC DEFAULT 80,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_lottery_rounds_date ON lottery_rounds(draw_date);
CREATE INDEX IF NOT EXISTS idx_lottery_rounds_status ON lottery_rounds(status);

-- =====================================================
-- TABLE: lottery_results (ผลรางวัล)
-- =====================================================
CREATE TABLE IF NOT EXISTS lottery_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    round_id UUID NOT NULL REFERENCES lottery_rounds(id) ON DELETE CASCADE,
    
    -- Official results
    result_6digit TEXT, -- e.g., "123456"
    r3top TEXT, -- เลขหน้า 3 ตัว comma-separated: "123,456"
    r3low TEXT, -- เลขท้าย 3 ตัว comma-separated: "789,012"
    r2bot TEXT, -- เลขท้าย 2 ตัว: "45"
    
    -- Special prizes
    result_special TEXT,
    result_special2 TEXT,
    
    -- Source
    source_api TEXT DEFAULT 'glo', -- สำนักงานสลากกินแบ่งรัฐบาล
    fetched_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(round_id)
);

-- Indexes for lottery_results
CREATE INDEX IF NOT EXISTS idx_results_round ON lottery_results(round_id);

-- =====================================================
-- TABLE: lottery_tickets (สลากที่ผู้ใช้ซื้อ)
-- =====================================================
CREATE TABLE IF NOT EXISTS lottery_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_number TEXT NOT NULL, -- 6 digits: "000000" - "999999"
    round_id UUID NOT NULL REFERENCES lottery_rounds(id),
    user_id UUID REFERENCES profiles(id), -- NULL if not purchased yet (unlimited supply model)
    price NUMERIC NOT NULL DEFAULT 80,
    
    -- Status
    status TEXT DEFAULT 'pending' CHECK (status IN (
        'available', 'pending', 'win', 'lose', 'paid'
    )),
    
    -- Win details
    prize_type TEXT, -- e.g., 'first', 'front3', 'back3', 'last2'
    prize_amount NUMERIC DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    settled_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tickets_user ON lottery_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_round ON lottery_tickets(round_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON lottery_tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_number ON lottery_tickets(ticket_number);

-- =====================================================
-- TABLE: kyc_documents (เอกสารยืนยันตัวตน)
-- =====================================================
CREATE TABLE IF NOT EXISTS kyc_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    id_card_number TEXT NOT NULL,
    id_card_front_url TEXT NOT NULL,
    id_card_back_url TEXT NOT NULL,
    selfie_url TEXT NOT NULL,
    
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    rejection_reason TEXT,
    
    reviewed_by UUID REFERENCES profiles(id),
    reviewed_at TIMESTAMPTZ,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- =====================================================
-- TABLE: winners (ผู้ถูกรางวัลที่แสดงสาธารณะ)
-- =====================================================
CREATE TABLE IF NOT EXISTS winners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    display_name TEXT NOT NULL,
    prize_type TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    ticket_number TEXT,
    round_id UUID REFERENCES lottery_rounds(id),
    draw_date DATE,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for winners
CREATE INDEX IF NOT EXISTS idx_winners_round ON winners(round_id);
CREATE INDEX IF NOT EXISTS idx_winners_public ON winners(is_public);

-- =====================================================
-- TABLE: promotions (โปรโมชั่น)
-- =====================================================
CREATE TABLE IF NOT EXISTS promotions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    subtitle TEXT,
    description TEXT,
    badge TEXT,
    promo_code TEXT UNIQUE,
    
    type TEXT NOT NULL CHECK (type IN ('bonus', 'cashback', 'referral', 'deposit', 'free_ticket')),
    discount_type TEXT CHECK (discount_type IN ('fixed', 'percent')),
    discount_value NUMERIC DEFAULT 0,
    max_discount NUMERIC,
    
    minimum_deposit NUMERIC DEFAULT 0,
    max_redemptions INTEGER,
    redemptions_count INTEGER DEFAULT 0,
    
    is_active BOOLEAN DEFAULT true,
    start_date TIMESTAMPTZ DEFAULT NOW(),
    end_date TIMESTAMPTZ,
    
    image_url TEXT,
    bg_gradient TEXT DEFAULT 'from-red-500 to-rose-600',
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABLE: notifications (แจ้งเตือน)
-- =====================================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE, -- NULL = broadcast
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    type TEXT DEFAULT 'info' CHECK (type IN ('info', 'win', 'deposit', 'withdraw', 'promo', 'system')),
    is_read BOOLEAN DEFAULT false,
    action_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);

-- =====================================================
-- TABLE: affiliate_commissions (ค่าแนะนำ)
-- =====================================================
CREATE TABLE IF NOT EXISTS affiliate_commissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    referrer_id UUID NOT NULL REFERENCES profiles(id),
    referee_id UUID NOT NULL REFERENCES profiles(id),
    amount NUMERIC NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for affiliate_commissions
CREATE INDEX IF NOT EXISTS idx_affiliate_referrer ON affiliate_commissions(referrer_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_referee ON affiliate_commissions(referee_id);

-- =====================================================
-- TABLE: loyalty_points (แต้มสะสม)
-- =====================================================
CREATE TABLE IF NOT EXISTS loyalty_points (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    points_balance INTEGER DEFAULT 0,
    lifetime_points INTEGER DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- =====================================================
-- TABLE: loyalty_rewards (ของรางวัลแต้ม)
-- =====================================================
CREATE TABLE IF NOT EXISTS loyalty_rewards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    points_required INTEGER NOT NULL,
    reward_type TEXT CHECK (reward_type IN ('credit', 'voucher', 'premium', 'free_ticket')),
    reward_value NUMERIC DEFAULT 0,
    image_url TEXT,
    stock INTEGER DEFAULT -1, -- -1 = unlimited
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for loyalty_rewards
CREATE INDEX IF NOT EXISTS idx_loyalty_rewards_active ON loyalty_rewards(is_active);

-- =====================================================
-- TABLE: loyalty_redemptions (การแลกแต้ม)
-- =====================================================
CREATE TABLE IF NOT EXISTS loyalty_redemptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id),
    reward_id UUID NOT NULL REFERENCES loyalty_rewards(id),
    points_used INTEGER NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABLE: site_settings (ตั้งค่าเว็บไซต์)
-- =====================================================
CREATE TABLE IF NOT EXISTS site_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    type TEXT DEFAULT 'text',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Default settings
INSERT INTO site_settings (key, value) VALUES
    ('site_name', 'ล็อตลี่ โชคดี'),
    ('site_tagline', 'ซื้อสลากออนไลน์ ง่าย ปลอดภัย ได้เงินจริง'),
    ('contact_phone', '02-xxx-xxxx'),
    ('contact_email', 'support@chokdee.com'),
    ('min_deposit', '100'),
    ('min_withdraw', '100'),
    ('ticket_price', '80'),
    ('affiliate_rate', '5'), -- 5%
    ('welcome_bonus', '50') -- 50 credits
ON CONFLICT (key) DO NOTHING;

-- =====================================================
-- TABLE: admin_activity_logs (บันทึกกิจกรรมแอดมิน)
-- =====================================================
CREATE TABLE IF NOT EXISTS admin_activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID REFERENCES profiles(id),
    action TEXT NOT NULL,
    details TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_admin_logs_created ON admin_activity_logs(created_at DESC);

-- =====================================================
-- TABLE: banners (แบนเนอร์โฆษณา)
-- =====================================================
CREATE TABLE IF NOT EXISTS banners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    subtitle TEXT,
    image_url TEXT NOT NULL,
    link_url TEXT,
    position TEXT DEFAULT 'home_top' CHECK (position IN ('home_top', 'home_middle', 'promo_page', 'login_page')),
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    start_date TIMESTAMPTZ DEFAULT NOW(),
    end_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_banners_active ON banners(is_active);
CREATE INDEX IF NOT EXISTS idx_banners_position ON banners(position);

-- Default banners
INSERT INTO banners (title, subtitle, image_url, position, sort_order) VALUES
    ('ยินดีต้อนรับ', 'ซื้อสลากออนไลน์ง่ายๆ', 'https://placehold.co/1200x400/red/white?text=Lucky+Lottery', 'home_top', 1),
    ('โปรโมชั่นพิเศษ', 'รับโบนัส 50 บาท', 'https://placehold.co/1200x400/blue/white?text=Welcome+Bonus', 'home_middle', 2)
ON CONFLICT DO NOTHING;

-- =====================================================
-- TABLE: leaderboard (อันดับผู้โชคดี - Cache)
-- =====================================================
CREATE TABLE IF NOT EXISTS leaderboard (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    round_id UUID REFERENCES lottery_rounds(id),
    user_id UUID NOT NULL REFERENCES profiles(id),
    display_name TEXT NOT NULL,
    prize_amount NUMERIC NOT NULL,
    prize_type TEXT,
    ticket_number TEXT,
    rank INTEGER,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(round_id, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_leaderboard_round ON leaderboard(round_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_rank ON leaderboard(rank);
CREATE INDEX IF NOT EXISTS idx_leaderboard_public ON leaderboard(is_public);

-- =====================================================
-- TABLE: support_tickets (ระบบช่วยเหลือลูกค้า)
-- =====================================================
CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id),
    ticket_number TEXT UNIQUE NOT NULL, -- e.g., 'TKT-2024-0001'
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    category TEXT DEFAULT 'general' CHECK (category IN ('general', 'deposit', 'withdraw', 'lottery', 'account', 'technical')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'waiting_user', 'resolved', 'closed')),
    
    -- Admin response
    admin_response TEXT,
    responded_by UUID REFERENCES profiles(id),
    responded_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_support_user ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_priority ON support_tickets(priority);
CREATE INDEX IF NOT EXISTS idx_support_created ON support_tickets(created_at DESC);

-- Trigger to generate ticket number
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TRIGGER AS $$
DECLARE
    year TEXT;
    count INTEGER;
    new_number TEXT;
BEGIN
    year := TO_CHAR(NOW(), 'YYYY');
    SELECT COUNT(*) INTO count FROM support_tickets WHERE ticket_number LIKE 'TKT-' || year || '-%';
    new_number := 'TKT-' || year || '-' || LPAD((count + 1)::TEXT, 4, '0');
    NEW.ticket_number := new_number;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_ticket_number
    BEFORE INSERT ON support_tickets
    FOR EACH ROW
    WHEN (NEW.ticket_number IS NULL)
    EXECUTE FUNCTION generate_ticket_number();

-- =====================================================
-- RPC FUNCTIONS
-- =====================================================

-- Function: Get admin stats
CREATE OR REPLACE FUNCTION get_admin_stats()
RETURNS TABLE (
    total_sales NUMERIC,
    new_members BIGINT,
    total_users BIGINT,
    tickets_sold BIGINT,
    net_profit NUMERIC,
    pending_withdrawals BIGINT,
    pending_kyc BIGINT,
    open_round_id UUID,
    open_round_date DATE,
    open_round_name TEXT,
    open_round_prize NUMERIC,
    total_deposit NUMERIC,
    total_withdraw NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COALESCE((SELECT SUM(amount) FROM transactions WHERE type = 'purchase' AND status = 'completed'), 0) as total_sales,
        (SELECT COUNT(*) FROM profiles WHERE created_at >= NOW() - INTERVAL '30 days') as new_members,
        (SELECT COUNT(*) FROM profiles) as total_users,
        (SELECT COUNT(*) FROM lottery_tickets WHERE user_id IS NOT NULL) as tickets_sold,
        COALESCE((SELECT SUM(amount) FROM transactions WHERE type = 'purchase' AND status = 'completed'), 0) - 
        COALESCE((SELECT SUM(amount) FROM transactions WHERE type = 'win' AND status = 'completed'), 0) as net_profit,
        (SELECT COUNT(*) FROM transactions WHERE type = 'withdraw' AND status = 'pending') as pending_withdrawals,
        (SELECT COUNT(*) FROM kyc_documents WHERE status = 'pending') as pending_kyc,
        (SELECT id FROM lottery_rounds WHERE status = 'open' LIMIT 1) as open_round_id,
        (SELECT draw_date FROM lottery_rounds WHERE status = 'open' LIMIT 1) as open_round_date,
        (SELECT name FROM lottery_rounds WHERE status = 'open' LIMIT 1) as open_round_name,
        COALESCE((SELECT SUM(prize_amount) FROM lottery_tickets WHERE status = 'win'), 0) as open_round_prize,
        COALESCE((SELECT SUM(amount) FROM transactions WHERE type = 'deposit' AND status = 'approved'), 0) as total_deposit,
        COALESCE((SELECT SUM(amount) FROM transactions WHERE type = 'withdraw' AND status = 'approved'), 0) as total_withdraw;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Purchase lottery tickets
CREATE OR REPLACE FUNCTION purchase_lottery_tickets(
    p_user_id UUID,
    p_ticket_numbers TEXT[],
    p_round_id UUID,
    p_total_price NUMERIC
)
RETURNS TABLE (success BOOLEAN, message TEXT, transaction_id UUID, tickets_purchased INTEGER) AS $$
DECLARE
    v_wallet_balance NUMERIC;
    v_tx_id UUID;
    v_ticket_count INTEGER := 0;
    v_number TEXT;
    v_round_price NUMERIC;
BEGIN
    -- Check wallet balance
    SELECT balance INTO v_wallet_balance FROM wallets WHERE user_id = p_user_id;
    
    IF v_wallet_balance < p_total_price THEN
        RETURN QUERY SELECT false, 'ยอดเงินในกระเป๋าไม่เพียงพน', NULL::UUID, 0;
        RETURN;
    END IF;
    
    -- Check round is open
    SELECT price_per_ticket INTO v_round_price FROM lottery_rounds 
    WHERE id = p_round_id AND status = 'open';
    
    IF v_round_price IS NULL THEN
        RETURN QUERY SELECT false, 'งวดนี้ปิดรับซื้อแล้ว', NULL::UUID, 0;
        RETURN;
    END IF;
    
    -- Create transaction record
    INSERT INTO transactions (user_id, type, amount, status, details)
    VALUES (p_user_id, 'purchase', p_total_price, 'completed', 'ซื้อสลาก ' || array_length(p_ticket_numbers, 1) || ' ใบ')
    RETURNING id INTO v_tx_id;
    
    -- Deduct wallet
    UPDATE wallets SET balance = balance - p_total_price WHERE user_id = p_user_id;
    
    -- Create/Update tickets
    FOREACH v_number IN ARRAY p_ticket_numbers
    LOOP
        INSERT INTO lottery_tickets (ticket_number, round_id, user_id, price, status)
        VALUES (LPAD(v_number, 6, '0'), p_round_id, p_user_id, v_round_price, 'pending');
        v_ticket_count := v_ticket_count + 1;
    END LOOP;
    
    -- Update user total spent
    UPDATE profiles SET total_spent = total_spent + p_total_price WHERE id = p_user_id;
    
    -- Add loyalty points (1 point per 10 baht)
    INSERT INTO loyalty_points (user_id, points_balance, lifetime_points)
    VALUES (p_user_id, FLOOR(p_total_price / 10), FLOOR(p_total_price / 10))
    ON CONFLICT (user_id) 
    DO UPDATE SET 
        points_balance = loyalty_points.points_balance + FLOOR(p_total_price / 10),
        lifetime_points = loyalty_points.lifetime_points + FLOOR(p_total_price / 10),
        updated_at = NOW();
    
    RETURN QUERY SELECT true, 'ซื้อสลากสำเร็จ!', v_tx_id, v_ticket_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Approve deposit
CREATE OR REPLACE FUNCTION approve_deposit(
    p_transaction_id UUID,
    p_admin_id UUID,
    p_action TEXT -- 'approve' or 'reject'
)
RETURNS TABLE (success BOOLEAN, message TEXT, new_balance NUMERIC) AS $$
DECLARE
    v_tx RECORD;
    v_user_id UUID;
BEGIN
    SELECT * INTO v_tx FROM transactions WHERE id = p_transaction_id AND type = 'deposit';
    
    IF v_tx IS NULL THEN
        RETURN QUERY SELECT false, 'ไม่พบรายการ', 0::NUMERIC;
        RETURN;
    END IF;
    
    IF p_action = 'approve' THEN
        UPDATE transactions 
        SET status = 'approved', approved_at = NOW(), approved_by = p_admin_id
        WHERE id = p_transaction_id;
        
        UPDATE wallets SET balance = balance + v_tx.amount WHERE user_id = v_tx.user_id;
        
        -- Send notification
        INSERT INTO notifications (user_id, title, body, type)
        VALUES (v_tx.user_id, 'ฝากเงินสำเร็จ', 'เงิน ' || v_tx.amount || ' บาทเข้ากระเป๋าแล้ว', 'deposit');
        
        RETURN QUERY SELECT true, 'อนุมัติสำเร็จ', (SELECT balance FROM wallets WHERE user_id = v_tx.user_id);
    ELSE
        UPDATE transactions 
        SET status = 'rejected', approved_at = NOW(), approved_by = p_admin_id
        WHERE id = p_transaction_id;
        
        RETURN QUERY SELECT true, 'ปฏิเสธสำเร็จ', 0::NUMERIC;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Approve withdrawal
CREATE OR REPLACE FUNCTION approve_withdrawal(
    p_transaction_id UUID,
    p_admin_id UUID,
    p_action TEXT
)
RETURNS TABLE (success BOOLEAN, message TEXT) AS $$
DECLARE
    v_tx RECORD;
BEGIN
    SELECT * INTO v_tx FROM transactions WHERE id = p_transaction_id AND type = 'withdraw';
    
    IF v_tx IS NULL THEN
        RETURN QUERY SELECT false, 'ไม่พบรายการ'::TEXT;
        RETURN;
    END IF;
    
    IF p_action = 'approve' THEN
        UPDATE transactions 
        SET status = 'approved', approved_at = NOW(), approved_by = p_admin_id
        WHERE id = p_transaction_id;
        
        INSERT INTO notifications (user_id, title, body, type)
        VALUES (v_tx.user_id, 'ถอนเงินสำเร็จ', 'เงิน ' || v_tx.amount || ' บาทถูกโอนแล้ว', 'withdraw');
        
        RETURN QUERY SELECT true, 'อนุมัติการถอนสำเร็จ'::TEXT;
    ELSE
        -- Refund to wallet
        UPDATE transactions 
        SET status = 'rejected', approved_at = NOW(), approved_by = p_admin_id
        WHERE id = p_transaction_id;
        
        UPDATE wallets SET balance = balance + v_tx.amount WHERE user_id = v_tx.user_id;
        
        INSERT INTO transactions (user_id, type, amount, status, details)
        VALUES (v_tx.user_id, 'refund', v_tx.amount, 'completed', 'คืนเงินจากการถอนที่ถูกปฏิเสธ');
        
        RETURN QUERY SELECT true, 'ปฏิเสธแล้ว (เงินคืนกระเป๋า)'::TEXT;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Settle lottery round (Auto payout)
CREATE OR REPLACE FUNCTION settle_lottery_round(
    p_round_id UUID,
    p_result_6digit TEXT,
    p_r3top TEXT,
    p_r3low TEXT,
    p_r2bot TEXT
)
RETURNS TABLE (success BOOLEAN, message TEXT, winners_count INTEGER, total_payout NUMERIC) AS $$
DECLARE
    v_ticket RECORD;
    v_winner_count INTEGER := 0;
    v_total_payout NUMERIC := 0;
    v_prize_amount NUMERIC;
    v_prize_type TEXT;
    v_f3_arr TEXT[];
    v_b3_arr TEXT[];
BEGIN
    -- Save results
    INSERT INTO lottery_results (round_id, result_6digit, r3top, r3low, r2bot)
    VALUES (p_round_id, p_result_6digit, p_r3top, p_r3low, p_r2bot);
    
    -- Parse 3-digit arrays
    v_f3_arr := string_to_array(p_r3top, ',');
    v_b3_arr := string_to_array(p_r3low, ',');
    
    -- Process all pending tickets
    FOR v_ticket IN 
        SELECT * FROM lottery_tickets 
        WHERE round_id = p_round_id AND status = 'pending' AND user_id IS NOT NULL
    LOOP
        v_prize_amount := 0;
        v_prize_type := '';
        
        -- Check 6-digit (First prize)
        IF v_ticket.ticket_number = p_result_6digit THEN
            v_prize_amount := 6000000;
            v_prize_type := 'first';
        END IF;
        
        -- Check front 3
        IF v_ticket.ticket_number[:3] = ANY(v_f3_arr) THEN
            v_prize_amount := v_prize_amount + 4000;
            v_prize_type := v_prize_type || CASE WHEN v_prize_type != '' THEN '+front3' ELSE 'front3' END;
        END IF;
        
        -- Check back 3
        IF v_ticket.ticket_number[4:] = ANY(v_b3_arr) THEN
            v_prize_amount := v_prize_amount + 4000;
            v_prize_type := v_prize_type || CASE WHEN v_prize_type != '' THEN '+back3' ELSE 'back3' END;
        END IF;
        
        -- Check back 2
        IF v_ticket.ticket_number[5:] = p_r2bot THEN
            v_prize_amount := v_prize_amount + 2000;
            v_prize_type := v_prize_type || CASE WHEN v_prize_type != '' THEN '+last2' ELSE 'last2' END;
        END IF;
        
        -- Update ticket and payout
        IF v_prize_amount > 0 THEN
            UPDATE lottery_tickets 
            SET status = 'paid', prize_type = v_prize_type, prize_amount = v_prize_amount, settled_at = NOW()
            WHERE id = v_ticket.id;
            
            -- Add to wallet
            UPDATE wallets SET balance = balance + v_prize_amount WHERE user_id = v_ticket.user_id;
            
            -- Create transaction record
            INSERT INTO transactions (user_id, type, amount, status, details)
            VALUES (v_ticket.user_id, 'win', v_prize_amount, 'completed', 
                    'ถูกรางวัล ' || v_prize_type || ' เลข ' || v_ticket.ticket_number);
            
            -- Notify winner
            INSERT INTO notifications (user_id, title, body, type)
            VALUES (v_ticket.user_id, '🎉 ถูกรางวัล!', 
                    'คุณถูกรางวัล ' || v_prize_type || ' มูลค่า ' || v_prize_amount || ' บาท', 'win');
            
            v_winner_count := v_winner_count + 1;
            v_total_payout := v_total_payout + v_prize_amount;
        ELSE
            UPDATE lottery_tickets SET status = 'lose' WHERE id = v_ticket.id;
        END IF;
    END LOOP;
    
    -- Close round
    UPDATE lottery_rounds SET status = 'settled' WHERE id = p_round_id;
    
    RETURN QUERY SELECT true, 'ประมวลผลรางวัลสำเร็จ', v_winner_count, v_total_payout;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Admin adjust wallet
CREATE OR REPLACE FUNCTION admin_adjust_wallet(
    p_user_id UUID,
    p_amount NUMERIC,
    p_type TEXT, -- 'add' or 'deduct'
    p_reason TEXT
)
RETURNS TABLE (success BOOLEAN, message TEXT, new_balance NUMERIC) AS $$
DECLARE
    v_current_balance NUMERIC;
    v_new_balance NUMERIC;
BEGIN
    SELECT balance INTO v_current_balance FROM wallets WHERE user_id = p_user_id;
    
    IF p_type = 'add' THEN
        UPDATE wallets SET balance = balance + p_amount WHERE user_id = p_user_id;
        INSERT INTO transactions (user_id, type, amount, status, details)
        VALUES (p_user_id, 'bonus', p_amount, 'completed', p_reason);
        v_new_balance := v_current_balance + p_amount;
    ELSE
        IF v_current_balance < p_amount THEN
            RETURN QUERY SELECT false, 'ยอดเงินไม่พอสำหรับการหัก', v_current_balance;
            RETURN;
        END IF;
        UPDATE wallets SET balance = balance - p_amount WHERE user_id = p_user_id;
        INSERT INTO transactions (user_id, type, amount, status, details)
        VALUES (p_user_id, 'refund', p_amount, 'completed', p_reason);
        v_new_balance := v_current_balance - p_amount;
    END IF;
    
    RETURN QUERY SELECT true, 'ปรับยอดสำเร็จ', v_new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get popular numbers
CREATE OR REPLACE FUNCTION get_popular_numbers(p_round_id UUID, p_limit INTEGER)
RETURNS TABLE (ticket_number TEXT, purchase_count BIGINT) AS $$
BEGIN
    RETURN QUERY
    SELECT lt.ticket_number, COUNT(*)::BIGINT as purchase_count
    FROM lottery_tickets lt
    WHERE lt.round_id = p_round_id AND lt.user_id IS NOT NULL
    GROUP BY lt.ticket_number
    ORDER BY purchase_count DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function: Grant welcome bonus
CREATE OR REPLACE FUNCTION grant_welcome_bonus(p_user_id UUID)
RETURNS TABLE (success BOOLEAN, message TEXT) AS $$
DECLARE
    v_bonus NUMERIC;
    v_claimed BOOLEAN;
BEGIN
    SELECT (value::NUMERIC) INTO v_bonus FROM site_settings WHERE key = 'welcome_bonus';
    
    -- Check if already claimed
    SELECT EXISTS(
        SELECT 1 FROM transactions 
        WHERE user_id = p_user_id AND type = 'bonus' AND details LIKE '%welcome%'
    ) INTO v_claimed;
    
    IF v_claimed THEN
        RETURN QUERY SELECT false, 'รับโบนัสไปแล้ว'::TEXT;
        RETURN;
    END IF;
    
    UPDATE wallets SET balance = balance + v_bonus WHERE user_id = p_user_id;
    
    INSERT INTO transactions (user_id, type, amount, status, details)
    VALUES (p_user_id, 'bonus', v_bonus, 'completed', 'Welcome bonus');
    
    RETURN QUERY SELECT true, 'รับโบนัส ' || v_bonus || ' บาทสำเร็จ'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE lottery_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_redemptions ENABLE ROW LEVEL SECURITY;

-- Policies: profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id OR auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Policies: wallets
CREATE POLICY "Users can view own wallet" ON wallets FOR SELECT USING (auth.uid() = user_id OR auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- Policies: transactions
CREATE POLICY "Users can view own transactions" ON transactions FOR SELECT USING (auth.uid() = user_id OR auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));
CREATE POLICY "Users can insert own transactions" ON transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policies: lottery_tickets
CREATE POLICY "Users can view own tickets" ON lottery_tickets FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL OR auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- Policies: notifications
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL OR auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- Policies: kyc_documents
CREATE POLICY "Users can view own kyc" ON kyc_documents FOR SELECT USING (auth.uid() = user_id OR auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));
CREATE POLICY "Users can insert own kyc" ON kyc_documents FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Enable RLS on remaining tables
ALTER TABLE lottery_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE winners ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Additional RLS Policies for remaining tables
CREATE POLICY "Admin full access on lottery_results" ON lottery_results FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));
CREATE POLICY "Public can view winners" ON winners FOR SELECT USING (is_public = true);
CREATE POLICY "Admin full access on winners" ON winners FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));
CREATE POLICY "Public can view active promotions" ON promotions FOR SELECT USING (is_active = true);
CREATE POLICY "Admin full access on promotions" ON promotions FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));
CREATE POLICY "Public can view active rewards" ON loyalty_rewards FOR SELECT USING (is_active = true);
CREATE POLICY "Admin full access on rewards" ON loyalty_rewards FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));
CREATE POLICY "Public can view site_settings" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Admin full access on site_settings" ON site_settings FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- Enable RLS on new tables
ALTER TABLE admin_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for new tables
CREATE POLICY "Admin full access on admin_activity_logs" ON admin_activity_logs FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));
CREATE POLICY "Public can view active banners" ON banners FOR SELECT USING (is_active = true AND (end_date IS NULL OR end_date > NOW()));
CREATE POLICY "Admin full access on banners" ON banners FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));
CREATE POLICY "Public can view leaderboard" ON leaderboard FOR SELECT USING (is_public = true);
CREATE POLICY "Admin full access on leaderboard" ON leaderboard FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));
CREATE POLICY "Users can view own tickets" ON support_tickets FOR SELECT USING (auth.uid() = user_id OR auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));
CREATE POLICY "Users can create tickets" ON support_tickets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin can update tickets" ON support_tickets FOR UPDATE USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- =====================================================
-- END OF SCHEMA
-- =====================================================
