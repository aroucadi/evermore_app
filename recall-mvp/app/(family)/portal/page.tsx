
'use client';

import { useState, useEffect } from 'react';
import { useChapterStore } from '@/lib/stores/chapterStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChapterCard } from '@/components/chapter/ChapterCard';
import { Sidebar } from '@/components/common/Sidebar';

export default function PortalPage() {
  const { chapters, setChapters, filter, setSearch, toggleTag } = useChapterStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch chapters from API
    // Using mock user ID for demo
    fetch('/api/chapters/mock-user-id')
      .then((res) => res.json())
      .then(data => {
          // ensure dates are objects if needed, but JSON usually returns strings
          // The store or component might need to handle string -> Date conversion
          setChapters(data);
          setLoading(false);
      })
      .catch(e => {
          console.error(e);
          setLoading(false);
      });
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
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 bg-neutral-50 p-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">📖 Arthur's Chapters</h1>
        <div className="h-px bg-neutral-300 mb-6" />

        {/* Search */}
        <div className="mb-6 max-w-2xl">
          <Input
            type="search"
            placeholder="Search chapters..."
            value={filter.search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-12"
          />
        </div>

        {/* Filter Tags */}
        <div className="flex flex-wrap gap-2 mb-8">
          {allTags.map((tag) => (
            <Button
              key={tag}
              variant={filter.tags.includes(tag) ? "default" : "outline"}
              size="sm"
              onClick={() => toggleTag(tag)}
              className="rounded-full"
            >
              {tag}
            </Button>
          ))}
        </div>

        {/* Chapter Grid */}
        <div className="grid gap-4">
          {loading ? (
              <p>Loading chapters...</p>
          ) : filteredChapters.map((chapter) => (
            <ChapterCard key={chapter.id} chapter={chapter} />
          ))}
        </div>

        {!loading && filteredChapters.length === 0 && (
          <div className="text-center py-16 text-neutral-600">
            <p className="text-lg">No chapters found matching your filters.</p>
          </div>
        )}
      </main>
    </div>
  );
}
