"use client";
import { useState } from 'react';
import WelcomeScreen from '../components/Welcome';
import DashboardScreen from '../components/Dashboard';

export default function Home() {
  const [currentPage, setCurrentPage] = useState<'welcome' | 'dashboard'>('welcome');

  return (
    <main className="bg-white h-screen w-full overflow-hidden relative">
      {currentPage === 'welcome' ? (
        <WelcomeScreen onStart={() => setCurrentPage('dashboard')} />
      ) : (
        <DashboardScreen />
      )}
    </main>
  );
}