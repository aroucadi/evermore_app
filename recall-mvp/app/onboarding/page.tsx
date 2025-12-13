'use client';

import React from 'react';
import Link from 'next/link';

export default function OnboardingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#FDFCF8] font-sans selection:bg-[#E07A5F]/20">
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-[10%] -left-[10%] w-[500px] h-[500px] bg-[#E07A5F]/5 rounded-full blur-[80px]"></div>
        <div className="absolute top-[30%] right-[0] w-[300px] h-[300px] bg-[#F2CC8F]/10 rounded-full blur-[60px]"></div>
      </div>

      <header className="px-6 py-6 w-full max-w-lg mx-auto flex items-center justify-between">
        <button className="p-2 -ml-2 rounded-full hover:bg-black/5 text-[#756A63] transition-colors">
          <Link href="/">
             <span className="material-symbols-outlined">arrow_back</span>
          </Link>
        </button>
        <div className="flex gap-1.5">
          <div className="w-8 h-1.5 rounded-full bg-[#E07A5F]"></div>
          <div className="w-2 h-1.5 rounded-full bg-[#E07A5F]/20"></div>
          <div className="w-2 h-1.5 rounded-full bg-[#E07A5F]/20"></div>
        </div>
        <div className="w-10"></div> {/* Spacer for centering */}
      </header>

      <main className="flex-1 flex flex-col px-6 max-w-lg mx-auto w-full pb-8">
        <div className="flex-1 flex flex-col justify-center items-center text-center gap-8 min-h-[50vh]">
          <div className="relative">
            <div className="absolute inset-0 bg-[#E07A5F]/10 rounded-full blur-xl transform scale-150"></div>
            <div className="w-28 h-28 bg-white rounded-3xl shadow-xl shadow-[#E07A5F]/10 flex items-center justify-center relative transform -rotate-3 border border-white">
              <span className="material-symbols-outlined text-[#E07A5F] text-[56px] filled">mic_external_on</span>
            </div>
            <div className="w-16 h-16 bg-[#FDFCF8] rounded-2xl shadow-lg absolute -bottom-4 -right-4 flex items-center justify-center transform rotate-6 border border-white">
              <span className="material-symbols-outlined text-[#F2CC8F] text-[32px] filled">auto_stories</span>
            </div>
          </div>

          <div className="space-y-4 max-w-[320px]">
            <h1 className="text-3xl font-extrabold text-[#3D3430] leading-tight">
              Let's set up your <br/>
              <span className="text-[#E07A5F]">Voice Companion</span>
            </h1>
            <p className="text-[#756A63] text-lg leading-relaxed">
              We'll customize the conversation style to make it feel natural and comfortable for you.
            </p>
          </div>
        </div>

        <div className="space-y-4 w-full mt-auto">
          <div className="space-y-3">
            <label className="text-sm font-bold text-[#3D3430] uppercase tracking-wider ml-1">Who is this for?</label>
            <div className="grid grid-cols-2 gap-3">
              <button className="flex flex-col items-center gap-3 p-4 rounded-2xl border-2 border-[#E07A5F] bg-[#E07A5F]/5 transition-all shadow-sm">
                <span className="material-symbols-outlined text-[#E07A5F] filled text-[28px]">person</span>
                <span className="font-bold text-[#3D3430]">Myself</span>
              </button>
              <button className="flex flex-col items-center gap-3 p-4 rounded-2xl border-2 border-transparent bg-white hover:border-[#E07A5F]/30 transition-all shadow-sm">
                <span className="material-symbols-outlined text-[#756A63] text-[28px]">diversity_1</span>
                <span className="font-bold text-[#756A63]">A Relative</span>
              </button>
            </div>
          </div>

          <div className="pt-6">
            <Link
              href="/dashboard"
              className="w-full bg-[#E07A5F] text-white font-bold h-14 rounded-full flex items-center justify-center gap-2 hover:bg-[#C66348] hover:shadow-lg hover:shadow-[#E07A5F]/20 hover:-translate-y-0.5 active:scale-[0.98] transition-all text-lg"
            >
              Continue
              <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
          </div>

          <p className="text-center text-xs text-[#756A63] font-medium pt-2">
            No credit card required
          </p>
        </div>
      </main>
    </div>
  );
}
