'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function ChapterDetailPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [progressPercent, setProgressPercent] = useState(30);

  const toggleSpeed = () => {
    if (playbackSpeed === 1.0) setPlaybackSpeed(1.5);
    else if (playbackSpeed === 1.5) setPlaybackSpeed(2.0);
    else setPlaybackSpeed(1.0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProgressPercent(Number(e.target.value));
  };

  // Mock waveform data
  const waveformHeights = [40, 60, 30, 80, 50, 70, 40, 90, 60, 30, 50, 80, 40, 60, 70, 40, 30, 50, 80, 60, 40, 70, 50, 30, 60, 40, 80, 50, 40, 30];

  return (
    <div className="bg-[#1C1917] font-sans text-orange-50 min-h-screen pb-32">
      {/* Background Texture */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/paper.png')" }}></div>

      <div className="max-w-3xl mx-auto min-h-screen bg-[#1C1917] shadow-2xl relative">

        {/* Navigation */}
        <nav className="sticky top-0 z-40 backdrop-blur-md bg-[#1C1917]/80 border-b border-white/5 px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/5 text-white/70 transition-colors -ml-2">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <div className="flex gap-4">
             <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/5 text-white/70 transition-colors">
                <span className="material-symbols-outlined">text_fields</span>
             </button>
             <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/5 text-white/70 transition-colors">
                <span className="material-symbols-outlined">share</span>
             </button>
          </div>
        </nav>

        {/* Hero Header */}
        <header className="px-8 pt-10 pb-6 relative overflow-hidden">
           {/* Decorative Elements */}
           <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#D97757]/20 to-transparent rounded-bl-full blur-3xl pointer-events-none"></div>

           <div className="relative z-10">
              <span className="inline-block px-3 py-1 rounded-full bg-[#D97757]/10 border border-[#D97757]/20 text-[#D97757] text-xs font-bold tracking-wider uppercase mb-4">
                Chapter 3
              </span>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-[1.15] font-serif">
                The Summer of '65
              </h1>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                   <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                   <span>Oct 25, 2023</span>
                </div>
                <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                <div className="flex items-center gap-2">
                   <span className="material-symbols-outlined text-[18px]">timer</span>
                   <span>14 min read</span>
                </div>
              </div>
           </div>
        </header>

        {/* Main Content */}
        <main className="px-8 relative z-10">

          {/* Audio Player Card */}
          <section className="my-8 p-1 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 shadow-xl overflow-hidden">
            <div className="bg-[#2A2320] rounded-[1.4rem] p-5">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#D97757] flex items-center justify-center text-white shadow-lg shadow-[#D97757]/20">
                     <span className="material-symbols-outlined filled">mic</span>
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-base">Original Recording</h3>
                    <p className="text-gray-400 text-xs">Arthur • 4:20</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                     <span className="text-xs font-bold text-[#D97757] bg-[#D97757]/10 px-2.5 py-1.5 rounded-lg border border-[#D97757]/20 tabular-nums transition-all">
                      {playbackSpeed.toFixed(1)}x
                    </span>
                    <button
                      onClick={toggleSpeed}
                      className="group/speed h-10 w-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all"
                      title="Change playback speed"
                    >
                      <span className="material-symbols-outlined text-[20px] group-hover/speed:rotate-180 transition-transform duration-500">settings_motion</span>
                    </button>
                  </div>

                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="flex shrink-0 items-center justify-center rounded-full size-16 bg-gradient-to-br from-[#D97757] to-[#C05632] text-white shadow-xl shadow-[#D97757]/30 hover:scale-105 active:scale-95 transition-all ring-4 ring-white/5"
                  >
                    <span className={`material-symbols-outlined filled text-[32px] ml-0.5 ${isPlaying ? '' : 'ml-1'}`}>
                      {isPlaying ? 'pause' : 'play_arrow'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Seek Bar / Waveform Section */}
              <div className="relative z-10 px-1 pb-2 h-12 flex items-center group/slider">
                {/* Waveform Visualization */}
                <div className="absolute inset-0 flex items-center justify-between gap-[3px] pointer-events-none px-1">
                  {waveformHeights.map((height, i) => {
                     const barPercent = (i / waveformHeights.length) * 100;
                     const isPlayed = barPercent <= progressPercent;
                     return (
                        <div
                          key={i}
                          className={`w-1.5 rounded-full transition-all duration-200 ${isPlayed ? 'bg-[#D97757]' : 'bg-white/10'}`}
                          style={{ height: `${height}%` }}
                        ></div>
                     );
                  })}
                </div>

                {/* Invisible Range Input for Interaction */}
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="0.1"
                  value={progressPercent}
                  onChange={handleSeek}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                  aria-label="Seek audio"
                />

                {/* Scrubber Handle */}
                 <div
                    className="absolute h-full w-0.5 bg-white/0 z-10 pointer-events-none transition-all duration-75"
                    style={{ left: `${progressPercent}%` }}
                 >
                    <div className="absolute top-1/2 -translate-y-1/2 -left-3 w-6 h-6 bg-white rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.3)] scale-0 group-hover/slider:scale-100 transition-transform flex items-center justify-center">
                        <div className="w-2 h-2 bg-[#D97757] rounded-full"></div>
                    </div>
                 </div>
              </div>
            </div>
          </section>

          <article className="mt-4 mb-6 relative">
            <div className="absolute left-0 top-3 bottom-3 w-0.5 bg-gradient-to-b from-transparent via-[#D97757]/20 to-transparent rounded-full hidden md:block"></div>
            <div className="md:pl-8">
              <p className="text-2xl leading-[1.7] text-gray-200 mb-8 font-serif">
                It started on a Tuesday, the kind of Tuesday where the sun feels like it's trying to make up for a whole week of rain. We packed the station wagon until it was bursting at the seams.
              </p>
              <div className="relative my-10 p-8 rounded-2xl bg-white/5 border border-white/5 shadow-sm overflow-hidden">
                <div className="absolute -left-4 -top-4 text-[8rem] text-[#D97757]/10 font-serif leading-none select-none">“</div>
                <p className="relative z-10 text-[1.6rem] leading-relaxed text-white italic font-serif font-medium text-center">
                  If we fit one more suitcase in here, the wheels are gonna pop off!
                </p>
              </div>
              <p className="text-2xl leading-[1.7] text-gray-200 mb-8 font-serif">
                 Dad shouted from the driveway, wiping sweat from his forehead. We all laughed, but I think he was half serious. The drive up to the lake was winding, filled with the smell of pine needles and anticipation.
              </p>
              <p className="text-2xl leading-[1.7] text-gray-200 mb-8 font-serif">
                That summer was different. It was the year I learned to fish, really fish, not just hold the pole. It was also the year everything felt... simpler. The water was crystal clear, cold enough to take your breath away, but we jumped in anyway. We spent hours skipping stones near the dock, counting ripples until the sun dipped below the pines.
              </p>
              <p className="text-2xl leading-[1.7] text-gray-200 font-serif">
                Grandma Rose would sit on the porch swing, snapping beans and humming that old tune she loved. Even now, if I close my eyes, I can still hear the creak of the swing chains and the distant splash of a trout jumping.
              </p>
            </div>
          </article>

          <section className="py-8 border-t border-white/10">
            <h2 className="text-sm font-bold uppercase tracking-widest text-[#D97757]/70 mb-5 pl-1">Mentioned in this story</h2>
            <div className="flex flex-wrap gap-3">
              <button className="group flex items-center gap-3 pl-2 pr-5 py-2 rounded-full bg-white/5 border border-white/10 hover:border-[#D97757]/40 hover:bg-white/10 hover:shadow-md transition-all">
                <div className="size-10 rounded-full bg-[#D97757]/10 flex items-center justify-center text-[#D97757] group-hover:bg-[#D97757] group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-xl filled">person</span>
                </div>
                <span className="text-lg font-medium text-gray-200 font-display">Grandma Rose</span>
              </button>
              <button className="group flex items-center gap-3 pl-2 pr-5 py-2 rounded-full bg-white/5 border border-white/10 hover:border-[#D97757]/40 hover:bg-white/10 hover:shadow-md transition-all">
                <div className="size-10 rounded-full bg-[#D97757]/10 flex items-center justify-center text-[#D97757] group-hover:bg-[#D97757] group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-xl filled">location_on</span>
                </div>
                <span className="text-lg font-medium text-gray-200 font-display">Lake Tahoe</span>
              </button>
              <button className="group flex items-center gap-3 pl-2 pr-5 py-2 rounded-full bg-white/5 border border-white/10 hover:border-[#D97757]/40 hover:bg-white/10 hover:shadow-md transition-all">
                <div className="size-10 rounded-full bg-[#D97757]/10 flex items-center justify-center text-[#D97757] group-hover:bg-[#D97757] group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-xl filled">phishing</span>
                </div>
                <span className="text-lg font-medium text-gray-200 font-display">Fishing</span>
              </button>
              <button className="group flex items-center gap-3 pl-2 pr-5 py-2 rounded-full bg-white/5 border border-white/10 hover:border-[#D97757]/40 hover:bg-white/10 hover:shadow-md transition-all">
                <div className="size-10 rounded-full bg-[#D97757]/10 flex items-center justify-center text-[#D97757] group-hover:bg-[#D97757] group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-xl filled">directions_car</span>
                </div>
                <span className="text-lg font-medium text-gray-200 font-display">Road Trip</span>
              </button>
            </div>
          </section>
        </main>

        <div className="fixed bottom-0 inset-x-0 p-6 pb-8 bg-gradient-to-t from-[#262321] via-[#262321]/95 to-transparent z-50 pointer-events-none">
          <div className="pointer-events-auto max-w-3xl mx-auto flex gap-4 p-2.5 rounded-[1.2rem] bg-white/10 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
            <button className="flex-1 flex items-center justify-center gap-2 h-16 rounded-xl hover:bg-white/10 text-white font-bold transition-all active:scale-[0.98]">
              <span className="material-symbols-outlined">download</span>
              <span className="text-lg">PDF</span>
            </button>
            <button className="flex-[2] flex items-center justify-center gap-3 h-16 rounded-xl bg-[#D97757] text-white font-bold hover:bg-[#C05632] active:scale-[0.98] transition-all shadow-lg shadow-[#D97757]/30 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="material-symbols-outlined text-[24px]">ios_share</span>
              <span className="text-lg tracking-wide">Share Story</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
