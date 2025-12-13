export interface VectorStorePort {
  storeConversation(sessionId: string, transcript: string, userId: string): Promise<void>;
  retrieveContext(userId: string, currentTopic?: string): Promise<any[]>;
}
