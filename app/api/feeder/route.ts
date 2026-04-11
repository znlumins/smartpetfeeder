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

    // 1. PEMBERSIHAN TOTAL
    // Kita pecah dulu pakai pipa (|)
    const parts = rawData.split('|');

    // 2. FORCING NUMBER (Hanya ambil angka dan titik saja)
    // Ini akan membuang \r, \n, spasi, atau karakter aneh yang nempel di "1387"
    const weightClean = parts[0] ? parts[0].replace(/[^0-9.]/g, '') : "0";
    const storageClean = parts[1] ? parts[1].replace(/[^0-9.]/g, '') : "0";
    
    const weight = parseFloat(weightClean) || 0;
    const storage = parseInt(storageClean) || 0;
    const ir_status = parts[2] ? parts[2].trim() : "CLEAR";

    console.log("DEBUG PARSING ->", { weight, storage, ir_status });

    // 3. INSERT KE SUPABASE
    const { error } = await supabase.from('feeder_logs').insert([
      { weight, storage, ir_status }
    ]);

    if (error) {
      console.error("SUPABASE ERROR:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 4. CEK PERINTAH FEED
    const { data: command } = await supabase
      .from('feeder_commands')
      .select('*')
      .eq('status', 'PENDING')
      .maybeSingle();

    if (command) {
      await supabase.from('feeder_commands')
        .update({ status: 'SUCCESS' })
        .eq('id', command.id);
      return NextResponse.json({ message: 'FEED' });
    }

    return NextResponse.json({ message: 'OK' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}