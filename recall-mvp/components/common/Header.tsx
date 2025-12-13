
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function Header() {
  return (
    <header className="bg-white border-b border-neutral-200">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary-600">
          <span>🎙️</span>
          <span>Recall</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link href="/portal" className="text-neutral-600 hover:text-primary-600">
            For Families
          </Link>
          <Link href="/conversation" className="text-neutral-600 hover:text-primary-600">
            For Seniors
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/portal">
            <Button variant="outline">Sign In</Button>
          </Link>
          <Link href="/onboarding">
            <Button>Get Started</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
