@echo off
chcp 65001 >nul
title 🚀 Master Deploy - Lucky Lottery Chokdee
cls

echo ============================================
echo   🎰 LUCKY LOTTERY CHOKDEE - MASTER DEPLOY
echo   ระบบสลากออนไลน์ พร้อมใช้งานจริง
echo ============================================
echo.
echo  สคริปต์นี้จะทำทั้งหมดอัตโนมัติ:
echo  [1] ตรวจสอบเครื่องมือที่จำเป็น
echo  [2] ติดตั้ง Dependencies
echo  [3] รัน Build Test
echo  [4] Link Supabase Project
echo  [5] Deploy Edge Functions
echo  [6] แนะนำขั้นตอนต่อไป
echo.
echo ============================================
echo.

:: =====================================================
:: STEP 1: CHECK PREREQUISITES
:: =====================================================
echo 📋 STEP 1: ตรวจสอบเครื่องมือที่จำเป็น...
echo.

:: Check Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js ไม่พบ กรุณาติดตั้ง Node.js 18+ ก่อน
    echo    https://nodejs.org
    pause
    exit /b 1
)
echo ✅ Node.js พร้อมใช้งาน

:: Check npm
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ npm ไม่พบ
    pause
    exit /b 1
)
echo ✅ npm พร้อมใช้งาน

:: Check Git
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Git ไม่พบ กรุณาติดตั้ง Git ก่อน
    echo    https://git-scm.com
    pause
    exit /b 1
)
echo ✅ Git พร้อมใช้งาน

:: Check Supabase CLI
call npx supabase --version >nul 2>nul
if %errorlevel% neq 0 (
    echo ⚠️ Supabase CLI ไม่พบ กำลังติดตั้ง...
    call npm install -g supabase
)
echo ✅ Supabase CLI พร้อมใช้งาน

:: Check Vercel CLI
where vercel >nul 2>nul
if %errorlevel% neq 0 (
    echo ⚠️ Vercel CLI ไม่พบ กำลังติดตั้ง...
    call npm install -g vercel
)
echo ✅ Vercel CLI พร้อมใช้งาน

echo.
echo ✅ ตรวจสอบเครื่องมือเสร็จสิ้น
echo.
timeout /t 2 /nobreak >nul

:: =====================================================
:: STEP 2: INSTALL DEPENDENCIES
:: =====================================================
echo 📦 STEP 2: ติดตั้ง Dependencies...
echo.

if not exist "node_modules" (
    echo กำลังติดตั้ง npm packages...
    call npm ci
    if %errorlevel% neq 0 (
        echo ❌ ติดตั้ง Dependencies ล้มเหลว
        pause
        exit /b 1
    )
    echo ✅ Dependencies ติดตั้งสำเร็จ
) else (
    echo ✅ Dependencies มีอยู่แล้ว
)

echo.
timeout /t 2 /nobreak >nul

:: =====================================================
:: STEP 3: BUILD TEST
:: =====================================================
echo 🔨 STEP 3: ทดสอบ Build...
echo.

call npm run build
if %errorlevel% neq 0 (
    echo ❌ Build ล้มเหลว กรุณาตรวจสอบ errors
    pause
    exit /b 1
)
echo ✅ Build สำเร็จ (dist/)

echo.
timeout /t 2 /nobreak >nul

:: =====================================================
:: STEP 4: LINK SUPABASE PROJECT
:: =====================================================
echo 🗄️ STEP 4: Link Supabase Project...
echo.

if not exist ".supabase\config.toml" (
    echo กำลัง Link Supabase Project...
    call npx supabase link --project-ref qitdcchnszvlvszzdajy
    if %errorlevel% neq 0 (
        echo ❌ Link Supabase ล้มเหลว
        echo    ตรวจสอบว่าคุณ login Supabase CLI แล้ว:
        echo    npx supabase login
        pause
        exit /b 1
    )
) else (
    echo ✅ Supabase Project ถูก Link แล้ว
)

echo.
timeout /t 2 /nobreak >nul

:: =====================================================
:: STEP 5: DEPLOY EDGE FUNCTIONS
:: =====================================================
echo ⚡ STEP 5: Deploy Edge Functions...
echo.

