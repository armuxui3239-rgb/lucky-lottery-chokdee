-- 11_promotions.sql
-- โปรโมชั่น และ ตั้งค่าเว็บไซต์

CREATE TABLE IF NOT EXISTS promotions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    subtitle TEXT,
    description TEXT,
    badge TEXT,
    code TEXT UNIQUE, -- รหัสโปรโมชั่น (เช่น WELCOME50)
    type TEXT NOT NULL CHECK (type IN ('bonus', 'cashback', 'referral', 'deposit', 'free_ticket', 'special')),
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

CREATE TABLE IF NOT EXISTS site_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    type TEXT DEFAULT 'text',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO site_settings (key, value) VALUES
    ('site_name', 'ล็อตลี่ โชคดี'),
    ('site_tagline', 'ซื้อสลากออนไลน์ ง่าย ปลอดภัย ได้เงินจริง'),
    ('site_logo', '🍀'),
    ('primary_color', '#ec131e'),
    ('secondary_color', '#990000'),
    ('hero_title', 'เปิดให้เลือกเลขแล้ว — ไม่มีเลขอั้น'),
    ('hero_subtitle', 'ซื้อสลากออนไลน์ ง่าย ปลอดภัย ได้เงินจริง'),
    ('banner_1_url', '/banner_lottery_horizontal_1.png'),
    ('banner_2_url', '/banner_lottery_horizontal_2.png'),
    ('banner_3_url', '/banner_lottery_horizontal_3.png'),
    ('announcement', '📢 ยินดีต้อนรับสู่ ล็อตลี่ โชคดี!'),
    ('promptpay_id', '0812345678'),
    ('telegram_url', ''),
    ('line_url', 'https://line.me/ti/p/@yourlineid'),
    ('facebook_url', 'https://facebook.com/yourpage'),
    ('tiktok_url', ''),
    ('meta_description', 'ล็อตลี่ โชคดี - ระบบซื้อสลากออนไลน์ พรีเมียม ปลอดภัย จ่ายจริง'),
    ('meta_keywords', 'ล็อตลี่, หวย, โชคดี, สลาก, สลากกินแบ่ง'),
    ('leaderboard_mock_mode', 'false'),
    ('maintenance_mode', 'false'),
    ('contact_phone', '02-xxx-xxxx'),
    ('contact_email', 'support@chokdee.com'),
    ('min_deposit', '100'),
    ('min_withdraw', '100'),
    ('ticket_price', '80'),
    ('affiliate_rate', '5'),
    ('welcome_bonus', '50')
ON CONFLICT (key) DO NOTHING;
