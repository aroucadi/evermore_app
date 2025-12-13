
'use client';

import { useState, useEffect, useRef } from 'react';
import { useConversationStore } from '@/lib/stores/conversationStore';
import { Button } from '@/components/ui/button';
import { WaveformVisualizer } from '@/components/conversation/WaveformVisualizer';
import { TranscriptDisplay } from '@/components/conversation/TranscriptDisplay';
import { formatDuration } from '@/lib/utils';
// import { useRouter } from 'next/navigation'; // Unused

export default function ConversationPage() {
  // const router = useRouter(); // Unused
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
    // Call API to start session
    try {
        const response = await fetch('/api/sessions/start', {
            method: 'POST',
            body: JSON.stringify({ userId: 'mock-user-id' }) // In real app, get from auth context
        });
        const data = await response.json();

        startSession(data.sessionId);

        // Add initial greeting (simulated from agent start or websocket)
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
            useConversationStore.setState((state) => ({ duration: state.duration + 1 }));
        }, 1000);
    } catch (e) {
        console.error("Failed to start session", e);
    }
  };

  const handleEnd = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Call API to end session
    if (sessionId) {
        await fetch(`/api/sessions/${sessionId}/end`, {
            method: 'POST'
        });
    }

    endSession();
    // Maybe show summary or thank you
    alert("Conversation ended. Chapter generation started.");
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

    // Get agent response from API
    try {
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
    } catch (e) {
        console.error("Failed to get response", e);
    }

    setAgentSpeaking(false);
  };

  // Clean up timer on unmount
  useEffect(() => {
      return () => {
          if (timerRef.current) {
              clearInterval(timerRef.current);
          }
      };
  }, []);

  if (!isActive) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-primary-50 flex items-center justify-center">
        <div className="text-center max-w-2xl px-4">
          {/* Microphone Icon */}
          <div className="mb-8 inline-block">
            <div className="w-32 h-32 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-6xl">🎙️</span>
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
          <div className="mt-16 text-left">
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
          <span>End Call</span>
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
