"use client";
import React, { useState } from 'react';
import { Power, PlusCircle, Wifi, BrainCircuit, Scale, Home, Settings, Clock, Bell, ChevronRight, Smartphone, Trash2, ShieldCheck } from 'lucide-react';

export default function DashboardScreen() {
  const [activeTab, setActiveTab] = useState<'home' | 'stats' | 'feeder' | 'settings'>('home');
  const [foodLevel] = useState(75);
  const [bowlWeight] = useState(45);
  const [isOnline] = useState(true);
  const [porsi, setPorsi] = useState(25);

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          // KUNCINYA: flex-1 dan overflow-y-auto di level tab agar bisa di-scroll di HP
          <div className="flex-1 w-full max-w-6xl mx-auto flex flex-col lg:flex-row gap-6 animate-in fade-in duration-500 overflow-y-auto lg:overflow-hidden pb-40 lg:pb-0 px-1 custom-scrollbar">
            
            {/* MONITORING - Section 1 */}
            <div className="flex-[1.5] w-full bg-white rounded-[32px] lg:rounded-[40px] shadow-sm border border-gray-50 flex flex-col items-center justify-center p-8 lg:p-12 min-h-[450px] shrink-0">
              <p className="text-gray-400 font-black uppercase tracking-[0.3em] text-[10px] mb-8 uppercase">Storage Level</p>
              <div className="relative w-64 h-64 lg:w-80 lg:h-80 flex items-center justify-center">
                <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="54" fill="none" stroke="#f8f8f8" strokeWidth="3" />
                  <circle cx="60" cy="60" r="54" fill="none" stroke="#e91e63" strokeWidth="5" strokeDasharray="339.3" strokeDashoffset={339.3 - (339.3 * foodLevel / 100)} strokeLinecap="round" className="transition-all duration-1000 ease-in-out" />
                </svg>
                <div className="text-center">
                  <span className="text-7xl lg:text-9xl font-black tracking-tighter leading-none">{foodLevel}</span>
                  <span className="text-2xl lg:text-4xl font-bold text-gray-200 ml-1">%</span>
                </div>
              </div>
              <div className="mt-10 grid grid-cols-2 gap-4 w-full max-w-md px-2">
                <div className="p-5 bg-gray-50 rounded-[24px] border border-gray-100/50 text-center">
                  <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Bowl Weight</p>
                  <p className="text-xl lg:text-2xl font-black">{bowlWeight}g</p>
                </div>
                <div className="p-5 bg-gray-50 rounded-[24px] border border-gray-100/50 text-center">
                  <p className="text-[9px] font-black text-gray-400 uppercase mb-1">IR Sensor</p>
                  <p className="text-lg font-black text-green-500 uppercase italic leading-none">Clear</p>
                </div>
              </div>
            </div>

            {/* REMOTE CONTROL & LOGS - Section 2 (Harus kescroll di HP) */}
            <div className="flex-1 w-full flex flex-col gap-6 shrink-0">
              <section className="bg-[#1d1d1d] p-8 rounded-[32px] lg:rounded-[40px] text-white shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                   <h3 className="font-black text-[10px] uppercase tracking-widest text-gray-500 uppercase">Remote Control</h3>
                   <span className="text-[#e91e63] font-black text-xl">{porsi}g</span>
                </div>
                <input type="range" min="10" max="200" step="10" value={porsi} onChange={(e) => setPorsi(parseInt(e.target.value))} className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#e91e63] mb-8" />
                <button className="w-full bg-[#e91e63] text-white font-black py-5 rounded-[20px] active:scale-95 transition-all flex items-center justify-center gap-3 tracking-widest text-[10px] uppercase shadow-lg shadow-pink-900/20"><Power size={18} /> Feed Now</button>
              </section>

              <section className="bg-white p-8 rounded-[32px] lg:rounded-[40px] border border-gray-50 shadow-sm flex flex-col">
                <h3 className="font-black text-[10px] uppercase tracking-widest text-gray-400 mb-6 uppercase">Recent Logs</h3>
                <div className="space-y-3">
                  <LogItem time="07:00 AM" amount="25g" />
                  <LogItem time="Yesterday, 18:00" amount="50g" />
                </div>
              </section>
            </div>
          </div>
        );

      case 'stats':
        return (
          <div className="flex-1 w-full max-w-6xl mx-auto bg-white rounded-[32px] lg:rounded-[40px] p-8 lg:p-12 border border-gray-50 animate-in fade-in duration-500 overflow-y-auto lg:overflow-hidden pb-40 lg:pb-0">
            <h2 className="text-3xl font-black tracking-tighter mb-8 italic uppercase">System <span className="text-[#e91e63]">Stats</span></h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-gray-50 rounded-[32px] p-8 h-80 flex flex-col justify-end border border-gray-100">
                <div className="flex items-end justify-around h-full pb-6">
                  {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
                    <div key={i} className="w-8 lg:w-10 bg-[#e91e63] rounded-t-xl transition-all" style={{ height: `${h}%` }}></div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
                <StatHighlight label="Total Fed" val="1.2kg" />
                <StatHighlight label="Success" val="99%" />
              </div>
            </div>
          </div>
        );

      case 'feeder':
        return (
          <div className="flex-1 w-full max-w-6xl mx-auto bg-white rounded-[32px] lg:rounded-[40px] p-8 lg:p-12 border border-gray-50 animate-in fade-in duration-500 overflow-y-auto lg:overflow-hidden pb-40 lg:pb-0">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
              <h2 className="text-3xl font-black tracking-tighter italic uppercase text-center w-full md:w-auto">Feeding <span className="text-[#e91e63]">Schedule</span></h2>
              <button className="w-full md:w-auto bg-[#1d1d1d] text-white px-8 py-4 rounded-2xl font-black text-[10px] tracking-widest uppercase">+ Add Schedule</button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <ScheduleCard time="07:00 AM" portion="25g" repeat="Everyday" />
              <ScheduleCard time="06:00 PM" portion="50g" repeat="Everyday" />
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="flex-1 w-full max-w-4xl mx-auto bg-white rounded-[32px] lg:rounded-[40px] p-8 lg:p-12 border border-gray-50 animate-in fade-in duration-500 overflow-y-auto lg:overflow-hidden pb-40 lg:pb-0">
            <h2 className="text-3xl font-black tracking-tighter mb-10 italic uppercase">Device <span className="text-[#e91e63]">Settings</span></h2>
            <div className="space-y-4">
              <SettingOption label="Device Name" val="Petsafe-Smart-V1" icon={<Smartphone size={18}/>} />
              <SettingOption label="Network" val="Connected to Wi-Fi" icon={<Wifi size={18}/>} />
              <SettingOption label="Access" val="Admin Access" icon={<ShieldCheck size={18}/>} />
              <button className="w-full mt-6 p-6 rounded-[24px] bg-red-50 text-red-600 font-black text-[10px] tracking-[0.3em] uppercase transition-all">Reset Factory Settings</button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="h-screen w-full bg-[#fafafa] text-[#1d1d1d] flex flex-col overflow-hidden p-4 lg:p-8">
      {/* HEADER - Tetap diam di atas */}
      <header className="flex justify-between items-center mb-6 lg:mb-8 px-2 lg:px-4 shrink-0">
        <div className="flex items-center gap-4">
          <div className="bg-[#e91e63] p-3 rounded-2xl text-white shadow-xl shadow-pink-100"><Power size={22} /></div>
          <div>
            <h1 className="text-xl lg:text-2xl font-black tracking-tighter italic leading-none uppercase">Petsafe <span className="text-[#e91e63]">System</span></h1>
            <p className="text-gray-400 text-[9px] font-black uppercase tracking-[0.2em] mt-1 italic leading-none">{activeTab}</p>
          </div>
        </div>
        <button className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 text-gray-400 hover:text-[#e91e63] transition-all active:scale-90"><Bell size={18} /></button>
      </header>

      {/* AREA KONTEN - Ini yang kescroll */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {renderContent()}
      </div>

      {/* NAVIGASI BAWAH - Tetap diam di bawah */}
      <nav className="fixed bottom-6 left-4 right-4 lg:left-0 lg:right-0 flex justify-center z-50">
        <div className="bg-white/90 backdrop-blur-md w-full max-w-sm lg:max-w-3xl px-6 lg:px-10 py-4 rounded-full shadow-2xl border border-gray-100 flex justify-between lg:justify-center gap-4 lg:gap-16 items-center">
          <NavBtn icon={<Home size={18}/>} label="Home" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
          <NavBtn icon={<BrainCircuit size={18}/>} label="Stats" active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} />
          <NavBtn icon={<Scale size={18}/>} label="Feeder" active={activeTab === 'feeder'} onClick={() => setActiveTab('feeder')} />
          <NavBtn icon={<Settings size={18}/>} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
        </div>
      </nav>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function LogItem({ time, amount }: any) {
  return (
    <div className="flex justify-between items-center p-5 bg-gray-50 rounded-[24px] border border-gray-100/30">
      <div className="flex flex-col"><span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">{time}</span><span className="text-sm font-extrabold">{amount}</span></div>
      <div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_#4ade80]"></div>
    </div>
  );
}

function StatHighlight({ label, val }: any) {
  return (
    <div className="p-6 bg-gray-50 rounded-[32px] border border-gray-100 flex flex-col justify-center text-center lg:text-left">
      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-2xl font-black text-[#1d1d1d]">{val}</p>
    </div>
  );
}

function ScheduleCard({ time, portion, repeat }: any) {
  return (
    <div className="p-8 bg-gray-50 rounded-[35px] border border-gray-100 flex justify-between items-center group hover:bg-white transition-all">
      <div>
        <p className="text-2xl lg:text-3xl font-black leading-none italic uppercase">{time}</p>
        <p className="text-[10px] font-bold text-gray-400 uppercase mt-2 tracking-widest">{repeat}</p>
      </div>
      <div className="text-right">
        <p className="text-xl font-black text-[#e91e63]">{portion}</p>
        <button className="mt-2 text-gray-200 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
      </div>
    </div>
  );
}

function SettingOption({ label, val, icon }: any) {
  return (
    <div className="w-full flex justify-between items-center p-6 bg-gray-50 rounded-[30px] border border-gray-100/50 group cursor-pointer hover:bg-white hover:shadow-xl transition-all duration-300">
      <div className="flex items-center gap-5">
        <div className="p-4 bg-white rounded-2xl text-gray-400 group-hover:text-[#e91e63] transition-colors shadow-sm">{icon}</div>
        <div>
          <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em]">{label}</p>
          <p className="font-extrabold text-lg text-[#1d1d1d]">{val}</p>
        </div>
      </div>
      <ChevronRight size={20} className="text-gray-200 group-hover:translate-x-1 transition-transform" />
    </div>
  );
}

function NavBtn({ icon, label, active, onClick }: any) {
  return (
    <button 
      onClick={onClick} 
      className={`flex flex-col lg:flex-row items-center gap-1 lg:gap-2 font-black text-[7px] lg:text-[10px] uppercase tracking-[0.1em] lg:tracking-[0.2em] transition-all duration-300 ${active ? 'text-[#e91e63] scale-105' : 'text-gray-300'}`}
    >
      {icon} <span className="mt-1 lg:mt-0 leading-none">{label}</span>
    </button>
  );
}