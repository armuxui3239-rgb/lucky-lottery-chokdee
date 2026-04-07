#!/usr/bin/env pwsh
# Deploy Script สำหรับ Lucky Lottery
# รันทั้งหมดในคำสั่งเดียว!

Write-Host "🚀 Lucky Lottery Deployment Script" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green

# ตรวจสอบ Supabase CLI
$supabaseVersion = supabase --version 2>$null
if (-not $supabaseVersion) {
    Write-Host "❌ Supabase CLI ไม่พบ กำลังติดตั้ง..." -ForegroundColor Red
    npm install -g supabase
}

Write-Host "✅ Supabase CLI: $supabaseVersion" -ForegroundColor Green

# Login (ถ้ายังไม่ได้ login)
Write-Host "`n🔐 ตรวจสอบการเชื่อมต่อ Supabase..." -ForegroundColor Yellow
supabase projects list 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "กรุณา Login ก่อน: supabase login" -ForegroundColor Red
    exit 1
}

# Link Project
Write-Host "`n🔗 Linking Project..." -ForegroundColor Yellow
supabase link --project-ref qitdcchnszvlvszzdajy

# Deploy Edge Functions
Write-Host "`n📦 Deploying Edge Functions..." -ForegroundColor Yellow
supabase functions deploy settle-lotto
supabase functions deploy auto-lotto-draw

# รัน SQL Migration
Write-Host "`n🗄️ Running Database Migrations..." -ForegroundColor Yellow
Write-Host "⚠️  กรุณาไปที่ Supabase Dashboard > SQL Editor" -ForegroundColor Cyan
Write-Host "    แล้วรันไฟล์: supabase/schema.sql" -ForegroundColor Cyan

Write-Host "`n✅ Deploy เสร็จสิ้น!" -ForegroundColor Green
Write-Host "`n📋 Checklist ถัดไป:" -ForegroundColor Cyan
Write-Host "   1. สร้าง Storage Buckets (documents, transactions, banners)" -ForegroundColor White
Write-Host "   2. รัน schema.sql ใน SQL Editor" -ForegroundColor White
Write-Host "   3. ตั้งค่า GitHub Secrets" -ForegroundColor White
Write-Host "   4. Push code ขึ้น GitHub" -ForegroundColor White
