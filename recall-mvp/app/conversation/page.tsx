'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { AudioPipeline } from '@/lib/audio/AudioPipeline';
import { AuthGuard } from '@/components/common/AuthGuard';
import { useStreamingChat } from '@/lib/stores/useStreamingChat';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AIAudioPlayer } from '@/components/audio/AIAudioPlayer';
import { usePauseDetection, useVolumeMonitor, useSessionTimer } from '@/lib/hooks/usePauseDetection';
import { WarmUpPhase } from '@/components/conversation/WarmUpPhase';
import type { WarmUpPhaseResult } from '@/lib/types/elevenlabs-websocket';
import Image from 'next/image';

type ConversationPhase = 'warmup' | 'recording';

export default function ActiveConversationPage() {
  const router = useRouter();
  const params = useParams();
  const [sessionId, setSessionId] = useState<string | null>(params?.id as string || null);

  // Two-phase conversation flow
  const [conversationPhase, setConversationPhase] = useState<ConversationPhase>('warmup');
  const [warmupResult, setWarmupResult] = useState<WarmUpPhaseResult | null>(null);
  const [userName, setUserName] = useState<string>('');

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState<{ text: string, isAI: boolean }[]>([]);

  const [inputValue, setInputValue] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [streamingResponse, setStreamingResponse] = useState<string>('');

  // AI Voice States
  const [aiTextToSpeak, setAiTextToSpeak] = useState<string | undefined>();
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [welcomeLoaded, setWelcomeLoaded] = useState(false);

  // Volume monitoring for waveform
  const { volumeLevel, updateVolume } = useVolumeMonitor();

  // Session timer
  const { startTime, formatDuration } = useSessionTimer(!!sessionId);

  // Streaming Hook - declared before pause detection to use agentState
  const {
    agentState,
    sendMessage: sendStreamingMessage,
  } = useStreamingChat({
    onToken: (token, fullText) => {
      setStreamingResponse(fullText);
    },
    onComplete: (response) => {
      if (response.text) {
        setTranscript(prev => [...prev, { text: response.text, isAI: true }]);
        // Trigger AI voice response
        setAiTextToSpeak(response.text);
      }
      setStreamingResponse('');
    },
    onError: (error) => {
      setToastMessage(error);
      setStreamingResponse('');
    },
  });

  // Pause detection for agentic interjections - with smart turn-taking
  const handlePauseDetected = useCallback(async (durationMs: number) => {
    // Smart turn-taking guards:
    // 1. Don't interject if no session
    // 2. Don't interject if AI is currently speaking
    // 3. Don't interject if AI is thinking/generating
    // 4. Don't interject if user is CURRENTLY speaking (key fix!)
    // 5. Don't interject too early in conversation (need at least some user messages)
    if (!sessionId || isAISpeaking || agentState === 'thinking' || isListening) {
      return;
    }

    // Only interject after meaningful user engagement (at least 2 messages exchanged)
    const userMessages = transcript.filter(t => !t.isAI);
    if (userMessages.length < 2) {
      return;
    }

    try {
      const res = await fetch('/api/chat/interjection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          silenceDuration: Math.floor(durationMs / 1000),
          recentTranscript: transcript.slice(-4).map(t => ({
            speaker: t.isAI ? 'ai' : 'user',
            text: t.text,
          })),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        // Double-check user hasn't started speaking during the API call
        if (data.shouldInterject && data.message && !isListening) {
          setTranscript(prev => [...prev, { text: data.message, isAI: true }]);
          setAiTextToSpeak(data.message);
        }
      }
    } catch (e) {
      console.error('[Pause Detection] Interjection failed:', e);
    }
  }, [sessionId, isAISpeaking, agentState, transcript, isListening]);

  const { isPaused, recordSpeech, reset: resetPause } = usePauseDetection({
    silenceThresholdMs: 6000, // Increased to 6 seconds for more natural pauses
    onPauseDetected: handlePauseDetected,
    // Re-enabled with smart turn-taking guards above
    enabled: !!sessionId && transcript.length > 0,
  });

  // Audio Pipeline
  const audioPipeline = useRef<AudioPipeline | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript, streamingResponse]);

  // Initialize Session and fetch user profile
  useEffect(() => {
    const initSession = async () => {
      // Fetch user profile for name
      try {
        const profileRes = await fetch('/api/users/profile');
        if (profileRes.ok) {
          const profile = await profileRes.json();
          setUserName(profile.name || profile.firstName || 'there');
        }
      } catch (e) {
        console.warn('[Profile] Failed to fetch:', e);
      }

      // Create session if needed
      if (sessionId) return;
      try {
        const res = await fetch('/api/sessions/start', { method: 'POST', body: JSON.stringify({}) });
        if (res.ok) {
          const data = await res.json();
          setSessionId(data.sessionId);
        }
      } catch (err) {
        console.error("Session init error", err);
      }
    };
    initSession();
  }, [sessionId]);

  // Handle warm-up phase completion - transition to recording
  const handleWarmUpComplete = useCallback((result: WarmUpPhaseResult & { extractedTopic: string | null }) => {
    setWarmupResult(result);
    setConversationPhase('recording');
    // Clear welcome loaded to trigger fresh greeting with topic context
    setWelcomeLoaded(false);
  }, []);

  // Handle warm-up error
  const handleWarmUpError = useCallback((error: string) => {
    // Prevent double-triggering if we're already handling the transition
    setConversationPhase(currentPhase => {
      if (currentPhase === 'recording') return 'recording';

      console.warn('[WarmUp] Error/Quota transitioning to recording:', error);
      setToastMessage(`Warm-up checks: ${error}`);
      // Reset welcome flag only on FIRST transition
      setWelcomeLoaded(false);
      return 'recording';
    });
  }, []);

  // Initial Greeting - Only runs in RECORDING phase
  useEffect(() => {
    if (!sessionId || welcomeLoaded || conversationPhase !== 'recording') return;

    const fetchWelcome = async () => {
      try {
        const res = await fetch('/api/chat/welcome', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, userId: 'current', userName, includeAudio: true }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.greeting) {
            setTranscript([{ text: data.greeting, isAI: true }]);
            setAiTextToSpeak(data.greeting);
            setWelcomeLoaded(true);
          }
        } else {
          // Fallback to streaming init
          await sendStreamingMessage(sessionId, '__init__');
          setWelcomeLoaded(true);
        }
      } catch (e) {
        console.error('[Welcome] Failed:', e);
        setTranscript([{ text: "Welcome! I'm so glad you're here. What story shall we capture today?", isAI: true }]);
        setWelcomeLoaded(true);
      }
    };

    fetchWelcome();
  }, [sessionId, welcomeLoaded, conversationPhase, userName]);

  // Moved sendAudio definition up to before it's used in useEffect
  const sendAudio = async (blob: Blob) => {
    console.log(`[Conversation ${sessionId}] Sending audio blob, size: ${blob.size}`);
    try {
      const formData = new FormData();
      formData.append('file', blob);
      const res = await fetch('/api/chat/speech-to-text', { method: 'POST', body: formData });
      if (res.ok) {
        const data = await res.json();
        console.log(`[Conversation ${sessionId}] STT result:`, data.text?.substring(0, 50) || '(empty)');
        if (data.text) {
          setTranscript(prev => [...prev, { text: data.text, isAI: false }]);
          console.log(`[Conversation ${sessionId}] Calling sendStreamingMessage...`);
          await sendStreamingMessage(sessionId!, data.text);
          console.log(`[Conversation ${sessionId}] sendStreamingMessage returned`);
        }
      } else {
        console.error(`[Conversation ${sessionId}] STT failed:`, res.status);
      }
    } catch (e) {
      console.error(`[Conversation ${sessionId}] sendAudio error:`, e);
    }
  };

  // Audio Pipeline Init
  useEffect(() => {
    if (!sessionId) return;

    audioPipeline.current = new AudioPipeline();
    audioPipeline.current.onSpeechStart = () => {
      setIsListening(true);
      recordSpeech(); // Reset pause detection
    };
    audioPipeline.current.onSpeechEnd = async (blob) => {
      setIsListening(false);
      await sendAudio(blob);
    };
    audioPipeline.current.onVolumeChange = (vol) => {
      updateVolume(vol);
      if (vol > 0.02) {
        recordSpeech(); // Keep resetting pause timer while speaking (above noise floor)
      }
    };
    audioPipeline.current.onError = (err) => {
      setIsListening(false);
      setToastMessage("Audio Error");
    };
    return () => { audioPipeline.current?.stop(); };
  }, [sessionId, recordSpeech, updateVolume]);



  const toggleListening = async () => {
    if (!audioPipeline.current) return;
    if (isListening) {
      audioPipeline.current.stop();
      setIsListening(false);
    } else {
      await audioPipeline.current.initialize();
      await audioPipeline.current.start();
      setIsListening(true);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !sessionId) return;
    const text = inputValue;
    setInputValue('');
    setTranscript(prev => [...prev, { text, isAI: false }]);
    await sendStreamingMessage(sessionId, text);
  };

  /* State for saving indicator */
  const [isSaving, setIsSaving] = useState(false);

  const handleEndSession = async () => {
    if (!sessionId || isSaving) return;
    setIsSaving(true);

    try {
      // Stop any audio recording
      if (audioPipeline.current && isListening) {
        audioPipeline.current.stop();
        setIsListening(false);
      }

      // End the session via API
      const res = await fetch(`/api/sessions/${sessionId}/end`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        setToastMessage('Session saved successfully!');
        // Redirect to persona-appropriate dashboard
        const profileRes = await fetch('/api/users/profile');
        const profile = profileRes.ok ? await profileRes.json() : null;
        const dashboard = profile?.role === 'family' ? '/family' : '/stories';
        setTimeout(() => {
          router.push(dashboard);
        }, 1500);
      } else {
        setToastMessage('Failed to save session. Please try again.');
        setIsSaving(false);
      }
    } catch (err) {
      console.error('Error ending session:', err);
      setToastMessage('Error saving session.');
      setIsSaving(false);
    }
  };

  const formatTime = () => {
    return new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  return (
    <AuthGuard>
      <div className="h-screen bg-[#FCF8F3] flex flex-col overflow-hidden">
        <Header />

        {/* AI Audio Player - Only in RECORDING phase (warm-up uses ElevenLabs agent audio) */}
        {conversationPhase === 'recording' && (
          <AIAudioPlayer
            textToSpeak={aiTextToSpeak}
            onSpeakingStart={() => setIsAISpeaking(true)}
            onSpeakingEnd={() => {
              setIsAISpeaking(false);
              setAiTextToSpeak(undefined);
            }}
            onError={(err) => console.error('[TTS Error]', err)}
            variant="minimal"
            shouldStop={isListening} // Smart interruption: stop AI when user starts speaking
          />
        )}

        {/* Toast Notification */}
        {toastMessage && (
          <div className="absolute top-24 left-1/2 -translate-x-1/2 z-50 animate-fade-in-down">
            <div className="bg-terracotta text-white px-6 py-3 rounded-full shadow-2xl font-bold flex items-center gap-2 transition-all duration-300">
              <span className="material-symbols-outlined filled">check_circle</span>
              {toastMessage}
            </div>
          </div>
        )}

        {/* Main Content Area - Flexbox for proper height distribution */}
        <div className="flex-1 flex flex-col items-center px-4 pt-4 pb-6 overflow-hidden">

          {/* Main Card - fixed height container */}
          <div className="w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl shadow-peach-warm/20 border border-peach-main/10 flex flex-col overflow-hidden animate-fade-in flex-1 relative">

            {/* PHASE 1: Warm-Up */}
            {conversationPhase === 'warmup' && sessionId && (
              <WarmUpPhase
                userName={userName || 'there'}
                sessionId={sessionId}
                onComplete={handleWarmUpComplete}
                onError={handleWarmUpError}
              />
            )}

            {/* PHASE 2: Story Recording */}
            {conversationPhase === 'recording' && (
              <>
                {/* Header: Timer & Status */}
                <div className="h-20 shrink-0 border-b border-peach-main/10 flex items-center justify-between px-8 bg-white/90 backdrop-blur-md z-20">
                  <div className="flex items-center gap-3 text-slate-500 bg-slate-50 px-4 py-2 rounded-full">
                    <span className="material-symbols-outlined text-xl">schedule</span>
                    <span className="text-base font-mono font-bold tracking-tight">{formatDuration()}</span>
                  </div>

                  {/* Dynamic Status Pill */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    {(agentState === 'thinking' || streamingResponse) ? (
                      <div className="flex items-center gap-3 px-6 py-2.5 bg-amber-50 rounded-full shadow-sm border border-amber-100 animate-pulse-gentle">
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                        </span>
                        <span className="text-sm font-extrabold text-amber-700 uppercase tracking-wide">Thinking</span>
                      </div>
                    ) : isAISpeaking ? (
                      <div className="flex items-center gap-3 px-6 py-2.5 bg-gradient-to-r from-terracotta/10 to-orange-100 rounded-full shadow-sm border border-terracotta/10">
                        <div className="flex gap-1 items-end h-4">
                          {[0, 1, 2, 3].map(i => (
                            <div key={i} className="w-1 bg-terracotta rounded-full animate-music-bar" style={{ animationDelay: `${i * 0.1}s` }}></div>
                          ))}
                        </div>
                        <span className="text-sm font-extrabold text-terracotta uppercase tracking-wide">Speaking</span>
                      </div>
                    ) : isListening ? (
                      <div className="flex items-center gap-3 px-6 py-2.5 bg-emerald-50 rounded-full shadow-sm border border-emerald-100">
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                        </span>
                        <span className="text-sm font-extrabold text-emerald-700 uppercase tracking-wide">Listening</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 px-5 py-2 bg-slate-50 rounded-full border border-slate-100">
                        <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                        <span className="text-sm font-bold text-slate-500 uppercase tracking-wide">Paused</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleEndSession}
                    className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-full transition-colors text-xs font-bold uppercase tracking-wider group"
                  >
                    <span>End</span>
                    <span className="material-symbols-outlined text-lg group-hover:scale-110 transition-transform">logout</span>
                  </button>
                </div>

                {/* Messages Area */}
                <div className="flex-grow overflow-y-auto px-6 py-6 md:px-10 scroll-smooth space-y-6 relative bg-gradient-to-b from-white to-peach-main/5">
                  {transcript.length === 0 && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center opacity-40 pointer-events-none">
                      <span className="material-symbols-outlined text-8xl text-peach-main/30 mb-4">forum</span>
                      <p className="text-xl font-serif text-text-secondary">Your story begins here...</p>
                    </div>
                  )}

                  {transcript.map((msg, i) => (
                    <div key={i} className={`flex flex-col ${msg.isAI ? 'items-start' : 'items-end'} animate-scale-in`}>
                      <div className={`flex items-end gap-3 max-w-[85%] md:max-w-[75%] group`}>
                        {msg.isAI && (
                          <div className="w-8 h-8 rounded-full bg-peach-main/20 flex items-center justify-center flex-shrink-0 text-terracotta mb-2">
                            <span className="material-symbols-outlined text-sm font-bold">smart_toy</span>
                          </div>
                        )}
                        <div className={`
                          px-6 py-4 rounded-[2rem] text-lg md:text-xl font-medium leading-relaxed font-sans shadow-sm transition-all
                          ${msg.isAI
                            ? 'bg-white border border-peach-main/10 text-text-primary rounded-bl-none'
                            : 'bg-gradient-to-br from-peach-warm to-terracotta text-white rounded-br-none shadow-terracotta/20'
                          }
                        `}>
                          {msg.text}
                        </div>
                      </div>
                    </div>
                  ))}

                  {streamingResponse && (
                    <div className="flex flex-col items-start animate-fade-in">
                      <div className="flex items-end gap-3 max-w-[85%]">
                        <div className="w-8 h-8 rounded-full bg-peach-main/20 flex items-center justify-center flex-shrink-0 text-terracotta mb-2 animate-pulse">
                          <span className="material-symbols-outlined text-sm font-bold">smart_toy</span>
                        </div>
                        <div className="bg-white border border-peach-main/10 text-text-primary px-6 py-4 rounded-[2rem] rounded-bl-none text-lg md:text-xl font-medium leading-relaxed shadow-sm opacity-90">
                          {streamingResponse}
                          <span className="inline-block w-2 h-4 bg-terracotta/50 ml-1 animate-pulse"></span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} className="h-4" />
                </div>

                {/* Controls Footer - Enhanced & Pinned */}
                <div className="shrink-0 p-6 bg-white border-t border-peach-main/10 relative z-30">
                  <div className="flex items-center justify-center gap-8 relative max-w-3xl mx-auto">

                    {/* Input Toggle (Subtle) */}
                    <button
                      onClick={() => {
                        const input = prompt("Type a message manually:");
                        if (input) {
                          setInputValue(input);
                          handleSendMessage();
                        }
                      }}
                      className="p-4 rounded-full text-text-muted hover:bg-slate-50 transition-colors tooltip-trigger hidden md:block"
                      title="Type message"
                    >
                      <span className="material-symbols-outlined text-2xl">keyboard</span>
                    </button>

                    {/* End Session Button (Restored) */}
                    <button
                      onClick={handleEndSession}
                      disabled={isSaving}
                      className="flex flex-col items-center gap-1 text-red-400 hover:text-red-500 transition-colors disabled:opacity-50"
                    >
                      <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center border border-red-100">
                        <span className="material-symbols-outlined text-xl">stop_circle</span>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider">End</span>
                    </button>

                    {/* Main Mic Button - Volume Reactive */}
                    <div className="relative group">
                      {/* Volume-reactive outer ring */}
                      {isListening && (
                        <div
                          className="absolute inset-0 rounded-full bg-gradient-to-br from-terracotta/40 to-orange-300/30 transition-transform duration-75"
                          style={{
                            transform: `scale(${1 + Math.min(volumeLevel * 3, 0.5)})`,
                            opacity: 0.5 + Math.min(volumeLevel * 2, 0.5)
                          }}
                        />
                      )}

                      {/* Ripple effects */}
                      {isListening && (
                        <>
                          <div className="absolute inset-0 bg-terracotta/30 rounded-full animate-ping opacity-75"></div>
                          <div className="absolute inset-0 bg-terracotta/20 rounded-full animate-pulse delay-75"></div>
                        </>
                      )}

                      <button
                        onClick={toggleListening}
                        className={`
                           relative w-24 h-24 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 transform group-hover:scale-105 active:scale-95 border-4 
                           ${isListening
                            ? 'bg-terracotta border-white text-white rotate-0'
                            : 'bg-white border-peach-main/20 text-terracotta hover:border-terracotta/50'
                          }
                         `}
                      >
                        <span className="material-symbols-outlined text-4xl filled transition-transform duration-300">
                          {isListening ? 'stop' : 'mic'}
                        </span>
                      </button>
                    </div>

                    {/* Visualizer / Volume Indicator (when listening) or Placeholder */}
                    <div className="w-12 h-12 flex items-center justify-center">
                      {isListening && (
                        <div className="flex gap-1 items-end h-6">
                          {[...Array(3)].map((_, i) => (
                            <div
                              key={i}
                              className="w-1.5 bg-terracotta rounded-full transition-all duration-75"
                              style={{ height: `${Math.max(4, volumeLevel * 24 + ((i * 3) % 8))}px` }}
                            ></div>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>
                  <div className="text-center mt-4">
                    <p className="text-xs font-bold text-text-muted uppercase tracking-[0.2em] opacity-60">
                      {isListening ? 'Listening...' : 'Tap to Speak'}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <Footer />
      </div>
    </AuthGuard>
  );
}
