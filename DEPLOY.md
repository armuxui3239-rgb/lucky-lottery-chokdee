# 🚀 คู่มือการ Deploy ล็อตลี่ โชคดี

## สิ่งที่ต้องมีก่อน Deploy

1. **Supabase Account** (https://supabase.com)
2. **Vercel Account** (https://vercel.com) หรือโฮสติ้งอื่น
3. **Node.js 22+** สำหรับ build

---

## 📋 Step 1: ตั้งค่า Supabase

### 1.1 สร้างโปรเจคใหม่
- ไปที่ https://supabase.com
- สร้างโปรเจคใหม่ ชื่อ "lucky-lottery"
- เลือก Region: Singapore (หรือใกล้คุณที่สุด)
- รอให้สร้างเสร็จ (ประมาณ 2-3 นาที)

### 1.2 รัน SQL Schema
- ไปที่ SQL Editor ใน Supabase Dashboard
- เปิดไฟล์ `supabase/schema.sql`
- Copy ทั้งหมดแล้ววางใน SQL Editor
- กด **Run** เพื่อสร้างตารางทั้งหมด

### 1.3 สร้าง Edge Function
```bash
# ติดตั้ง Supabase CLI (ถ้ายังไม่มี)
npm install -g supabase

# Login
supabase login

# Link กับโปรเจค
supabase link --project-ref your-project-ref

# Deploy Edge Function
supabase functions deploy settle-lotto
```

หรือ deploy ผ่าน Dashboard:
- ไปที่ Functions > New Function
- ชื่อ: `settle-lotto`
- วางโค้ดจาก `supabase/functions/settle-lotto/index.ts`

### 1.4 ตั้งค่า Authentication
- ไปที่ Authentication > Providers
- เปิดใช้งาน **Phone** (สำหรับ OTP)
- เปิดใช้งาน **Email** (ถ้าต้องการ)

### 1.5 ตั้งค่า Storage
- ไปที่ Storage > New Bucket
- สร้าง bucket ชื่อ `transactions` (สำหรับสลิป)
- สร้าง bucket ชื่อ `kyc` (สำหรับเอกสาร KYC)
- ตั้งค่า Policy ให้อนุญาตให้ authenticated users อัปโหลดได้

### 1.6 ดึง API Keys
- ไปที่ Project Settings > API
- คัดลอก:
  - `Project URL` → VITE_SUPABASE_URL
  - `anon public` → VITE_SUPABASE_ANON_KEY
  - `service_role` → SUPABASE_SERVICE_ROLE_KEY (เก็บไว้ลับ)

---

## 🌐 Step 2: Deploy Frontend

### 2.1 บน Vercel (แนะนำ)

1. Push code ขึ้น GitHub
2. ไปที่ https://vercel.com
3. Import Project > เลือก repository
4. ตั้งค่า Environment Variables:
   ```
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
5. Deploy!

### 2.2 Build เอง
```bash
npm install
npm run build
# ไฟล์จะอยู่ใน folder `dist`
# Upload ขึ้นโฮสติ้งของคุณ
```

---

## ⚙️ Step 3: ตั้งค่า Admin Account

### 3.1 สร้างผู้ใช้แรก
```sql
-- รันคำสั่งนี้ใน SQL Editor ของ Supabase
-- แทนที่ user_id ด้วย UUID ที่ได้จากการสมัคร

UPDATE profiles 
SET role = 'admin' 
WHERE id = 'your-user-uuid-here';
```

หรือทำผ่าน Dashboard:
- สมัครสมาชิกผ่านหน้าเว็บก่อน
- ไปที่ Table Editor > profiles
- หา user ของคุณ แล้วเปลี่ยน role เป็น `admin`

---

## 🔧 Step 4: ตั้งค่าเริ่มต้น

### 4.1 ตั้งค่าธนาคาร
- เข้า Admin Panel > จัดการธนาคาร
- เพิ่มบัญชีธนาคารที่รับเงินฝาก

### 4.2 สร้างงวดแรก
- เข้า Admin Panel > จัดการสลาก
- สร้างงวดใหม่ กำหนดวันออกรางวัล

### 4.3 ตั้งค่า Site Settings
- เข้า Admin Panel > ตั้งค่า
- ปรับแต่งชื่อเว็บไซต์, ติดต่อ, โบนัสต้อนรับ

---

## 🧪 Step 5: ทดสอบระบบ

### 5.1 ทดสอบการซื้อ
1. สมัครสมาชิกใหม่
2. ยืนยัน OTP
3. ทำ KYC (อัปโหลดบัตรปชช.)
4. รอ Admin อนุมัติ KYC
5. ฝากเงิน (อัปโหลดสลิป)
6. รอ Admin อนุมัติ
7. ซื้อสลาก

### 5.2 ทดสอบการออกรางวัล (วันจริง)
1. รอถึงวันออกรางวัล
2. เข้า Admin Panel > จัดการสลาก
3. กด "ดึงผลรางวัล & จ่ายเงินออโต้"
4. ระบบจะดึงผลจาก GLO แล้วจ่ายเงินให้ผู้ถูกรางวัลอัตโนมัติ

---

## 🔒 Security Checklist

- [ ] เปลี่ยน JWT Secret เป็นแบบสุ่ม
- [ ] ตั้งค่า RLS Policies บนทุกตาราง
- [ ] ปิด service_role key ไม่ให้ expose บน frontend
- [ ] เปิดใช้งาน Row Level Security
- [ ] ตั้งค่า CORS ให้ถูกต้อง

---

## 🆘 แก้ไขปัญหาที่พบบ่อย

### ปัญหา: ซื้อสลากไม่ได้ (ยอดเงินไม่พอ)
**แก้ไข:** ตรวจสอบว่า wallet มี balance จริง และ KYC ผ่านแล้ว

### ปัญหา: API ดึงผลรางวัลไม่ได้
**แก้ไข:** 
- ตรวจสอบว่าวันที่ถูกต้อง (รูปแบบ: DDMMYYYY+543)
- ตรวจสอบว่ามีผลรางวัลออกแล้วจริง (16:00 น. ของวันที่ 1 และ 16)
- เช็ค Logs ใน Supabase Functions

### ปัญหา: Edge Function ไม่ทำงาน
**แก้ไข:**
```bash
# Redeploy
supabase functions deploy settle-lotto

# ดู Logs
supabase functions logs settle-lotto --tail
```

---

## 📞 การสนับสนุน

หากมีปัญหา:
1. ตรวจสอบ Logs ใน Supabase Dashboard
2. ดู Network requests ใน Browser DevTools
3. ตรวจสอบว่า Environment Variables ตั้งค่าถูกต้อง

---

**โชคดีกับการเปิดใช้งาน!** 🎉
