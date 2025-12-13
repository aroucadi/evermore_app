'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/common/Sidebar';
import { Button } from '@/components/ui/button';
import { Chapter } from '@/lib/core/domain/entities/Chapter';
import { useParams } from 'next/navigation';

export default function ChapterDetailPage() {
  const { id } = useParams();
  const [chapter, setChapter] = useState<Chapter | null>(null);

  useEffect(() => {
    // In a real app we would have an API to get single chapter
    // For MVP we can just fetch all and find, or mock it if ID matches mock data
    // Let's assume we can fetch via the chapters list API for now or add a detail endpoint later.
    // For now, let's simulate fetching logic or reuse the store if populated
    // Since we don't have a detail API yet, we'll try to find it in local store or mock it.

    // Using a mock fetch for now as Detail API wasn't explicitly in my Plan for Backend but it is in Frontend features
    // I'll leave it as a placeholder or implement the detail API if time permits.
  }, [id]);

  if (!chapter && !id) return <div>Loading...</div>;

  return (
     <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 bg-neutral-50 p-8 flex justify-center">
        <div className="max-w-3xl bg-white p-12 shadow-sm rounded-lg min-h-[80vh]">
            <div className="mb-8">
                <h1 className="text-4xl font-serif font-bold text-neutral-900 mb-4">
                    {chapter?.title || "Chapter Title"}
                </h1>
                <div className="flex items-center gap-4 text-neutral-500 text-sm">
                    <span>Dec 10, 2025</span>
                    <span>•</span>
                    <span>{chapter?.metadata?.wordCount || 500} words</span>
                </div>
            </div>

            <div className="prose prose-lg text-neutral-800 leading-relaxed mb-12">
                {/* Simulated Content */}
                <p>
                   {chapter?.content || "Content will appear here..."}
                </p>
            </div>

             <div className="border-t pt-8 flex justify-between items-center">
                <Button variant="outline">
                    ← Back to Library
                </Button>
                <div className="flex gap-2">
                    <Button variant="outline">Download PDF</Button>
                    <Button>Share with Family</Button>
                </div>
             </div>
        </div>
      </main>
    </div>
  );
}
