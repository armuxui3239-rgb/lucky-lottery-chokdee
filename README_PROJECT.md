# 🎰 ล็อตลี่ โชคดี - Lucky Lottery Online

ระบบซื้อสลากกินแบ่งรัฐบาลออนไลน์ครบวงจร อิงผลจากสำนักงานสลากกินแบ่งรัฐบาล (GLO) 100%

## ✨ จุดเด่นของระบบ

- 🎯 **ไม่จำกัดเลข** - ซื้อเลขไหนก็ได้ ไม่มี "เลขหมด"
- 💰 **จ่ายเงินอัตโนมัติ** - ถูกรางวัลปุ๊บ เงินเข้ากระเป๋าทันที
- 🔐 **ปลอดภัยสูงสุด** - KYC + PIN + OTP ป้องกันมิจฉาชีพ
- 📱 **รองรับมือถือ** - ออกแบบ Mobile-First
- 🤖 **แอดมินครบครัน** - จัดการทุกอย่างผ่าน Dashboard

---

## 🛠️ เทคโนโลยี

| ส่วน | เทคโนโลยี |
|-----|----------|
| Frontend | React 19 + TypeScript + Vite |
| Styling | Tailwind CSS 4.0 |
| Backend | Supabase (PostgreSQL) |
| Authentication | Supabase Auth (OTP/Email) |
| Storage | Supabase Storage |
| Edge Functions | Deno (TypeScript) |
| Hosting | Vercel / Netlify |

---

## 🚀 เริ่มต้นใช้งาน (Development)

```bash
# 1. Clone repository
git clone <your-repo-url>
cd lucky-lottery

# 2. Install dependencies
npm install

# 3. Copy environment variables
cp .env.example .env.local

# 4. Edit .env.local with your Supabase credentials:
# VITE_SUPABASE_URL=https://your-project.supabase.co
# VITE_SUPABASE_ANON_KEY=your-anon-key

# 5. Start development server
npm run dev
```

---

## 📦 โครงสร้างโปรเจค

```
ล็อตลี่ โชคดี/
├── src/
│   ├── pages/              # หน้าเว็บทั้งหมด
│   │   ├── admin/          # หน้าแอดมิน (18 หน้า)
│   │   └── ...             # หน้าผู้ใช้ (25+ หน้า)
│   ├── components/          # React Components
│   ├── services/            # API Services (6 ไฟล์)
│   ├── lib/                 # Context, Hooks, Utils
│   └── App.tsx             # Main Router
├── supabase/
│   ├── schema.sql          # Database Schema
│   ├── config.toml         # Supabase Config
│   └── functions/          # Edge Functions
│       └── settle-lotto/   # Auto-result processor
├── .env.example            # Environment template
├── DEPLOY.md              # Deployment guide
└── package.json
```

---

## 🎯 ฟังชั่นหลัก

### ส่วนผู้ใช้ (Customer)
- ✅ สมัครสมาชิก / เข้าสู่ระบบ (OTP)
- ✅ ยืนยันตัวตน KYC (บัตรปชช.)
- ✅ เลือกเลข 6 หลัก (Unlimited Supply)
- ✅ ตะกร้าสินค้า + ชำระเงิน
- ✅ กระเป๋าเงิน (ฝาก/ถอน)
- ✅ ดูประวัติการซื้อ + สถานะ
- ✅ ตรวจผลรางวัลย้อนหลัง
- ✅ ระบบแนะนำเพื่อน (Affiliate)
- ✅ สะสมแต้ม (Loyalty)
- ✅ วงล้อเสี่ยงโชค (Lucky Wheel)

### ส่วนแอดมิน (Admin)
- 📊 Dashboard สถิติสด
- 👥 จัดการสมาชิก + KYC
- 💰 อนุมัติ ฝาก/ถอน
- 🎫 จัดการงวด + ออกรางวัลอัตโนมัติ
- 🏆 ผู้ถูกรางวัล
- 🎁 โปรโมชั่น + แจ้งเตือน
- 📈 รายงานการเงิน
- 🎰 Loyalty + Affiliate Management

---

## ⚙️ ระบบอัตโนมัติ (Automation Flow)

```
1. ผู้ใช้ซื้อสลาก → ตัดเงิน Wallet → สลากเป็น "pending"
         ↓
2. รอวันออกรางวัล (1, 16 ของเดือน)
         ↓
3. แอดมินกด "ดึงผลรางวัล" → ดึง API สำนักงานสลากฯ
         ↓
4. ระบบประมวลผล:
   - ตรวจสอบทุกสลาก (6-digit, 3-front, 3-back, 2-back)
   - คำนวณเงินรางวัล
   - โอนเข้า Wallet อัตโนมัติ
   - อัปเดตสถานะ (win/lose/paid)
   - ส่ง Notification แจ้งผู้ถูกรางวัล
         ↓
5. ผู้ใช้เห็นเงินเข้ากระเป๋าทันที!
```

---

## 🗄️ Database Schema

### ตารางหลัก
- `profiles` - ข้อมูลผู้ใช้
- `wallets` - กระเป๋าเงิน
- `transactions` - ธุรกรรมทั้งหมด
- `lottery_rounds` - งวดสลาก
- `lottery_results` - ผลรางวัล
- `lottery_tickets` - สลากที่ซื้อ
- `kyc_documents` - เอกสารยืนยันตัวตน
- `winners` - ผู้ถูกรางวัล
- `promotions` - โปรโมชั่น
- `notifications` - การแจ้งเตือน
- `affiliate_commissions` - ค่าแนะนำ
- `loyalty_points` - แต้มสะสม
- `site_settings` - ตั้งค่าเว็บไซต์

ดูรายละเอียดทั้งหมดใน `supabase/schema.sql`

---

## 🔒 ระบบความปลอดภัย

| ระดับ | ฟังชั่น |
|------|--------|
| 🔐 Authentication | OTP + Email + Session |
| 🛡️ KYC | บัตรปชช. + Selfie |
| 💳 Transaction | PIN 6 หลัก ก่อนถอน |
| 🔑 Admin | Role-based Access |
| 📝 Audit | Logs ทุกธุรกรรม |

---

## 🌐 Deploy ขึ้น Production

อ่านรายละเอียดทั้งหมดใน **[DEPLOY.md](DEPLOY.md)**

### เร็วๆ (Quick Deploy)

```bash
# 1. Deploy Database
# ไปที่ Supabase SQL Editor แล้วรัน schema.sql

# 2. Deploy Edge Function
supabase functions deploy settle-lotto

# 3. Deploy Frontend (Vercel)
vercel --prod
```

---

## 📞 ติดต่อสอบถาม

หากมีปัญหาหรือคำถาม:
1. ตรวจสอบ [DEPLOY.md](DEPLOY.md) ก่อน
2. ดู Logs ใน Supabase Dashboard
3. ตรวจสอบ Environment Variables

---

## ⚖️ License

MIT License - สามารถใช้งานส่วนตัวหรือพาณิชย์ได้

---

**🎉 ขอให้โชคดีกับการเปิดใช้งาน!**

*ล็อตลี่ โชคดี - ซื้อสลากออนไลน์ ง่าย ปลอดภัย ได้เงินจริง*
