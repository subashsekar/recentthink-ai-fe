'use client';

import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { getTimeGreeting } from '@/utils/greeting';
import { HeroOrb } from './hero-orb';

export function HeroSection() {
  const { user } = useAuthStore();
  const greeting = getTimeGreeting();
  const displayName = user ? `${user.first_name} ${user.last_name}` : 'there';

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="glass-card p-8 shadow-lg md:p-10 lg:p-12"
    >
      <div className="grid items-center gap-8 lg:grid-cols-[45fr_55fr] lg:gap-10">
        <div className="flex flex-col justify-center space-y-4">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-base font-semibold tracking-wide text-[#7EC8FF] drop-shadow-[0_0_12px_rgba(126,200,255,0.45)]"
          >
            {greeting}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="font-heading text-4xl font-semibold leading-tight tracking-tight text-white drop-shadow-[0_2px_16px_rgba(0,0,0,0.45)] md:text-5xl"
          >
            Welcome back,
            <br />
            <span className="bg-gradient-to-r from-[#8BCBFF] via-[#63B3FF] to-[#4F9DFF] bg-clip-text text-transparent drop-shadow-none">
              {displayName}
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="max-w-md text-lg text-[#D4E4F7] md:text-xl"
          >
            Build intelligent AI solutions with RecentThink.
          </motion.p>
        </div>

        <div className="relative flex h-full w-full items-center justify-center overflow-visible">
          <HeroOrb className="h-full w-full" />
        </div>
      </div>
    </motion.section>
  );
}
