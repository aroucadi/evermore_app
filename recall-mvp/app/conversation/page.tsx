'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ActiveConversationPage() {
  const [isListening, setIsListening] = useState(false);
  const [showWaves, setShowWaves] = useState(false);
  const [transcript, setTranscript] = useState<string[]>([]);

  useEffect(() => {
    // Initial greeting
    const timer = setTimeout(() => {
      setTranscript(['Hello Arthur, it\'s great to speak with you again. I was hoping you could tell me more about that summer trip to the lake house you mentioned?']);
      setIsListening(true);
      setShowWaves(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const toggleListening = () => {
    setIsListening(!isListening);
    setShowWaves(!showWaves);
  };

  return (
    <div className="bg-[#2A2320] font-sans text-orange-50 min-h-screen relative overflow-hidden flex flex-col">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-500/10 rounded-full blur-[100px] transition-all duration-1000 ${isListening ? 'scale-110 opacity-70' : 'scale-100 opacity-40'}`}></div>
      </div>

      <header className="relative z-10 px-6 py-6 flex items-center justify-between">
        <Link href="/dashboard" className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors">
          <span className="material-symbols-outlined text-white/70">close</span>
        </Link>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20">
          <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
          <span className="text-xs font-bold text-orange-500 tracking-wide uppercase">Recording</span>
        </div>
        <button className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors">
          <span className="material-symbols-outlined text-white/70">more_horiz</span>
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center relative z-10 w-full max-w-lg mx-auto px-6">
        {/* Visualizer Area */}
        <div className="flex-1 w-full flex items-center justify-center min-h-[300px]">
          {showWaves ? (
             <div className="flex items-center gap-1.5 h-24">
               {[...Array(8)].map((_, i) => (
                  <div key={i} className={`w-3 rounded-full bg-gradient-to-t from-[#FF845E] to-[#FF9A7B] ${
                    i % 3 === 0 ? 'animate-wave-slow' : i % 2 === 0 ? 'animate-wave-fast' : 'animate-wave-medium'
                  }`}></div>
               ))}
             </div>
          ) : (
             <div className="w-40 h-40 rounded-full bg-white/5 border border-white/5 flex items-center justify-center">
                <span className="material-symbols-outlined text-5xl text-white/20">graphic_eq</span>
             </div>
          )}
        </div>

        {/* Live Transcript / Prompts */}
        <div className="w-full mb-12 space-y-6">
           <div className="space-y-4">
              {transcript.map((text, i) => (
                 <div key={i} className="text-2xl md:text-3xl font-medium text-center text-white/90 leading-relaxed animate-fade-in">
                    "{text}"
                 </div>
              ))}
              {transcript.length === 0 && (
                 <div className="text-center text-white/40 text-lg">Initializing conversation...</div>
              )}
           </div>
        </div>

        {/* Controls */}
        <div className="w-full flex items-center justify-between gap-6 pb-12">
           <button className="flex-1 h-16 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center gap-2 transition-all active:scale-[0.98]">
              <span className="material-symbols-outlined text-white/60">keyboard</span>
              <span className="font-semibold text-white/60">Type</span>
           </button>

           <button
              onClick={toggleListening}
              className={`h-24 w-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl ${
                 isListening
                 ? 'bg-red-500/20 text-red-500 border border-red-500/50 scale-100'
                 : 'bg-[#FF845E] text-white scale-100 hover:scale-105 shadow-[#FF845E]/40'
              }`}
           >
              <span className={`material-symbols-outlined text-4xl transition-transform duration-300 ${isListening ? '' : 'filled'}`}>
                 {isListening ? 'stop' : 'mic'}
              </span>
           </button>

           <button className="flex-1 h-16 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center gap-2 transition-all active:scale-[0.98]">
              <span className="material-symbols-outlined text-white/60">photo_camera</span>
              <span className="font-semibold text-white/60">Show</span>
           </button>
        </div>
      </main>
    </div>
  );
}
