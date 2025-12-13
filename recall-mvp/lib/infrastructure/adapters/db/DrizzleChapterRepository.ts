import { ChapterRepository } from '../../../../core/domain/repositories/ChapterRepository';
import { Chapter } from '../../../../core/domain/entities/Chapter';
import { db } from './index';
import { chapters } from './schema';
import { eq, desc, and, sql } from 'drizzle-orm';

export class DrizzleChapterRepository implements ChapterRepository {
  async create(chapter: Chapter): Promise<Chapter> {
    const [created] = await db.insert(chapters).values({
      id: chapter.id,
      sessionId: chapter.sessionId,
      userId: chapter.userId,
      title: chapter.title,
      content: chapter.content,
      excerpt: chapter.excerpt,
      entities: chapter.entities,
      metadata: chapter.metadata,
      audioHighlightUrl: chapter.audioHighlightUrl,
      audioDuration: chapter.audioDuration,
      pdfUrl: chapter.pdfUrl
    }).returning();
    return this.mapToEntity(created);
  }

  async findByUserId(userId: string): Promise<Chapter[]> {
    const found = await db.select()
      .from(chapters)
      .where(eq(chapters.userId, userId))
      .orderBy(desc(chapters.createdAt));
    return found.map(this.mapToEntity);
  }

  async findById(id: string): Promise<Chapter | null> {
    const [found] = await db.select().from(chapters).where(eq(chapters.id, id));
    return found ? this.mapToEntity(found) : null;
  }

  async findByEntity(userId: string, entityType: string, entityName: string): Promise<Chapter[]> {
    // Advanced query using JSONB containment or path matching
    // Drizzle's `sql` operator is useful here for specific JSONB syntax
    const found = await db.select()
      .from(chapters)
      .where(
        and(
            eq(chapters.userId, userId),
            sql`${chapters.entities} @> ${JSON.stringify([{ type: entityType, name: entityName }])}::jsonb`
        )
      )
      .orderBy(desc(chapters.createdAt));

    return found.map(this.mapToEntity);
  }

  private mapToEntity(raw: any): Chapter {
    return new Chapter(
      raw.id,
      raw.sessionId,
      raw.userId,
      raw.title,
      raw.content,
      raw.excerpt,
      raw.createdAt,
      raw.audioHighlightUrl,
      raw.audioDuration,
      raw.pdfUrl,
      raw.entities,
      raw.metadata
    );
  }
}
