'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

export interface Message {
    id: string;
    speaker: 'agent' | 'user';
    text: string;
    timestamp: Date;
    audioTimestamp?: number;
}

interface TranscriptDisplayProps {
  messages: Message[];
}

export function TranscriptDisplay({ messages }: TranscriptDisplayProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="bg-neutral-50 p-8 space-y-4 max-w-4xl mx-auto">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isAgent = message.speaker === 'agent';

  return (
    <div className={cn(
      "flex items-start gap-3",
      !isAgent && "flex-row-reverse"
    )}>
      {/* Avatar */}
      <div className={cn(
        "w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0",
        isAgent ? "bg-neutral-200" : "bg-primary-500"
      )}>
        {isAgent ? "🎙️" : "👤"}
      </div>

      {/* Message bubble */}
      <div className={cn(
        "max-w-[75%] px-4 py-3 rounded-lg",
        isAgent
          ? "bg-white border border-neutral-300 rounded-bl-none"
          : "bg-primary-500 text-white rounded-br-none"
      )}>
        <p className="text-base leading-relaxed">{message.text}</p>
      </div>
    </div>
  );
}
