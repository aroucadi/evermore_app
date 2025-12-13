import Link from 'next/link';
import { Chapter } from '@/lib/core/domain/entities/Chapter';
import { formatDistanceToNow } from 'date-fns';

export function ChapterCard({ chapter }: { chapter: Chapter }) {
  // Defensive check for dates
  const createdAt = chapter.createdAt ? new Date(chapter.createdAt) : new Date();

  return (
    <Link href={`/chapter/${chapter.id}`}>
      <div className="bg-white p-6 rounded-lg border border-neutral-300 shadow-sm hover:shadow-md transition cursor-pointer">
        <div className="flex items-start gap-4">
          <div className="text-3xl flex-shrink-0">📖</div>

          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-semibold text-neutral-900 mb-2">
              {chapter.title}
            </h3>

            <p className="text-sm text-neutral-600 mb-3">
              {formatDistanceToNow(createdAt, { addSuffix: true })} • {chapter.metadata?.wordCount || 0} words
            </p>

            <p className="text-neutral-700 line-clamp-2 mb-4">
              {chapter.excerpt}
            </p>

            <div className="flex items-center justify-between">
              <span className="text-primary-500 font-medium hover:underline">
                Read Chapter →
              </span>

              {chapter.audioHighlightUrl && (
                <div className="flex items-center gap-1 text-sm text-neutral-600">
                  <span>🎵</span>
                  <span>{chapter.audioDuration ? `${Math.floor(chapter.audioDuration / 60)}:${(chapter.audioDuration % 60).toString().padStart(2, '0')}` : '0:00'}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
