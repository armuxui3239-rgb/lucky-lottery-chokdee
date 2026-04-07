-- 19_default_data.sql
-- ค่าเริ่มต้นเพิ่มเติมสำหรับระบบ

-- ========================================
-- 1. งวดสลากเริ่มต้น (งวดถัดไป)
-- ========================================
INSERT INTO lottery_rounds (name, draw_date, status, price_per_ticket) VALUES
    ('งวดที่ 1 เมษายน 2568', '2026-04-01', 'open', 80),
    ('งวดที่ 16 เมษายน 2568', '2026-04-16', 'open', 80),
    ('งวดที่ 1 พฤษภาคม 2568', '2026-05-01', 'open', 80)
ON CONFLICT DO NOTHING;

-- ========================================
-- 2. ผู้ถูกรางวัลตัวอย่าง (Winners)
-- ========================================
INSERT INTO winners (display_name, prize_type, amount, ticket_number, is_public) VALUES
    ('สมชาย ใจดี', 'รางวัลที่ 1', 6000000, '123456', true),
    ('มานี รักเรียน', 'เลขท้าย 3 ตัว', 4000, '789', true),
    ('สมหญิง สดใส', 'เลขท้าย 2 ตัว', 2000, '12', true),
    ('อานนท์ โชคดี', 'เลขหน้า 3 ตัว', 4000, '456', true),
    ('ปารมี มั่งมี', 'รางวัลข้างเคียง', 100000, '123455', true),
    ('วีระชัย ก้าวหน้า', 'เลขท้าย 3 ตัว', 4000, '012', true)
ON CONFLICT DO NOTHING;

-- ========================================
-- 3. ของรางวัล Loyalty (แต้มสะสม)
-- ========================================
INSERT INTO loyalty_rewards (name, description, points_required, reward_type, reward_value, stock, is_active, sort_order) VALUES
    ('เครดิต 50 บาท', 'แลกเครดิตใช้ซื้อสลาก', 500, 'credit', 50, 100, true, 1),
    ('เครดิต 100 บาท', 'แลกเครดิตใช้ซื้อสลาก', 900, 'credit', 100, 50, true, 2),
    ('เครดิต 500 บาท', 'แลกเครดิตใช้ซื้อสลาก', 4000, 'credit', 500, 20, true, 3),
    ('สลากฟรี 1 ใบ', 'รับสลากฟรี 1 ใบในงวดถัดไป', 800, 'free_ticket', 80, 200, true, 4),
    ('เครดิต 1000 บาท', 'แลกเครดิตจำนวนมาก', 7500, 'credit', 1000, 10, true, 5),
    ('VIP Status', 'สถานะ VIP 30 วัน', 5000, 'premium', 0, 30, true, 6),
    ('ส่วนลด 10%', 'ส่วนลดซื้อสลาก 10%', 300, 'voucher', 10, 500, true, 7),
    ('ส่วนลด 20%', 'ส่วนลดซื้อสลาก 20%', 500, 'voucher', 20, 300, true, 8)
ON CONFLICT DO NOTHING;

-- ========================================
-- 4. โปรโมชั่นเริ่มต้น
-- ========================================
INSERT INTO promotions (title, subtitle, code, description, type, discount_type, discount_value, minimum_deposit, is_active, start_date, end_date) VALUES
    ('ยินดีต้อนรับ', 'สมาชิกใหม่รับโบนัส', 'WELCOME50', 'สมัครสมาชิกใหม่รับเครดิตฟรี 50 บาท', 'bonus', 'fixed', 50, 0, true, NOW(), NOW() + INTERVAL '30 days'),
    ('ฝากครั้งแรก', 'ฝากเงินครั้งแรกรับโบนัส', 'FIRST100', 'ฝากเงินครั้งแรกรับเพิ่ม 100%', 'deposit', 'percent', 100, 100, true, NOW(), NOW() + INTERVAL '7 days'),
    ('แนะนำเพื่อน', 'ชวนเพื่อนมาเล่น', 'REFER10', 'แนะนำเพื่อนรับ 10% จากยอดฝากเพื่อน', 'referral', 'percent', 10, 0, true, NOW(), NULL),
    ('วันเกิด', 'ของขวัญวันเกิด', 'BIRTHDAY', 'รับเครดิตฟรี 200 บาทในวันเกิด', 'bonus', 'fixed', 200, 0, true, NOW(), NULL),
    ('คืนยอดเสีย', 'คืนยอดเสีย 5% ทุกสัปดาห์', 'CASHBACK5', 'รับเงินคืน 5% จากยอดซื้อสลาก', 'cashback', 'percent', 5, 0, true, NOW(), NULL)
ON CONFLICT DO NOTHING;

-- ========================================
-- 5. ข้อมูลธนาคารของแอดมิน
-- ========================================
INSERT INTO profiles (id, bank_code, bank_account, bank_account_name)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'SCB',
    '1234567890',
    'บริษัท ล็อตลี่ โชคดี จำกัด'
)
ON CONFLICT (id) DO UPDATE SET
    bank_code = EXCLUDED.bank_code,
    bank_account = EXCLUDED.bank_account,
    bank_account_name = EXCLUDED.bank_account_name;

-- ========================================
-- 6. ประวัติกิจกรรมแอดมินเริ่มต้น
-- ========================================
INSERT INTO admin_activity_logs (action, details, user_id) VALUES
    ('SYSTEM_INIT', 'ระบบเริ่มต้นทำงานครั้งแรก', '00000000-0000-0000-0000-000000000001'),
    ('DEFAULT_DATA_LOADED', 'โหลดข้อมูลเริ่มต้นเสร็จสิ้น', '00000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;

-- ========================================
-- 7. แจ้งเตือนระบบเริ่มต้น
-- ========================================
INSERT INTO notifications (title, body, type, is_read) VALUES
    ('ยินดีต้อนรับสู่ ล็อตลี่ โชคดี!', 'เริ่มต้นใช้งานระบบสลากออนไลน์', 'system', false),
    ('อย่าลืมยืนยันตัวตน KYC', 'ยืนยันตัวตนเพื่อถอนเงินได้', 'info', false),
    ('โปรโมชั่นพิเศษ', 'ใช้โค้ด WELCOME50 รับเครดิตฟรี', 'promo', false)
ON CONFLICT DO NOTHING;
