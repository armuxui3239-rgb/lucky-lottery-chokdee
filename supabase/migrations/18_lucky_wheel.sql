-- 18_lucky_wheel.sql
-- ตารางสำหรับวงล้อเสี่ยงโชค (Lucky Wheel)

CREATE TABLE IF NOT EXISTS lucky_wheel_prizes (
    id SERIAL PRIMARY KEY,
    label TEXT NOT NULL,
    prize_value INTEGER NOT NULL DEFAULT 0,
    win_probability NUMERIC(4,3) NOT NULL DEFAULT 0.25,
    image_url TEXT,
    color TEXT DEFAULT '#ec131e',
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ข้อมูลเริ่มต้น 8 รางวัล
INSERT INTO lucky_wheel_prizes (id, label, prize_value, win_probability, color, sort_order) VALUES
    (1, 'เครดิต 0 บาท', 0, 0.40, '#64748b', 1),
    (2, 'เครดิต 50 บาท', 50, 0.30, '#22c55e', 2),
    (3, 'เครดิต 0 บาท', 0, 0.15, '#64748b', 3),
    (4, 'เครดิต 100 บาท', 100, 0.10, '#3b82f6', 4),
    (5, 'เครดิต 0 บาท', 0, 0.03, '#64748b', 5),
    (6, 'เครดิต 50 บาท', 50, 0.01, '#22c55e', 6),
    (7, 'เครดิต 0 บาท', 0, 0.005, '#64748b', 7),
    (8, 'เครดิต 1,000 บาท', 1000, 0.005, '#f59e0b', 8)
ON CONFLICT (id) DO NOTHING;

-- Index
CREATE INDEX IF NOT EXISTS idx_lucky_wheel_active ON lucky_wheel_prizes(is_active);

-- Trigger อัปเดต updated_at
CREATE OR REPLACE FUNCTION update_lucky_wheel_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_lucky_wheel_updated_at ON lucky_wheel_prizes;

CREATE TRIGGER update_lucky_wheel_updated_at
    BEFORE UPDATE ON lucky_wheel_prizes
    FOR EACH ROW
    EXECUTE FUNCTION update_lucky_wheel_updated_at();

-- RLS Policies
ALTER TABLE lucky_wheel_prizes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read lucky_wheel_prizes"
    ON lucky_wheel_prizes
    FOR SELECT
    TO public
    USING (is_active = true);

CREATE POLICY "Allow admin all lucky_wheel_prizes"
    ON lucky_wheel_prizes
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );
