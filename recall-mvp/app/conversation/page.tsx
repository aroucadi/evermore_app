'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
];

export default function ActiveConversationPage() {
  const router = useRouter();
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

  // Helper for AI Response logic
  const handleAIResponse = (text: string) => {
    let finalText = text;
    if (!text || text.trim().length === 0) {
      finalText = "Tell me more about that.";
    }
    setTranscript(prev => [...prev, finalText]);
  };

  useEffect(() => {
    // Initial greeting
    const timer = setTimeout(() => {
      handleAIResponse('Hello Arthur, it\'s great to speak with you again. I was hoping you could tell me more about that summer trip to the lake house you mentioned?');
      setIsListening(true);
      setShowWaves(true);
    }, 1000);

    // Simulate auto-save cycle
    const saveInterval = setInterval(() => {
      if (isListening) {
        setSaveStatus('saving');
        setTimeout(() => {
          setSaveStatus('saved');
          setTimeout(() => {
            setSaveStatus('recording');
          }, 2000);
        }, 1500);
      }
    }, 10000);

    return () => {
      clearTimeout(timer);
      clearInterval(saveInterval);
    };
  }, [isListening]);

  // Toast Timer
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const toggleListening = () => {
    setIsListening(!isListening);
    setShowWaves(!showWaves);
  };

  const handleEndConversation = () => {
    // Logic to save session final state could go here
    router.push('/dashboard');
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) {
      setToastMessage('Cannot send an empty message.');
      return;
    }
    // Add user message to transcript (simulated)
    setTranscript(prev => [...prev, inputValue]); // In a real app, this would be distinguished as user text
    setInputValue('');
    setShowInput(false);

    // Simulate AI response
    setTimeout(() => {
        // Here we could simulate an empty response to test the logic: handleAIResponse('');
        // For now, standard response
        handleAIResponse("That's fascinating. Tell me more.");
    }, 1000);
  };

  return (
    <div className="bg-[#2A2320] font-sans text-orange-50 min-h-screen relative overflow-hidden flex flex-col">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-red-500 text-white px-6 py-3 rounded-full shadow-lg transition-all animate-fade-in">
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
        >
          <span className="material-symbols-outlined text-white/70">close</span>
        </button>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20">
          {saveStatus === 'saving' ? (
             <span className="material-symbols-outlined text-orange-500 text-sm animate-spin">progress_activity</span>
          ) : (
             <div className={`w-2 h-2 rounded-full bg-orange-500 ${saveStatus === 'recording' ? 'animate-pulse' : ''}`}></div>
          )}
          <span className="text-xs font-bold text-orange-500 tracking-wide uppercase">
            {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved' : 'Recording'}
          </span>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowLanguageMenu(!showLanguageMenu)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined text-white/70">more_horiz</span>
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
           <div className="space-y-4 max-h-[200px] overflow-y-auto no-scrollbar mask-fade-top">
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
                    <button onClick={() => setShowInput(false)} className="text-white/50 hover:text-white">
                       <span className="material-symbols-outlined">close</span>
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
           >
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
