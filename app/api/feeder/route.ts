import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server'; // Mengatasi error NextResponse

// Mengatasi error Cannot find name 'supabase'
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawData = body.data;

    // Pastikan pakai NextResponse.json
    if (!rawData) {
      return NextResponse.json({ message: 'No Data' }, { status: 400 });
    }

    const parts = rawData.split('|');
    const weight = parseFloat(parts[0]?.trim()) || 0;
    const storage = parseInt(parts[1]?.trim()) || 0;
    const ir_status = parts[2]?.trim() || 'CLEAR';

    // Insert ke Logs
    await supabase.from('feeder_logs').insert([
      { weight, storage, ir_status }
    ]);

    // Cek Perintah PENDING
    const { data: command } = await supabase
      .from('feeder_commands')
      .select('*')
      .eq('status', 'PENDING')
      .maybeSingle();

    if (command) {
      await supabase
        .from('feeder_commands')
        .update({ status: 'SUCCESS' })
        .eq('id', command.id);

      return NextResponse.json({ message: 'FEED' });
    }

    return NextResponse.json({ message: 'OK' });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}