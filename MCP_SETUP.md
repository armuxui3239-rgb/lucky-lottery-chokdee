# Supabase MCP Setup Guide
# คู่มือตั้งค่า Supabase MCP สำหรับ Windsurf

## ✅ สิ่งที่สร้างแล้ว:

ไฟล์ `~/.codeium/windsurf/mcp_config.json` ถูกสร้างเรียบร้อยแล้ว!

## 🔧 ขั้นตอนถัดไป:

### 1. ติดตั้ง mcp-remote package (จำเป็น)

```bash
# เปิด Terminal ใน Windsurf หรือ PowerShell
cd "c:\Users\arm\Downloads\ล็อตลี่ โชคดี"

# ติดตั้ง mcp-remote package
npm install -g mcp-remote

# หรือใช้ npx (ไม่ต้องติดตั้ง global)
npx -y mcp-remote --version
```

### 2. ติดตั้ง Agent Skills (แนะนำ)

```bash
# ติดตั้ง Supabase Agent Skills
npx skills add supabase/agent-skills
```

### 3. Restart Windsurf IDE

1. ปิด Windsurf ทั้งหมด
2. เปิดใหม่
3. AI Agent จะเชื่อมต่อกับ Supabase อัตโนมัติ

## 🎯 หลังจาก Setup สำเร็จ:

AI Agent จะสามารถ:
- ✅ อ่าน/เขียนข้อมูลในฐานข้อมูลได้โดยตรง
- ✅ สร้าง/แก้ไขตารางอัตโนมัติ
- ✅ Deploy Edge Functions
- ✅ จัดการ Storage Buckets
- ✅ Debug ปัญหาฐานข้อมูล

## ⚠️ ข้อควรระวัง:

- MCP ยังอยู่ในช่วง Preview/Beta
- อาจมีบั๊กหรือข้อจำกัดบางอย่าง
- ควรทดสอบบน Development ก่อน Production

## 🆘 ถ้าไม่ทำงาน:

1. ตรวจสอบ Windsurf version (ต้อง 0.1.37+)
2. ตรวจสอบว่า `mcp-remote` ติดตั้งสำเร็จ: `npx mcp-remote --version`
3. ตรวจสอบไฟล์ `~/.codeium/windsurf/mcp_config.json` มีอยู่จริง
4. ลอง Logout/Login Supabase ใหม่

---
**พร้อมใช้งาน!** 🚀
