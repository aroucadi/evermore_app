export type SessionStatus = 'active' | 'completed' | 'failed';

export interface Alert {
  timestamp: string;
  severity: string;
  reason: string;
  message: string;
}

export interface SessionMetadata {
  strategy_usage?: { [key: string]: number };
  avg_response_length?: number;
  sentiment_distribution?: { [key: string]: number };
  alerts?: Alert[];
  [key: string]: any; // Allow extensibility
}

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
    public metadata: SessionMetadata = {}
  ) {}

  addAlert(severity: string, reason: string, message: string): void {
    if (!this.metadata) {
      this.metadata = {};
    }
    if (!this.metadata.alerts) {
      this.metadata.alerts = [];
    }
    this.metadata.alerts.push({
      timestamp: new Date().toISOString(),
      severity,
      reason,
      message,
    });
  }
}
