export interface ChapterGeneratorResult {
  chapter: string;
  atoms: {
    narrativeArc: string;
    emotionalValence: string;
    [key: string]: any;
  };
}

export interface ChapterGeneratorPort {
  generateChapter(transcript: string, previousContext: any[]): Promise<ChapterGeneratorResult>;
}
