export interface Message {
  id: string;
  speaker: 'agent' | 'user';
  text: string;
  timestamp: string | Date; // Allow string for serialization
  audioTimestamp?: number; // For audio sync
  strategy?: string;
}
