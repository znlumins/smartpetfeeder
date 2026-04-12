"use client";
import React, { useState, useEffect } from 'react';
import { createClient, RealtimePostgresInsertPayload } from '@supabase/supabase-js';
import { Power, BrainCircuit, Scale, Home, Settings, Bell, Loader2, History, Database, Trash2, Clock } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface FeederLog {
  id: number;
  created_at: string;
  weight: number;
  storage: number;
  ir_status: string;
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'home' | 'stats' | 'feeder' | 'settings'>('home');
  const [foodLevel, setFoodLevel] = useState(0);
  const [bowlWeight, setBowlWeight] = useState(0);
  const [irStatus, setIrStatus] = useState("Checking...");
  const [isOnline, setIsOnline] = useState(false);
  const [logs, setLogs] = useState<FeederLog[]>([]);
  const [isFeeding, setIsFeeding] = useState(false);
  
  // State Baru untuk Jadwal
  const [schedules, setSchedules] = useState<any[]>([]);
  const [newTime, setNewTime] = useState("");

  useEffect(() => {
    const getData = async () => {
      // Ambil Logs
      const { data: logData } = await supabase.from('feeder_logs').select('*').order('created_at', { ascending: false }).limit(10);
      if (logData && logData.length > 0) {
        setFoodLevel(logData[0].storage);
        setBowlWeight(logData[0].weight);
        setIrStatus(logData[0].ir_status === "ADA_KUCING" ? "Object Detected" : "Clear");
        setLogs(logData);
        setIsOnline(true);
      }

      // Ambil Jadwal
      const { data: schedData } = await supabase.from('schedules').select('*').order('feed_time');
      if (schedData) setSchedules(schedData);
    };

    getData();

    // Realtime Channel
    const channel = supabase.channel('realtime-iot')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'feeder_logs' }, 
        (payload: RealtimePostgresInsertPayload<FeederLog>) => {
          const newData = payload.new;
          setFoodLevel(newData.storage);
          setBowlWeight(newData.weight);
          setIrStatus(newData.ir_status === "ADA_KUCING" ? "Object Detected" : "Clear");
          setLogs(prev => [newData, ...prev.slice(0, 9)]);
          setIsOnline(true);
        })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleFeedNow = async () => {
    if (isFeeding) return;
    setIsFeeding(true);
    const { error } = await supabase.from('feeder_commands').insert([{ status: 'PENDING' }]);
    if (error) { alert("Error!"); setIsFeeding(false); }
    else { setTimeout(() => setIsFeeding(false), 5000); }
  };

  const handleAddSchedule = async () => {
    if (!newTime) return;
    const { error } = await supabase.from('schedules').insert([{ feed_time: `${newTime}:00` }]);
    if (!error) { 
        setNewTime(""); 
        const { data } = await supabase.from('schedules').select('*').order('feed_time');
        if (data) setSchedules(data);
    }
  };

  const handleDeleteSchedule = async (id: number) => {
    await supabase.from('schedules').delete().eq('id', id);
    setSchedules(schedules.filter(s => s.id !== id));
  };

  const renderContent = () => {
    const tabWrapperClass = "flex-1 w-full max-w-6xl mx-auto overflow-y-auto pb-44 px-2 pt-2 animate-in fade-in duration-500";

    switch (activeTab) {
      case 'home':
        return (
          <div className={tabWrapperClass}>
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-[1.5] w-full bg-white rounded-[40px] shadow-sm border border-gray-50 flex flex-col items-center justify-center p-8 lg:p-12 min-h-[450px]">
                <p className="text-gray-400 font-black uppercase tracking-[0.3em] text-[10px] mb-8 text-center">Food Storage Level</p>
                <div className="relative w-64 h-64 lg:w-80 lg:h-80 flex items-center justify-center">
                  <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="54" fill="none" stroke="#f8f8f8" strokeWidth="3" />
                    <circle 
                      cx="60" cy="60" r="54" 
                      fill="none" stroke="#e91e63" 
                      strokeWidth="5" 
                      strokeDasharray="339.3" 
                      strokeDashoffset={339.3 - (339.3 * foodLevel / 100)} 
                      strokeLinecap="round" 
                      className="transition-all duration-1000 ease-in-out" 
                    />
                  </svg>
                  <div className="text-center">
                    <span className="text-7xl lg:text-9xl font-black tracking-tighter leading-none">{foodLevel}</span>
                    <span className="text-2xl lg:text-4xl font-bold text-gray-200 ml-1">%</span>
                  </div>
                </div>
                <div className="mt-10 grid grid-cols-2 gap-4 w-full max-w-md">
                  <div className="p-5 bg-gray-50 rounded-3xl border border-gray-100/50 text-center">
                    <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Bowl Weight</p>
                    <p className="text-xl lg:text-2xl font-black">{bowlWeight}g</p>
                  </div>
                  <div className="p-5 bg-gray-50 rounded-3xl border border-gray-100/50 text-center">
                    <p className="text-[9px] font-black text-gray-400 uppercase mb-1">IR Sensor</p>
                    <p className={`text-lg font-black uppercase italic ${irStatus === "Clear" ? "text-green-500" : "text-red-500"}`}>{irStatus}</p>
                  </div>
                </div>
              </div>
              <div className="flex-1 flex flex-col gap-6">
                <section className="bg-[#1d1d1d] p-10 rounded-[40px] text-white shadow-2xl flex flex-col justify-center items-center h-full min-h-[300px]">
                  <h3 className="font-black text-[10px] uppercase tracking-widest text-gray-500 mb-8">Manual Feeding</h3>
                  <button onClick={handleFeedNow} disabled={isFeeding} className={`group relative w-full h-48 ${isFeeding ? 'bg-gray-800' : 'bg-[#e91e63] active:scale-95'} text-white font-black rounded-[30px] transition-all flex flex-col items-center justify-center gap-4 tracking-widest text-[11px] uppercase shadow-xl shadow-pink-900/30`}>
                    {isFeeding ? <Loader2 className="animate-spin" size={40} /> : <Power size={40} />}
                    <span>{isFeeding ? 'Processing' : 'Feed Now'}</span>
                  </button>
                </section>
              </div>
            </div>
          </div>
        );

      case 'feeder': 
        return (
          <div className={tabWrapperClass}>
            <section className="bg-white p-8 rounded-[40px] border border-gray-50 shadow-sm min-h-full">
               <h3 className="font-black text-lg uppercase italic mb-6">Feeder <span className="text-[#e91e63]">Logs</span></h3>
               <div className="space-y-4">
                 {logs.map((log, i) => (
                   <div key={i} className="flex justify-between items-center p-6 bg-gray-50 rounded-[25px]">
                     <div className="flex flex-col">
                       <span className="text-[10px] font-black text-gray-400 uppercase">{new Date(log.created_at).toLocaleString()}</span>
                       <span className="text-sm font-black">W: {log.weight}g | S: {log.storage}%</span>
                     </div>
                     <span className={`text-[10px] font-black uppercase ${log.ir_status === "ADA_KUCING" ? "text-red-500" : "text-green-500"}`}>{log.ir_status}</span>
                   </div>
                 ))}
               </div>
            </section>
          </div>
        );

      case 'settings':
        return (
          <div className={tabWrapperClass}>
            <section className="bg-white p-8 rounded-[40px] border border-gray-50 shadow-sm min-h-full">
              <h3 className="font-black text-lg uppercase italic mb-6">Schedule <span className="text-[#e91e63]">Manager</span></h3>
              <div className="flex gap-3 mb-8 bg-gray-50 p-6 rounded-[30px]">
                <input type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)} className="flex-1 p-3 rounded-2xl border-none ring-1 ring-gray-200 outline-none font-bold" />
                <button onClick={handleAddSchedule} className="bg-[#e91e63] text-white px-6 rounded-2xl font-black uppercase text-[10px] tracking-widest">Add</button>
              </div>
              <div className="grid gap-4">
                {schedules.map((s) => (
                  <div key={s.id} className="flex justify-between items-center p-5 bg-gray-50 rounded-[25px]">
                    <span className="text-xl font-black text-gray-700">{s.feed_time.substring(0, 5)} WIB</span>
                    <button onClick={() => handleDeleteSchedule(s.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-xl"><Trash2 size={20}/></button>
                  </div>
                ))}
              </div>
            </section>
          </div>
        );
      
      default: return null;
    }
  };

  return (
    <div className="h-screen w-full bg-[#fafafa] text-[#1d1d1d] flex flex-col overflow-hidden p-4 lg:p-8">
      <header className="flex justify-between items-center mb-6 px-2 shrink-0">
        <div className="flex items-center gap-4">
          <div className="bg-[#e91e63] p-3 rounded-2xl text-white shadow-xl shadow-pink-100"><Power size={22} /></div>
          <div>
            <h1 className="text-xl lg:text-2xl font-black tracking-tighter italic leading-none uppercase">Petsafe <span className="text-[#e91e63]">System</span></h1>
            <p className="text-gray-400 text-[9px] font-black uppercase tracking-[0.2em] mt-1 italic">{isOnline ? '● Online' : '○ Offline'}</p>
          </div>
        </div>
      </header>
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">{renderContent()}</div>
      <nav className="fixed bottom-6 left-4 right-4 flex justify-center z-50">
        <div className="bg-white/90 backdrop-blur-md w-full max-w-sm lg:max-w-3xl px-6 py-4 rounded-full shadow-2xl border border-gray-100 flex justify-between items-center">
          <NavBtn icon={<Home size={18}/>} label="Home" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
          <NavBtn icon={<Clock size={18}/>} label="Schedule" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
          <NavBtn icon={<Scale size={18}/>} label="History" active={activeTab === 'feeder'} onClick={() => setActiveTab('feeder')} />
        </div>
      </nav>
    </div>
  );
}

function NavBtn({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button onClick={onClick} className={`flex flex-col lg:flex-row items-center gap-1 lg:gap-2 font-black text-[7px] lg:text-[10px] uppercase tracking-[0.2em] transition-all ${active ? 'text-[#e91e63]' : 'text-gray-300'}`}>
      {icon} <span>{label}</span>
    </button>
  );
}