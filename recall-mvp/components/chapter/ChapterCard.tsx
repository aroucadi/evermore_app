
import Link from 'next/link';
import { Chapter } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';

export function ChapterCard({ chapter }: { chapter: Chapter }) {
  const getIconForTopic = (topic: string) => {
    switch (topic.toLowerCase()) {
      case 'navy service':
        return 'sailing';
      case 'romance':
        return 'favorite';
      case 'career':
        return 'work';
      default:
        return 'history_edu';
    }
  };

  return (
    <Link href={`/chapter/${chapter.id}`}>
      <article className="group relative flex flex-col gap-3 glass-card p-5 rounded-3xl transition-all active:scale-[0.99] touch-manipulation hover:shadow-glass hover:-translate-y-0.5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center rounded-2xl bg-blue-50 text-blue-500 shrink-0 h-14 w-14 shadow-inner ring-1 ring-blue-100">
              <span className="material-symbols-outlined text-[28px]">{getIconForTopic(chapter.entities.find(e => e.type === 'topic')?.name || '')}</span>
            </div>
            <div>
              <h2 className="text-text-main text-lg font-display font-bold leading-tight">{chapter.title}</h2>
              <div className="flex items-center gap-2 mt-1.5">
                {chapter.entities.filter(e => e.type === 'topic').map(tag => (
                  <span key={tag.name} className="text-[11px] font-bold tracking-wide uppercase bg-blue-100/50 text-blue-700 px-2.5 py-1 rounded-lg border border-blue-100">{tag.name}</span>
                ))}
                <span className="text-text-secondary text-xs flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-text-secondary/40"></span> {formatDistanceToNow(chapter.createdAt, { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>
          <button className="h-9 w-9 rounded-full flex items-center justify-center text-text-secondary hover:bg-secondary/30 transition-colors">
            <span className="material-symbols-outlined">more_horiz</span>
          </button>
        </div>
        <p className="text-text-main/80 text-[15px] leading-relaxed line-clamp-2 pl-1 font-body">
          {chapter.excerpt}
        </p>
        <div className="flex items-center justify-between pt-3 border-t border-black/5 mt-1">
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 pl-2 pr-4 py-1.5 rounded-full bg-white/50 border border-white/60 hover:bg-primary hover:border-primary hover:text-white transition-all shadow-sm group/play">
              <span className="material-symbols-outlined text-[22px] text-primary group-hover/play:text-white">play_circle</span>
              <span className="text-xs font-semibold text-text-secondary group-hover/play:text-white">{Math.floor((chapter.audioDuration || 0) / 60)}:{((chapter.audioDuration || 0) % 60).toString().padStart(2, '0')} Listen</span>
            </button>
            <span className="text-text-secondary text-xs font-medium opacity-70">{chapter.metadata.wordCount} words</span>
          </div>
          <div className="h-9 w-9 rounded-full bg-white/50 border border-white/60 flex items-center justify-center text-text-secondary group-hover:bg-primary group-hover:border-primary group-hover:text-white transition-all shadow-sm">
            <span className="material-symbols-outlined text-[20px]">chevron_right</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
