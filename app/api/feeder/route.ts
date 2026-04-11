import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// 1. Ambil variabel tanpa tanda '!'
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// 2. Gunakan fallback (cadangan) agar build tidak crash
// Kita kasih string kosong jika variabel tidak ditemukan saat proses build
const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder-key'
);

// 3. Tambahkan ini agar Vercel tidak menganggap ini static page
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    // Validasi runtime: Jika beneran kosong saat diakses
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Supabase env missing' }, { status: 500 });
    }

    const body = await request.json();
    const rawData = body.data;

    if (!rawData) return NextResponse.json({ error: 'No data provided' }, { status: 400 });

    const [weight, storage, ir_status] = rawData.split('|');

    // 1. Simpan data sensor
    const { error: insertError } = await supabase
      .from('feeder_logs')
      .insert([
        { 
          weight: parseFloat(weight) || 0, 
          storage: parseInt(storage) || 0, 
          ir_status: ir_status || 'unknown'
        }
      ]);

    if (insertError) throw insertError;

    // 2. Cek perintah "FEED"
    const { data: cmdData } = await supabase
      .from('feeder_commands')
      .select('command')
      .eq('status', 'PENDING')
      .single();

    if (cmdData?.command === 'FEED') {
      await supabase
        .from('feeder_commands')
        .update({ status: 'SUCCESS' })
        .eq('status', 'PENDING');

      return NextResponse.json({ message: "FEED" });
    }

    return NextResponse.json({ message: "OK" });
  } catch (error: any) {
    console.error('Error:', error.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}