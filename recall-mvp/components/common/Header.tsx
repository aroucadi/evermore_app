
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function Header() {
  return (
    <header className="sticky top-0 z-50 flex items-center glass-header px-4 py-4 justify-between transition-all">
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
          <span className="material-symbols-outlined text-[24px]">local_library</span>
        </div>
        <h2 className="text-xl font-bold leading-tight tracking-tight text-text-main">Recall</h2>
      </div>
      <Button asChild variant="ghost">
        <Link href="/onboarding">Log In</Link>
      </Button>
    </header>
  );
}
