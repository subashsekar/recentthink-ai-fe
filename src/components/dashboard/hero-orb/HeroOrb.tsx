'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import { Glow } from './Glow';

const HERO_VIDEO_SRC = '/hero-ai-core.mp4.mp4';

interface HeroOrbProps {
  className?: string;
}

export function HeroOrb({ className }: HeroOrbProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.play().catch(() => {});
  }, []);

  return (
    <div
      className={cn(
        'relative flex h-full w-full items-center justify-center overflow-visible border-none bg-transparent shadow-none',
        className,
      )}
      style={{ borderRadius: 0 }}
    >
      <Glow />

      <motion.div
        className="will-change-transform"
        animate={{
          y: [0, -8, 0],
          rotate: [-1, 1, -1],
        }}
        transition={{
          y: { duration: 5, repeat: Infinity, ease: 'easeInOut' },
          rotate: { duration: 15, repeat: Infinity, ease: 'easeInOut' },
        }}
      >
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          controls={false}
          aria-label="RecentThink AI Core"
          className="hero-video mx-auto block h-auto w-[320px] max-w-full object-contain sm:w-[450px] lg:w-[560px]"
        >
          <source src={HERO_VIDEO_SRC} type="video/mp4" />
        </video>
      </motion.div>
    </div>
  );
}
