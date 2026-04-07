-- 02_banks.sql
-- ตารางธนาคารและข้อมูลเริ่มต้น

CREATE TABLE IF NOT EXISTS banks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    name_th TEXT NOT NULL,
    name_en TEXT,
    logo_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default Thai banks (12 แห่ง)
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

-- Default admin user (ถ้าไม่มี)
INSERT INTO auth.users (id, email, phone, raw_user_meta_data)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'admin@chokdee.com',
    '0812345678',
    '{"role":"admin","full_name":"แอดมินระบบ"}'
)
ON CONFLICT (id) DO NOTHING;

-- Admin profile
INSERT INTO profiles (id, phone, full_name, role, is_otp_verified)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    '0812345678',
    'แอดมินระบบ',
    'admin',
    true
)
ON CONFLICT (id) DO NOTHING;

-- Admin wallet
INSERT INTO wallets (user_id, balance)
VALUES ('00000000-0000-0000-0000-000000000001', 999999)
ON CONFLICT (user_id) DO NOTHING;
