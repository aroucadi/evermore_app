
'use client';

import { useState, useEffect, useRef } from 'react';
import { useConversationStore } from '@/lib/stores/conversationStore';
import { Button } from '@/components/ui/button';
import { WaveformVisualizer } from '@/components/conversation/WaveformVisualizer';
import { TranscriptDisplay } from '@/components/conversation/TranscriptDisplay';
import { formatDuration } from '@/lib/utils';
import Link from 'next/link';

export default function ConversationPage() {
  const {
    isActive,
    sessionId,
    messages,
    duration,
    isAgentSpeaking,
    startSession,
    endSession,
    addMessage,
    setAgentSpeaking,
    updateDuration
  } = useConversationStore();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive) {
      interval = setInterval(() => {
        updateDuration(duration + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, duration, updateDuration]);

  const handleStart = async () => {
    // Call mock API to start session
    const response = await fetch('/api/sessions/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'user-arthur' })
    });
    const data = await response.json();

    startSession(data.sessionId);

    // Add initial greeting
    setTimeout(() => {
      addMessage({
        id: `msg-${Date.now()}`,
        speaker: 'agent',
        text: "Hi Arthur, it's wonderful to talk with you today. What's been on your mind lately?",
        timestamp: new Date()
      });
    }, 1000);
  };

  const handleEnd = async () => {
    // Call mock API to end session
    await fetch(`/api/sessions/${sessionId}/end`, {
      method: 'POST'
    });

    endSession();
  };

  const handleSimulateUserMessage = async () => {
    const userText = "Well, it was 1965, and I was stationed in San Diego. It felt vast, open. Not like the crowded beaches you see in magazines today.";

    // Add user message
    addMessage({
      id: `msg-${Date.now()}`,
      speaker: 'user',
      text: userText,
      timestamp: new Date()
    });

    // Simulate agent thinking
    setAgentSpeaking(true);

    // Get agent response from mock API
    const response = await fetch(`/api/sessions/${sessionId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userText, speaker: 'user' })
    });
    const agentMessage = await response.json();

    // Add agent response
    addMessage({
      ...agentMessage,
      timestamp: new Date(agentMessage.timestamp)
    });

    setAgentSpeaking(false);
  };

  if (!isActive) {
    // This is the "home" screen for the senior
    return (
      <div className="bg-background-light dark:bg-background-dark font-display text-slate-800 dark:text-orange-50 antialiased selection:bg-primary selection:text-white">
        <div className="relative flex h-full min-h-screen w-full flex-col overflow-hidden max-w-md mx-auto shadow-2xl bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm border-x border-white/50 dark:border-white/5">
          <header className="sticky top-0 z-30 flex items-center justify-between p-6 pb-4 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-md">
            <div className="flex flex-col">
              <span className="text-primary font-bold text-sm tracking-wide uppercase mb-1">Oct 26, Tuesday</span>
              <h2 className="text-3xl font-bold leading-tight tracking-tight text-slate-900 dark:text-white">Good Morning,<br/>Arthur</h2>
            </div>
            <button aria-label="Settings" className="glass-panel flex items-center justify-center w-14 h-14 rounded-full bg-white/60 dark:bg-white/10 hover:bg-white dark:hover:bg-white/20 border border-white/40 dark:border-white/10 transition-all shadow-sm text-slate-700 dark:text-orange-50">
              <span className="material-symbols-outlined" style={{fontSize: '28px'}}>settings</span>
            </button>
          </header>
          <main className="flex-1 flex flex-col px-6 pt-2 pb-28 relative z-10">
            <div className="flex-1 flex flex-col items-center justify-center min-h-[380px] relative py-8">
              <h1 className="relative z-10 text-3xl md:text-4xl font-bold text-center mb-12 text-slate-800 dark:text-white tracking-tight leading-tight drop-shadow-sm">
                Ready to share<br/>a story?
              </h1>
              <div className="relative group z-10 flex items-center justify-center">
                <button onClick={handleStart} className="relative flex items-center justify-center w-36 h-36 md:w-44 md:h-44 rounded-full bg-warm-gradient shadow-glow hover:scale-105 active:scale-95 transition-all duration-300 ease-out focus:outline-none focus:ring-4 focus:ring-primary/30 group">
                  <div className="absolute top-0 left-0 w-full h-full rounded-full bg-gradient-to-b from-white/20 to-transparent opacity-50 pointer-events-none"></div>
                  <span className="material-symbols-outlined text-white drop-shadow-md" style={{fontSize: '64px', fontVariationSettings: "'FILL' 1"}}>mic</span>
                </button>
              </div>
              <div className="mt-10 text-center z-10">
                <p className="text-lg font-medium text-slate-600 dark:text-slate-300 bg-white/40 dark:bg-black/20 px-6 py-2 rounded-full backdrop-blur-sm inline-block">Tap to start conversation</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // This is the active conversation screen
  return (
    <div className="font-display text-white h-screen overflow-hidden flex flex-col selection:bg-primary selection:text-background-dark bg-background-dark">
      <header className="flex flex-col gap-4 p-6 shrink-0 z-20">
        <div className="flex items-center justify-between">
          <div className="glass-panel px-3 py-1.5 rounded-full flex items-center gap-2.5 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse shadow-[0_0_8px_rgba(248,113,113,0.6)]"></div>
            <span className="text-white/90 text-xs font-semibold tracking-wide uppercase">Live</span>
          </div>
          <div className="absolute left-1/2 -translate-x-1/2 top-7">
            <span className="text-white/90 text-xl font-bold tracking-widest tabular-nums drop-shadow-md">{formatDuration(duration)}</span>
          </div>
          <Button onClick={handleEnd} variant="destructive" className="group flex items-center justify-center gap-2 glass-panel hover:bg-red-500/20 active:bg-red-500/30 transition-all rounded-full pl-4 pr-5 py-2 border-white/10 hover:border-red-500/30 shadow-sm">
            <span className="material-symbols-outlined text-red-300 group-hover:text-red-200 text-[20px]">call_end</span>
            <span className="text-sm font-semibold text-red-100/90 group-hover:text-white">End</span>
          </Button>
        </div>
      </header>
      <div className="shrink-0 flex flex-col items-center justify-center pt-2 pb-6 gap-5 z-10 relative">
        <WaveformVisualizer isActive={isAgentSpeaking} />
        <p className="text-primary/90 text-sm font-medium tracking-wide flex items-center gap-2 bg-black/20 px-4 py-1.5 rounded-full border border-white/5 backdrop-blur-sm">
          <span className="material-symbols-outlined text-[18px] animate-pulse">graphic_eq</span>
          Recall is listening...
        </p>
      </div>
      <main className="flex-1 overflow-y-auto no-scrollbar px-4 pb-4 space-y-6 flex flex-col z-10 relative">
        <div className="mt-auto flex flex-col gap-6 pt-10">
          <TranscriptDisplay messages={messages} />
        </div>
      </main>
      <footer className="p-6 pt-4 shrink-0 flex items-center justify-center z-20 relative">
        <div className="glass-panel px-8 py-3 rounded-[3rem] flex items-center gap-8 shadow-2xl bg-black/20">
          <button onClick={handleSimulateUserMessage} className="w-20 h-20 -mt-10 mb-2 rounded-full bg-gradient-to-b from-[#2a2624] to-[#1a1816] border border-white/10 flex items-center justify-center text-white shadow-glow hover:scale-105 active:scale-95 transition-all group relative overflow-hidden">
            <div className="absolute inset-0 bg-primary/10 rounded-full animate-pulse-slow group-hover:bg-primary/20 transition-all"></div>
            <div className="absolute inset-0 rounded-full border border-primary/30 opacity-50 group-hover:opacity-100 transition-opacity"></div>
            <span className="material-symbols-outlined text-[36px] text-primary group-hover:text-white transition-colors relative z-10">mic</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
