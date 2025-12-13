
import { db } from '@/lib/db';
import { chapters } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;

    let chapter: any;
    try {
        const result = await db.select()
            .from(chapters)
            .where(eq(chapters.id, id))
            .limit(1);
        chapter = result[0];
    } catch (e) {
        console.warn("DB select chapter detail failed");
         if (id === 'mock-chapter-1') {
            chapter = {
                id: 'mock-chapter-1',
                title: 'The Ford Plant',
                content: '# The Ford Plant\n\nIn 1952...',
                excerpt: 'In 1952, at eighteen years old...',
                createdAt: new Date(),
                metadata: { wordCount: 200 },
                entities: [{type: 'topic', name: 'Ford'}]
            };
        }
    }

    if (!chapter) {
      return NextResponse.json(
        { error: 'Chapter not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(chapter);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch chapter' },
      { status: 500 }
    );
  }
}
