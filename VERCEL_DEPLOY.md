# 🚀 Vercel Deployment Guide

คู่มือ Deploy "ล็อตลี่ โชคดี" บน Vercel พร้อมแยกลิงก์ Admin และ User

---

## 📋 สรุปลิงก์หลัง Deploy

| ส่วน | URL ตัวอย่าง | รายละเอียด |
|------|--------------|------------|
| **🎯 หน้าหลัก (User)** | `https://lucky-lottery.vercel.app` | หน้าซื้อสลาก ผู้ใช้ทั่วไป |
| **👨‍💼 แอดมิน (Admin)** | `https://lucky-lottery.vercel.app/admin` | หน้าแอดมิน Dashboard |
| **🔐 Admin Login** | `https://lucky-lottery.vercel.app/admin/login` | เข้าสู่ระบบแอดมิน |

---

## 🎯 วิธีที่ 1: Deploy รวมบน Vercel (แนะนำ)

แอดมินและผู้ใช้อยู่บนโปรเจคเดียวกัน แยกกันที่ path

### ขั้นตอนที่ 1: สร้างโปรเจคบน Vercel

```bash
# 1. ติดตั้ง Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. ที่ root โปรเจค รัน
vercel

# 4. ตั้งค่าโปรเจค
? Set up "~/Downloads/ล็อตลี่ โชคดี"? [Y/n] y
? Which scope do you want to deploy to? [Your Username]
? Link to existing project? [n]
? What's your project name? [lucky-lottery]
? Which directory is your code located? [./]
```

### ขั้นตอนที่ 2: ตั้งค่า Environment Variables

ไปที่ **Vercel Dashboard** → เลือกโปรเจค → **Settings** → **Environment Variables**

| Variable | Value | Environment |
|----------|-------|-------------|
| `VITE_SUPABASE_URL` | `https://qitdcchnszvlvszzdajy.supabase.co` | Production, Preview |
| `VITE_SUPABASE_ANON_KEY` | `sb_publishable_O4f0nj6cxJjvBw4w30AgBw_gfhIsBdH` | Production, Preview |

หรือรันคำสั่ง:
```bash
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
```

### ขั้นตอนที่ 3: Deploy

```bash
vercel --prod
```

---

## 🎯 วิธีที่ 2: Deploy แยก 2 โปรเจค (Advanced)

แยกโปรเจค User และ Admin ออกจากกัน (ต้องแก้โค้ดเพิ่ม)

### โครงสร้างที่ต้องแก้ไข:

```
src/
├── user/          # หน้าผู้ใช้ทั้งหมด
├── admin/         # หน้าแอดมินทั้งหมด
├── shared/        # โค้ดที่ใช้ร่วมกัน
└── ...
```

### ลิงก์หลัง Deploy:

| ส่วน | URL | โปรเจค Vercel |
|------|-----|---------------|
| User | `https://lucky-lottery-user.vercel.app` | lucky-lottery-user |
| Admin | `https://lucky-lottery-admin.vercel.app` | lucky-lottery-admin |

---

## 🔗 GitHub Integration (Auto Deploy)

### ขั้นตอนที่ 1: Push ขึ้น GitHub

```bash
git init
git add .
git commit -m "Ready for Vercel deploy"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/lucky-lottery.git
git push -u origin main
```

### ขั้นตอนที่ 2: Import บน Vercel

1. ไปที่ https://vercel.com/new
2. เลือก **Import Git Repository**
3. เลือก repository `lucky-lottery`
4. คลิก **Import**

### ขั้นตอนที่ 3: ตั้งค่า Build

