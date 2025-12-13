
import { create } from 'zustand';
import { ConversationState, Message } from '@/lib/types';

interface ConversationStore extends ConversationState {
  // Actions
  startSession: (sessionId: string) => void;
  endSession: () => void;
  addMessage: (message: Message) => void;
  setAgentSpeaking: (speaking: boolean) => void;
  updateDuration: (duration: number) => void;
  reset: () => void;
}

export const useConversationStore = create<ConversationStore>((set) => ({
  // Initial state
  isActive: false,
  sessionId: undefined,
  messages: [],
  duration: 0,
  isAgentSpeaking: false,

  // Actions
  startSession: (sessionId) => set({
    isActive: true,
    sessionId,
    messages: [],
    duration: 0
  }),

  endSession: () => set({
    isActive: false
  }),

  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message]
  })),

  setAgentSpeaking: (speaking) => set({
    isAgentSpeaking: speaking
  }),

  updateDuration: (duration) => set({ duration }),

  reset: () => set({
    isActive: false,
    sessionId: undefined,
    messages: [],
    duration: 0,
    isAgentSpeaking: false
  })
}));
