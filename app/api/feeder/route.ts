import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let rawData = body.data || "";
    
    // Parsing
    const parts = rawData.split('|');
    const weight = parseFloat(parts[0]?.replace(/[^\d.-]/g, '')) || 0;
    const storage = parseFloat(parts[1]?.replace(/[^\d.-]/g, '')) || 0;
    const ir_status = parts[2]?.trim() || "CLEAR";

    // Simpan Log
    await supabase.from('feeder_logs').insert([{ weight, storage, ir_status }]);

    // Cek Jam Malang (WIB)
    const skrg = new Date().toLocaleTimeString('en-GB', { 
        hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Jakarta' 
    }) + ":00";

    const { data: schedule } = await supabase.from('schedules').select('*').eq('feed_time', skrg).eq('is_active', true).maybeSingle();
    const { data: manual } = await supabase.from('feeder_commands').select('*').eq('status', 'PENDING').maybeSingle();

    if (schedule || manual) {
      if (manual) await supabase.from('feeder_commands').update({ status: 'SUCCESS' }).eq('id', manual.id);
      return NextResponse.json({ message: 'FEED' });
    }

    return NextResponse.json({ message: 'OK' });
  } catch (e) { return NextResponse.json({ error: 'Error' }, { status: 500 }); }
}