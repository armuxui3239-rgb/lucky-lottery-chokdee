-- 06_lottery.sql
-- งวดสลาก ผลรางวัล และตั๋ว

-- งวดสลาก
CREATE TABLE IF NOT EXISTS lottery_rounds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    draw_date DATE NOT NULL,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed', 'settled')),
    price_per_ticket NUMERIC DEFAULT 80,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lottery_rounds_date ON lottery_rounds(draw_date);
CREATE INDEX IF NOT EXISTS idx_lottery_rounds_status ON lottery_rounds(status);

-- ผลรางวัล (ครบทุกรางวัลตามสลากกินแบ่งรัฐบาล)
CREATE TABLE IF NOT EXISTS lottery_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    round_id UUID NOT NULL REFERENCES lottery_rounds(id) ON DELETE CASCADE,
    -- รางวัลที่ 1 และข้างเคียง
    result_6digit TEXT,                    -- รางวัลที่ 1 (6 ล้าน)
    result_6digit_near1 TEXT,              -- ข้างเคียงรางวัลที่ 1 ใบที่ 1 (+1)
    result_6digit_near2 TEXT,              -- ข้างเคียงรางวัลที่ 1 ใบที่ 2 (-1)
    -- รางวัลที่ 2-5 (เก็บเป็น JSON array)
    result_2nd JSONB,                      -- รางวัลที่ 2 (5 ใบ, ใบละ 200,000)
    result_3rd JSONB,                      -- รางวัลที่ 3 (10 ใบ, ใบละ 80,000)
    result_4th JSONB,                      -- รางวัลที่ 4 (50 ใบ, ใบละ 40,000)
    result_5th JSONB,                      -- รางวัลที่ 5 (100 ใบ, ใบละ 20,000)
    -- เลขท้าย/หน้า
    r3top TEXT,                            -- เลขหน้า 3 ตัว (2 รางวัล)
    r3low TEXT,                            -- เลขท้าย 3 ตัว (2 รางวัล)
    r2bot TEXT,                            -- เลขท้าย 2 ตัว (1 รางวัล)
    result_special TEXT,                   -- รางวัลพิเศษ (ถ้ามี)
    result_special2 TEXT,                -- รางวัลพิเศษ 2 (ถ้ามี)
    source_api TEXT DEFAULT 'glo',         -- แหล่งที่มา (glo = สำนักงานสลาก)
    fetched_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(round_id)
);

CREATE INDEX IF NOT EXISTS idx_results_round ON lottery_results(round_id);

-- ตั๋วสลาก
CREATE TABLE IF NOT EXISTS lottery_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_number TEXT NOT NULL,
    round_id UUID NOT NULL REFERENCES lottery_rounds(id),
    user_id UUID REFERENCES profiles(id),
    price NUMERIC NOT NULL DEFAULT 80,
    status TEXT DEFAULT 'pending' CHECK (status IN (
        'available', 'pending', 'win', 'lose', 'paid'
    )),
    prize_type TEXT,
    prize_amount NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    settled_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_tickets_user ON lottery_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_round ON lottery_tickets(round_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON lottery_tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_number ON lottery_tickets(ticket_number);
