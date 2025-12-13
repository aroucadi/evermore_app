'use client';

import React from 'react';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="bg-[#261E1C] font-sans text-orange-50 antialiased min-h-screen">
      {/* Background Blobs */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[40%] rounded-full bg-orange-900/20 blur-[80px]"></div>
        <div className="absolute bottom-[20%] right-[-5%] w-[50%] h-[50%] rounded-full bg-red-900/10 blur-[90px]"></div>
      </div>

      <div className="relative flex h-full min-h-screen w-full flex-col overflow-hidden max-w-md mx-auto shadow-2xl bg-[#261E1C]/80 backdrop-blur-sm border-x border-white/5">
        <header className="sticky top-0 z-30 flex items-center justify-between p-6 pb-4 bg-[#261E1C]/90 backdrop-blur-md">
          <div className="flex flex-col">
            <span className="text-[#FF845E] font-bold text-sm tracking-wide uppercase mb-1">Oct 26, Tuesday</span>
            <h2 className="text-3xl font-bold leading-tight tracking-tight text-white">Good Morning,<br/>Arthur</h2>
          </div>
          <button aria-label="Settings" className="backdrop-blur-xl flex items-center justify-center w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 transition-all shadow-sm text-orange-50">
            <span className="material-symbols-outlined" style={{fontSize: 28}}>settings</span>
          </button>
        </header>

        <main className="flex-1 flex flex-col px-6 pt-2 pb-28 relative z-10">
          <div className="flex-1 flex flex-col items-center justify-center min-h-[380px] relative py-8">
            <h1 className="relative z-10 text-3xl md:text-4xl font-bold text-center mb-12 text-white tracking-tight leading-tight drop-shadow-sm">
              Ready to share<br/>a story?
            </h1>

            <div className="relative group z-10 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-[#FF845E]/20 pulse-bg-warm blur-xl transform scale-125"></div>
              <div className="absolute inset-0 rounded-full bg-[#FF845E]/10 animate-ping opacity-20 duration-[3s]"></div>
              <div className="absolute -inset-4 rounded-full bg-white/5 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.05)]"></div>
              <Link
                href="/conversation"
                className="relative flex items-center justify-center w-36 h-36 md:w-44 md:h-44 rounded-full bg-[linear-gradient(135deg,#FF9A7B_0%,#FF845E_100%)] shadow-[0_0_60px_-15px_rgba(255,132,94,0.5)] hover:scale-105 active:scale-95 transition-all duration-300 ease-out focus:outline-none focus:ring-4 focus:ring-[#FF845E]/30 group"
              >
                <div className="absolute top-0 left-0 w-full h-full rounded-full bg-gradient-to-b from-white/20 to-transparent opacity-50 pointer-events-none"></div>
                <span className="material-symbols-outlined text-white drop-shadow-md filled" style={{fontSize: 64}}>mic</span>
              </Link>
            </div>

            <div className="mt-10 text-center z-10">
              <p className="text-lg font-medium text-slate-300 bg-black/20 px-6 py-2 rounded-full backdrop-blur-sm inline-block">Tap to start conversation</p>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-4 z-10">
            <div className="flex items-center justify-between mb-1 px-1">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-[#FF845E]">history_edu</span>
                Previous Memories
              </h3>
              <Link href="/family" className="text-[#FF845E] font-bold text-sm hover:text-[#E56A45] hover:bg-[#FF845E]/10 px-3 py-1.5 rounded-full transition-colors">View All</Link>
            </div>

            <div className="flex flex-col gap-3">
              {/* Card 1 */}
              <Link href="/chapter/1" className="backdrop-blur-xl group flex items-center p-4 bg-[#362C29]/40 rounded-2xl shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] border border-white/5 cursor-pointer hover:bg-[#362C29]/60 transition-all hover:translate-x-1">
                <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-orange-900/30 text-orange-300 shrink-0 mr-4 shadow-inner">
                  <span className="material-symbols-outlined" style={{fontSize: 28}}>auto_stories</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-lg font-bold text-white truncate">The Summer of '65</h4>
                  <p className="text-sm font-medium text-slate-400">Yesterday • 14 mins</p>
                </div>
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/5 text-slate-400 group-hover:text-[#FF845E] transition-colors">
                  <span className="material-symbols-outlined">play_circle</span>
                </div>
              </Link>

              {/* Card 2 */}
              <Link href="/chapter/2" className="backdrop-blur-xl group flex items-center p-4 bg-[#362C29]/40 rounded-2xl shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] border border-white/5 cursor-pointer hover:bg-[#362C29]/60 transition-all hover:translate-x-1">
                <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-rose-900/30 text-rose-300 shrink-0 mr-4 shadow-inner">
                  <span className="material-symbols-outlined" style={{fontSize: 28}}>family_star</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-lg font-bold text-white truncate">Meeting Martha</h4>
                  <p className="text-sm font-medium text-slate-400">Oct 24 • 22 mins</p>
                </div>
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/5 text-slate-400 group-hover:text-[#FF845E] transition-colors">
                  <span className="material-symbols-outlined">play_circle</span>
                </div>
              </Link>
            </div>
          </div>
        </main>

        <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#261E1C]/95 backdrop-blur-xl border-t border-white/10 px-6 pb-6 pt-4 z-40 flex justify-around items-center shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.05)]">
          <Link href="/dashboard" className="flex flex-col items-center gap-1.5 group w-20">
            <div className="flex items-center justify-center w-14 h-9 rounded-full bg-[#FF845E]/10 text-[#FF845E] transition-colors relative overflow-hidden">
              <div className="absolute inset-0 bg-[#FF845E]/10 blur-md"></div>
              <span className="material-symbols-outlined text-[26px] font-bold relative z-10 filled">chat_bubble</span>
            </div>
            <span className="text-xs font-bold text-white">Chat</span>
          </Link>
          <button className="flex flex-col items-center gap-1.5 group w-20">
            <div className="flex items-center justify-center w-14 h-9 rounded-full text-slate-500 group-hover:bg-white/10 transition-colors">
              <span className="material-symbols-outlined text-[26px]">book_2</span>
            </div>
            <span className="text-xs font-medium text-slate-400 group-hover:text-white">My Story</span>
          </button>
          <Link href="/family" className="flex flex-col items-center gap-1.5 group w-20">
            <div className="flex items-center justify-center w-14 h-9 rounded-full text-slate-500 group-hover:bg-white/10 transition-colors">
              <span className="material-symbols-outlined text-[26px]">photo_library</span>
            </div>
            <span className="text-xs font-medium text-slate-400 group-hover:text-white">Gallery</span>
          </Link>
        </nav>
      </div>
    </div>
  );
}
