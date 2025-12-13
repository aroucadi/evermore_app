export type SessionStatus = 'active' | 'completed' | 'failed';

export class Session {
  constructor(
    public id: string,
    public userId: string,
    public transcriptRaw: string, // JSON string
    public status: SessionStatus,
    public startedAt: Date,
    public audioUrl?: string,
    public duration?: number,
    public endedAt?: Date,
    public metadata?: {
      strategy_usage?: { [key: string]: number };
      avg_response_length?: number;
      sentiment_distribution?: { [key: string]: number };
    }
  ) {}
}
