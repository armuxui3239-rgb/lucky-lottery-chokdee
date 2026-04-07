import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error(
    '❌ Supabase URL หรือ Anon Key หายไปในไฟล์ .env.local! กรุณาตรวจสอบตัวแปรต้นแบบ:\n',
    'VITE_SUPABASE_URL:', supabaseUrl ? '✅ ตั้งค่าแล้ว' : '❌ ยังไม่ระบุ', '\n',
    'VITE_SUPABASE_ANON_KEY:', supabaseKey ? '✅ ตั้งค่าแล้ว' : '❌ ยังไม่ระบุ'
  )
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder-key'
)