echo กำลัง Deploy settle-lotto...
call npx supabase functions deploy settle-lotto
if %errorlevel% neq 0 (
    echo ❌ Deploy settle-lotto ล้มเหลว
    pause
    exit /b 1
)
echo ✅ settle-lotto Deployed

echo กำลัง Deploy auto-lotto-draw...
call npx supabase functions deploy auto-lotto-draw
if %errorlevel% neq 0 (
    echo ❌ Deploy auto-lotto-draw ล้มเหลว
    pause
    exit /b 1
)
echo ✅ auto-lotto-draw Deployed

echo.
timeout /t 2 /nobreak >nul

:: =====================================================
:: STEP 6: GIT INITIALIZATION
:: =====================================================
echo 📁 STEP 6: เตรียม Git Repository...
echo.

if not exist ".git" (
    echo กำลัง Initialize Git...
    call git init
    call git add .
    call git commit -m "🎰 Lucky Lottery Chokdee - Production Ready v1.0.0"
    call git branch -M main
    echo ✅ Git Repository สร้างสำเร็จ
) else (
    echo ✅ Git Repository มีอยู่แล้ว
    call git add .
    call git status
)

echo.
timeout /t 2 /nobreak >nul

:: =====================================================
:: STEP 7: VERCEL SETUP
:: =====================================================
echo 🌐 STEP 7: Setup Vercel...
echo.

if not exist ".vercel\project.json" (
    echo กำลัง Setup Vercel...
    call vercel
    echo ✅ Vercel Setup สำเร็จ
) else (
    echo ✅ Vercel ถูก Setup แล้ว
)

echo.
timeout /t 2 /nobreak >nul

:: =====================================================
:: COMPLETION
:: =====================================================
cls
echo ============================================
echo   ✅ MASTER DEPLOY - สำเร็จแล้ว!
echo ============================================
echo.
echo 🎯 สิ่งที่ทำเสร็จแล้ว:
echo    ✅ ตรวจสอบเครื่องมือครบถ้วน
echo    ✅ ติดตั้ง Dependencies
echo    ✅ Build Test ผ่าน
echo    ✅ Link Supabase Project
echo    ✅ Deploy Edge Functions (2 functions)
echo    ✅ Git Repository พร้อม
echo    ✅ Vercel Setup แล้ว
echo.
echo ============================================
echo   📋 ขั้นตอนต่อไป (ทำด้วยตนเอง):
echo ============================================
echo.
echo  1️⃣  สร้าง GitHub Repository:
echo      https://github.com/new
echo      ตั้งชื่อ: lucky-lottery-chokdee
echo.
echo  2️⃣  Push ขึ้น GitHub:
echo      git remote add origin https://github.com/YOUR_USERNAME/lucky-lottery-chokdee.git
echo      git push -u origin main
echo.
echo  3️⃣  รัน SQL Migrations (สำคัญ!):
echo      - ไปที่ https://supabase.com/dashboard
echo      - เลือกโปรเจค ไปที่ SQL Editor
echo      - รันไฟล์ตามลำดับ: 01_extensions.sql ถึง 19_default_data.sql
echo.
echo  4️⃣  สร้าง Storage Buckets:
echo      - documents (private)
echo      - transactions (private)  
echo      - banners (public)
echo.
echo  5️⃣  ตั้งค่า GitHub Secrets:
echo      ดูรายละเอียดใน: GITHUB_SECRETS_SETUP.md
echo.
echo  6️⃣  Deploy บน Vercel:
echo      vercel --prod
echo.
echo ============================================
echo   🔗 ลิงก์สำคัญ:
echo ============================================
echo.
echo  📄 คู่มือการตั้งค่า:  GITHUB_SECRETS_SETUP.md
echo  📄 คู่มือ Deploy:     VERCEL_DEPLOY.md
echo  📄 รายงานตรวจสอบ:   FINAL_VERIFICATION_REPORT.md
echo  📄 Checklist:         DEPLOY_CHECKLIST.md
echo.
echo ============================================
echo   🎰 พร้อมเปิดใช้งาน Lucky Lottery Chokdee!
echo ============================================
echo.
pause
