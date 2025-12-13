import { ChapterRepository } from '../../lib/core/domain/repositories/ChapterRepository';
import { Chapter } from '../../lib/core/domain/entities/Chapter';

// Mock Repository
const mockChapterRepository: ChapterRepository = {
    create: async (c) => c,
    findById: async () => null,
    findByUserId: async () => [],
    findByEntity: async (userId, type, name) => {
        // Mock implementation of logic
        if (type === 'person' && name === 'Bill') {
            return [new Chapter('1', 's1', userId, 'Title', 'Content', 'Excerpt', new Date())];
        }
        return [];
    }
};

(async () => {
    const chapters = await mockChapterRepository.findByEntity('user-1', 'person', 'Bill');
    if (chapters.length === 1) {
        console.log('ChapterRepository Query Test PASSED');
    } else {
        console.error('ChapterRepository Query Test FAILED');
        process.exit(1);
    }
})();
