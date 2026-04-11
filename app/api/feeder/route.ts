import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let rawData = body.data || "";

    // 1. Bersihkan karakter aneh tapi sisakan angka, titik, dan pipa (|)
    const cleanData = rawData.replace(/[^0-9.|A-Z]/gi, "").trim();
    const parts = cleanData.split('|');

    // 2. Gunakan parseFloat dan pastikan hasilnya bukan NaN
    // Kita ambil bagian pertama (weight)
    let weightVal = parseFloat(parts[0]);
    if (isNaN(weightVal)) weightVal = 0; // Jika gagal, set 0

    // Kita ambil bagian kedua (storage/stok)
    let storageVal = parseInt(parts[1]);
    if (isNaN(storageVal)) storageVal = 0;

    const ir_status = parts[2] || "CLEAR";

    // DEBUG LOG (Cek di Dashboard Vercel)
    console.log("HASIL PARSING FINAL:", { weightVal, storageVal, ir_status });

    // 3. Simpan ke Supabase
    const { error } = await supabase.from('feeder_logs').insert([
      { 
        weight: weightVal, 
        storage: storageVal, 
        ir_status: ir_status 
      }
    ]);

    if (error) {
      console.error("SUPABASE ERROR:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 4. Cek Perintah Feed
    const { data: command } = await supabase
      .from('feeder_commands')
      .select('*')
      .eq('status', 'PENDING')
      .maybeSingle();

    if (command) {
      await supabase.from('feeder_commands').update({ status: 'SUCCESS' }).eq('id', command.id);
      return NextResponse.json({ message: 'FEED' });
    }

    return NextResponse.json({ message: 'OK' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}