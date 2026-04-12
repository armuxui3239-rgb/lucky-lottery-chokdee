# 🚀 Lucky Lottery Chokdee - Deploy Checklist

**วันที่ Deploy:** ___/___/______  
**ผู้ Deploy:** _______________________  
**เวอร์ชั่น:** 1.0.0-PRODUCTION

---

## ✅ PHASE 1: Pre-Deploy (ก่อน Deploy)

### 🔧 1.1 ตรวจสอบเครื่องมือ

- [ ] **Node.js 18+** ติดตั้งแล้ว (`node --version`)
- [ ] **npm** ติดตั้งแล้ว (`npm --version`)
- [ ] **Git** ติดตั้งแล้ว (`git --version`)
- [ ] **Supabase CLI** ติดตั้งแล้ว (`npx supabase --version`)
- [ ] **Vercel CLI** ติดตั้งแล้ว (`vercel --version`)

### 🗄️ 1.2 ตรวจสอบ Supabase Project

- [ ] Project ถูกสร้างแล้ว (ref: `qitdcchnszvlvszzdajy`)
- [ ] รู้ Service Role Key (Project Settings → API)
- [ ] รู้ Anon Key (Project Settings → API)
- [ ] Database Password ถูกเก็บไว้

### 🌐 1.3 ตรวจสอบ Vercel

