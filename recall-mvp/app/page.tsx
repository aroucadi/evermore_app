
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary-50 to-neutral-50 py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6 max-w-3xl mx-auto">
            Preserve Your Parent's Stories with AI
          </h1>

          <p className="text-xl text-neutral-600 mb-8 max-w-2xl mx-auto">
            Turn meaningful conversations into lasting memories.
            Recall uses AI to capture life stories through natural voice conversations.
          </p>

          <Link href="/onboarding">
            <Button size="lg" className="text-lg px-8 py-6">
              Get Started Free →
            </Button>
          </Link>

          {/* Demo Video Placeholder */}
          <div className="mt-12 max-w-4xl mx-auto">
            <div className="aspect-video bg-neutral-200 rounded-xl shadow-xl flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-primary-500 flex items-center justify-center cursor-pointer hover:bg-primary-600 transition">
                <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">How It Works</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon="🎙️"
              title="Chat"
              description="Natural voice conversations powered by AI that adapt to your parent's storytelling style."
            />
            <FeatureCard
              icon="🧠"
              title="Remember"
              description="AI remembers past conversations and asks intelligent follow-up questions."
            />
            <FeatureCard
              icon="📖"
              title="Share"
              description="Beautiful narrative chapters automatically created and shared with your family."
            />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition border border-neutral-300">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-neutral-600">{description}</p>
    </div>
  );
}
