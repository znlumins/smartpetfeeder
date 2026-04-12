import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // LOG UNTUK DEBUG: Lihat apa yang dikirim NodeMCU
    console.log("RAW BODY DARI NODEMCU:", body);

    let rawData = body.data || "";

    // 1. Bersihkan spasi atau enter di awal/akhir string total
    rawData = rawData.trim();

    // 2. Pecah pakai pipa (|)
    const parts = rawData.split('|');

    // 3. Ambil dan bersihkan masing-masing bagian
    // Kita pakai regex yang lebih ketat untuk memastikan hanya angka yang diambil
    const weightRaw = parts[0] ? parts[0].replace(/[^\d.-]/g, '') : "0";
    const storageRaw = parts[1] ? parts[1].replace(/[^\d.-]/g, '') : "0";
    
    // Konversi ke angka
    const weight = parseFloat(weightRaw) || 0;
    const storage = parseFloat(storageRaw) || 0;
    const ir_status = parts[2] ? parts[2].trim() : "CLEAR";

    // LOG HASIL PARSING: Pastikan di sini bukan 0 lagi
    console.log("HASIL PARSING FINAL:", { weight, storage, ir_status });

    // 4. INSERT KE SUPABASE
    const { error } = await supabase.from('feeder_logs').insert([
      { 
        weight: weight, 
        storage: storage, 
        ir_status: ir_status 
      }
    ]);

    if (error) {
      console.error("SUPABASE ERROR:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 5. CEK PERINTAH FEED (Logic andalan kamu)
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
  } catch (err) {
    console.error("CATCH ERROR:", err);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}