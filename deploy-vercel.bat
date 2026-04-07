@echo off
chcp 65001 >nul
echo ==========================================
echo   🚀 Deploy Lucky Lottery to Vercel
echo ==========================================
echo.

:: Check if Vercel CLI is installed
where vercel >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Vercel CLI ไม่ได้ติดตั้ง
    echo.
    echo ติดตั้งด้วยคำสั่ง: npm i -g vercel
    pause
    exit /b 1
)

echo ✅ Vercel CLI พร้อมใช้งาน
echo.

:: Check if logged in
vercel whoami >nul 2>nul
if %errorlevel% neq 0 (
    echo 🔐 กรุณา login ก่อน...
    vercel login
)

echo ✅ Login แล้ว
echo.

:: Check if project is linked
if not exist ".vercel\project.json" (
    echo 🔗 Linking project...
    vercel link
)

echo ✅ Project linked
echo.

:: Pull environment variables
echo 📥 Pulling environment variables...
vercel env pull .env.local

:: Deploy
echo.
echo 🚀 Deploying to Vercel...
echo.
vercel --prod

echo.
echo ==========================================
echo   ✅ Deploy เสร็จสิ้น!
echo ==========================================
echo.
echo 🌐 ลิงก์หลัง Deploy:
echo    - หน้าหลัก: https://[your-domain].vercel.app
echo    - หน้าแอดมิน: https://[your-domain].vercel.app/admin
echo.
pause
