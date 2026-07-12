'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { BACKGROUND_GIF_PATH } from '@/constants/assets';

export function AuthBrandingPanel() {
  useEffect(() => {
    const img = new window.Image();
    img.src = BACKGROUND_GIF_PATH;
  }, []);

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url("${BACKGROUND_GIF_PATH}")` }}
        aria-hidden="true"
      />
      <div className="glass-overlay absolute inset-0" aria-hidden="true" />

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-8 py-14 lg:py-20">
        <div className="w-[clamp(320px, 88%, 560px)]">
          <Image
            src="/recentthink-logo.svg"
            alt="RecentThink"
            width={560}
            height={560}
            className="h-auto w-full object-contain drop-shadow-[0_8px_32px_rgba(0,0,0,0.45)]"
            priority
          />
        </div>
        <p className="mt-8 max-w-sm text-center text-lg font-medium tracking-tight text-white/90">
          Build intelligent AI solutions with confidence.
        </p>
      </div>
    </div>
  );
}
