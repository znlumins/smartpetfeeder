"use client";
import React, { useState, useEffect } from 'react';
import { createClient, RealtimePostgresInsertPayload } from '@supabase/supabase-js';
import { Power, BrainCircuit, Scale, Home, Settings, Bell, Loader2, History, Database } from 'lucide-react';

// Inisialisasi Client Supabase
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

  useEffect(() => {
    // 1. FUNGSI AMBIL DATA AWAL
    const getInitialData = async () => {
      console.log("%c[DEBUG] Mencoba ambil data awal...", "color: blue; font-weight: bold;");
      
      const { data, error } = await supabase
        .from('feeder_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10); 
      
      if (error) {
        console.error("%c[ERROR] Gagal ambil data awal:", "color: red;", error.message);
        return;
      }

      if (data && data.length > 0) {
        console.log("%c[SUCCESS] Data awal diterima:", "color: green;", data[0]);
        setFoodLevel(data[0].storage);
        setBowlWeight(data[0].weight);
        setIrStatus(data[0].ir_status === "ADA" ? "Object Detected" : "Clear");
        setLogs(data);
        setIsOnline(true);
      } else {
        console.warn("[WARN] Tabel feeder_logs kosong!");
      }
    };

    getInitialData();

    // 2. SETUP REALTIME (PASTIKAN REPLICATION DI SUPABASE SUDAH AKTIF)
    console.log("[DEBUG] Menghubungkan ke Realtime Channel...");
    const channel = supabase
      .channel('realtime-iot')
      .on(
        'postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'feeder_logs' }, 
        (payload: RealtimePostgresInsertPayload<FeederLog>) => {
          console.log("%c[REALTIME] Data baru terdeteksi!", "color: purple; font-weight: bold;");
          const newData = payload.new;
          console.log("Isi payload baru:", newData);

          setFoodLevel(newData.storage);
          setBowlWeight(newData.weight);
          setIrStatus(newData.ir_status === "ADA" ? "Object Detected" : "Clear");
          setLogs(prev => [newData, ...prev.slice(0, 9)]);
          setIsOnline(true);
        }
      )
      .subscribe((status) => {
        console.log(`[STATUS] Koneksi Realtime: ${status}`);
        if (status === 'CHANNEL_ERROR') {
          console.error("!!! REPLICATION MUNGKIN BELUM DIAKTIFKAN DI DASHBOARD SUPABASE !!!");
        }
      });

    return () => { 
      console.log("[DEBUG] Membersihkan channel realtime...");
      supabase.removeChannel(channel); 
    };
  }, []);

  // 3. FUNGSI TOMBOL MAKAN
  const handleFeedNow = async () => {
    if (isFeeding) return;
    
    console.log("%c[ACTION] Tombol Feed Now ditekan", "background: #e91e63; color: white; padding: 2px 5px;");
    setIsFeeding(true);
    
    const { error } = await supabase
      .from('feeder_commands')
      .insert([{ command: 'FEED', portion: 25, status: 'PENDING' }]);
    
    if (error) {
      console.error("[ERROR] Gagal input perintah ke database:", error.message);
      alert("Gagal mengirim perintah!");
      setIsFeeding(false);
    } else {
      console.log("%c[SUCCESS] Perintah FEED masuk ke tabel commands (PENDING)", "color: green;");
      // Cooldown 10 detik agar tidak spam
      setTimeout(() => {
        setIsFeeding(false);
        console.log("[DEBUG] Cooldown selesai, tombol aktif kembali.");
      }, 10000); 
    }
  };

  const renderContent = () => {
    const tabWrapperClass = "flex-1 w-full max-w-6xl mx-auto overflow-y-auto pb-44 px-2 pt-2 animate-in fade-in duration-500";

    switch (activeTab) {
      case 'home':
        return (
          <div className={tabWrapperClass}>
            <div className="flex flex-col lg:flex-row gap-6">
              {/* FOOD LEVEL CIRCLE */}
              <div className="flex-[1.5] w-full bg-white rounded-[40px] shadow-sm border border-gray-50 flex flex-col items-center justify-center p-8 lg:p-12 min-h-112.5">
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
                {/* SMALL CARDS */}
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

              {/* MANUAL FEEDING BUTTON */}
              <div className="flex-1 flex flex-col gap-6">
                <section className="bg-[#1d1d1d] p-10 rounded-[40px] text-white shadow-2xl flex flex-col justify-center items-center h-full min-h-[300px]">
                  <h3 className="font-black text-[10px] uppercase tracking-widest text-gray-500 mb-8">Manual Feeding</h3>
                  <button 
                    onClick={handleFeedNow} 
                    disabled={isFeeding}
                    className={`group relative w-full h-48 ${isFeeding ? 'bg-gray-800' : 'bg-[#e91e63] active:scale-95'} text-white font-black rounded-[30px] transition-all flex flex-col items-center justify-center gap-4 tracking-widest text-[11px] uppercase shadow-xl shadow-pink-900/30`}
                  >
                    {isFeeding ? (
                      <>
                        <Loader2 className="animate-spin text-gray-400" size={40} />
                        <span className="text-gray-400 mt-2">Processing...</span>
                      </>
                    ) : (
                      <>
                        <div className="bg-white/10 p-5 rounded-full group-hover:bg-white/20 transition-colors">
                          <Power size={40} />
                        </div>
                        <span>Feed Now</span>
                      </>
                    )}
                  </button>
                  <p className="text-[9px] text-gray-600 mt-8 font-bold uppercase tracking-widest italic text-center">
                    Tap to release 25g of food<br/>Wait for cooldown after use
                  </p>
                </section>
              </div>
            </div>
          </div>
        );

      case 'feeder': 
        return (
          <div className={tabWrapperClass}>
            <section className="bg-white p-8 rounded-[40px] border border-gray-50 shadow-sm min-h-full">
              <div className="flex items-center gap-3 mb-8">
                <div className="bg-gray-100 p-3 rounded-2xl text-gray-600"><History size={20}/></div>
                <div>
                  <h3 className="font-black text-lg tracking-tight leading-none uppercase italic">Feeder <span className="text-[#e91e63]">Logs</span></h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">History of your pet feeding</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {logs.length > 0 ? logs.map((log, i) => (
                  <div key={i} className="flex justify-between items-center p-6 bg-gray-50 rounded-[25px] border border-gray-100/30 hover:bg-white hover:shadow-md transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="bg-white p-3 rounded-2xl shadow-sm group-hover:bg-pink-50 transition-colors">
                        <Database size={18} className="text-gray-400 group-hover:text-[#e91e63]" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
                          {new Date(log.created_at).toLocaleDateString()} - {new Date(log.created_at).toLocaleTimeString()}
                        </span>
                        <div className="flex gap-4 mt-1">
                          <span className="text-sm font-black text-gray-800">Weight: {log.weight}g</span>
                          <span className="text-sm font-black text-gray-400">|</span>
                          <span className="text-sm font-black text-gray-800">Storage: {log.storage}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                       <span className={`text-[10px] font-black uppercase italic ${log.ir_status === "ADA" ? "text-red-400" : "text-green-400"}`}>
                         {log.ir_status === "ADA" ? "Object On Bowl" : "Success"}
                       </span>
                       <div className={`w-2 h-2 rounded-full ${log.ir_status === "ADA" ? "bg-red-400 shadow-[0_0_8px_#f87171]" : "bg-green-400 shadow-[0_0_8px_#4ade80]"}`}></div>
                    </div>
                  </div>
                )) : (
                  <div className="py-20 text-center">
                    <p className="text-gray-300 font-black uppercase tracking-widest text-xs italic">No data history available</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        );
      
      default:
        return (
          <div className={tabWrapperClass}>
            <div className="flex flex-col items-center justify-center py-20 text-gray-300">
              <Settings size={48} className="animate-spin-slow mb-4 opacity-20" />
              <p className="font-black uppercase tracking-[0.3em] text-xs italic opacity-40">Section Under Development</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="h-screen w-full bg-[#fafafa] text-[#1d1d1d] flex flex-col overflow-hidden p-4 lg:p-8">
      <header className="flex justify-between items-center mb-6 px-2 shrink-0">
        <div className="flex items-center gap-4">
          <div className="bg-[#e91e63] p-3 rounded-2xl text-white shadow-xl shadow-pink-100"><Power size={22} /></div>
          <div>
            <h1 className="text-xl lg:text-2xl font-black tracking-tighter italic leading-none uppercase">Petsafe <span className="text-[#e91e63]">System</span></h1>
            <p className="text-gray-400 text-[9px] font-black uppercase tracking-[0.2em] mt-1 italic">{isOnline ? '● Device Online' : '○ Device Offline'}</p>
          </div>
        </div>
        <button className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 text-gray-400 hover:text-[#e91e63] transition-all"><Bell size={18} /></button>
      </header>

      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {renderContent()}
      </div>

      <nav className="fixed bottom-6 left-4 right-4 flex justify-center z-50">
        <div className="bg-white/90 backdrop-blur-md w-full max-w-sm lg:max-w-3xl px-6 py-4 rounded-full shadow-2xl border border-gray-100 flex justify-between gap-4 items-center">
          <NavBtn icon={<Home size={18}/>} label="Home" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
          <NavBtn icon={<BrainCircuit size={18}/>} label="Stats" active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} />
          <NavBtn icon={<Scale size={18}/>} label="Feeder" active={activeTab === 'feeder'} onClick={() => setActiveTab('feeder')} />
          <NavBtn icon={<Settings size={18}/>} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
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