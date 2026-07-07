'use client';

import { motion } from 'framer-motion';

export function Glow() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center overflow-visible"
    >
      <motion.div
        className="h-[min(100%,420px)] w-[min(100%,420px)] will-change-transform"
        style={{
          background:
            'radial-gradient(circle, rgba(255, 90, 54, 0.18) 0%, rgba(255, 90, 54, 0.06) 50%, transparent 72%)',
        }}
        animate={{
          opacity: [0.75, 1, 0.75],
          scale: [0.98, 1.02, 0.98],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
}
