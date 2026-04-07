-- 15_banners.sql
-- แบนเนอร์โฆษณา

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

CREATE INDEX IF NOT EXISTS idx_banners_active ON banners(is_active);
CREATE INDEX IF NOT EXISTS idx_banners_position ON banners(position);

INSERT INTO banners (title, subtitle, image_url, position, sort_order) VALUES
    ('ยินดีต้อนรับ', 'ซื้อสลากออนไลน์ง่ายๆ', 'https://placehold.co/1200x400/red/white?text=Lucky+Lottery', 'home_top', 1),
    ('โปรโมชั่นพิเศษ', 'รับโบนัส 50 บาท', 'https://placehold.co/1200x400/blue/white?text=Welcome+Bonus', 'home_middle', 2)
ON CONFLICT DO NOTHING;
