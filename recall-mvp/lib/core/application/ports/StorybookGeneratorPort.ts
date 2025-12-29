export interface StorybookData {
    id: string;
    chapterId: string;
    title: string;
    childrenStory: string;
    scenes: any[]; // Using any[] to avoid circular deps with Scene types for now, or define Scene here too
    atoms: any;
    metadata: {
        generatedAt: Date;
        characterName: string;
        timePeriod: string;
        totalPages: number;
        style: string;
    };
}

export interface StorybookContext {
    characterName?: string;
    characterDescription?: string;
    visualThemes?: string[];
    timePeriod?: string;
}

export interface StorybookGeneratorPort {
    generateStorybook(chapterId: string, context?: StorybookContext): Promise<StorybookData>;
}
