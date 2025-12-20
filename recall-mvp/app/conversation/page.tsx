'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AudioPipeline } from '@/lib/audio/AudioPipeline';

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
];

export default function ActiveConversationPage() {
  const router = useRouter();
  const params = useParams(); // Get sessionId from URL
  const sessionId = params?.id as string || 'mock-session-id';

  const [isListening, setIsListening] = useState(false);
  const [showWaves, setShowWaves] = useState(false);
  const [transcript, setTranscript] = useState<string[]>([]);

  // New States
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(LANGUAGES[0]);
  const [saveStatus, setSaveStatus] = useState<'recording' | 'saving' | 'saved'>('recording');
  const [showEndConfirmation, setShowEndConfirmation] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Audio Pipeline State
  const audioPipeline = useRef<AudioPipeline | null>(null);
  const [volume, setVolume] = useState(0);

  // Image Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Helper for AI Response logic
  const handleAIResponse = (text: string, audioBase64?: string) => {
    let finalText = text;
    if (!text || text.trim().length === 0) {
      finalText = "Tell me more about that.";
    }
    setTranscript(prev => [...prev, finalText]);

    // Play Audio if provided
    if (audioBase64) {
        try {
            const audio = new Audio(`data:audio/mpeg;base64,${audioBase64}`);
            audio.play();
        } catch (e) {
            console.error("Failed to play audio", e);
        }
    }
  };

  useEffect(() => {
    // Initial greeting (Simulated for demo if no history)
    const timer = setTimeout(() => {
      // Only greet if transcript is empty
      if (transcript.length === 0) {
          handleAIResponse('Hello Arthur, it\'s great to speak with you again. I was hoping you could tell me more about that summer trip to the lake house you mentioned?');
          // Don't auto-start listening until user taps mic for permissions
      }
    }, 1000);

    // Initialize Audio Pipeline
    audioPipeline.current = new AudioPipeline();
    audioPipeline.current.onVolumeChange = (vol) => {
        setVolume(vol);
        // Do not auto-show waves based on volume alone if not explicitly listening,
        // but here we only call start() when listening.
    };
    audioPipeline.current.onSpeechStart = () => {
        setSaveStatus('recording');
        setShowWaves(true);
    };
    audioPipeline.current.onSpeechEnd = async (blob) => {
        setShowWaves(false);
        setSaveStatus('saving');
        setToastMessage("Processing speech...");
        await sendAudio(blob);
        setSaveStatus('saved');
    };
    audioPipeline.current.onError = (err) => {
        console.error("Audio Pipeline Error:", err);
        setToastMessage("Audio Error: " + err.message);
        setIsListening(false);
    };

    return () => {
      clearTimeout(timer);
      if (audioPipeline.current) {
          audioPipeline.current.stop();
      }
    };
  }, []); // Only run once on mount

  // Toast Timer
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const sendAudio = async (blob: Blob) => {
      try {
          const formData = new FormData();
          formData.append('file', blob);

          const res = await fetch('/api/chat/speech-to-text', {
              method: 'POST',
              body: formData,
          });

          if (!res.ok) throw new Error("STT failed");

          const data = await res.json();
          if (data.text) {
              setTranscript(prev => [...prev, data.text]);
              // Send text to Chat API to get AI response
              await handleSendMessageText(data.text);
          }
      } catch (e) {
          console.error("Failed to process audio", e);
          setToastMessage("Could not understand audio");
      }
  };

  const toggleListening = async () => {
    if (!audioPipeline.current) return;

    if (isListening) {
        audioPipeline.current.stop();
        setIsListening(false);
        setShowWaves(false);
    } else {
        await audioPipeline.current.initialize();
        await audioPipeline.current.start();
        setIsListening(true);
        setToastMessage("Listening...");
    }
  };

  const handleEndConversation = () => {
    if (audioPipeline.current) audioPipeline.current.stop();
    router.push('/dashboard');
  };

  const handleSendMessageText = async (text: string) => {
    try {
        const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sessionId,
                message: text
            })
        });

        if (!res.ok) throw new Error("Failed to send message");

        const data = await res.json();
        // The API returns { text: string, strategy: string }
        if (data && data.text) {
             handleAIResponse(data.text);
        } else {
             handleAIResponse("I'm listening...");
        }

    } catch (e) {
        console.error(e);
        setToastMessage("Failed to send message to AI.");
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) {
      setToastMessage('Cannot send an empty message.');
      return;
    }
    const messageToSend = inputValue;

    // Optimistic Update
    setTranscript(prev => [...prev, messageToSend]);
    setInputValue('');
    setShowInput(false);

    await handleSendMessageText(messageToSend);
  };

  const handleShowClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    setToastMessage("Analyzing photo...");
    setShowWaves(false);
    if (isListening) toggleListening(); // Pause listening

    const formData = new FormData();
    formData.append('image', file);

    try {
        const res = await fetch(`/api/session/${sessionId}/analyze-image`, {
            method: 'POST',
            body: formData,
        });

        if (!res.ok) throw new Error('Failed to analyze image');

        const data = await res.json();
        handleAIResponse(data.text, data.audioBase64);
        setToastMessage("Photo analyzed!");

    } catch (error) {
        console.error(error);
        setToastMessage("Failed to analyze photo.");
    } finally {
        setIsAnalyzing(false);
    }
  };

  return (
    <div className="bg-[#2A2320] font-sans text-orange-50 min-h-screen relative overflow-hidden flex flex-col">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-orange-500 text-white px-6 py-3 rounded-full shadow-lg transition-all animate-fade-in">
          {toastMessage}
        </div>
      )}

      {/* Confirmation Dialog */}
      {showEndConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#2A2320] border border-white/10 p-6 rounded-2xl max-w-sm w-full shadow-2xl space-y-4">
            <h3 className="text-xl font-semibold text-white">End Conversation?</h3>
            <p className="text-white/70">Are you sure you want to end this conversation? Your progress will be saved.</p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowEndConfirmation(false)}
                className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleEndConversation}
                className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white transition-colors font-medium"
              >
                End
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-orange-500/10 rounded-full blur-[100px] transition-all duration-1000 ${isListening ? 'scale-110 opacity-70' : 'scale-100 opacity-40'}`}></div>
      </div>

      <header className="relative z-10 px-6 py-6 flex items-center justify-between">
        <button
          onClick={() => setShowEndConfirmation(true)}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors"
          aria-label="End conversation"
        >
          <span className="material-symbols-outlined text-white/70" aria-hidden="true">close</span>
        </button>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20">
          {saveStatus === 'saving' || isAnalyzing ? (
             <span className="material-symbols-outlined text-orange-500 text-sm animate-spin">progress_activity</span>
          ) : (
             <div className={`w-2 h-2 rounded-full bg-orange-500 ${saveStatus === 'recording' ? 'animate-pulse' : ''}`}></div>
          )}
          <span className="text-xs font-bold text-orange-500 tracking-wide uppercase">
            {isAnalyzing ? 'Analyzing...' : saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved' : 'Recording'}
          </span>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowLanguageMenu(!showLanguageMenu)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors"
            aria-label="Conversation options"
            aria-expanded={showLanguageMenu}
            aria-haspopup="true"
          >
            <span className="material-symbols-outlined text-white/70" aria-hidden="true">more_horiz</span>
          </button>

          {showLanguageMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowLanguageMenu(false)}
              ></div>
              <div className="absolute right-0 top-full mt-2 w-48 bg-[#3D3430] border border-white/10 rounded-xl shadow-xl overflow-hidden z-20">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setSelectedLanguage(lang);
                      setShowLanguageMenu(false);
                    }}
                    className={`w-full text-left px-4 py-3 hover:bg-white/5 flex items-center gap-3 transition-colors ${selectedLanguage.code === lang.code ? 'bg-white/5' : ''}`}
                  >
                    <span className="text-lg">{lang.flag}</span>
                    <span className="text-white/90 text-sm">{lang.name}</span>
                    {selectedLanguage.code === lang.code && (
                      <span className="material-symbols-outlined text-orange-500 text-sm ml-auto">check</span>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center relative z-10 w-full max-w-lg mx-auto px-6">
        {/* Visualizer Area */}
        <div className="flex-1 w-full flex items-center justify-center min-h-[300px]">
          {isListening ? (
             <div className="flex items-center gap-1.5 h-24">
               {/* Use real volume to scale waves */}
               {[...Array(8)].map((_, i) => (
                  <div key={i}
                       className={`w-3 rounded-full bg-gradient-to-t from-[#FF845E] to-[#FF9A7B] transition-all duration-75`}
                       style={{
                           height: `${Math.max(10, volume * 100 * (1 + Math.sin(Date.now()/100 + i)))}%`
                       }}
                  ></div>
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
           <div className="space-y-4 max-h-[200px] overflow-y-auto no-scrollbar mask-fade-top" role="log" aria-live="polite" aria-relevant="additions text">
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

        {/* Input Area Overlay */}
        {showInput && (
           <div className="fixed inset-x-0 bottom-0 bg-[#2A2320] p-6 pb-12 rounded-t-3xl border-t border-white/10 z-30 shadow-2xl animate-slide-up">
              <div className="max-w-lg mx-auto flex flex-col gap-4">
                 <div className="flex justify-between items-center">
                    <h3 className="text-white font-medium">Type your response</h3>
                    <button onClick={() => setShowInput(false)} className="text-white/50 hover:text-white" aria-label="Close input">
                       <span className="material-symbols-outlined" aria-hidden="true">close</span>
                    </button>
                 </div>
                 <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Type here..."
                    className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-white/30 focus:outline-none focus:border-orange-500/50 resize-none"
                    autoFocus
                 />
                 <button
                    onClick={handleSendMessage}
                    className="w-full py-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-colors"
                 >
                    Send Message
                 </button>
              </div>
           </div>
        )}

        {/* Controls */}
        <div className="w-full flex items-center justify-between gap-6 pb-12">
           <button
             onClick={() => setShowInput(true)}
             className="flex-1 h-16 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
             aria-label="Type a message"
           >
              <span className="material-symbols-outlined text-white/60" aria-hidden="true">keyboard</span>
              <span className="font-semibold text-white/60">Type</span>
           </button>

           <button
              onClick={toggleListening}
              className={`h-24 w-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl ${
                 isListening
                 ? 'bg-red-500/20 text-red-500 border border-red-500/50 scale-100'
                 : 'bg-[#FF845E] text-white scale-100 hover:scale-105 shadow-[#FF845E]/40'
              }`}
              aria-label={isListening ? "Stop recording" : "Start recording"}
           >
              <span className={`material-symbols-outlined text-4xl transition-transform duration-300 ${isListening ? '' : 'filled'}`} aria-hidden="true">
                 {isListening ? 'stop' : 'mic'}
              </span>
           </button>

           <button
              onClick={handleShowClick}
              disabled={isAnalyzing}
              className="flex-1 h-16 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
              aria-label="Show a photo"
           >
              <span className="material-symbols-outlined text-white/60" aria-hidden="true">photo_camera</span>
              <span className="font-semibold text-white/60">Show</span>
           </button>
        </div>
      </main>
    </div>
  );
}
