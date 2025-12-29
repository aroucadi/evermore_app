'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { StoryCard } from '@/components/ui/stories/StoryCard';

interface Chapter {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  imageUrl?: string;
}

interface Story {
  id: string;
  title: string;
  narrator: string;
  date: string;
  excerpt: string;
  imageUrl: string;
}

// Fallback images for chapters without images
const FALLBACK_IMAGES = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuB1uP1kSbs-YHxcRRKPQopZgwbhcqd-OfV8P0JrEilZJ6d_MmtpwteqqCFrS09Q42HGgucZEzlRqrDw6CAs74McFJHqJkHdzYog-YbhFkTO1qHSgT7jU1aPst3JFdZMLpK0uhsO-fpGuP6dQlhXbWnneamYLEh5bj5J103mTH68DHis7_ptRygyMo6Ba4dBTpQ1I-JTrIhbL6VJ6omN1qv0nDoO2BsRHuJoeymP9P6guBTPvFRJRds9KJTeehLCXGmQfB7YszQpNBo",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAvAvQ9RC6JGyrS_gKf5mBpeubVvJTaP6dIKRZZm2hTVl7nJDrSJn0ojobwYp5svDgODckSByJRv77gG-7Z6g8QCcyAXnjuZUoF4NhkfnIlZdPJaQXcn9Wksp1-bzUBlx33mfu4vMXzcWpEcv2eT4MFjDgJY95cc0hTz6dPlxTZRzyzZ51D-yIKN9YkCyuCmXW80ZU7qd6FWMsT4RCyio3w8Gk9q99dahFMggN0AEbFTXPc-JzjKLq1iapARDauoKc_VGSCdu3nsy0",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDmaBwnfZ0jlqigJaix5kYuz0Rq0JHiiTFWAmZz4VPJF6Ly17lEUbdA0f6lzKqpivxd9bk0hxEHldS4uLelKsew9eey3VqugEZGhIttfhgQX4YXqIRTg1o8d0pPtsr3VOn81miKv41Dyimh4u8jWF8VYlNLH5F_f_brWOxnn_3kMfqT8tm2lGSw91Yrgzqzi2mTudG7RRV5KjXpEB6YYRtiqh9MUis0D6t_PWL63vPdYl-a3tMDYd3svcfefhAEbQjpkwUJO5ov7TA",
];

