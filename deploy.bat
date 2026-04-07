@echo off
chcp 65001 >nul
cls
echo ========================================
echo 🚀 LUCKY LOTTERY - FULL DEPLOY
echo ========================================
echo.

:: Check Supabase CLI
supabase --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Supabase CLI ไม่พบ
    echo กำลังติดตั้ง...
    npm install -g supabase
)

:: Login check
echo 🔐 ตรวจสอบการเชื่อมต่อ...
supabase projects list >nul 2>&1
if errorlevel 1 (
    echo ❌ กรุณา Login ก่อน: supabase login
    pause
    exit /b 1
)

:: Link Project
echo.
echo 🔗 Linking Project...
supabase link --project-ref qitdcchnszvlvszzdajy

:: Deploy Edge Functions
echo.
echo 📦 Deploying Edge Functions...
supabase functions deploy settle-lotto
supabase functions deploy auto-lotto-draw

:: Database Migrations
echo.
echo 🗄️ Running SQL Migrations...
echo ไปที่ Supabase Dashboard ^> SQL Editor
echo รันไฟล์ตามลำดับ:
echo   01_extensions.sql
echo   02_banks.sql
echo   03_profiles.sql
...
echo   16_storage_buckets.sql

echo.
echo ✅ DEPLOYMENT READY!
echo.
echo 📋 Checklist:
echo  1. รัน SQL Migrations ใน Dashboard
echo  2. สร้าง Storage Buckets (ถ้ายังไม่สร้าง)
echo  3. ตั้งค่า GitHub Secrets
echo  4. Push code ขึ้น GitHub
echo.
pause
