# Supabase Storage Buckets Setup
# คู่มือสร้าง Storage Buckets สำหรับระบบ

## Buckets ที่ต้องสร้าง:

### 1. documents (สำหรับ KYC)
- **ใช้ใน:** KYC.tsx
- **โฟลเดอร์:** 
  - `{user_id}/id_card_{timestamp}.jpg`
  - `{user_id}/selfie_{timestamp}.jpg`
- **การตั้งค่า:**
  - Public: false (เฉพาะ admin เห็น)
  - Allowed MIME types: image/jpeg, image/png
  - Max file size: 5MB

### 2. transactions (สำหรับสลิปฝากเงิน)
- **ใช้ใน:** WalletPage.tsx
- **โฟลเดอร์:**
  - `{user_id}-{timestamp}.{ext}`
- **การตั้งค่า:**
  - Public: false (เฉพาะ admin เห็น)
  - Allowed MIME types: image/jpeg, image/png
  - Max file size: 5MB

### 3. banners (สำหรับแบนเนอร์)
- **ใช้ใน:** Home.tsx, Promotions.tsx
- **โฟลเดอร์:**
  - `banner-{id}.jpg`
- **การตั้งค่า:**
  - Public: true (ทุกคนเห็น)
  - Allowed MIME types: image/jpeg, image/png, image/webp
  - Max file size: 2MB

## SQL สร้าง Buckets:

```sql
-- สร้าง buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('documents', 'documents', false),
  ('transactions', 'transactions', false),
  ('banners', 'banners', true);

-- ตั้งค่า policies สำหรับ documents
CREATE POLICY "Users can upload own documents" ON storage.objects 
  FOR INSERT TO authenticated 
  WITH CHECK (bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can view own documents" ON storage.objects 
  FOR SELECT TO authenticated 
  USING (bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Admin can view all documents" ON storage.objects 
  FOR SELECT TO authenticated 
  USING (bucket_id = 'documents' AND auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- ตั้งค่า policies สำหรับ transactions
CREATE POLICY "Users can upload transaction proofs" ON storage.objects 
  FOR INSERT TO authenticated 
  WITH CHECK (bucket_id = 'transactions' AND name LIKE auth.uid()::text || '-%');

CREATE POLICY "Admin can view transaction proofs" ON storage.objects 
  FOR SELECT TO authenticated 
  USING (bucket_id = 'transactions' AND auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- ตั้งค่า policies สำหรับ banners (public)
CREATE POLICY "Public can view banners" ON storage.objects 
  FOR SELECT TO anon, authenticated 
  USING (bucket_id = 'banners');

CREATE POLICY "Admin can manage banners" ON storage.objects 
  FOR ALL TO authenticated 
  USING (bucket_id = 'banners' AND auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));
```

## วิธีสร้างใน Supabase Dashboard:

1. ไปที่ https://supabase.com/dashboard
2. เลือกโปรเจค
3. ไปที่ Storage > Buckets
4. กด "New bucket"
5. ตั้งชื่อตามด้านบน
6. ตั้งค่า Public/Private
7. กด Create

## ตรวจสอบว่าสร้างสำเร็จ:

```sql
SELECT * FROM storage.buckets;
```
