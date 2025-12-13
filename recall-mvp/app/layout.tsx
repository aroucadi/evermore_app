
'use client';

import { useEffect } from 'react';
import "./globals.css"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Initialize MSW in browser
      const startMocking = async () => {
        const { worker } = await import('@/lib/mocks/browser');
        worker.start();
      };
      startMocking();
    }
  }, []);

  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
