
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Header } from '@/components/common/Header';

export default function OnboardingPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    seniorName: '',
    familyName: '',
    email: '',
    relationship: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call to create users
    // In real app: POST /api/users
    try {
        await fetch('/api/users', {
            method: 'POST',
            body: JSON.stringify({
                name: formData.seniorName,
                email: 'senior@example.com', // simplified for demo
                role: 'senior'
            })
        });

        // Redirect to portal
        router.push('/portal');
    } catch (error) {
        console.error("Onboarding failed", error);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-12 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-md max-w-md w-full">
          <h1 className="text-2xl font-bold mb-6 text-center">Create Your Account</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="seniorName">Senior's Name</Label>
              <Input
                id="seniorName"
                placeholder="e.g. Arthur Thompson"
                value={formData.seniorName}
                onChange={(e) => setFormData({...formData, seniorName: e.target.value})}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="familyName">Your Name</Label>
              <Input
                id="familyName"
                placeholder="e.g. Sarah Thompson"
                value={formData.familyName}
                onChange={(e) => setFormData({...formData, familyName: e.target.value})}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Your Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="sarah@example.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="relationship">Relationship</Label>
              <Input
                id="relationship"
                placeholder="e.g. Daughter"
                value={formData.relationship}
                onChange={(e) => setFormData({...formData, relationship: e.target.value})}
                required
              />
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
