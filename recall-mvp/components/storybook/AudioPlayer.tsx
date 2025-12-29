'use client';

import React, { useState, useRef, useEffect } from 'react';

interface AudioPlayerProps {
    text: string;
    onPlayingChange?: (isPlaying: boolean) => void;
    className?: string;
    autoPlay?: boolean;
}

/**
 * AudioPlayer Component
 * 
 * Plays narration using Web Speech API (fallback)
 * Future: Will use streamed audio from TTS providers
 */
export function AudioPlayer({ text, onPlayingChange, className = '', autoPlay = false }: AudioPlayerProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isSupported, setIsSupported] = useState(false);
    const [progress, setProgress] = useState(0);
    const synthRef = useRef<SpeechSynthesis | null>(null);
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            synthRef.current = window.speechSynthesis;
            setTimeout(() => setIsSupported(true), 0);
        }

        return () => {
            synthRef.current?.cancel();
        };
    }, []);

    const handlePlay = () => {
        if (!synthRef.current || isPlaying) return;

        // Cancel any ongoing speech
        synthRef.current.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utteranceRef.current = utterance;

        // Get a friendly voice
        const voices = synthRef.current.getVoices();
        const friendlyVoice = voices.find(v =>
            v.lang.startsWith('en') && (v.name.includes('Samantha') || v.name.includes('Karen') || v.name.includes('Daniel'))
        ) || voices.find(v => v.lang.startsWith('en'));

        if (friendlyVoice) utterance.voice = friendlyVoice;

        // Slower, warmer pace for storytelling
        utterance.rate = 0.9;
        utterance.pitch = 1.0;

        utterance.onstart = () => {
            setIsPlaying(true);
            onPlayingChange?.(true);
        };

        utterance.onend = () => {
            setIsPlaying(false);
            setProgress(100);
            onPlayingChange?.(false);
            setTimeout(() => setProgress(0), 1000);
        };

        utterance.onerror = () => {
            setIsPlaying(false);
            onPlayingChange?.(false);
        };

        // Estimate progress (rough)
        const words = text.split(/\s+/).length;
        const estimatedMs = words * 400; // ~400ms per word at 0.9 rate
        let elapsed = 0;
        const interval = setInterval(() => {
            elapsed += 100;
            setProgress(Math.min((elapsed / estimatedMs) * 100, 99));
            if (!synthRef.current?.speaking) {
                clearInterval(interval);
            }
        }, 100);

        synthRef.current.speak(utterance);
    };

    useEffect(() => {
        if (autoPlay && isSupported && text) {
            handlePlay();
        }
    }, [autoPlay, text]);

    const handlePause = () => {
        if (!synthRef.current) return;

        if (isPlaying) {
            synthRef.current.pause();
            setIsPlaying(false);
            onPlayingChange?.(false);
        } else {
            synthRef.current.resume();
            setIsPlaying(true);
            onPlayingChange?.(true);
        }
    };

    const handleStop = () => {
        synthRef.current?.cancel();
        setIsPlaying(false);
        setProgress(0);
        onPlayingChange?.(false);
    };

    if (!isSupported) {
        return (
            <div className={`flex items-center gap-2 text-amber-600/50 ${className}`}>
                <span className="material-symbols-outlined text-lg">volume_off</span>
                <span className="text-xs font-medium">Audio unavailable</span>
            </div>
        );
    }

    return (
        <div className={`flex items-center gap-3 ${className}`}>
            {/* Play/Pause Button */}
            <button
                onClick={isPlaying ? handlePause : handlePlay}
                className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 text-white flex items-center justify-center shadow-lg hover:opacity-90 transition-all"
            >
                <span className="material-symbols-outlined">
                    {isPlaying ? 'pause' : 'play_arrow'}
                </span>
            </button>

            {/* Progress Bar */}
            <div className="flex-1 h-1.5 bg-amber-200/50 rounded-full overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-amber-400 to-orange-400 transition-all duration-200"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Stop Button */}
            {isPlaying && (
                <button
                    onClick={handleStop}
                    className="w-8 h-8 rounded-full bg-white/80 text-amber-700 flex items-center justify-center hover:bg-white transition-all"
                >
                    <span className="material-symbols-outlined text-lg">stop</span>
                </button>
            )}

            {/* Listen Label */}
            {!isPlaying && progress === 0 && (
                <span className="text-xs font-bold text-amber-700/70 uppercase tracking-wider">
                    Listen
                </span>
            )}
        </div>
    );
}
