# 🔐 GitHub Secrets Setup Guide

คู่มือตั้งค่า GitHub Secrets สำหรับ Lucky Lottery CI/CD

## ขั้นตอนที่ 1: สร้าง GitHub Repository

1. ไปที่ https://github.com/new
2. ตั้งชื่อ repository: `lucky-lottery-chokdee`
3. เลือก Public หรือ Private
4. คลิก **Create repository**

## ขั้นตอนที่ 2: Push Code ขึ้น GitHub

```bash
# ใน terminal (ที่โฟลเดอร์โปรเจค)
git init
git add .
git commit -m "Initial commit - Lucky Lottery"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/lucky-lottery-chokdee.git
git push -u origin main
```

## ขั้นตอนที่ 3: ตั้งค่า Secrets

ไปที่ **GitHub Repository** → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

### Secrets ที่ต้องเพิ่ม:

| Secret Name | Value | ได้จากไหน |
|-------------|-------|-----------|
| `VITE_SUPABASE_URL` | `https://qitdcchnszvlvszzdajy.supabase.co` | Supabase Dashboard |
| `VITE_SUPABASE_ANON_KEY` | `sb_publishable_O4f0nj6cxJjvBw4w30AgBw_gfhIsBdH` | Supabase Dashboard |
| `SUPABASE_URL` | `https://qitdcchnszvlvszzdajy.supabase.co` | Supabase Dashboard |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbG...` (service_role) | Supabase Dashboard → Project Settings → API |
| `NETLIFY_AUTH_TOKEN` | `nfp_...` | Netlify Dashboard → User Settings → Applications |
| `NETLIFY_SITE_ID` | `xxxx-xxxx-xxxx` | หลัง deploy ครั้งแรก |

### วิธีหา Supabase Service Role Key:
1. ไปที่ https://supabase.com/dashboard
2. เลือกโปรเจค `ล็อตเตอร์โชคดี`
3. Project Settings → API → Service role secret
4. กด **Reveal** แล้ว copy

### วิธีหา Netlify Token:
1. ไปที่ https://app.netlify.com/user/applications/personal
2. New access token
3. ตั้งชื่อ: `lucky-lottery-deploy`
4. Copy token

## ขั้นตอนที่ 4: Deploy ครั้งแรก

หลังจาก push code และตั้งค่า secrets ครบแล้ว:

1. GitHub Actions จะทำงานอัตโนมัติ
2. ไปที่ **Actions** tab ใน GitHub repository
3. ดูสถานะการ build และ deploy
4. ถือสำเร็จจะได้ URL เช่น `https://lucky-lottery-chokdee.netlify.app`

## ขั้นตอนที่ 5: ทดสอบ Auto Draw (ทดสอบด้วยมือ)

1. ไปที่ **Actions** tab
2. เลือก workflow **"🚀 Lucky Lottery CI/CD"**
3. กด **Run workflow** → ✅ manual_draw
4. ระบบจะรันออกรางวัลทันที (ถ้าวันนี้มีงวดเปิดอยู่)

## 🎯 สรุปการทำงานอัตโนมัติ

| Event | การทำงาน |
|-------|----------|
| Push ขึ้น `main` | Build + Deploy อัตโนมัติ |
| วันที่ 1 และ 16 เวลา 16:00 น. | ออกรางวัลอัตโนมัติ |
| Pull Request | Preview deploy |
| Manual trigger | รันได้ทุกเมื่อ |

## 🔒 ความปลอดภัย

⚠️ **ห้าม push secrets ขึ้น GitHub!** ใช้ GitHub Secrets เท่านั้น

ถ้า push secrets โดยไม่ได้ตั้งใจ:
1. Revoke token นั้นทันที
2. สร้าง token ใหม่
3. อัปเดตใน GitHub Secrets

---

**พร้อมใช้งาน!** 🚀