| Setting | Value |
|---------|-------|
| Framework Preset | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm ci` |

### ขั้นตอนที่ 4: ใส่ Environment Variables

ใส่ตามตารางด้านบน

### ขั้นตอนที่ 5: Deploy

คลิก **Deploy**

---

## 🔐 การเข้าถึงหน้าแอดมิน

### URL สำหรับเข้าแอดมิน:

```
https://your-domain.vercel.app/admin
```

ตัวอย่าง:
```
https://lucky-lottery.vercel.app/admin
```

### การ Redirect อัตโนมัติ:

ระบบจะ redirect ไป `/admin/login` ถ้ายังไม่ได้ login

ดูที่ไฟล์ `src/App.tsx`:
```tsx
<Route path="/admin" element={<AdminDashboard />} />
<Route path="/admin/:tab" element={<AdminDashboard />} />
<Route path="/admin/login" element={<AdminLogin />} />
```

---

## ⚙️ GitHub Actions for Vercel (Auto Deploy)

### ตั้งค่า GitHub Secrets:

ไปที่ **GitHub** → **Settings** → **Secrets and variables** → **Actions**

| Secret | ได้จากไหน |
|--------|------------|
| `VERCEL_TOKEN` | Vercel Dashboard → Settings → Tokens |
| `VERCEL_ORG_ID` | ไฟล์ `.vercel/project.json` หลัง `vercel link` |
| `VERCEL_PROJECT_ID` | ไฟล์ `.vercel/project.json` |

### วิธีหา Secrets:

```bash
# 1. Link โปรเจค
vercel link

# 2. ดูค่าในไฟล์
cat .vercel/project.json
```

จะได้:
```json
{
  "orgId": "your_org_id",
  "projectId": "your_project_id"
}
```

---

## 🌐 Custom Domain (ถ้าต้องการ)

### ตั้งค่า Custom Domain บน Vercel:

1. ไปที่ **Vercel Dashboard** → โปรเจค → **Settings** → **Domains**
2. ใส่โดเมนที่ต้องการ เช่น `lucky-lottery.com`
3. ทำตามขั้นตอน configure DNS

### แยก Subdomain สำหรับ Admin:

| Subdomain | ชี้ไปที่ |
|-----------|----------|
| `lucky-lottery.com` | หน้าหลัก (User) |
| `admin.lucky-lottery.com` | หน้าแอดมิน |

วิธีตั้งค่า:
1. ที่ Vercel Dashboard → **Domains** → **Edit**
2. เพิ่ม `admin.lucky-lottery.com`
3. แก้ `vercel.json` เพิ่ม redirect:

```json
{
  "redirects": [
    {
      "source": "/admin/(.*)",
      "has": [{ "type": "host", "value": "admin.lucky-lottery.com" }],
      "destination": "/$1"
    }
  ]
}
```

---

## 📝 สรุปคำสั่งที่ใช้บ่อย

```bash
# Deploy ทันที
vercel --prod

# Deploy preview (ไม่ใช่ production)
vercel

# ดู logs
vercel logs

# รัน dev server
vercel dev
```

---

## 🎉 สถานะหลัง Deploy

| ส่วน | URL | สถานะ |
|------|-----|--------|
| หน้าหลัก | `https://[your-domain].vercel.app/` | ✅ พร้อมใช้ |
| ซื้อสลาก | `https://[your-domain].vercel.app/buy` | ✅ พร้อมใช้ |
| แอดมิน | `https://[your-domain].vercel.app/admin` | ✅ พร้อมใช้ |
| API/Functions | `https://[project].supabase.co` | ✅ พร้อมใช้ |

---

## ⚠️ หมายเหตุสำคัญ

1. **Security**: หน้า `/admin` มีการป้องกันด้วย ProtectedRoute ต้อง login ด้วย role = 'admin'
2. **Cache**: หน้า admin จะไม่ cache (no-cache header)
3. **Assets**: ไฟล์ static จะ cache 1 ปี
4. **Edge Functions**: ยังคงใช้ Supabase Edge Functions (ไม่เปลี่ยน)

---

# 🚀 พร้อม Deploy แล้ว!

1. ติดตั้ง Vercel CLI: `npm i -g vercel`
2. Login: `vercel login`
3. Deploy: `vercel --prod`
4. เข้าใช้งาน: `https://your-domain.vercel.app`
