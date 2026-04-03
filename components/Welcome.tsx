"use client";
import React, { useState } from 'react';

export default function WelcomeScreen({ onStart }: { onStart: () => void }) {
  const [isExiting, setIsExiting] = useState(false);

  const handleStart = () => {
    setIsExiting(true);
    setTimeout(onStart, 800);
  };

  return (
    <div className={`h-screen w-full bg-[#e91e63] flex flex-col items-center justify-center p-6 text-white transition-all duration-1000 ease-in-out ${isExiting ? 'opacity-0 scale-125 blur-2xl' : 'opacity-100 scale-100'}`}>
      <div className="relative flex flex-col items-center">
        <div className="w-32 h-32 mb-10 bg-white/10 backdrop-blur-xl rounded-[40px] flex items-center justify-center border border-white/30 shadow-2xl rotate-12">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-16 h-16 -rotate-12">
            <path d="M9 14c-1.1 0-2 .9-2 2a4 4 0 0 0 4 4 4 4 0 0 0 4-4c0-1.1-.9-2-2-2z" strokeLinecap="round"/><circle cx="11" cy="4" r="2"/><circle cx="18" cy="8" r="2"/><circle cx="20" cy="16" r="2"/><circle cx="9" cy="10" r="2"/>
          </svg>
        </div>
        <h1 className="text-6xl font-black tracking-tighter mb-3 italic">Petsafe</h1>
        <p className="text-xl font-medium mb-20 text-white/60 tracking-tight italic">Smart Pet Feeder System</p>
        <button 
          onClick={handleStart}
          className="bg-white text-[#e91e63] font-extrabold text-xl px-20 py-5 rounded-full shadow-2xl active:scale-90 hover:scale-105 transition-all duration-300 uppercase tracking-widest"
        >
          Let's Care
        </button>
      </div>
    </div>
  );
}