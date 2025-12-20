export interface PDFPort {
    generateBook(chapters: { title: string; content: string }[], photos: string[]): Promise<Buffer>;
}
