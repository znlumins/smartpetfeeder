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

    // MEMBERSIHKAN DATA DARI KARAKTER ENTER (\r atau \n)
    const cleanData = rawData.replace(/(\r\n|\n|\r)/gm, "").trim();
    const parts = cleanData.split('|');

    // KONVERSI KE ANGKA (Memastikan weight tidak jadi 0)
    const weight = Number(parts[0]) || 0;
    const storage = Number(parts[1]) || 0;
    const ir_status = parts[2] || "CLEAR";

    // 1. Simpan ke Supabase
    await supabase.from('feeder_logs').insert([{ weight, storage, ir_status }]);

    // 2. Cek Perintah FEED
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
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}