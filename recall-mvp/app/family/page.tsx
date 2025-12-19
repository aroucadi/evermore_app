'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function FamilyPortalPage() {
  const [topicsToAvoid, setTopicsToAvoid] = useState<string[]>(['Politics', 'Recent Surgery']);
  const [newTopic, setNewTopic] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const handleAddTopic = () => {
    if (newTopic.trim()) {
      setTopicsToAvoid([...topicsToAvoid, newTopic.trim()]);
      setNewTopic('');
      // In a real app, we would call an API here to persist this
    }
  };

  const handleRemoveTopic = (topic: string) => {
    setTopicsToAvoid(topicsToAvoid.filter(t => t !== topic));
    // API call to persist
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        alert("Book exported successfully! (Download started)");
    } catch (e) {
        alert("Failed to export book");
    } finally {
        setIsExporting(false);
    }
  };

  return (
    <div className="bg-[#F8F9FA] min-h-screen font-sans text-slate-900 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors mr-2">
               <span className="material-symbols-outlined text-[20px] text-slate-600">arrow_back</span>
            </Link>
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">L</div>
            <h1 className="font-bold text-lg tracking-tight">The Lewis Family</h1>
          </div>
          <div className="flex items-center gap-4">
             <div className="hidden md:flex items-center -space-x-2">
                {[1,2,3].map(i => (
                   <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">
                      {['M', 'D', 'S'][i-1]}
                   </div>
                ))}
                <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">+4</div>
             </div>
             <button className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 text-sm font-semibold hover:bg-blue-100 transition-colors">
                <span className="material-symbols-outlined text-[18px]">person_add</span>
                <span className="hidden sm:inline">Invite</span>
             </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Left Column: Feed */}
           <div className="lg:col-span-2 space-y-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                 <span className="material-symbols-outlined text-blue-600">feed</span>
                 Latest Updates
              </h2>

              {/* Feed Item 1 */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                 <div className="p-4 flex items-center gap-3 border-b border-slate-100 bg-slate-50/50">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center border border-orange-200">
                       <span className="material-symbols-outlined text-orange-600 filled">mic</span>
                    </div>
                    <div>
                       <p className="font-semibold text-sm">Grandpa Arthur recorded a new story</p>
                       <p className="text-xs text-slate-500">2 hours ago • "The Summer of '65"</p>
                    </div>
                 </div>
                 <div className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                       <div className="md:w-1/3">
                          <div className="aspect-[4/5] rounded-xl bg-slate-100 relative overflow-hidden group cursor-pointer">
                             <img src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=800&auto=format&fit=crop" className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105" alt="Story cover" />
                             <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                                <span className="material-symbols-outlined text-white text-[48px] opacity-80 group-hover:opacity-100 transition-opacity">play_circle</span>
                             </div>
                          </div>
                       </div>
                       <div className="md:w-2/3 flex flex-col justify-between">
                          <div>
                             <h3 className="text-2xl font-bold text-slate-900 mb-2 font-serif">The Summer of '65</h3>
                             <p className="text-slate-600 leading-relaxed line-clamp-3 mb-4">
                                "It started on a Tuesday, the kind of Tuesday where the sun feels like it's trying to make up for a whole week of rain. We packed the station wagon until it was bursting at the seams..."
                             </p>
                             <div className="flex flex-wrap gap-2 mb-4">
                                <span className="px-2 py-1 rounded-md bg-slate-100 text-xs font-semibold text-slate-600 border border-slate-200">Road Trip</span>
                                <span className="px-2 py-1 rounded-md bg-slate-100 text-xs font-semibold text-slate-600 border border-slate-200">Lake Tahoe</span>
                             </div>
                          </div>
                          <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
                             <button className="flex items-center gap-1.5 text-slate-500 hover:text-red-500 transition-colors">
                                <span className="material-symbols-outlined text-[20px]">favorite</span>
                                <span className="text-sm font-medium">24</span>
                             </button>
                             <button className="flex items-center gap-1.5 text-slate-500 hover:text-blue-600 transition-colors">
                                <span className="material-symbols-outlined text-[20px]">comment</span>
                                <span className="text-sm font-medium">8 Comments</span>
                             </button>
                             <div className="flex-1"></div>
                             <Link href="/chapter/1" className="text-blue-600 font-bold text-sm hover:underline">Read Full Story</Link>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           {/* Right Column: Stats & Gallery & Settings */}
           <div className="space-y-8">
              {/* Book Progress */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                 <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-orange-500">book</span>
                    Book Progress
                 </h3>
                 <div className="space-y-4">
                    <div className="flex items-end justify-between mb-1">
                       <span className="text-3xl font-bold text-slate-900">12</span>
                       <span className="text-sm text-slate-500 font-medium mb-1">Chapters Completed</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                       <div className="bg-orange-500 h-2.5 rounded-full" style={{width: '45%'}}></div>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">Est. completion: Nov 15th</p>
                    <button
                        onClick={handleExport}
                        disabled={isExporting}
                        className="w-full mt-4 py-2 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isExporting ? 'Generating PDF...' : (
                            <>
                                <span className="material-symbols-outlined text-[18px]">download</span>
                                Export Book (PDF)
                            </>
                        )}
                    </button>
                 </div>
              </div>

              {/* Topics to Avoid (F-01) */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                 <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-red-500">block</span>
                    Topics to Avoid
                 </h3>
                 <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                        {topicsToAvoid.map((topic, i) => (
                            <span key={i} className="px-3 py-1 bg-red-50 text-red-600 text-sm font-medium rounded-full flex items-center gap-1">
                                {topic}
                                <button onClick={() => handleRemoveTopic(topic)} className="hover:text-red-800">
                                    <span className="material-symbols-outlined text-[14px]">close</span>
                                </button>
                            </span>
                        ))}
                    </div>
                    <div className="flex gap-2 mt-2">
                        <input
                            type="text"
                            value={newTopic}
                            onChange={(e) => setNewTopic(e.target.value)}
                            placeholder="Add topic..."
                            className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                            onKeyDown={(e) => e.key === 'Enter' && handleAddTopic()}
                        />
                        <button
                            onClick={handleAddTopic}
                            className="px-3 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
                        >
                            <span className="material-symbols-outlined">add</span>
                        </button>
                    </div>
                 </div>
              </div>

              {/* Recent Photos */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                 <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                       <span className="material-symbols-outlined text-purple-500">photo_library</span>
                       Recent Photos
                    </h3>
                    <button className="text-blue-600 text-xs font-bold hover:underline">View All</button>
                 </div>
                 <div className="grid grid-cols-3 gap-2">
                    {[1,2,3,4,5,6].map(i => (
                       <div key={i} className="aspect-square rounded-lg bg-slate-100 relative overflow-hidden group cursor-pointer">
                          <div className="absolute inset-0 bg-slate-200 group-hover:bg-slate-300 transition-colors"></div>
                       </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      </main>
    </div>
  );
}
