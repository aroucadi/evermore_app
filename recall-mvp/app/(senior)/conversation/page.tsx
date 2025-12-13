'use client';

import { useState, useRef } from 'react';
import { useConversationStore } from '@/lib/stores/conversationStore';
import { Button } from '@/components/ui/button';
import { WaveformVisualizer } from '@/components/conversation/WaveformVisualizer';
import { TranscriptDisplay } from '@/components/conversation/TranscriptDisplay';
import { formatDuration } from '@/lib/utils';
import { Message } from '@/components/conversation/TranscriptDisplay'; // Import type for consistency

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

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleStart = async () => {
    // Call mock API to start session
    // Using a hardcoded mock user ID for MVP demo flow
    const response = await fetch('/api/sessions/start', {
      method: 'POST',
      body: JSON.stringify({ userId: 'user-mvp-demo' })
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

    // Start duration timer
    timerRef.current = setInterval(() => {
      updateDuration(duration + 1);
    }, 1000);
  };

  const handleEnd = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Call mock API to end session
    if (sessionId) {
        await fetch(`/api/sessions/${sessionId}/end`, {
        method: 'POST'
        });
    }

    endSession();
  };

  const handleSimulateUserMessage = async () => {
    const userText = "I was thinking about my first job at the Ford plant.";

    // Add user message
    addMessage({
      id: `msg-${Date.now()}`,
      speaker: 'user',
      text: userText,
      timestamp: new Date()
    });

    // Simulate agent thinking
    setAgentSpeaking(true);

    if (sessionId) {
        // Get agent response from mock API
        const response = await fetch(`/api/sessions/${sessionId}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: userText, speaker: 'user' })
        });
        const agentMessage = await response.json();

        // Add agent response
        if (agentMessage.text) {
             addMessage({
                id: agentMessage.id,
                speaker: 'agent',
                text: agentMessage.text,
                timestamp: new Date(agentMessage.timestamp)
            });
        }
    }

    setAgentSpeaking(false);
  };

  if (!isActive) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-primary-50 flex items-center justify-center">
        <div className="text-center max-w-2xl px-4">
          {/* Microphone Icon */}
          <div className="mb-8 inline-block">
            <div className="w-32 h-32 rounded-full bg-primary-100 flex items-center justify-center">
              <svg className="w-16 h-16 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
          </div>

          <h1 className="text-2xl font-semibold text-neutral-900 mb-4">
            Ready to chat?
          </h1>

          <Button
            size="lg"
            className="rounded-full px-12 py-6 text-lg"
            onClick={handleStart}
          >
            Start Conversation
          </Button>

          {/* Previous conversations */}
          <div className="mt-16">
            <h2 className="text-lg font-semibold mb-4">Previous Conversations</h2>
            <div className="space-y-3">
              <PreviousConversationCard title="The Ford Plant" date="Dec 10" />
              <PreviousConversationCard title="Navy Days" date="Dec 8" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="bg-neutral-900 text-white px-6 py-4 flex justify-between items-center">
        <div className="font-mono text-lg">
          Session {formatDuration(duration)}
        </div>
        <Button
          variant="destructive"
          onClick={handleEnd}
          className="flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
          </svg>
          End Call
        </Button>
      </div>

      {/* Waveform Visualizer */}
      <div className="p-6">
        <WaveformVisualizer isActive={isAgentSpeaking} />
      </div>

      {/* Transcript */}
      <div className="flex-1 overflow-y-auto">
        <TranscriptDisplay messages={messages} />
      </div>

      {/* Demo button to simulate user message */}
      <div className="p-4 bg-neutral-100 text-center">
        <Button onClick={handleSimulateUserMessage} variant="outline">
          Simulate User Response (Demo)
        </Button>
      </div>
    </div>
  );
}

function PreviousConversationCard({ title, date }: { title: string; date: string }) {
  return (
    <div className="bg-white p-4 rounded-md border-l-4 border-primary-500 shadow-sm hover:shadow-md transition cursor-pointer">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl">📖</span>
          <div>
            <h3 className="font-medium">{title}</h3>
            <p className="text-sm text-neutral-600">{date}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
