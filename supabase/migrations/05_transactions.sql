-- 05_transactions.sql
-- ธุรกรรมทั้งหมด

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
    details TEXT,
    proof_url TEXT,
    admin_remark TEXT,
    approved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created ON transactions(created_at DESC);
