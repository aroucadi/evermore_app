
'use client';

import { useEffect, useRef } from 'react';
import { Message } from '@/lib/types';
import { cn } from '@/lib/utils';

interface TranscriptDisplayProps {
  messages: Message[];
}

export function TranscriptDisplay({ messages }: TranscriptDisplayProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="bg-transparent p-8 space-y-4 max-w-4xl mx-auto">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isAgent = message.speaker === 'agent';

  const agentAvatar = "https://lh3.googleusercontent.com/aida-public/AB6AXuCH2QULWmU227MbsQfBVkErS88_fwsIUcatC8pLVF52yJG44c7-hm13z6ibhgtJhCYLmQtaOULpA2xip7Dg-OZOKpkR8K0FlxoQl3oG9zLyS0_FyXMBTK7N_zB9koNiOpUEVTj5w0K59cKJWna9m2cK0hXb_VUWw62dF3T5hZHmBEEvNoRqKDBtu6-X1MXcONPMETNJyC17HgiM30jbKsReRiAC4pnsYOJbMJ98IM4FgpgnAlRm5C2coO4Mn_dNSKYOP78pszxhCM4";
  const userAvatar = "https://lh3.googleusercontent.com/aida-public/AB6AXuAmSnWAHmsGxCthJInatgYSvtbnvwKle5AbXklk2e4LKXi4aYl5Pjc-hwlga8SmLRPbG6FJ3YzYz4RzHhNgPlVzRD6ZgPznJvAR8TINjVoWfAfzWX8HuEqBl1zzgU0oGhJnxTxUf6xJPZKk3YCEZkvjVAiTJWgU94pMeQ1m4OCTKxA56eLW1PKIStu4WYePMvj8vSN3SCEtZdA3E54XDbmC1b50VcnjonKReF-WRL6fzStUH8NfDMXAkOrGZoIN1PgLE4Nu-bVTrR4";

  return (
    <div className={cn(
      "flex items-end gap-3 max-w-[90%] group",
      isAgent ? "self-start" : "self-end flex-row-reverse"
    )}>
      <div className={cn(
        "w-10 h-10 rounded-full overflow-hidden shrink-0 border shadow-lg bg-cover bg-center",
        isAgent ? "border-white/10 bg-surface-glass" : "border-2 border-primary/30"
      )} style={{backgroundImage: `url(${isAgent ? agentAvatar : userAvatar})`}}></div>
      <div className={cn(
        "flex flex-col gap-1.5",
        !isAgent && "items-end"
      )}>
        <span className="text-white/50 text-xs font-medium tracking-wide",
          isAgent ? "ml-4" : "mr-4"
        >
          {isAgent ? "Recall" : "You"}
        </span>
        <div className={cn(
          "px-5 py-4 rounded-2xl",
          isAgent
            ? "glass-bubble-ai rounded-bl-none"
            : "glass-bubble-user text-background-dark rounded-br-none"
        )}>
          <p className="text-[17px] leading-relaxed font-semibold">
            {message.text}
          </p>
        </div>
      </div>
    </div>
  );
}
