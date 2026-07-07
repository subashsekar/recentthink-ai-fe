'use client';

import { cn } from '@/utils/cn';

const RINGS = [
  { size: 360, delay: '0s' },
  { size: 450, delay: '2s' },
  { size: 540, delay: '4s' },
] as const;

export function BackgroundRings() {
  return (
    <>
      <style>{`
        @keyframes hero-ring-pulse {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.08;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.04);
            opacity: 0.18;
          }
        }
      `}</style>
      {RINGS.map((ring) => (
        <div
          key={ring.size}
          aria-hidden
          className={cn(
            'pointer-events-none absolute left-1/2 top-1/2 rounded-full will-change-transform',
          )}
          style={{
            width: ring.size,
            height: ring.size,
            border: '1px solid rgba(255, 90, 54, 0.15)',
            animation: `hero-ring-pulse 6s ease-in-out infinite`,
            animationDelay: ring.delay,
          }}
        />
      ))}
    </>
  );
}
