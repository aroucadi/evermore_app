
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Sidebar } from '@/components/common/Sidebar';
import { Button } from '@/components/ui/button';
import { Chapter } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';

export default function ChapterDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    fetch(`/api/chapters/detail/${id}`)
      .then((res) => {
          if (!res.ok) throw new Error('Failed to fetch');
          return res.json();
      })
      .then((data) => {
          setChapter(data);
          setLoading(false);
      })
      .catch((e) => {
          console.error(e);
          setLoading(false);
      });
  }, [id]);

  if (loading) {
      return <div className="p-8">Loading...</div>;
  }

  if (!chapter) {
      return <div className="p-8">Chapter not found.</div>;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 bg-neutral-50 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto bg-white shadow-sm rounded-xl p-8 md:p-12 border border-neutral-200">
            <div className="mb-8 border-b pb-8">
                <Button variant="ghost" className="mb-4 pl-0" onClick={() => router.back()}>
                    ← Back to Library
                </Button>

                <h1 className="text-3xl md:text-4xl font-serif font-bold text-neutral-900 mb-4">
                    {chapter.title}
                </h1>

                <div className="flex items-center gap-4 text-neutral-500 text-sm">
                    <span>{new Date(chapter.createdAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{chapter.metadata.wordCount} words</span>
                    <span>•</span>
                    <span>{chapter.metadata.lifePeriod || 'Life Story'}</span>
                </div>
            </div>

            {/* Audio Player Placeholder */}
            {chapter.audioHighlightUrl && (
                <div className="mb-8 bg-primary-50 p-4 rounded-lg flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white cursor-pointer">
                        ▶
                    </div>
                    <div className="flex-1">
                        <div className="text-sm font-medium text-primary-900">Audio Highlight</div>
                        <div className="h-1 bg-primary-200 rounded-full mt-2 w-full">
                            <div className="h-full w-1/3 bg-primary-600 rounded-full"></div>
                        </div>
                    </div>
                    <div className="text-xs text-primary-700 font-mono">
                        {Math.floor(chapter.audioDuration! / 60)}:{(chapter.audioDuration! % 60).toString().padStart(2, '0')}
                    </div>
                </div>
            )}

            <div className="prose prose-lg max-w-none font-serif text-neutral-800">
                {/*
                  In a real app, we would use a markdown parser.
                  For MVP demo, we assume content is either HTML or simple text.
                  If markdown, we'd use react-markdown.
                  Here we just render simple text with line breaks.
                */}
                {chapter.content.split('\n').map((paragraph, i) => (
                    <p key={i} className="mb-4">
                        {paragraph}
                    </p>
                ))}
            </div>

            <div className="mt-12 pt-8 border-t flex justify-between items-center">
                <Button variant="outline">Download PDF</Button>
                <Button>Share with Family</Button>
            </div>
        </div>
      </main>
    </div>
  );
}
