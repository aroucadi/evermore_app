export interface VectorStorePort {
  storeConversation(sessionId: string, transcript: string, userId: string): Promise<void>;
  storeMemoryChunk(userId: string, sessionId: string, text: string, metadata: any): Promise<void>;
  retrieveContext(userId: string, currentTopic?: string): Promise<any[]>;
}
