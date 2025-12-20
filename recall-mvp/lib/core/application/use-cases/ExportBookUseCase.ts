import { ChapterRepository } from '../../domain/repositories/ChapterRepository';
import { PDFPort } from '../ports/PDFPort';

export class ExportBookUseCase {
    constructor(
        private chapterRepository: ChapterRepository,
        private pdfService: PDFPort
    ) {}

    async execute(userId: string): Promise<Buffer> {
        const chapters = await this.chapterRepository.findByUserId(userId);

        // Transform for PDF Service
        const bookContent = chapters.map(ch => ({
            title: ch.title,
            content: ch.content
        }));

        // In a real app, we might fetch photos associated with chapters
        const photos: string[] = [];

        return this.pdfService.generateBook(bookContent, photos);
    }
}