export default function StoriesPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Senior-focused: Simple story viewing, no storybook creation

  useEffect(() => {
    async function fetchStories() {
      try {
        // First check if we have a valid session
        const sessionRes = await fetch('/api/session/check');
        if (!sessionRes.ok) {
          // Not logged in, show empty state
          setLoading(false);
          return;
        }

        // Get user profile to get userId
        const profileRes = await fetch('/api/users/profile');
        if (!profileRes.ok) {
          throw new Error('Failed to fetch profile');
        }
        const profile = await profileRes.json();

        // SECURITY: Enforce Persona - Only seniors can access stories page
        if (profile.role !== 'senior') {
          window.location.href = '/family'; // Redirect family members to their dashboard
          return;
        }

        // Fetch chapters for this user
        const chaptersRes = await fetch(`/api/users/${profile.userId}/chapters`);
        if (!chaptersRes.ok) {
          throw new Error('Failed to fetch chapters');
        }
        const chapters: Chapter[] = await chaptersRes.json();

        // Transform chapters to stories format
        const transformedStories: Story[] = chapters.map((chapter, index) => ({
          id: chapter.id,
          title: chapter.title || 'Untitled Memory',
          narrator: profile.name || 'Family Member',
          date: new Date(chapter.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          excerpt: chapter.content?.substring(0, 120) + '...' || 'A cherished memory...',
          imageUrl: chapter.imageUrl || FALLBACK_IMAGES[index % FALLBACK_IMAGES.length],
        }));

        setStories(transformedStories);
      } catch (err: any) {
        console.error('Error fetching stories:', err);
        setError(err.message || 'Failed to load stories');
      } finally {
        setLoading(false);
      }
    }

    fetchStories();
  }, []);

  return (
    <div className="min-h-screen bg-[#FCF8F3] font-sans text-text-primary overflow-x-hidden">

      {/* Premium Header */}
      <header className="h-24 bg-white/40 backdrop-blur-xl flex items-center px-10 border-b border-peach-main/5">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-peach-warm to-terracotta rounded-2xl flex items-center justify-center text-white shadow-lg">
              <span className="material-symbols-outlined text-3xl filled">mic</span>
            </div>
            <span className="text-3xl font-serif font-black text-terracotta tracking-tight">ReCall</span>
          </Link>
          <nav className="hidden lg:flex items-center gap-10">
            <Link href="/" className="font-bold text-brown-main opacity-60 hover:opacity-100 transition-opacity">Home</Link>
            <div className="bg-peach-main/10 px-6 py-2 rounded-full ring-2 ring-peach-main/20">
              <Link href="/stories" className="font-extrabold text-terracotta">My Stories</Link>
            </div>
            <Link href="/conversation" className="font-bold text-brown-main opacity-60 hover:opacity-100 transition-opacity">Conversation</Link>
            <Link href="/profile" className="font-bold text-brown-main opacity-60 hover:opacity-100 transition-opacity">Profile</Link>
            <Link href="/settings" className="font-bold text-brown-main opacity-60 hover:opacity-100 transition-opacity">Settings</Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto py-20 px-6 max-w-7xl">

        {/* Page Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-16 gap-10 animate-fade-in">
          <div>
            <h1 className="text-5xl md:text-7xl font-serif font-extrabold text-text-primary mb-4 leading-tight">
              Your Memory Archive
            </h1>
            <p className="text-xl text-text-secondary font-medium opacity-70">A collection of your cherished stories, preserved forever.</p>
          </div>
          <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
            <div className="flex bg-white/60 backdrop-blur-sm border border-peach-main/10 rounded-full p-1.5 shadow-sm">
              <button className="px-6 py-2.5 rounded-full text-sm font-bold text-terracotta bg-white shadow-md">All Stories</button>
              <button className="px-6 py-2.5 rounded-full text-sm font-bold text-text-muted hover:text-text-secondary transition-colors">By Topic</button>
              <button className="px-6 py-2.5 rounded-full text-sm font-bold text-text-muted hover:text-text-secondary transition-colors">By Date</button>
            </div>
            <Link href="/conversation" className="bg-[#D4A373] hover:bg-[#C18E5E] text-white px-10 py-4 rounded-full font-bold shadow-xl shadow-peach-warm/20 hover:scale-105 transition-all flex items-center gap-3">
              <span className="material-symbols-outlined text-xl">add</span>
              Record New Story
            </Link>
          </div>
        </div>

        {/* Search Bar */}
        {!loading && stories.length > 0 && (
          <div className="relative mb-16 animate-fade-in [animation-delay:0.1s]">
            <input
              type="text"
              placeholder="Search through your memories..."
              className="w-full bg-white border-2 border-peach-main/10 rounded-2xl px-16 py-5 text-text-primary shadow-lg shadow-peach-warm/5 focus:outline-none focus:ring-4 focus:ring-terracotta/10 transition-all placeholder:text-text-muted font-medium"
            />
            <span className="material-symbols-outlined absolute left-6 top-1/2 -translate-y-1/2 text-terracotta text-2xl">search</span>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-[2rem] p-6 shadow-lg shadow-peach-warm/5 border border-peach-main/5 animate-pulse">
                <div className="aspect-[16/10] bg-peach-main/10 rounded-2xl mb-6"></div>
                <div className="h-4 bg-peach-main/20 rounded-full mb-4 w-1/3"></div>
                <div className="h-6 bg-peach-main/10 rounded-full mb-3 w-3/4"></div>
                <div className="h-4 bg-peach-main/5 rounded-full w-full mb-2"></div>
                <div className="h-4 bg-peach-main/5 rounded-full w-2/3"></div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-24 bg-red-50/30 rounded-[3rem] border border-red-100 animate-fade-in">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center text-red-500 mx-auto mb-6">
              <span className="material-symbols-outlined text-4xl">error</span>
            </div>
            <h3 className="text-2xl font-serif font-bold text-text-primary mb-2">Something went wrong</h3>
            <p className="text-text-secondary font-medium">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && stories.length === 0 && (
          <div className="text-center py-32 bg-white/30 rounded-[3rem] border-2 border-dashed border-peach-main/30 animate-fade-in">
            <div className="w-28 h-28 bg-peach-main/10 rounded-full flex items-center justify-center text-terracotta mx-auto mb-10">
              <span className="material-symbols-outlined text-6xl">auto_stories</span>
            </div>
            <h2 className="text-4xl font-serif font-extrabold text-text-primary mb-6">No stories yet</h2>
            <p className="text-xl text-text-secondary mb-12 max-w-lg mx-auto leading-relaxed font-medium opacity-70">
              Your masterpiece is waiting for its first brushstroke. Start a conversation with ReCall to record your first memory.
            </p>
            <Link href="/conversation" className="inline-flex items-center gap-4 bg-[#D4A373] hover:bg-[#C18E5E] text-white px-12 py-5 rounded-full font-bold shadow-2xl shadow-peach-warm/30 hover:scale-105 transition-all">
              <span className="material-symbols-outlined text-2xl">mic</span>
              Begin Your First Story
            </Link>
          </div>
        )}


        {/* Stories Grid - Senior View (Simple) */}
        {!loading && !error && stories.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10 animate-fade-in [animation-delay:0.2s]">
            {stories.map((story) => (
              <Link href={`/stories/${story.id}`} key={story.id} className="h-full group">
                <div className="bg-white rounded-[2rem] overflow-hidden shadow-xl shadow-peach-warm/5 border border-peach-main/5 h-full flex flex-col hover:-translate-y-2 transition-all duration-500">
                  <div className="aspect-[16/10] overflow-hidden relative">
                    <img src={story.imageUrl} alt={story.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <p className="text-[10px] font-black text-terracotta uppercase tracking-widest mb-2">{story.date}</p>
                    <h3 className="text-xl font-serif font-bold text-text-primary mb-3 line-clamp-2 group-hover:text-terracotta transition-colors">{story.title}</h3>
                    <p className="text-sm text-text-muted leading-relaxed line-clamp-3 flex-1">{story.excerpt}</p>
                    <div className="mt-6 pt-4 border-t border-peach-main/10 flex justify-between items-center">
                      <span className="text-xs font-bold text-text-muted opacity-60">by {story.narrator}</span>
                      <span className="text-xs font-black text-terracotta uppercase tracking-widest flex items-center gap-1">
                        Read <span className="material-symbols-outlined text-sm">chevron_right</span>
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="py-20 bg-white/40 border-t border-peach-main/10 mt-32">
        <div className="container mx-auto px-10 max-w-7xl flex flex-col md:flex-row justify-between items-center gap-10">
          <p className="text-sm font-bold text-text-muted opacity-60">© 2024 ReCall. Immortalizing Stories.</p>
          <div className="flex gap-10 text-sm font-bold text-text-muted opacity-60">
            <Link href="#" className="hover:text-terracotta transition-colors">About</Link>
            <Link href="#" className="hover:text-terracotta transition-colors">Help</Link>
            <Link href="#" className="hover:text-terracotta transition-colors">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
