-- 16_storage_buckets.sql
-- Storage Buckets และ Policies (รันใน Supabase Dashboard SQL Editor)

-- สร้าง Buckets (ถ้ายังไม่มี)
INSERT INTO storage.buckets (id, name, public) VALUES 
    ('documents', 'documents', false),
    ('transactions', 'transactions', false),
    ('banners', 'banners', true)
ON CONFLICT (id) DO NOTHING;

-- Policies สำหรับ documents bucket
CREATE POLICY "Users upload own documents" ON storage.objects 
    FOR INSERT TO authenticated 
    WITH CHECK (bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users view own documents" ON storage.objects 
    FOR SELECT TO authenticated 
    USING (bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Admin view all documents" ON storage.objects 
    FOR SELECT TO authenticated 
    USING (bucket_id = 'documents' AND auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- Policies สำหรับ transactions bucket
CREATE POLICY "Users upload transaction proofs" ON storage.objects 
    FOR INSERT TO authenticated 
    WITH CHECK (bucket_id = 'transactions' AND name LIKE auth.uid()::text || '-%');

CREATE POLICY "Admin view transaction proofs" ON storage.objects 
    FOR SELECT TO authenticated 
    USING (bucket_id = 'transactions' AND auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- Policies สำหรับ banners bucket (public)
CREATE POLICY "Public view banners" ON storage.objects 
    FOR SELECT TO anon, authenticated 
    USING (bucket_id = 'banners');

CREATE POLICY "Admin manage banners" ON storage.objects 
    FOR ALL TO authenticated 
    USING (bucket_id = 'banners' AND auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));
