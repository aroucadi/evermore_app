
import { db } from '@/lib/db';
import { chapters } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const userId = (await params).userId;

    let userChapters: any[] = [];
    try {
        userChapters = await db.select()
            .from(chapters)
            .where(eq(chapters.userId, userId))
            .orderBy(desc(chapters.createdAt));
    } catch (e) {
        console.warn("DB select chapters failed, returning mocks");
        userChapters = [
            {
                id: 'mock-chapter-1',
                title: 'The Ford Plant',
                excerpt: 'In 1952, at eighteen years old...',
                createdAt: new Date(),
                metadata: { wordCount: 200 },
                entities: [{type: 'topic', name: 'Ford'}]
            }
        ];
    }

    return NextResponse.json(userChapters);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch chapters' },
      { status: 500 }
    );
  }
}
