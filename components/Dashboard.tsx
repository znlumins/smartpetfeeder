"use client";
import React, { useState } from 'react';
import { Power, PlusCircle, Wifi, BrainCircuit, Scale, Home, Settings, Clock, Bell, ChevronRight, Smartphone, Trash2, ShieldCheck } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';

const dataStats = [
  { day: 'Mon', amount: 120 },
  { day: 'Tue', amount: 150 },
  { day: 'Wed', amount: 180 },
  { day: 'Thu', amount: 140 },
  { day: 'Fri', amount: 200 },
  { day: 'Sat', amount: 170 },
  { day: 'Sun', amount: 160 },
];

export default function DashboardScreen() {
  const [activeTab, setActiveTab] = useState<'home' | 'stats' | 'feeder' | 'settings'>('home');
  const [foodLevel] = useState(75);
  const [bowlWeight] = useState(45);
  const [isOnline] = useState(true);
  const [porsi, setPorsi] = useState(25);

  const renderContent = () => {
    // Wrapper standar untuk semua tab agar scroll maksimal
    const tabWrapperClass = "flex-1 w-full max-w-6xl mx-auto overflow-y-auto custom-scrollbar pb-44 px-2 pt-2 animate-in fade-in duration-500";

    switch (activeTab) {
      case 'home':
        return (
          <div className={tabWrapperClass}>
            <div className="flex flex-col lg:flex-row gap-6">
              {/* MONITORING */}
              <div className="flex-[1.5] w-full bg-white rounded-[40px] shadow-sm border border-gray-50 flex flex-col items-center justify-center p-8 lg:p-12 min-h-[450px]">
                <p className="text-gray-400 font-black uppercase tracking-[0.3em] text-[10px] mb-8 uppercase text-center">Food Storage Level</p>
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
                <div className="mt-10 grid grid-cols-2 gap-4 w-full max-w-md">
                  <div className="p-5 bg-gray-50 rounded-[24px] border border-gray-100/50 text-center">
                    <p className="text-[9px] font-black text-gray-400 uppercase mb-1">Bowl Weight</p>
                    <p className="text-xl lg:text-2xl font-black">{bowlWeight}g</p>
                  </div>
                  <div className="p-5 bg-gray-50 rounded-[24px] border border-gray-100/50 text-center">
                    <p className="text-[9px] font-black text-gray-400 uppercase mb-1">IR Sensor</p>
                    <p className="text-lg font-black text-green-500 uppercase italic">Clear</p>
                  </div>
                </div>
              </div>

              {/* CONTROLS & LOGS */}
              <div className="flex-1 flex flex-col gap-6">
                <section className="bg-[#1d1d1d] p-8 rounded-[40px] text-white shadow-2xl">
                  <div className="flex justify-between items-center mb-6">
                     <h3 className="font-black text-[10px] uppercase tracking-widest text-gray-500 uppercase">Remote Control</h3>
                     <span className="text-[#e91e63] font-black text-xl">{porsi}g</span>
                  </div>
                  <input type="range" min="10" max="200" step="10" value={porsi} onChange={(e) => setPorsi(parseInt(e.target.value))} className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#e91e63] mb-8" />
                  <button className="w-full bg-[#e91e63] text-white font-black py-5 rounded-[20px] active:scale-95 transition-all flex items-center justify-center gap-3 tracking-widest text-[10px] uppercase shadow-lg shadow-pink-900/20"><Power size={18} /> Feed Now</button>
                </section>
                <section className="bg-white p-8 rounded-[40px] border border-gray-50 shadow-sm">
                  <h3 className="font-black text-[10px] uppercase tracking-widest text-gray-400 mb-6 uppercase">Recent Logs</h3>
                  <div className="space-y-3">
                    <LogItem time="07:00 AM" amount="25g" />
                    <LogItem time="Yesterday, 18:00" amount="50g" />
                    <LogItem time="Yesterday, 12:00" amount="20g" />
                  </div>
                </section>
              </div>
            </div>
          </div>
        );

      case 'stats':
        return (
          <div className={tabWrapperClass}>
            <div className="bg-white rounded-[40px] p-8 lg:p-12 border border-gray-50 min-h-full">
              <h2 className="text-3xl font-black tracking-tighter mb-8 italic uppercase">Feeding <span className="text-[#e91e63]">Analysis</span></h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-gray-50 rounded-[40px] p-6 lg:p-8 border border-gray-100 min-h-[350px]">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-8 text-center lg:text-left">Weekly Consumption (gram)</p>
                  <div className="h-64 lg:h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dataStats}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 10, fontWeight: 900}} dy={10} />
                        <YAxis hide />
                        <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                        <Bar dataKey="amount" radius={[10, 10, 10, 10]} barSize={35}>
                          {dataStats.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index === 4 ? '#e91e63' : '#ffd1dc'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="flex flex-col gap-4">
                  <div className="p-8 bg-pink-50 rounded-[40px] border border-pink-100">
                    <p className="text-[9px] font-black text-[#e91e63] uppercase tracking-widest mb-1">Total This Week</p>
                    <p className="text-4xl font-black text-[#e91e63]">1,120<span className="text-sm ml-1 uppercase">g</span></p>
                  </div>
                  <StatHighlight label="Average" val="35g" />
                  <StatHighlight label="Stability" val="98%" />
                </div>
              </div>
            </div>
          </div>
        );

      case 'feeder':
        return (
          <div className={tabWrapperClass}>
            <div className="bg-white rounded-[40px] p-8 lg:p-12 border border-gray-50 min-h-full">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                <h2 className="text-3xl font-black tracking-tighter italic uppercase">Feeding <span className="text-[#e91e63]">Schedule</span></h2>
                <button className="w-full md:w-auto bg-[#1d1d1d] text-white px-8 py-4 rounded-2xl font-black text-[10px] tracking-widest uppercase shadow-xl">+ Add Schedule</button>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <ScheduleCard time="07:00 AM" portion="25g" repeat="Everyday" />
                <ScheduleCard time="12:00 PM" portion="35g" repeat="Mon, Wed, Fri" />
                <ScheduleCard time="06:00 PM" portion="50g" repeat="Everyday" />
                <ScheduleCard time="10:00 PM" portion="15g" repeat="Sat, Sun" />
              </div>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className={tabWrapperClass}>
            <div className="bg-white rounded-[40px] p-8 lg:p-12 border border-gray-50 min-h-full max-w-4xl mx-auto">
              <h2 className="text-3xl font-black tracking-tighter mb-10 italic uppercase">Device <span className="text-[#e91e63]">Settings</span></h2>
              <div className="space-y-4">
                <SettingOption label="Device Name" val="Petsafe-Smart-V1" icon={<Smartphone size={18}/>} />
                <SettingOption label="Network" val="Wi-Fi Connected" icon={<Wifi size={18}/>} />
                <SettingOption label="Access" val="Admin Access" icon={<ShieldCheck size={18}/>} />
                <button className="w-full mt-6 p-6 rounded-[30px] bg-red-50 text-red-600 font-black text-[10px] tracking-[0.3em] uppercase transition-all hover:bg-red-100 border border-red-100/50">Reset Factory Settings</button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="h-screen w-full bg-[#fafafa] text-[#1d1d1d] flex flex-col overflow-hidden p-4 lg:p-8">
      {/* HEADER - Fixed at Top */}
      <header className="flex justify-between items-center mb-6 lg:mb-8 px-2 lg:px-4 shrink-0">
        <div className="flex items-center gap-4">
          <div className="bg-[#e91e63] p-3 rounded-2xl text-white shadow-xl shadow-pink-100"><Power size={22} /></div>
          <div>
            <h1 className="text-xl lg:text-2xl font-black tracking-tighter italic leading-none uppercase">Petsafe <span className="text-[#e91e63]">System</span></h1>
            <p className="text-gray-400 text-[9px] font-black uppercase tracking-[0.2em] mt-1 italic leading-none">{activeTab}</p>
          </div>
        </div>
        <button className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 text-gray-400 hover:text-[#e91e63] transition-all"><Bell size={18} /></button>
      </header>

      {/* DYNAMIC AREA - This scrolls properly now */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {renderContent()}
      </div>

      {/* NAV BAR - Fixed at Bottom */}
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

// Sub-components
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
    <div className="p-6 bg-gray-50 rounded-[32px] border border-gray-100 flex flex-col justify-center">
      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-2xl font-black text-[#1d1d1d]">{val}</p>
    </div>
  );
}

function ScheduleCard({ time, portion, repeat }: any) {
  return (
    <div className="p-8 bg-gray-50 rounded-[35px] border border-gray-100 flex justify-between items-center group hover:bg-white transition-all shadow-sm">
      <div><p className="text-2xl lg:text-3xl font-black italic uppercase leading-none">{time}</p><p className="text-[10px] font-bold text-gray-400 uppercase mt-2 tracking-widest">{repeat}</p></div>
      <div className="text-right"><p className="text-xl font-black text-[#e91e63]">{portion}</p><button className="mt-2 text-gray-200 hover:text-red-500 transition-colors"><Trash2 size={16}/></button></div>
    </div>
  );
}

function SettingOption({ label, val, icon }: any) {
  return (
    <div className="w-full flex justify-between items-center p-6 bg-gray-50 rounded-[30px] border border-gray-100/50 group hover:bg-white hover:shadow-xl transition-all duration-300">
      <div className="flex items-center gap-5"><div className="p-4 bg-white rounded-2xl text-gray-400 group-hover:text-[#e91e63] transition-colors shadow-sm">{icon}</div><div><p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em]">{label}</p><p className="font-extrabold text-lg text-[#1d1d1d]">{val}</p></div></div>
      <ChevronRight size={20} className="text-gray-200 group-hover:translate-x-1 transition-transform" />
    </div>
  );
}

function NavBtn({ icon, label, active, onClick }: any) {
  return (
    <button onClick={onClick} className={`flex flex-col lg:flex-row items-center gap-1 lg:gap-2 font-black text-[7px] lg:text-[10px] uppercase tracking-[0.1em] lg:tracking-[0.2em] transition-all duration-300 ${active ? 'text-[#e91e63] scale-105' : 'text-gray-300'}`}>
      {icon} <span className="mt-1 lg:mt-0 leading-none">{label}</span>
    </button>
  );
}