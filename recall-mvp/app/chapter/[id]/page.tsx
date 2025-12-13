
'use client'
import { Chapter } from "@/lib/types";
import { useEffect, useState } from "react";
import { format } from 'date-fns';
import { Skeleton } from "@/components/ui/skeleton";

function ChapterDetailSkeleton() {
  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-gray-800 dark:text-gray-100 min-h-screen">
      <div className="relative flex flex-col min-h-screen pb-36 z-10">
        <header className="sticky top-0 z-40 flex items-center justify-between px-6 py-4 transition-all">
          <Skeleton className="size-14 rounded-full" />
          <Skeleton className="size-14 rounded-full" />
        </header>
        <main className="flex-1 flex flex-col px-6 pt-4 gap-8 max-w-3xl mx-auto w-full">
          <section className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-3 text-base font-medium">
              <Skeleton className="h-8 w-24 rounded-full" />
              <Skeleton className="h-6 w-32 rounded-full" />
            </div>
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-3/4 rounded-lg" />
          </section>
          <section className="w-full relative group">
            <Skeleton className="h-32 w-full rounded-2xl" />
          </section>
          <article className="mt-4 mb-6 relative">
            <div className="md:pl-8 space-y-4">
              <Skeleton className="h-8 w-full rounded-lg" />
              <Skeleton className="h-8 w-full rounded-lg" />
              <Skeleton className="h-8 w-5/6 rounded-lg" />
            </div>
          </article>
        </main>
      </div>
    </div>
  )
}


export default function ChapterDetail({ params }: { id: string}) {
  const [chapter, setChapter] = useState<Chapter | null>(null);

  useEffect(() => {
    if (params.id) {
      fetch(`/api/chapters/detail/${params.id}`)
        .then((res) => res.json())
        .then(setChapter);
    }
  }, [params.id]);

  if (!chapter) {
    return <ChapterDetailSkeleton />;
  }

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-gray-800 dark:text-gray-100 min-h-screen">
      <div className="relative flex flex-col min-h-screen pb-36 z-10">
        <header className="sticky top-0 z-40 flex items-center justify-between px-6 py-4 transition-all">
          <button aria-label="Go back to chapters" className="glass-button flex items-center justify-center size-14 rounded-full hover:bg-white/80 dark:hover:bg-white/20 active:scale-95 transition-all shadow-sm group">
            <span className="material-symbols-outlined text-gray-800 dark:text-gray-100 group-hover:-translate-x-0.5 transition-transform">arrow_back_ios_new</span>
          </button>
          <button aria-label="Menu" className="glass-button flex items-center justify-center size-14 rounded-full hover:bg-white/80 dark:hover:bg-white/20 active:scale-95 transition-all shadow-sm">
            <span className="material-symbols-outlined text-gray-800 dark:text-gray-100">more_horiz</span>
          </button>
        </header>

        <main className="flex-1 flex flex-col px-6 pt-4 gap-8 max-w-3xl mx-auto w-full">
          <section className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-3 text-base font-medium">
              <span className="px-4 py-1.5 rounded-full bg-primary/10 text-primary-dark dark:text-primary border border-primary/20 backdrop-blur-sm">
                Session {chapter.metadata.sessionNumber}
              </span>
              <span className="text-gray-500 dark:text-gray-400 font-display flex items-center gap-1">
                <span className="material-symbols-outlined text-[18px]">calendar_today</span> {format(new Date(chapter.createdAt), 'MMM dd, yyyy')}
              </span>
              <span className="text-gray-300 dark:text-gray-600">•</span>
              <span className="text-gray-500 dark:text-gray-400 font-display">{chapter.audioDuration} mins</span>
            </div>
            <h1 className="text-[2.5rem] leading-[1.15] font-bold tracking-tight text-gray-900 dark:text-white font-serif">
              {chapter.title}
            </h1>
          </section>

          <section className="w-full relative group">
            <div className="glass-panel p-5 rounded-[2rem] shadow-xl shadow-orange-900/5 relative overflow-hidden transition-transform hover:scale-[1.01] duration-500">
              <div className="flex items-center gap-5 relative z-10">
                <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white truncate leading-tight font-display">Highlight Reel</h3>
                  <p className="text-primary-dark dark:text-primary font-medium text-base truncate">{chapter.audioDuration} <span className="text-gray-400 dark:text-gray-500 font-normal">/ {chapter.metadata.wordCount} words</span></p>
                </div>
                <button className="flex shrink-0 items-center justify-center rounded-full size-16 bg-gradient-to-br from-primary to-primary-dark text-white shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all ring-4 ring-white/20 dark:ring-white/5">
                  <span className="material-symbols-outlined icon-filled text-[36px] ml-1">play_arrow</span>
                </button>
              </div>
            </div>
          </section>

          <article className="mt-4 mb-6 relative">
            <div className="md:pl-8">
              <p className="text-2xl leading-[1.7] text-gray-800 dark:text-gray-200 mb-8 font-serif">
                {chapter.content}
              </p>
            </div>
          </article>

          <section className="py-8 border-t border-primary/10 dark:border-white/10">
            <h2 className="text-sm font-bold uppercase tracking-widest text-primary-dark/70 dark:text-primary/70 mb-5 pl-1">Mentioned in this story</h2>
            <div className="flex flex-wrap gap-3">
              {chapter.entities.map((entity, index) => (
                <button key={index} className="group flex items-center gap-3 pl-2 pr-5 py-2 rounded-full bg-white/70 dark:bg-white/5 border border-primary/10 dark:border-white/10 hover:border-primary/40 hover:bg-white dark:hover:bg-white/10 hover:shadow-md transition-all">
                  <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-xl icon-filled">{entity.type === 'person' ? 'person' : entity.type === 'place' ? 'location_on' : 'phishing'}</span>
                  </div>
                  <span className="text-lg font-medium text-gray-700 dark:text-gray-200 font-display">{entity.name}</span>
                </button>
              ))}
            </div>
          </section>
        </main>

        <div className="fixed bottom-0 inset-x-0 p-6 pb-8 bg-gradient-to-t from-background-light via-background-light/95 to-transparent dark:from-background-dark dark:via-background-dark/95 dark:to-transparent z-50 pointer-events-none">
          <div className="pointer-events-auto max-w-3xl mx-auto flex gap-4 p-2.5 rounded-[1.2rem] glass-panel shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
            <button className="flex-1 flex items-center justify-center gap-2 h-16 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-gray-800 dark:text-white font-bold transition-all active:scale-[0.98]">
              <span className="material-symbols-outlined">download</span>
              <span className="text-lg">PDF</span>
            </button>
            <button className="flex-[2] flex items-center justify-center gap-3 h-16 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark active:scale-[0.98] transition-all shadow-lg shadow-primary/30 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="material-symbols-outlined text-[24px]">ios_share</span>
              <span className="text-lg tracking-wide">Share Story</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
