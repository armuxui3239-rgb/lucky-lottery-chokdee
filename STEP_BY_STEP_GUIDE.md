# 📖 Lucky Lottery Chokdee - คู่มือ Deploy ฉบับสมบูรณ์

## 🎯 ภาพรวม: 3 ขั้นตอนสั้นๆ เปิดใช้งานจริง!

```
┌─────────────────────────────────────────────────────┐
│  STEP 1: รัน MASTER_DEPLOY.bat                      │
│  STEP 2: รัน SQL Migrations ใน Supabase              │
│  STEP 3: Deploy บน Vercel                           │
└─────────────────────────────────────────────────────┘
```

---

## ⚡ STEP 1: รัน MASTER_DEPLOY.bat (อัตโนมัติ)

### 1.1 เปิด Terminal

```powershell
# ไปที่โฟลเดอร์โปรเจค
cd "C:\Users\arm\Downloads\ล็อตลี่ โชคดี"

# รัน Script
.\MASTER_DEPLOY.bat
```

### 1.2 ผลลัพธ์ที่จะได้

Script จะทำให้อัตโนมัติ:
- ✅ ตรวจสอบ Node.js, npm, Git, Supabase CLI, Vercel CLI
- ✅ ติดตั้ง Dependencies (`npm ci`)
- ✅ Build Test (`npm run build`)
- ✅ Link Supabase Project
- ✅ Deploy Edge Functions (2 functions)
- ✅ Initialize Git Repository
- ✅ Setup Vercel

**เวลาที่ใช้:** ~5-10 นาที

---

## 🗄️ STEP 2: รัน SQL Migrations (สำคัญมาก!)

### 2.1 เข้า Supabase Dashboard

1. ไปที่: https://supabase.com/dashboard
2. Login เข้าบัญชี
3. เลือกโปรเจค `ล็อตเตอร์โชคดี`
4. ไปที่ **SQL Editor** → **New Query**

### 2.2 รันไฟล์ตามลำดับ

**สำคัญ! ต้องรันเรียงตามเลข 01-19**

วิธีที่ 1: รันทีละไฟล์ (แนะนำ)
```
1. เปิดไฟล์ supabase/migrations/01_extensions.sql
2. Copy ทั้งหมด
3. Paste ใน SQL Editor
4. กด Run
5. ทำซ้ำกับไฟล์ 02, 03, 04... ถึง 19
```

วิธีที่ 2: รันทั้งหมดครั้งเดียว
```bash
# ใน terminal ที่ root โปรเจค
npx supabase db push
```

### 2.3 ตรวจสอบว่าสำเร็จ

รัน Query นี้ตรวจสอบ:
```sql
-- ตรวจสอบ Admin User
SELECT phone, full_name, role FROM profiles WHERE role = 'admin';
-- ผลลัพธ์: 0812345678 | แอดมินระบบ | admin

-- ตรวจสอบธนาคาร
SELECT code, name_th FROM banks LIMIT 5;
-- ผลลัพธ์: SCB | ไทยพาณิชย์

-- ตรวจสอบงวดสลาก
SELECT name, draw_date, status FROM lottery_rounds;
-- ผลลัพธ์: งวดที่ 1 เมษายน 2568 | 2026-04-01 | open
```

---

## 🌐 STEP 3: Deploy บน Vercel

### 3.1 Login Vercel

```bash
# ใน terminal
vercel login
# กด Enter → เปิด browser → ยืนยัน login
```

### 3.2 Deploy

```bash
# Deploy production
vercel --prod
```

หรือใช้ script:
```bash
.\deploy-vercel.bat
```

### 3.3 ตั้งค่า Environment Variables

ไปที่ Vercel Dashboard → Project → Settings → Environment Variables

เพิ่ม 2 ตัวแปร:
- `VITE_SUPABASE_URL` = `https://qitdcchnszvlvszzdajy.supabase.co`
- `VITE_SUPABASE_ANON_KEY` = `sb_publishable_O4f0nj6cxJjvBw4w30AgBw_gfhIsBdH`

### 3.4 ผลลัพธ์

จะได้ URL:
```
🎉 https://lucky-lottery-chokdee.vercel.app
```

---

## 🔧 ขั้นตอนเพิ่มเติม (สำคัญ)

### A. สร้าง GitHub Repository

```bash
# 1. สร้าง repo บน GitHub (https://github.com/new)
#    ตั้งชื่อ: lucky-lottery-chokdee

# 2. Push ขึ้น GitHub
git remote add origin https://github.com/YOUR_USERNAME/lucky-lottery-chokdee.git
git push -u origin main
```

### B. ตั้งค่า GitHub Secrets

ไปที่ GitHub → Settings → Secrets and variables → Actions

เพิ่ม Secrets 7 รายการ:
```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
```

ดูรายละเอียดใน: `GITHUB_SECRETS_SETUP.md`

### C. สร้าง Storage Buckets

ไปที่ Supabase Dashboard → Storage → New bucket

สร้าง 3 buckets:
1. `documents` (private) - สำหรับ KYC
2. `transactions` (private) - สำหรับสลิป
3. `banners` (public) - สำหรับแบนเนอร์

---

## 🎉 เปิดใช้งานแล้ว!

### ทดสอบระบบ:

```
🌐 เปิด: https://lucky-lottery-chokdee.vercel.app

👤 ทดสอบ User:
   - สมัครสมาชิกใหม่
   - ซื้อสลาก
   - แจ้งฝาก-ถอน

👨‍💼 ทดสอบ Admin:
   - เข้า /admin/login
   - เบอร์: 0812345678
   - จัดการระบบ
```

---

## ❓ แก้ไขปัญหาที่พบบ่อย

### Q: Build ไม่ผ่าน?
```bash
# ลองลบ node_modules แล้วติดตั้งใหม่
rm -rf node_modules
npm ci
npm run build
```

### Q: Supabase ไม่ Link?
```bash
npx supabase login
npx supabase link --project-ref qitdcchnszvlvszzdajy
```

### Q: Edge Function Deploy ไม่ได้?
```bash
# เช็คว่า project link แล้ว
npx supabase status

# Deploy ใหม่
npx supabase functions deploy settle-lotto
npx supabase functions deploy auto-lotto-draw
```

### Q: Database ไม่มีข้อมูล?
```sql
-- รัน migrations ใหม่
-- ไปที่ SQL Editor → รันไฟล์ 19_default_data.sql
```

---

## 📞 ต้องการความช่วยเหลือ?

- 📄 `FINAL_VERIFICATION_REPORT.md` - รายงานตรวจสอบ
- 📄 `DEPLOY_CHECKLIST.md` - Checklist ครบถ้วน
- 📄 `GITHUB_SECRETS_SETUP.md` - ตั้งค่า Secrets

---

**Deploy เสร็จแล้ว! 🎰 เปิดให้บริการ Lucky Lottery Chokdee ได้เลย!**
