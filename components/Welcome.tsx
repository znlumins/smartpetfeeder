"use client";
import React, { useState } from 'react';

export default function WelcomeScreen({ onStart }: { onStart: () => void }) {
  const [isExiting, setIsExiting] = useState(false);

  const handleStart = () => {
    setIsExiting(true);
    // Durasi timeout disamakan dengan durasi transisi CSS (800ms)
    setTimeout(onStart, 800);
  };

  return (
    <div 
      className={`h-screen w-full bg-[#e91e63] flex flex-col items-center justify-center p-6 text-white transition-all duration-1000 ease-in-out ${
        isExiting ? 'opacity-0 scale-125 blur-2xl' : 'opacity-100 scale-100'
      }`}
    >
      <div className="relative flex flex-col items-center max-w-sm w-full">
        
        {/* CONTAINER LOGO - Dibuat besar dan fleksibel */}
        <div className="w-full h-72 mb-8 flex items-center justify-center">
          <img 
            src="/gambarlogo.png" 
            alt="Logo Petsafe" 
            // object-contain menjaga proporsi asli gambar agar tidak gepeng
            // drop-shadow memberikan dimensi agar logo "keluar" dari background
            className="w-full h-full object-contain filter drop-shadow-2xl transition-transform duration-500 hover:scale-105" 
          />
        </div>

        {/* TEXT CONTENT */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-black tracking-tighter mb-2 italic drop-shadow-md">
            Petsafe
          </h1>
          <p className="text-xl font-medium text-white/70 tracking-tight italic">
            Smart Pet Feeder System
          </p>
        </div>
        
        {/* BUTTON ACTION */}
        <button 
          onClick={handleStart}
          className="group relative bg-white text-[#e91e63] font-extrabold text-xl px-16 py-5 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.2)] active:scale-95 hover:shadow-white/20 transition-all duration-300 uppercase tracking-[0.2em]"
        >
          <span className="relative z-10">Let's Care</span>
          {/* Efek kilau tipis saat di-hover */}
          <div className="absolute inset-0 bg-pink-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </button>

      </div>
    </div>
  );
}