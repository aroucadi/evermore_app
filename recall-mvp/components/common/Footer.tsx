
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-white border-t border-neutral-200">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center">
          <p className="text-neutral-600">&copy; {new Date().getFullYear()} Recall. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/contact" className="text-neutral-600 hover:text-primary-500">
              Contact
            </Link>
            <Link href="/privacy" className="text-neutral-600 hover:text-primary-500">
              Privacy
            </Link>
            <Link href="/terms" className="text-neutral-600 hover:text-primary-500">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
