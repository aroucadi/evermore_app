
// User Types
export type UserRole = 'senior' | 'family';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  seniorId?: string; // For family members
  createdAt: Date;
}

// Session Types
export interface ConversationSession {
  id: string;
  userId: string;
  transcript: Message[];
  audioUrl?: string;
  duration: number; // seconds
  startedAt: Date;
  endedAt?: Date;
  status: 'active' | 'completed';
}

export interface Message {
  id: string;
  speaker: 'agent' | 'user';
  text: string;
  timestamp: Date;
  audioTimestamp?: number; // For audio sync
}

// Chapter Types
export interface Chapter {
  id: string;
  sessionId: string;
  userId: string;
  title: string;
  content: string; // Markdown formatted
  excerpt: string; // First 100 chars
  audioHighlightUrl?: string;
  audioDuration?: number; // seconds
  pdfUrl?: string;
  entities: EntityMention[];
  metadata: ChapterMetadata;
  createdAt: Date;
}

export interface EntityMention {
  type: 'person' | 'place' | 'topic';
  name: string;
  mentions: number;
}

export interface ChapterMetadata {
  sessionNumber: number;
  wordCount: number;
  emotionalTone: 'positive' | 'neutral' | 'bittersweet' | 'melancholic';
  lifePeriod?: string; // "1950s", "Navy Years", etc.
}

// Conversation State
export interface ConversationState {
  isActive: boolean;
  sessionId?: string;
  messages: Message[];
  duration: number;
  isAgentSpeaking: boolean;
}