- [ ] มี Vercel Account แล้ว
- [ ] สร้าง Vercel Token แล้ว (https://vercel.com/account/tokens)
- [ ] รู้ Org ID และ Project ID (ถ้ามี)

### 📁 1.4 ตรวจสอบไฟล์โปรเจค

- [ ] `supabase/migrations/` มี 19 ไฟล์
- [ ] `supabase/functions/settle-lotto/index.ts` มีอยู่
- [ ] `supabase/functions/auto-lotto-draw/index.ts` มีอยู่
- [ ] `src/App.tsx` มีอยู่
- [ ] `.env` หรือ `.env.local` มีค่าที่ถูกต้อง

---

## ✅ PHASE 2: Deploy (ขณะ Deploy)

### 🚀 2.1 รัน MASTER_DEPLOY.bat

- [ ] เปิด PowerShell หรือ Command Prompt (Admin)
- [ ] รัน `MASTER_DEPLOY.bat`
- [ ] รอให้เสร็จทุกขั้นตอน (Steps 1-7)
- [ ] ตรวจสอบว่าไม่มี errors

**Output ที่ควรได้:**
```
✅ ตรวจสอบเครื่องมือครบถ้วน
✅ Dependencies ติดตั้งสำเร็จ
✅ Build สำเร็จ
✅ Supabase Project Linked
✅ Edge Functions Deployed
✅ Git Repository พร้อม
✅ Vercel Setup แล้ว
```

### ⚡ 2.2 Deploy Edge Functions (ถ้ายังไม่ได้)

```bash
npx supabase link --project-ref qitdcchnszvlvszzdajy
npx supabase functions deploy settle-lotto
npx supabase functions deploy auto-lotto-draw
```

- [ ] `settle-lotto` Deployed
- [ ] `auto-lotto-draw` Deployed

---

## ✅ PHASE 3: Database Setup (สำคัญมาก!)

### 🗄️ 3.1 รัน SQL Migrations

ไปที่ https://supabase.com/dashboard → SQL Editor → New Query

รัน **เรียงตามลำดับเลข**:

- [ ] `01_extensions.sql`
- [ ] `02_banks.sql` (ได้ Admin user + ธนาคาร 12 แห่ง)
- [ ] `03_profiles.sql`
- [ ] `04_wallets.sql`
- [ ] `05_transactions.sql`
- [ ] `06_lottery.sql` (ครบทุกรางวัล)
- [ ] `07_kyc_notifications.sql`
- [ ] `08_winners_leaderboard.sql`
- [ ] `09_loyalty.sql`
- [ ] `10_affiliate.sql`
- [ ] `11_promotions.sql` (ได้ Site Settings 25+ ค่า)
- [ ] `12_admin_support.sql`
- [ ] `13_rpc_functions.sql` (16 functions)
- [ ] `14_rls_policies.sql` (30+ policies)
- [ ] `15_banners.sql`
- [ ] `16_storage_buckets.sql`
- [ ] `17_additional_rpc.sql` (10 functions)
- [ ] `18_lucky_wheel.sql` (8 รางวัล)
- [ ] `19_default_data.sql` (งวด + ผู้ถูกรางวัล + โปรโมชั่น)

### 📊 3.2 ตรวจสอบข้อมูล Default

รัน Query:
```sql
-- ตรวจสอบ Admin User
SELECT * FROM profiles WHERE role = 'admin';
-- ควรเห็น: 0812345678, แอดมินระบบ

-- ตรวจสอบธนาคาร
SELECT COUNT(*) FROM banks;
-- ควรได้: 12

-- ตรวจสอบ Site Settings
SELECT COUNT(*) FROM site_settings;
-- ควรได้: 25+

-- ตรวจสอบงวดสลาก
SELECT * FROM lottery_rounds WHERE status = 'open';
-- ควรเห็น: 3 งวด
```

---

## ✅ PHASE 4: Storage Setup

### 📁 4.1 สร้าง Storage Buckets

ไปที่ Supabase Dashboard → Storage → New Bucket

- [ ] **documents** (private) - สำหรับ KYC
- [ ] **transactions** (private) - สำหรับสลิป
- [ ] **banners** (public) - สำหรับแบนเนอร์

### 🔒 4.2 ตั้งค่า Storage Policies

รัน `16_storage_buckets.sql` ใน SQL Editor

---

## ✅ PHASE 5: GitHub Setup

### 📁 5.1 สร้าง Repository

- [ ] ไปที่ https://github.com/new
- [ ] ตั้งชื่อ: `lucky-lottery-chokdee`
- [ ] เลือก Public หรือ Private
- [ ] กด Create repository

### 🚀 5.2 Push Code

```bash
git remote add origin https://github.com/YOUR_USERNAME/lucky-lottery-chokdee.git
git push -u origin main
```

- [ ] Code อยู่บน GitHub แล้ว

### 🔐 5.3 ตั้งค่า GitHub Secrets

ไปที่ GitHub → Repository → Settings → Secrets and variables → Actions → New repository secret

| Secret Name | Value | ได้จากไหน |
|-------------|-------|-----------|
| `VITE_SUPABASE_URL` | `https://qitdcchnszvlvszzdajy.supabase.co` | Supabase Dashboard |
| `VITE_SUPABASE_ANON_KEY` | `sb_publishable_O4f0nj6cxJjvBw4w30AgBw_gfhIsBdH` | Supabase Dashboard → Project Settings → API |
| `SUPABASE_URL` | `https://qitdcchnszvlvszzdajy.supabase.co` | Supabase Dashboard |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbG...` | Supabase Dashboard → Project Settings → API → Service role secret |
| `VERCEL_TOKEN` | `nfp_...` | Vercel Dashboard → Account Settings → Tokens |
| `VERCEL_ORG_ID` | `team_...` | ไฟล์ `.vercel/project.json` หลัง `vercel link` |
| `VERCEL_PROJECT_ID` | `prj_...` | ไฟล์ `.vercel/project.json` |

- [ ] ทุก Secret ถูกเพิ่มแล้ว

---

## ✅ PHASE 6: Vercel Deploy

### 🌐 6.1 Deploy

```bash
vercel --prod
```

หรือ

```bash
.
```

- [ ] Deploy สำเร็จ
- [ ] ได้ Domain (เช่น `https://lucky-lottery-chokdee.vercel.app`)

### ⚙️ 6.2 ตั้งค่า Environment Variables บน Vercel

ไปที่ Vercel Dashboard → Project → Settings → Environment Variables

- [ ] `VITE_SUPABASE_URL`
- [ ] `VITE_SUPABASE_ANON_KEY`

---

## ✅ PHASE 7: Post-Deploy (หลัง Deploy)

### 🧪 7.1 ทดสอบระบบ (Test)

#### หน้า Public:
- [ ] หน้าแรก (`/`) แสดงถูกต้อง
- [ ] หน้า Login (`/login`) ใช้งานได้
- [ ] หน้า Register (`/register`) ใช้งานได้
- [ ] หน้า Results (`/results`) แสดงผลรางวัล
- [ ] หน้า Winners (`/winners`) แสดงผู้ถูกรางวัล

#### หน้า User (ต้อง Login):
- [ ] สมัครสมาชิกใหม่
- [ ] Login ด้วย OTP
- [ ] ซื้อสลาก (กดเลข 6 หลัก)
- [ ] เพิ่มตะกร้า
- [ ] ชำระเงิน (QR + Slip)
- [ ] ดูประวัติการซื้อ
- [ ] ยื่นเอกสาร KYC
- [ ] แจ้งฝากเงิน
- [ ] แจ้งถอนเงิน

#### หน้า Admin (ใช้ 0812345678):
- [ ] Login แอดมิน (`/admin/login`)
- [ ] ภาพรวมระบบ (`/admin`)
- [ ] จัดการสมาชิก (`/admin/users`)
- [ ] อนุมัติ KYC (`/admin/kyc`)
- [ ] อนุมัติฝาก-ถอน (`/admin/finance`)
- [ ] ตั้งค่า CMS (`/admin/settings`)
- [ ] จัดการแบนเนอร์ (`/admin/banners`)
- [ ] ตั้งค่าวงล้อ (`/admin/lucky-wheel`)

### 🎯 7.2 ทดสอบฟีเจอร์สำคัญ

#### Unlimited Supply:
- [ ] กดเลข `123456` → มีสลากขาย
- [ ] กดเลข `000000` → มีสลากขาย
- [ ] กดเลข `999999` → มีสลากขาย

#### Auto Result Check:
- [ ] รองวดออกรางวัล
- [ ] ตรวจสอบว่าระบบดึงผลจากรัฐบาล
- [ ] ตรวจสอบว่าจ่ายเงินรางวัลเข้ากระเป๋า

### 📱 7.3 ทดสอบ Responsive

- [ ] ทดสอบบน Desktop (Chrome, Firefox, Safari)
- [ ] ทดสอบบน Mobile (iOS Safari, Android Chrome)
- [ ] ทดสอบบน Tablet

### 🔒 7.4 ตรวจสอบความปลอดภัย

- [ ] ไม่สามารถเข้า Admin โดยไม่ได้ Login
- [ ] ไม่สามารถดูข้อมูลคนอื่น
- [ ] ไม่สามารถแก้ไขโดยไม่ผ่าน Admin
- [ ] RLS Policies ทำงาน (ตรวจสอบใน Supabase)

---

## ✅ PHASE 8: Go Live (เปิดใช้งานจริง)

### 🎉 8.1 สุดท้าย

- [ ] ทุกอย่างทำงานถูกต้อง
- [ ] ไม่มี Errors ใน Console
- [ ] ไม่มี Errors ใน Supabase Logs
- [ ] ไม่มี Errors ใน Vercel Logs

### 📢 8.2 ประกาศเปิดใช้งาน

- [ ] แจ้งลูกค้าทราบ
- [ ] โพสต์โซเชียลมีเดีย
- [ ] เปิดระบบให้ใช้งานจริง

---

## 📞 การสนับสนุน

### หากพบปัญหา:

1. **ดู Logs:**
   - Vercel: Dashboard → Project → Functions
   - Supabase: Dashboard → Logs → API
   - Browser: F12 → Console

2. **ตรวจสอบ:**
   - GitHub Secrets ถูกต้องหรือไม่
   - Database migrations รันครบหรือไม่
   - Edge Functions Deployed หรือไม่

3. **เอกสารช่วยเหลือ:**
   - `FINAL_VERIFICATION_REPORT.md` - รายงานตรวจสอบ
   - `GITHUB_SECRETS_SETUP.md` - ตั้งค่า Secrets
   - `VERCEL_DEPLOY.md` - คู่มือ Vercel

---

## ✍️ ลายเซ็นผู้ Deploy

** Deploy โดย:** _______________________  
** วันที่:** ___/___/______  
** เวลา:** _______  
** สถานะ:** ✅ เปิดใช้งานจริงแล้ว

---

🎰 **Lucky Lottery Chokdee - พร้อมใช้งาน!**
