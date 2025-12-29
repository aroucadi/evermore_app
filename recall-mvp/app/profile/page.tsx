'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AppShell } from '@/components/layout/AppShell';
import { Header } from '@/components/layout/Header';

interface UserProfile {
    userId: string;
    role: 'senior' | 'family';
    displayName: string;
    preferences?: {
        topicsLove?: string[];
    };
}

interface Chapter {
    id: string;
    title: string;
    content?: string;
    createdAt: string;
    imageUrl?: string;
}

const TARGET_CHAPTERS = 15;

// Fallback images for chapters without images
const FALLBACK_IMAGES = [
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAvAvQ9RC6JGyrS_gKf5mBpeubVvJTaP6dIKRZZm2hTVl7nJDrSJn0ojobwYp5svDgODckSByJRv77gG-7Z6g8QCcyAXnjuZUoF4NhkfnIlZdPJaQXcn9Wksp1-bzUBlx33mfu4vMXzcWpEcv2eT4MFjDgJY95cc0hTz6dPlxTZRzyzZ51D-yIKN9YkCyuCmXW80ZU7qd6FWMsT4RCyio3w8Gk9q99dahFMggN0AEbFTXPc-JzjKLq1iapARDauoKc_VGSCdu3nsy0",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAWLg1Gak0lUXEmSP9sqIy5_h2MOouRH_vGk4FuZWk0O4DLTIfKWhiMw9vYuQ3PLClVvLFFsb_VhNMSDyxgEBik_qvnxe6P8GzLacA8uKbRMMnV1aB_FKgFTdcijW4_KtfoCENLPgzX5l4zXCwvZWgkCjSz2T4ndmYGzvjmZ8xJ4NF2eFNQQjYEp6-1PBw90Z8c7J1qz9aX5wxTnG0NzbgM99wC6RNN7XEYAD-pA4l683VKWghgEhcFmNCxILngKSMveaU5ZdXOQwY",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuB1uP1kSbs-YHxcRRKPQopZgwbhcqd-OfV8P0JrEilZJ6d_MmtpwteqqCFrS09Q42HGgucZEzlRqrDw6CAs74McFJHqJkHdzYog-YbhFkTO1qHSgT7jU1aPst3JFdZMLpK0uhsO-fpGuP6dQlhXbWnneamYLEh5bj5J103mTH68DHis7_ptRygyMo6Ba4dBTpQ1I-JTrIhbL6VJ6omN1qv0nDoO2BsRHuJoeymP9P6guBTPvFRJRds9KJTeehLCXGmQfB7YszQpNBo",
];

