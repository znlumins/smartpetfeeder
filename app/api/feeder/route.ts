// app/api/feeder/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawData = body.data; // Format dari NodeMCU: "berat|stok|status"

    const [weight, storage, ir_status] = rawData.split('|');

    // 1. Simpan data sensor ke Database
    const { error: insertError } = await supabase
      .from('feeder_logs')
      .insert([
        { 
          weight: parseFloat(weight), 
          storage: parseInt(storage), 
          ir_status: ir_status 
        }
      ]);

    if (insertError) throw insertError;

    // 2. Cek apakah ada perintah "FEED" yang tertunda
    // Kita ambil data terakhir yang kolom command-nya 'FEED'
    const { data: cmdData } = await supabase
      .from('feeder_commands')
      .select('command')
      .eq('status', 'PENDING')
      .single();

    if (cmdData?.command === 'FEED') {
      // Update status jadi 'SUCCESS' supaya tidak kasih makan terus-terusan
      await supabase
        .from('feeder_commands')
        .update({ status: 'SUCCESS' })
        .eq('status', 'PENDING');

      return NextResponse.json({ message: "FEED" });
    }

    return NextResponse.json({ message: "OK" });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}