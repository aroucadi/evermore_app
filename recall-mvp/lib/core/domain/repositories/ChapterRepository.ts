import { Chapter } from '../entities/Chapter';

export interface ChapterRepository {
  create(chapter: Chapter): Promise<Chapter>;
  findByUserId(userId: string): Promise<Chapter[]>;
  findById(id: string): Promise<Chapter | null>;
  findByEntity(userId: string, entityType: string, entityName: string): Promise<Chapter[]>;
}
