import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawData = body.data; // Menerima "berat|stok|status" dari NodeMCU

    if (!rawData) return NextResponse.json({ message: 'No Data' }, { status: 400 });

    // MEMECAH DATA (SPLIT)
    const parts = rawData.split('|');
    const weight = parseFloat(parts[0]) || 0;
    const storage = parseInt(parts[1]) || 0;
    const ir_status = parts[2] || 'CLEAR';

    // 1. Masukkan data sensor ke tabel logs
    await supabase.from('feeder_logs').insert([
      { weight, storage, ir_status }
    ]);

    // 2. Cek apakah ada perintah FEED yang PENDING
    const { data: command } = await supabase
      .from('feeder_commands')
      .select('*')
      .eq('status', 'PENDING')
      .maybeSingle();

    if (command) {
      // Update status jadi SUCCESS supaya tidak diproses ulang
      await supabase
        .from('feeder_commands')
        .update({ status: 'SUCCESS' })
        .eq('id', command.id);

      // KIRIM BALASAN "FEED" KE NODEMCU
      return NextResponse.json({ message: 'FEED' });
    }

    return NextResponse.json({ message: 'OK' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}