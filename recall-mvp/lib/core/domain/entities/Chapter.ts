export type EntityType = 'person' | 'place' | 'topic';

export interface Entity {
  type: EntityType;
  name: string;
  mentions: number;
}

export class Chapter {
  constructor(
    public id: string,
    public sessionId: string,
    public userId: string,
    public title: string,
    public content: string,
    public excerpt: string,
    public createdAt: Date,
    public audioHighlightUrl?: string,
    public audioDuration?: number,
    public pdfUrl?: string,
    public entities?: Entity[],
    public metadata?: {
      sessionNumber: number;
      wordCount: number;
      emotionalTone: string;
      lifePeriod?: string;
    }
  ) {}
}
