'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FDFCF8] text-[#3D3430] font-sans selection:bg-[#E07A5F]/20 relative overflow-x-hidden">
      {/* Background Gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-[radial-gradient(at_0%_0%,hsla(27,68%,94%,1)_0,transparent_50%),radial-gradient(at_100%_0%,hsla(38,78%,93%,1)_0,transparent_50%),radial-gradient(at_100%_100%,hsla(14,68%,96%,1)_0,transparent_50%),radial-gradient(at_0%_100%,hsla(38,70%,96%,1)_0,transparent_50%)]"></div>

      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-[#E07A5F]/10 rounded-full blur-3xl opacity-60"></div>
        <div className="absolute bottom-[20%] left-[-10%] w-80 h-80 bg-[#F2CC8F]/20 rounded-full blur-3xl opacity-60"></div>
      </div>

      <div className="relative flex flex-col min-h-screen w-full">
        {/* Header */}
        <header className="sticky top-0 z-50 flex items-center justify-between px-4 py-4 bg-[#FDFCF8]/85 backdrop-blur-md border-b border-[#E07A5F]/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#E07A5F]/10 flex items-center justify-center text-[#E07A5F] border border-[#E07A5F]/20">
              <span className="material-symbols-outlined text-[24px]">local_library</span>
            </div>
            <h2 className="text-xl font-bold leading-tight tracking-tight">LegacyApp</h2>
          </div>
          <Link href="/login" className="flex items-center justify-end px-5 py-2.5 rounded-full hover:bg-black/5 transition-colors font-semibold text-sm text-[#756A63]">
            Log In
          </Link>
        </header>

        {/* Hero Section */}
        <section className="@container">
          <div className="flex flex-col gap-10 px-5 py-10 pt-8 md:gap-14 lg:flex-row lg:items-center max-w-6xl mx-auto w-full">
            <div className="flex flex-col gap-8 items-center text-center lg:items-start lg:text-left lg:flex-1">
              <div className="flex flex-col gap-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/60 border border-[#E07A5F]/20 backdrop-blur-sm w-fit mx-auto lg:mx-0 shadow-sm">
                  <span className="flex h-2 w-2 rounded-full bg-[#E07A5F] animate-pulse"></span>
                  <span className="text-xs font-semibold text-[#E07A5F] uppercase tracking-wide">New: Voice to Book</span>
                </div>
                <h1 className="text-4xl font-extrabold leading-[1.15] tracking-tight sm:text-5xl">
                  Preserve your family's <br className="hidden sm:block" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E07A5F] to-orange-400">priceless stories</span>
                </h1>
                <h2 className="text-[#756A63] text-lg font-medium leading-relaxed max-w-lg mx-auto lg:mx-0">
                  The simple, comforting way for seniors to record memories through conversation. We turn voices into cherished family books.
                </h2>
              </div>

              <div className="flex flex-col gap-6 items-center w-full lg:items-start">
                <Link
                  href="/onboarding"
                  className="group flex w-full max-w-[340px] cursor-pointer items-center justify-center gap-3 overflow-hidden rounded-full bg-[#E07A5F] h-14 px-8 text-white text-lg font-bold transition-all hover:bg-[#C66348] hover:shadow-lg hover:shadow-[#E07A5F]/20 hover:-translate-y-0.5 active:scale-[0.98]"
                >
                  <span>Get Started Free</span>
                  <span className="material-symbols-outlined text-[22px] transition-transform group-hover:translate-x-1">arrow_forward</span>
                </Link>

                {/* Social Proof */}
                <div className="flex flex-col items-center lg:items-start gap-2 pt-1">
                  <div className="flex items-center gap-4">
                    <div className="flex -space-x-3">
                      <div className="w-10 h-10 rounded-full border-[3px] border-white shadow-md bg-gray-200 overflow-hidden relative">
                        <img alt="User 1" className="h-full w-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA1CcxpqLmDicTG3o-BsW2FGv2ZsAE-GqhGFMabPjJ73tKWxMIWBMkMLsMCnUD2p8FKKX4nHMcUgyJjqbJCFIxZ2mzOawLO-p1iPwBN07qZ2vKQOxyht_9ifB9t5nV44Sf290smlyARz-q_H7Gt1g5rDt5Tf0xApcS61Y9UvWQ2yZ4ghyEPqH-L_DS4OouG4142cXiQXM1jw14OxmUoXFS1xuaCdC4hsXeM35bD5rwm8A0IwWNkOqnogMhft9AspVqR_ui92r4lOew" />
                      </div>
                      <div className="w-10 h-10 rounded-full border-[3px] border-white shadow-md bg-gray-200 overflow-hidden relative">
                        <img alt="User 2" className="h-full w-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAwD2rnsMVOeafZsnBt1p-ROMVyLfjmEL0RZZechlApXTGWrXkqF258hZbQUbhoJACLuVWhtLwqp2UrMphfciPxzF-hUh7OF6_seTxkIGM5alu_h7ujzrWepkQrFRGjQ12J6ZYb7CpaBzVUN0quF2jnew4_JXXYlQDoeIhMd3LmqzXf0DrQjpImC-KZpwH73gi8gXByAE-MOmx_Aixf59MPz1YjG8u7tcTV57AvWQTmt7jSmhp3yNPj2kHTQDHjZTyYqPXFnOfs97E" />
                      </div>
                      <div className="w-10 h-10 rounded-full border-[3px] border-white shadow-md bg-gray-200 overflow-hidden relative">
                        <img alt="User 3" className="h-full w-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDdl9reXMLGeXxbtcE7XhqnMHTA9PTkJfzALwQI7WlsFFKh4tl_wk90RD3v4gJejeGvlRDWvV8CYJuLfsiOJTui5LtRnZ5VdE0abg33w5nMG3ogzw7ipnsvgU_7Xm8JTHUk1NVIbySTKBbm-s51SuwbmXs5QSU4VLgJy02BQesbfCJNglzvuike979g7dVogs_mZTsPaJ5vjfylaIDoUQNoczqE5gmcYM9eZRAS6f3e2bFYoyjrELWDSlu1nq2hwYlqirpFFDZyjNM" />
                      </div>
                      <div className="w-10 h-10 rounded-full border-[3px] border-white shadow-md bg-white flex items-center justify-center text-xs font-bold text-[#E07A5F]">
                        +2k
                      </div>
                    </div>
                    <div className="flex flex-col items-start">
                      <div className="flex text-yellow-500 text-[14px]">
                        {[1,2,3,4,5].map(i => (
                          <span key={i} className="material-symbols-outlined filled text-[18px]">star</span>
                        ))}
                      </div>
                      <p className="text-xs font-semibold text-[#756A63]">Trusted by 2,000+ families</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Hero Image / Video Placeholder */}
            <div className="w-full lg:flex-1 px-2">
              <div className="relative w-full aspect-[4/3] rounded-[2rem] overflow-hidden shadow-2xl shadow-[#E07A5F]/10 border-[6px] border-white group cursor-pointer bg-white">
                <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCt87K7-ogtEOOARQA70qdjb1gfH-U1oynox5wf-RKi1ihtPnX4IUqHPKf7SqvGtdkxyaH3I8n3kMXGFRFXUyCeGnp5-tQDgWkrsVdiXZVuAiHp2cJMo-8ZJ8B_7gRFINLP1cCS8wossmjSH3j-KrWj67hzGSuFjB7DIoQBDsyg8RsZyykfPpv9V2TWol_NfP6_5XWI52kScB3YFi96Ab7Y32bjO1LT2jTlUkawLkHPPqvWLQtVpM_9apORe4924jlPQUYCG-P9Dyg')" }}></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-80"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-white/40 backdrop-blur-sm border border-white/60 flex items-center justify-center text-white transition-all duration-300 group-hover:scale-110 group-hover:bg-[#E07A5F]/90 shadow-lg">
                    <span className="material-symbols-outlined filled text-[40px] ml-1">play_arrow</span>
                  </div>
                </div>
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-white/65 backdrop-blur-md border border-white/80 px-4 py-3 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-[#3D3430]">See how it works</p>
                      <p className="text-xs text-[#756A63]">1 min demo video</p>
                    </div>
                    <span className="material-symbols-outlined text-[#E07A5F]">arrow_forward</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it works divider */}
        <div className="relative py-8 flex items-center justify-center">
          <div aria-hidden="true" className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-[#FDFCF8] px-4 text-sm text-[#756A63] uppercase tracking-widest font-semibold">How it Works</span>
          </div>
        </div>

        {/* Steps Section */}
        <section className="flex flex-col py-8 pb-20 px-5 gap-10 max-w-6xl mx-auto w-full">
          <div className="flex flex-col items-center text-center gap-4 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold leading-tight text-[#3D3430]">Three simple steps to forever</h2>
            <p className="text-[#756A63] text-base">We've designed LegacyApp to be incredibly easy to use, focusing on voice and conversation rather than typing.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="bg-white/65 backdrop-blur-md border border-white/80 p-8 rounded-2xl flex flex-col gap-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg group shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#E07A5F]/10 to-[#E07A5F]/5 border border-[#E07A5F]/20 flex items-center justify-center group-hover:bg-[#E07A5F] group-hover:text-white transition-colors duration-300">
                <span className="material-symbols-outlined text-[#E07A5F] text-[32px] group-hover:text-white transition-colors">mic</span>
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#E07A5F]/10 text-[#E07A5F] text-xs font-bold">1</span>
                  <h3 className="text-xl font-bold text-[#3D3430]">Chat</h3>
                </div>
                <p className="text-[#756A63] text-sm leading-relaxed">Grandma chats comfortably with our friendly AI voice companion, recalling her favorite moments naturally.</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white/65 backdrop-blur-md border border-white/80 p-8 rounded-2xl flex flex-col gap-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg group shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#F2CC8F]/20 to-[#F2CC8F]/10 border border-[#F2CC8F]/30 flex items-center justify-center group-hover:bg-[#F2CC8F] group-hover:text-[#3D3430] transition-colors duration-300">
                <span className="material-symbols-outlined text-orange-400 text-[32px] group-hover:text-[#3D3430] transition-colors">auto_stories</span>
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#F2CC8F]/20 text-orange-700 text-xs font-bold">2</span>
                  <h3 className="text-xl font-bold text-[#3D3430]">Remember</h3>
                </div>
                <p className="text-[#756A63] text-sm leading-relaxed">We instantly preserve those spoken words, turning them into beautifully written narrative chapters.</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white/65 backdrop-blur-md border border-white/80 p-8 rounded-2xl flex flex-col gap-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg group shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50 border border-blue-200 flex items-center justify-center group-hover:bg-blue-400 group-hover:text-white transition-colors duration-300">
                <span className="material-symbols-outlined text-blue-400 text-[32px] group-hover:text-white transition-colors">diversity_3</span>
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold">3</span>
                  <h3 className="text-xl font-bold text-[#3D3430]">Share</h3>
                </div>
                <p className="text-[#756A63] text-sm leading-relaxed">Family members receive the story updates to read, share, and cherish forever in a private family space.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
