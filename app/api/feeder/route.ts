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

    if (!rawData) return NextResponse.json({ message: 'No Data' }, { status: 400 });

    // MEMBERSIHKAN DATA DARI KARAKTER GAIB (\r\n)
    rawData = rawData.replace(/(\r\n|\n|\r)/gm, "").trim();

    const parts = rawData.split('|');
    // Paksa konversi ke angka murni
    const weight = Number(parts[0]) || 0;
    const storage = Number(parts[1]) || 0;
    const ir_status = parts[2] || 'CLEAR';

    // 1. Simpan ke Supabase
    await supabase.from('feeder_logs').insert([{ weight, storage, ir_status }]);

    // 2. Cek Antrian FEED
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