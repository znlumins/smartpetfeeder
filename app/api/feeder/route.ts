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

    console.log("Raw Data Masuk:", rawData); // Cek di Logs Vercel

    if (!rawData) return NextResponse.json({ message: 'No Data' }, { status: 400 });

    // 1. PEMBERSIHAN TOTAL (Hapus karakter gaib \r atau \n)
    const cleanData = rawData.replace(/(\r\n|\n|\r)/gm, "").trim();
    const parts = cleanData.split('|');

    // 2. KONVERSI PAKSA (Gunakan Number() agar lebih kuat dari parseFloat)
    const weight = Number(parts[0]) || 0;
    const storage = Number(parts[1]) || 0;
    const ir_status = parts[2] || 'CLEAR';

    console.log("Data Setelah Diproses:", { weight, storage, ir_status });

    // 3. INSERT KE SUPABASE
    const { error: insertError } = await supabase.from('feeder_logs').insert([
      { 
        weight: weight, 
        storage: storage, 
        ir_status: ir_status 
      }
    ]);

    if (insertError) {
      console.error("Supabase Error:", insertError.message);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // 4. CEK PERINTAH FEED (PENDING)
    const { data: command } = await supabase
      .from('feeder_commands')
      .select('*')
      .eq('status', 'PENDING')
      .maybeSingle();

    if (command) {
      // Update jadi SUCCESS agar tidak diproses ulang
      await supabase
        .from('feeder_commands')
        .update({ status: 'SUCCESS' })
        .eq('id', command.id);

      return NextResponse.json({ message: 'FEED' });
    }

    return NextResponse.json({ message: 'OK' });
  } catch (error) {
    console.error("Internal Server Error:", error);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}