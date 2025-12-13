
'use client';

export function WaveformVisualizer({ isActive }: { isActive: boolean }) {
  const bars = [
    { height: 'h-4', animation: 'animate-wave-slow' },
    { height: 'h-8', animation: 'animate-wave-medium' },
    { height: 'h-12', animation: 'animate-wave-fast' },
    { height: 'h-8', animation: 'animate-wave-medium' },
    { height: 'h-14', animation: 'animate-wave-fast' },
    { height: 'h-6', animation: 'animate-wave-slow' },
    { height: 'h-10', animation: 'animate-wave-medium' },
    { height: 'h-4', animation: 'animate-wave-slow' },
  ];

  return (
    <div aria-hidden="true" className="flex items-center gap-1.5 h-16">
      {bars.map((bar, index) => (
        <div
          key={index}
          className={`w-1.5 bg-primary/40 rounded-full ${isActive ? `${bar.height} ${bar.animation}` : 'h-2'}`}
        ></div>
      ))}
    </div>
  );
}
