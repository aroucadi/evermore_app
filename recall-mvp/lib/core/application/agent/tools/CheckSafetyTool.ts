import { Tool } from '../types';
import { ContentSafetyGuard } from '../../services/ContentSafetyGuard';

export class CheckSafetyTool implements Tool {
  name = 'CheckSafety';
  description = 'Check if the user input or intended response is safe.';
  schema = {
    type: 'object',
    properties: {
      text: { type: 'string', description: 'The text to check' },
    },
    required: ['text'],
  };

  constructor(
      private safetyGuard: ContentSafetyGuard,
      private userId: string,
      private sessionId: string,
      private emergencyContact?: string
  ) {}

  async execute(input: any): Promise<string> {
    if (!input.text) return 'Error: Missing text.';
    const isRisky = await this.safetyGuard.monitor(
        input.text,
        this.userId,
        this.sessionId,
        this.emergencyContact
    );
    return isRisky ? "RISK_DETECTED" : "SAFE";
  }
}
