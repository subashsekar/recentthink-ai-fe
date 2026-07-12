'use client';

import { memo, useEffect, type ReactNode } from 'react';
import { BACKGROUND_GIF_PATH } from '@/constants/assets';

interface AnimatedBackgroundProps {
  children: ReactNode;
}

export const AnimatedBackground = memo(function AnimatedBackground({
  children,
}: AnimatedBackgroundProps) {
  useEffect(() => {
    const img = new window.Image();
    img.src = BACKGROUND_GIF_PATH;
  }, []);

  return (
    <div className="animated-bg-theme relative min-h-screen">
      <div
        className="pointer-events-none fixed inset-0 -z-20 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url("${BACKGROUND_GIF_PATH}")` }}
        aria-hidden="true"
      />
      <div className="glass-overlay pointer-events-none fixed inset-0 -z-10" aria-hidden="true" />
      <div className="relative z-0 overflow-x-clip">{children}</div>
    </div>
  );
});
