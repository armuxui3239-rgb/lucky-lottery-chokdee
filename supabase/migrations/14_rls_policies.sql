-- 14_rls_policies.sql
-- นโยบายความปลอดภัย

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE lottery_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE lottery_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE winners ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Users view own profile" ON profiles FOR SELECT USING (auth.uid() = id OR auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Wallets
CREATE POLICY "Users view own wallet" ON wallets FOR SELECT USING (auth.uid() = user_id OR auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- Transactions
CREATE POLICY "Users view own transactions" ON transactions FOR SELECT USING (auth.uid() = user_id OR auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));
CREATE POLICY "Users insert own transactions" ON transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Lottery Tickets
CREATE POLICY "Users view own tickets" ON lottery_tickets FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL OR auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- Notifications
CREATE POLICY "Users view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL OR auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));
CREATE POLICY "Users update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- KYC Documents
CREATE POLICY "Users view own kyc" ON kyc_documents FOR SELECT USING (auth.uid() = user_id OR auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));
CREATE POLICY "Users insert own kyc" ON kyc_documents FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admin full access
CREATE POLICY "Admin full access on lottery_results" ON lottery_results FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));
CREATE POLICY "Public view winners" ON winners FOR SELECT USING (is_public = true);
CREATE POLICY "Admin full access on winners" ON winners FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));
CREATE POLICY "Public view active promotions" ON promotions FOR SELECT USING (is_active = true);
CREATE POLICY "Admin full access on promotions" ON promotions FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));
CREATE POLICY "Public view active rewards" ON loyalty_rewards FOR SELECT USING (is_active = true);
CREATE POLICY "Admin full access on rewards" ON loyalty_rewards FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));
CREATE POLICY "Public view site_settings" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Admin full access on site_settings" ON site_settings FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));
CREATE POLICY "Admin full access on admin_logs" ON admin_activity_logs FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));
CREATE POLICY "Public view active banners" ON banners FOR SELECT USING (is_active = true AND (end_date IS NULL OR end_date > NOW()));
CREATE POLICY "Admin full access on banners" ON banners FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));
CREATE POLICY "Public view leaderboard" ON leaderboard FOR SELECT USING (is_public = true);
CREATE POLICY "Admin full access on leaderboard" ON leaderboard FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));
CREATE POLICY "Users view own tickets" ON support_tickets FOR SELECT USING (auth.uid() = user_id OR auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));
CREATE POLICY "Users create tickets" ON support_tickets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin update tickets" ON support_tickets FOR UPDATE USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));
