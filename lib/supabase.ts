import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Cek apakah variabel ada sebelum membuat client
if (!supabaseUrl || !supabaseKey) {
  console.warn("Peringatan: Supabase URL atau Key tidak ditemukan!")
}

export const supabase = createClient(supabaseUrl, supabaseKey)