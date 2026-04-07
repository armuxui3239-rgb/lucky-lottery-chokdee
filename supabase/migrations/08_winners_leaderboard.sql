-- 08_winners_leaderboard.sql
-- ผู้ถูกรางวัล และ Leaderboard

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

CREATE INDEX IF NOT EXISTS idx_winners_round ON winners(round_id);
CREATE INDEX IF NOT EXISTS idx_winners_public ON winners(is_public);

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

CREATE INDEX IF NOT EXISTS idx_leaderboard_round ON leaderboard(round_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_rank ON leaderboard(rank);
CREATE INDEX IF NOT EXISTS idx_leaderboard_public ON leaderboard(is_public);
