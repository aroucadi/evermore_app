export interface AIServicePort {
  generateQuestion(
    userUtterance: string,
    history: any[],
    memories: any[]
  ): Promise<{ text: string; strategy: string }>;

  generateChapterAnalysis(transcript: string): Promise<any>;

  generateChapterNarrative(
    transcript: string,
    analysis: any
  ): Promise<{ content: string; wordCount: number }>;

  startVoiceConversation(userId: string, sessionId: string, userName: string, memories: any[]): Promise<{
    agentId: string;
    conversationId: string;
    wsUrl?: string;
  }>;
}