export default function ProfilePage() {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
    const [saveMessage, setSaveMessage] = useState('');
    const [interestInput, setInterestInput] = useState('');
    const [showInterestInput, setShowInterestInput] = useState(false);

    // All hooks must be defined before any conditional returns
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        displayName: '',
        aboutMe: '',
        interests: [] as string[],
        // Biographical fields for AI context
        birthYear: undefined as number | undefined,
        gender: undefined as 'male' | 'female' | 'other' | undefined,
        location: '',
        formerOccupation: '',
        spouseName: '',
        childrenCount: undefined as number | undefined,
        grandchildrenCount: undefined as number | undefined,
        favoriteDecade: ''
    });

    useEffect(() => {
        async function fetchData() {
            try {
                // Fetch user profile
                const profileRes = await fetch('/api/users/profile');
                if (!profileRes.ok) {
                    throw new Error('Failed to fetch profile');
                }
                const profileData = await profileRes.json();
                setProfile(profileData);

                // Fetch user's chapters
                if (profileData.userId) {
                    const chaptersRes = await fetch(`/api/users/${profileData.userId}/chapters`);
                    if (chaptersRes.ok) {
                        const chaptersData = await chaptersRes.json();
                        setChapters(chaptersData);
                    }
                }
            } catch (err: any) {
                console.error('Error fetching profile data:', err);
                setError(err.message || 'Failed to load profile');
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    useEffect(() => {
        if (profile) {
            setEditData({
                displayName: profile.displayName || '',
                aboutMe: profile.role === 'senior'
                    ? 'A retired history teacher with a passion for gardening and classic films. Father of three, grandfather of five.'
                    : 'A devoted family member helping to preserve our shared history for future generations.',
                interests: profile.preferences?.topicsLove || ['Gardening', 'Photography', 'Classical Music', 'History', 'Travel'],
                // Biographical fields
                birthYear: undefined,
                gender: undefined,
                location: '',
                formerOccupation: '',
                spouseName: '',
                childrenCount: undefined,
                grandchildrenCount: undefined,
                favoriteDecade: ''
            });
        }
    }, [profile]);

    const handleSave = async () => {
        if (!profile) return;

        setSaveStatus('saving');
        setSaveMessage('');

        try {
            const res = await fetch('/api/users/profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': profile.userId,
                    'x-user-role': profile.role
                },
                body: JSON.stringify({
                    type: profile.role,
                    updates: {
                        topicsLove: editData.interests,
                        // Other fields would go here if backend supported them
                    }
                })
            });

            if (!res.ok) throw new Error('Failed to save profile');

            const updatedProfile = await res.json();
            setProfile(updatedProfile); // Update local state with server response
            setSaveStatus('success');
            setTimeout(() => {
                setSaveStatus('idle');
                setIsEditing(false);
            }, 1500);
        } catch (err: any) {
            console.error('Error saving profile:', err);
            setSaveStatus('error');
            setSaveMessage('Failed to save changes. Please try again.');
        }
    };

    const handleChangePhoto = () => {
        alert("Photo upload is coming soon!");
    };

    const handleShareProfile = () => {
        navigator.clipboard.writeText(window.location.href);
        alert("Profile link copied to clipboard!");
    };

    const removeInterest = (interest: string) => {
        setEditData(prev => ({
            ...prev,
            interests: prev.interests.filter(i => i !== interest)
        }));
    };

    const addInterest = () => {
        if (interestInput.trim() && !editData.interests.includes(interestInput.trim())) {
            setEditData(prev => ({
                ...prev,
                interests: [...prev.interests, interestInput.trim()]
            }));
            setInterestInput('');
            setShowInterestInput(false);
        }
    };

    // Calculate book progress
    const progressPercent = Math.min(Math.round((chapters.length / TARGET_CHAPTERS) * 100), 100);

    // Get recent chapters (up to 3)
    const recentChapters = chapters
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 3);

    // Get user's topics/interests
    const topics = profile?.preferences?.topicsLove || [];

    if (loading) {
        return (
            <AppShell userType="senior" showNav={true}>
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="flex flex-col lg:flex-row gap-12 items-start">
                        <div className="w-full lg:w-1/3 flex flex-col items-center">
                            <div className="w-64 h-64 rounded-full bg-border-light animate-pulse mb-8"></div>
                            <div className="h-8 w-48 bg-border-light rounded animate-pulse mb-4"></div>
                            <div className="h-4 w-64 bg-border-light rounded animate-pulse"></div>
                        </div>
                        <div className="w-full lg:w-2/3 space-y-8">
                            <div className="h-48 bg-border-light rounded-[2rem] animate-pulse"></div>
                            <div className="grid grid-cols-3 gap-6">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="aspect-square bg-border-light rounded-2xl animate-pulse"></div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </AppShell>
        );
    }

    if (error) {
        return (
            <AppShell userType="senior" showNav={true}>
                <div className="max-w-7xl mx-auto px-4 py-8 text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-500 mx-auto mb-4">
                        <span className="material-symbols-outlined text-3xl">error</span>
                    </div>
                    <p className="text-text-secondary-light mb-4">{error}</p>
                    <Link href="/stories" className="text-primary hover:underline">Return to Stories</Link>
                </div>
            </AppShell>
        );
    }

    // Hooks are now all at the top, this is just the main render

    const displayName = profile?.displayName || 'Arthur Pendelton';
    const isSenior = profile?.role === 'senior';

    if (isEditing) {
        return (
            <AppShell userType={profile?.role} showNav={true}>
                <main className="container mx-auto py-10 px-0 max-w-6xl">
                    <h1 className="text-4xl md:text-5xl font-serif font-extrabold text-terracotta text-center mb-16">
                        Update <span className="text-text-primary">{displayName.split(' ')[0]}'s Details 📖</span>
                    </h1>

                    <div className="grid lg:grid-cols-12 gap-12">
                        {/* Profile Photo Side */}
                        <div className="lg:col-span-4 flex flex-col items-center">
                            <div className="bg-white p-10 rounded-[3rem] shadow-2xl shadow-peach-warm/20 border border-peach-main/10 flex flex-col items-center w-full">
                                <div className="w-48 h-48 rounded-full border-4 border-peach-main/20 p-1 bg-white relative mb-8 group overflow-hidden">
                                    <div className="w-full h-full rounded-full overflow-hidden">
                                        <Image
                                            src={isSenior ? '/images/avatar_senior.png' : '/images/avatar_family.png'}
                                            alt={displayName}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                    </div>
                                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="material-symbols-outlined text-white text-3xl">photo_camera</span>
                                    </div>
                                </div>
                                <h3 className="text-xl font-serif font-bold text-text-primary mb-6">{displayName}</h3>
                                <button
                                    onClick={handleChangePhoto}
                                    className="w-full py-4 rounded-full bg-peach-main/10 text-brown-main font-bold hover:bg-peach-main/20 transition-all flex items-center justify-center gap-2">
                                    <span className="material-symbols-outlined text-xl">image</span>
                                    Change Photo
                                </button>
                            </div>
                        </div>

                        {/* Form Side */}
                        <div className="lg:col-span-8">
                            <div className="bg-white p-10 md:p-14 rounded-[3rem] shadow-2xl shadow-peach-warm/20 border border-peach-main/10 space-y-10">
                                <div className="space-y-4">
                                    <label className="block text-sm font-black uppercase tracking-[0.2em] text-text-muted">Display Name</label>
                                    <input
                                        type="text"
                                        value={editData.displayName}
                                        onChange={(e) => setEditData({ ...editData, displayName: e.target.value })}
                                        className="w-full px-8 py-4 rounded-2xl border-2 border-peach-main/20 focus:border-terracotta focus:outline-none bg-[#FCF8F3]/30 font-medium"
                                        placeholder="Enter your name"
                                    />
                                </div>

                                {/* Senior-only fields */}
                                {isSenior && (
                                    <>
                                        {/* Biographical Grid */}
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="block text-xs font-black uppercase tracking-widest text-text-muted">Birth Year</label>
                                                <input
                                                    type="number"
                                                    value={editData.birthYear || ''}
                                                    onChange={(e) => setEditData({ ...editData, birthYear: e.target.value ? parseInt(e.target.value) : undefined })}
                                                    className="w-full px-6 py-3 rounded-xl border-2 border-peach-main/20 focus:border-terracotta focus:outline-none bg-[#FCF8F3]/30 font-medium"
                                                    placeholder="e.g., 1945"
                                                    min="1900"
                                                    max={new Date().getFullYear()}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="block text-xs font-black uppercase tracking-widest text-text-muted">Gender</label>
                                                <select
                                                    value={editData.gender || ''}
                                                    onChange={(e) => setEditData({ ...editData, gender: e.target.value as 'male' | 'female' | 'other' | undefined || undefined })}
                                                    className="w-full px-6 py-3 rounded-xl border-2 border-peach-main/20 focus:border-terracotta focus:outline-none bg-[#FCF8F3]/30 font-medium"
                                                >
                                                    <option value="">Select...</option>
                                                    <option value="male">Male</option>
                                                    <option value="female">Female</option>
                                                    <option value="other">Other</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="block text-xs font-black uppercase tracking-widest text-text-muted">Location</label>
                                                <input
                                                    type="text"
                                                    value={editData.location}
                                                    onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                                                    className="w-full px-6 py-3 rounded-xl border-2 border-peach-main/20 focus:border-terracotta focus:outline-none bg-[#FCF8F3]/30 font-medium"
                                                    placeholder="City, State/Country"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="block text-xs font-black uppercase tracking-widest text-text-muted">Former Occupation</label>
                                                <input
                                                    type="text"
                                                    value={editData.formerOccupation}
                                                    onChange={(e) => setEditData({ ...editData, formerOccupation: e.target.value })}
                                                    className="w-full px-6 py-3 rounded-xl border-2 border-peach-main/20 focus:border-terracotta focus:outline-none bg-[#FCF8F3]/30 font-medium"
                                                    placeholder="e.g., Teacher, Engineer"
                                                />
                                            </div>
                                        </div>

                                        {/* Family Section */}
                                        <div className="space-y-4 pt-4 border-t border-peach-main/10">
                                            <h4 className="text-sm font-black uppercase tracking-widest text-text-muted flex items-center gap-2">
                                                <span className="material-symbols-outlined text-lg">family_restroom</span>
                                                Family Information
                                            </h4>
                                            <div className="grid md:grid-cols-3 gap-4">
                                                <div className="space-y-2">
                                                    <label className="block text-xs font-bold text-text-muted">Spouse Name</label>
                                                    <input
                                                        type="text"
                                                        value={editData.spouseName}
                                                        onChange={(e) => setEditData({ ...editData, spouseName: e.target.value })}
                                                        className="w-full px-4 py-2 rounded-lg border border-peach-main/20 focus:border-terracotta focus:outline-none bg-white/50 text-sm"
                                                        placeholder="Optional"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="block text-xs font-bold text-text-muted">Children</label>
                                                    <input
                                                        type="number"
                                                        value={editData.childrenCount || ''}
                                                        onChange={(e) => setEditData({ ...editData, childrenCount: e.target.value ? parseInt(e.target.value) : undefined })}
                                                        className="w-full px-4 py-2 rounded-lg border border-peach-main/20 focus:border-terracotta focus:outline-none bg-white/50 text-sm"
                                                        min="0"
                                                        placeholder="0"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="block text-xs font-bold text-text-muted">Grandchildren</label>
                                                    <input
                                                        type="number"
                                                        value={editData.grandchildrenCount || ''}
                                                        onChange={(e) => setEditData({ ...editData, grandchildrenCount: e.target.value ? parseInt(e.target.value) : undefined })}
                                                        className="w-full px-4 py-2 rounded-lg border border-peach-main/20 focus:border-terracotta focus:outline-none bg-white/50 text-sm"
                                                        min="0"
                                                        placeholder="0"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Memory Context */}
                                        <div className="space-y-2">
                                            <label className="block text-xs font-black uppercase tracking-widest text-text-muted">Favorite Decade</label>
                                            <select
                                                value={editData.favoriteDecade}
                                                onChange={(e) => setEditData({ ...editData, favoriteDecade: e.target.value })}
                                                className="w-full px-6 py-3 rounded-xl border-2 border-peach-main/20 focus:border-terracotta focus:outline-none bg-[#FCF8F3]/30 font-medium"
                                            >
                                                <option value="">Select your favorite era...</option>
                                                <option value="1940s">1940s</option>
                                                <option value="1950s">1950s</option>
                                                <option value="1960s">1960s</option>
                                                <option value="1970s">1970s</option>
                                                <option value="1980s">1980s</option>
                                                <option value="1990s">1990s</option>
                                            </select>
                                        </div>

                                        <div className="space-y-4">
                                            <label className="block text-sm font-black uppercase tracking-[0.2em] text-text-muted">About Me</label>
                                            <textarea
                                                rows={4}
                                                value={editData.aboutMe}
                                                onChange={(e) => setEditData({ ...editData, aboutMe: e.target.value })}
                                                className="w-full px-8 py-5 rounded-2xl border-2 border-peach-main/20 focus:border-terracotta focus:outline-none bg-[#FCF8F3]/30 font-medium resize-none leading-relaxed"
                                                placeholder="Tell us a bit about yourself"
                                            />
                                        </div>

                                        <div className="space-y-4">
                                            <label className="block text-sm font-black uppercase tracking-[0.2em] text-text-muted">Interests</label>
                                            <div className="w-full px-8 py-4 rounded-2xl border-2 border-peach-main/20 bg-[#FCF8F3]/30 flex flex-wrap gap-2">
                                                {editData.interests.map((tag, idx) => (
                                                    <span key={idx} className="px-4 py-1.5 bg-white rounded-full text-sm font-bold text-brown-main shadow-sm flex items-center gap-2 group">
                                                        {tag}
                                                        <button
                                                            onClick={() => removeInterest(tag)}
                                                            className="material-symbols-outlined text-sm text-text-muted hover:text-red-500">close</button>
                                                    </span>
                                                ))}
                                                {showInterestInput ? (
                                                    <div className="flex gap-2 w-full md:w-auto mt-2">
                                                        <input
                                                            type="text"
                                                            value={interestInput}
                                                            onChange={(e) => setInterestInput(e.target.value)}
                                                            onKeyDown={(e) => e.key === 'Enter' && addInterest()}
                                                            placeholder="Enter interest..."
                                                            autoFocus
                                                            className="px-4 py-1.5 border-b-2 border-terracotta bg-transparent focus:outline-none text-sm font-bold"
                                                        />
                                                        <button onClick={addInterest} className="text-terracotta">
                                                            <span className="material-symbols-outlined">check</span>
                                                        </button>
                                                        <button onClick={() => setShowInterestInput(false)} className="text-text-muted">
                                                            <span className="material-symbols-outlined">close</span>
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => setShowInterestInput(true)}
                                                        className="px-4 py-1.5 border border-dashed border-peach-main/40 rounded-full text-sm font-bold text-text-muted hover:border-terracotta hover:text-terracotta transition-all">+ Add Interest</button>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Family-only message */}
                                {!isSenior && (
                                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 text-center">
                                        <span className="material-symbols-outlined text-blue-400 text-3xl mb-2">info</span>
                                        <p className="text-sm text-blue-600 font-medium">
                                            As a family member, you can update your display name. For more settings, visit the Settings page.
                                        </p>
                                    </div>
                                )}

                                <div className="pt-6 flex flex-col sm:flex-row gap-4">
                                    <button
                                        onClick={handleSave}
                                        disabled={saveStatus === 'saving'}
                                        className="flex-1 py-5 rounded-full bg-[#8CAF8C] hover:bg-[#7A9E7A] text-white font-black text-xl shadow-xl shadow-green-900/10 transition-all active:scale-95 disabled:opacity-50"
                                    >
                                        {saveStatus === 'saving' ? 'Saving...' : 'Save Changes'}
                                    </button>
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="flex-1 py-5 rounded-full bg-peach-main/10 hover:bg-peach-main/20 text-brown-main font-black text-xl transition-all"
                                    >
                                        Cancel
                                    </button>
                                </div>

                                {/* Feedback UI */}
                                {saveStatus === 'error' && (
                                    <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-xl text-center font-bold">
                                        {saveMessage}
                                    </div>
                                )}
                                {saveStatus === 'success' && (
                                    <div className="mt-4 p-4 bg-green-50 text-green-600 rounded-xl text-center font-bold">
                                        Changes saved successfully!
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </AppShell>
        );
    }

    return (
        <AppShell userType={profile?.role} showNav={true}>
            <main className="container mx-auto py-10 px-0 max-w-7xl">
                <div className="grid lg:grid-cols-12 gap-16 items-start">

                    {/* Identity Section (Sticky) */}
                    <div className="lg:col-span-5 xl:col-span-4 flex flex-col items-center lg:sticky lg:top-32 text-center">
                        <div className="relative mb-10">
                            <div className="w-64 h-64 rounded-full border-8 border-[#D4A373]/20 p-2 bg-white shadow-2xl relative z-10">
                                <div className="w-full h-full rounded-full overflow-hidden relative">
                                    <Image
                                        src={isSenior ? '/images/avatar_senior.png' : '/images/avatar_family.png'}
                                        alt={displayName}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            </div>
                            <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-br from-[#D4A373]/20 to-transparent rounded-full blur-3xl opacity-50"></div>
                        </div>

                        <h1 className="text-5xl font-serif font-extrabold text-text-primary mb-4 leading-tight">{displayName}</h1>
                        <p className="text-xl text-text-secondary font-medium leading-relaxed max-w-sm mb-12 opacity-80">
                            {isSenior
                                ? "Welcome to my journey. Sharing our family stories, one memory at a time."
                                : "Helping preserve our shared history. Documenting every memory for the generations to come."
                            }
                        </p>

                        <div className="flex flex-col gap-4 w-full max-w-xs">
                            <button
                                onClick={handleShareProfile}
                                className="w-full py-4 rounded-full bg-white border-2 border-peach-main/20 text-text-secondary font-bold hover:bg-peach-main/5 transition-all flex items-center justify-center gap-2 shadow-sm">
                                <span className="material-symbols-outlined text-xl">share</span>
                                Share Profile
                            </button>
                            <button
                                onClick={() => setIsEditing(true)}
                                className="w-full py-4 rounded-full bg-[#D4A373] text-white font-bold hover:bg-[#C18E5E] transition-all flex items-center justify-center gap-2 shadow-xl shadow-peach-warm/20"
                            >
                                <span className="material-symbols-outlined text-xl">edit</span>
                                Edit Profile
                            </button>
                        </div>
                    </div>

                    {/* Activity Content */}
                    <div className="lg:col-span-7 xl:col-span-8 space-y-12">

                        {/* Progress Section */}
                        <section className="bg-gradient-to-br from-[#FDF0D5] to-[#FDE2D0] rounded-[3rem] p-10 md:p-14 shadow-2xl shadow-peach-warm/10 border border-white relative overflow-hidden group">
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-10">
                                    <h2 className="text-3xl font-serif font-black text-text-primary opacity-80 uppercase tracking-tight">
                                        {isSenior ? "My Story Book Progress" : "Family Collection Growth"}
                                    </h2>
                                    <div className="text-right">
                                        <div className="text-5xl font-serif font-black text-text-primary">
                                            {chapters.length} <span className="text-2xl font-medium opacity-40">of {TARGET_CHAPTERS}</span>
                                        </div>
                                        <p className="text-xs font-black uppercase tracking-widest text-text-muted mt-1">
                                            {isSenior ? "Stories Written" : "Stories Curated"}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="w-full h-4 bg-white/40 rounded-full overflow-hidden shadow-inner">
                                        <div
                                            className="h-full bg-gradient-to-r from-[#D4A373] to-[#BC8A5F] rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-1"
                                            style={{ width: `${progressPercent}%` }}
                                        >
                                            <div className="w-1.5 h-1.5 bg-white rounded-full shadow-sm"></div>
                                        </div>
                                    </div>
                                    <p className="text-sm font-black text-text-muted opacity-60 uppercase tracking-widest">{progressPercent}% Complete</p>
                                </div>

                                <div className="mt-12">
                                    <Link href={isSenior ? "/dashboard" : "/family"} className="inline-flex items-center gap-3 bg-white/40 hover:bg-white/60 backdrop-blur-md px-10 py-4 rounded-2xl font-black text-brown-main shadow-lg shadow-peach-warm/10 transition-all transform hover:-translate-y-1 border border-white">
                                        <span className="material-symbols-outlined text-xl">{isSenior ? "book_2" : "hub"}</span>
                                        {isSenior ? "View Book Draft" : "View Family Portal"}
                                    </Link>
                                </div>
                            </div>
                            {/* Subtle grain texture placeholder */}
                            <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay"></div>
                        </section>

                        {/* Recent Memories Section */}
                        <section>
                            <h2 className="text-3xl font-serif font-black text-text-primary mb-10 opacity-80">
                                {isSenior ? "Recent Memories Shared" : "Recent Family Stories"}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                                {recentChapters.length > 0 ? (
                                    recentChapters.map((chapter, i) => (
                                        <div key={chapter.id} className="bg-white rounded-[2rem] p-6 shadow-xl shadow-peach-warm/5 border border-peach-main/5 flex flex-col gap-6 hover:-translate-y-2 transition-transform duration-500">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1 pr-4">
                                                    <h3 className="text-lg font-serif font-bold text-text-primary mb-2 line-clamp-2">{chapter.title || 'The Summer at Lake Como'}</h3>
                                                    <p className="text-xs text-text-muted leading-relaxed line-clamp-2 italic opacity-70">
                                                        {chapter.content || 'The old boat house was our castle...'}
                                                    </p>
                                                </div>
                                                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-peach-main/5 relative flex-shrink-0">
                                                    <Image
                                                        src={chapter.imageUrl || FALLBACK_IMAGES[i % FALLBACK_IMAGES.length]}
                                                        alt={chapter.title}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center pt-2 border-t border-peach-main/5">
                                                <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">October 26, 2023</span>
                                                <Link href={`/stories/${chapter.id}`} className="px-4 py-1.5 bg-peach-main/10 rounded-lg text-[10px] font-black uppercase text-terracotta hover:bg-peach-main/20 transition-all">
                                                    Read More
                                                </Link>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    [1, 2, 3].map(i => (
                                        <div key={i} className="bg-white rounded-[2.2rem] p-6 shadow-xl shadow-peach-warm/5 border border-peach-main/5 flex flex-col gap-6 opacity-40">
                                            <div className="flex justify-between items-start">
                                                <div className="h-4 w-3/4 bg-peach-main/10 rounded mb-2"></div>
                                                <div className="w-20 h-20 rounded-2xl bg-peach-main/10"></div>
                                            </div>
                                            <div className="h-10 bg-peach-main/5 rounded-xl"></div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </section>

                        {/* About Section */}
                        <section className="bg-white rounded-[3rem] p-10 md:p-14 shadow-2xl shadow-peach-warm/5 border border-peach-main/10">
                            <h2 className="text-3xl font-serif font-black text-text-primary mb-8 opacity-80">About Me</h2>
                            <p className="text-lg text-text-secondary leading-relaxed font-serif italic mb-10 opacity-80">
                                {editData.aboutMe}
                            </p>
                            <div className="flex flex-wrap gap-4">
                                {editData.interests.map((tag, idx) => (
                                    <span key={idx} className="px-5 py-2 rounded-full bg-peach-main/5 border border-peach-main/10 text-xs font-bold text-brown-main opacity-80">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </section>

                    </div>
                </div>
            </main>
        </AppShell>
    );
}
