
'use client';

import { useState, useEffect } from 'react';
import { useChapterStore } from '@/lib/stores/chapterStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChapterCard } from '@/components/chapter/ChapterCard';
import { FamilySidebar } from '@/components/common/FamilySidebar';

export default function PortalPage() {
  const { chapters, setChapters, filter, setSearch, toggleTag, clearFilters } = useChapterStore();

  useEffect(() => {
    // Fetch chapters from mock API
    fetch('/api/chapters/user-arthur')
      .then((res) => res.json())
      .then(setChapters);
  }, [setChapters]);

  const filteredChapters = chapters.filter((chapter) => {
    // Search filter
    if (filter.search && !chapter.title.toLowerCase().includes(filter.search.toLowerCase())) {
      return false;
    }

    // Tag filter
    if (filter.tags.length > 0) {
      const chapterTopics = chapter.entities.filter((e) => e.type === 'topic').map((e) => e.name);
      if (!filter.tags.some((tag) => chapterTopics.includes(tag))) {
        return false;
      }
    }

    return true;
  });

  const allTags = Array.from(
    new Set(chapters.flatMap((c) => c.entities.filter((e) => e.type === 'topic').map((e) => e.name)))
  );

  return (
    <div className="font-body antialiased text-text-main min-h-screen flex flex-col selection:bg-primary/20">
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl opacity-60"></div>
        <div className="absolute bottom-[20%] left-[-20%] w-[400px] h-[400px] bg-accent/5 rounded-full blur-3xl opacity-60"></div>
      </div>
      <header className="relative pt-6 px-5 pb-2 sticky top-0 z-30 transition-all duration-300">
        <div className="absolute inset-0 bg-background-warm/80 backdrop-blur-md -z-10 border-b border-white/20 shadow-sm"></div>
        <div className="relative flex justify-between items-center mb-6 pt-2">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="bg-center bg-no-repeat bg-cover rounded-full h-14 w-14 ring-4 ring-white shadow-soft" style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBfcFK6-jWC3iVMbNXfAvjTmZ7am8DPcnVwpDzz7DHNBKaahKftnDh9b6AoTqhU21Hmzu3ZJbZvLvLMFSPXiUY37MD5ufKOU_VDOcczWd9f1bcGxaM_-gauPtrlpDDOCgQ_b8bdApp5H06YeH-6z2cCixm53G-MSTnJQz8s4syqBD0I6B9HK94sSOR4ew--0RxA70eNhFOrZxElfTnbTjveEaLflZdZ22YsM1ZYr7mGSytiUlEiGdpSgSl3lVoEkcm60AS3w3CVMAw")'}}></div>
              <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-sm">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold leading-tight tracking-tight text-text-main">Arthur's Chapters</h1>
              <p className="text-text-secondary text-sm font-medium flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-primary">family_history</span>
                Family Library
              </p>
            </div>
          </div>
          <button className="flex items-center justify-center w-11 h-11 rounded-full bg-white/60 hover:bg-white border border-white/50 shadow-sm transition-all text-text-secondary hover:text-primary">
            <span className="material-symbols-outlined filled">notifications</span>
          </button>
        </div>
        <div className="relative mb-2">
          <label className="group flex items-center w-full h-12 glass-search rounded-2xl overflow-hidden focus-within:bg-white/80 focus-within:shadow-md focus-within:border-primary/30 transition-all">
            <div className="flex items-center justify-center pl-4 pr-3 text-text-secondary group-focus-within:text-primary transition-colors">
              <span className="material-symbols-outlined text-[22px]">search</span>
            </div>
            <Input
              type="search"
              placeholder="Search chapters..."
              value={filter.search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent border-none focus:ring-0 text-text-main placeholder:text-text-secondary/70 text-base font-normal h-full"
            />
          </label>
        </div>
      </header>
      <div className="sticky top-[146px] z-20 pb-4 pt-1">
        <div className="absolute inset-0 bg-background-warm/90 backdrop-blur-xl mask-image-gradient-b -z-10"></div>
        <div className="flex gap-3 px-5 overflow-x-auto no-scrollbar py-2">
          <Button
            onClick={clearFilters}
            className="flex h-10 shrink-0 items-center justify-center px-6 rounded-full bg-primary text-white font-medium text-sm shadow-lg shadow-primary/20 transition-transform active:scale-95 border border-primary"
          >
            All
          </Button>
          {allTags.map((tag) => (
            <Button
              key={tag}
              variant={filter.tags.includes(tag) ? "default" : "outline"}
              size="sm"
              onClick={() => toggleTag(tag)}
              className="flex h-10 shrink-0 items-center justify-center px-6 rounded-full bg-white/60 border border-white/60 text-text-secondary font-medium text-sm hover:bg-white hover:text-primary hover:shadow-md transition-all active:scale-95 backdrop-blur-sm"
            >
              {tag}
            </Button>
          ))}
        </div>
      </div>
      <main className="flex-1 px-5 pb-6 space-y-5 z-10">
        {filteredChapters.map((chapter) => (
          <ChapterCard key={chapter.id} chapter={chapter} />
        ))}
        {filteredChapters.length === 0 && (
          <div className="text-center py-16 text-neutral-600">
            <p className="text-lg">No chapters found matching your filters.</p>
          </div>
        )}
      </main>
    </div>
  );
}
