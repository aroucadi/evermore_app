export interface AgentStep {
  thought: string;
  action: string;
  actionInput: any;
  observation?: string;
}

export interface AgentPlan {
  goal: string;
  steps: string[];
}

export interface Tool {
  name: string;
  description: string;
  schema: any; // JSON schema for arguments
  execute(input: any): Promise<string>;
}

export interface AgentContext {
  userId: string;
  sessionId: string;
  memories: any[]; // RAG results
  recentHistory: any[]; // Chat history
}

export interface AgentRunResult {
  finalAnswer: string;
  steps: AgentStep[];
  success: boolean;
}
