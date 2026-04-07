-- 10_affiliate.sql
-- ระบบแนะนำเพื่อน

CREATE TABLE IF NOT EXISTS affiliate_commissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    referrer_id UUID NOT NULL REFERENCES profiles(id),
    referee_id UUID NOT NULL REFERENCES profiles(id),
    amount NUMERIC NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_affiliate_referrer ON affiliate_commissions(referrer_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_referee ON affiliate_commissions(referee_id);
