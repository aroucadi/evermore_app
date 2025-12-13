
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
      <head>
        <title>Recall - Legacy Recorder</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        {/* Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Noto+Sans:wght@300;400;500;600;700&family=Noto+Serif:ital,wght@0,400;0,600;1,400&family=Playfair+Display:wght@400;600;700&family=Spline+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

        {/* Icons */}
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
