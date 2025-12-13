
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';

export default function LandingPage() {
  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-background text-text-main antialiased selection:bg-primary/20">
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-60"></div>
        <div className="absolute bottom-[20%] left-[-10%] w-80 h-80 bg-secondary/20 rounded-full blur-3xl opacity-60"></div>
      </div>

      <Header />

      <section className="@container">
        <div className="flex flex-col gap-10 px-5 py-10 pt-8 @[480px]:gap-14 @[864px]:flex-row @[864px]:items-center max-w-6xl mx-auto w-full">
          <div className="flex flex-col gap-8 @[480px]:gap-10 items-center text-center @[864px]:items-start @[864px]:text-left @[864px]:flex-1">
            <div className="flex flex-col gap-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/60 border border-primary/20 backdrop-blur-sm w-fit mx-auto @[864px]:mx-0 shadow-sm">
                <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
                <span className="text-xs font-semibold text-primary uppercase tracking-wide">New: Voice to Book</span>
              </div>
              <h1 className="text-4xl font-extrabold leading-[1.15] tracking-tight @[480px]:text-5xl text-text-main">
                Preserve your family's <br className="hidden @[480px]:block"/>
                <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-orange-400">priceless stories</span>
              </h1>
              <h2 className="text-text-muted text-lg font-medium leading-relaxed max-w-lg mx-auto @[864px]:mx-0">
                The simple, comforting way for seniors to record memories through conversation. We turn voices into cherished family books.
              </h2>
            </div>
            <div className="flex flex-col gap-6 items-center w-full @[864px]:items-start">
              <Button asChild className="group flex w-full max-w-[340px] cursor-pointer items-center justify-center gap-3 overflow-hidden rounded-full bg-primary h-14 px-8 text-white text-lg font-bold transition-all hover:bg-primary-dark hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 active:scale-[0.98]">
                <Link href="/onboarding">
                  <span>Get Started Free</span>
                  <span className="material-symbols-outlined text-[22px] transition-transform group-hover:translate-x-1">arrow_forward</span>
                </Link>
              </Button>
            </div>
          </div>
          <div className="w-full @[864px]:flex-1 px-2">
            <div className="relative w-full aspect-[4/3] rounded-[2rem] overflow-hidden shadow-2xl shadow-primary/10 border-[6px] border-white group cursor-pointer bg-white">
              <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCt87K7-ogtEOOARQA70qdjb1gfH-U1oynox5wf-RKi1ihtPnX4IUqHPKf7SqvGtdkxyaH3I8n3kMXGFRFXUyCeGnp5-tQDgWkrsVdiXZVuAiHp2cJMo-8ZJ8B_7gRFINLP1cCS8wossmjSH3j-KrWj67hzGSuFjB7DIoQBDsyg8RsZyykfPpv9V2TWol_NfP6_5XWI52kScB3YFi96Ab7Y32bjO1LT2jTlUkawLkHPPqvWLQtVpM_9apORe4924jlPQUYCG-P9Dyg')"}}></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-80"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="size-20 rounded-full glass-button flex items-center justify-center text-white transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/90 shadow-glass border-white/50 border">
                  <span className="material-symbols-outlined text-[40px] fill ml-1">play_arrow</span>
                </div>
              </div>
              <div className="absolute bottom-6 left-6 right-6">
                <div className="glass-panel px-4 py-3 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-text-main">See how it works</p>
                    <p className="text-xs text-text-muted">1 min demo video</p>
                  </div>
                  <span className="material-symbols-outlined text-primary">arrow_forward</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="relative py-8 flex items-center justify-center">
        <div aria-hidden="true" className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="bg-[#FDFCF8] px-4 text-sm text-text-muted uppercase tracking-widest font-semibold">How it Works</span>
        </div>
      </div>

      <section className="flex flex-col py-8 pb-20 px-5 gap-10 max-w-6xl mx-auto w-full">
        <div className="flex flex-col items-center text-center gap-4 max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold leading-tight text-text-main">Three simple steps to forever</h2>
          <p className="text-text-muted text-base">We've designed Recall to be incredibly easy to use, focusing on voice and conversation rather than typing.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard
            icon="mic"
            step="1"
            title="Chat"
            description="Grandma chats comfortably with our friendly AI voice companion, recalling her favorite moments naturally."
          />
          <FeatureCard
            icon="auto_stories"
            step="2"
            title="Remember"
            description="We instantly preserve those spoken words, turning them into beautifully written narrative chapters."
          />
          <FeatureCard
            icon="diversity_3"
            step="3"
            title="Share"
            description="Family members receive the story updates to read, share, and cherish forever in a private family space."
          />
        </div>
      </section>

      <Footer />
    </div>
  );
}

function FeatureCard({ icon, step, title, description }: { icon: string; step: string; title: string; description: string }) {
  return (
    <div className="glass-panel p-8 rounded-2xl flex flex-col gap-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg group">
      <div className="size-16 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors duration-300">
        <span className="material-symbols-outlined text-primary text-[32px] group-hover:text-white transition-colors">{icon}</span>
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center size-6 rounded-full bg-primary/10 text-primary text-xs font-bold">{step}</span>
          <h3 className="text-xl font-bold text-text-main">{title}</h3>
        </div>
        <p className="text-text-muted text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
