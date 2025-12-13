
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';

export function Sidebar() {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-white border-r border-neutral-200 min-h-screen flex flex-col hidden md:flex">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Trigger */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="bg-white">
              <span className="text-xl">☰</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}

function SidebarContent() {
  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary-600">
          <span>🎙️</span>
          <span>Recall</span>
        </Link>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2">
        <SidebarLink href="/portal" icon="📚" label="Chapters" active />
        <SidebarLink href="#" icon="👥" label="Family Members" />
        <SidebarLink href="#" icon="⚙️" label="Settings" />
      </nav>

      <div className="p-4 border-t border-neutral-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold">
            S
          </div>
          <div>
            <div className="font-medium">Sarah T.</div>
            <div className="text-xs text-neutral-500">Family Member</div>
          </div>
        </div>
        <Button variant="outline" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50">
          Sign Out
        </Button>
      </div>
    </div>
  );
}

function SidebarLink({ href, icon, label, active }: { href: string; icon: string; label: string; active?: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-md transition",
        active
          ? "bg-primary-50 text-primary-700 font-medium"
          : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
      )}
    >
      <span className="text-xl">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}
