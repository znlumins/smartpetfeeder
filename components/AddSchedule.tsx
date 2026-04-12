'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AddSchedule() {
  const [time, setTime] = useState('');
  const [schedules, setSchedules] = useState<any[]>([]);

  // Ambil daftar jadwal saat halaman dibuka
  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    const { data } = await supabase.from('schedules').select('*').order('feed_time');
    if (data) setSchedules(data);
  };

  const handleAdd = async () => {
    if (!time) return;
    const { error } = await supabase.from('schedules').insert([{ feed_time: `${time}:00` }]);
    if (error) alert("Error: " + error.message);
    else { setTime(''); fetchSchedules(); }
  };

  const handleDelete = async (id: number) => {
    await supabase.from('schedules').delete().eq('id', id);
    fetchSchedules();
  };

  return (
    <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Manajemen Jadwal Makan</h2>
      
      {/* Input Jadwal Baru */}
      <div className="flex gap-3 mb-6">
        <input 
          type="time" 
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <button 
          onClick={handleAdd}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition"
        >
          Tambah Jadwal
        </button>
      </div>

      {/* Daftar Jadwal */}
      <div className="space-y-3">
        {schedules.map((s) => (
          <div key={s.id} className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
            <span className="text-lg font-mono font-semibold text-blue-600">
              {s.feed_time.substring(0, 5)} WIB
            </span>
            <button 
              onClick={() => handleDelete(s.id)}
              className="text-red-500 hover:text-red-700 font-medium"
            >
              Hapus
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}