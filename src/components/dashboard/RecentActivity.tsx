'use client';

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export function RecentActivity() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="glass-card p-8 shadow-lg md:p-10"
    >
      <h2 className="font-heading text-2xl font-semibold text-white drop-shadow-[0_1px_8px_rgba(0,0,0,0.35)]">
        Recent Activity
      </h2>

      <div className="mt-10 flex flex-col items-center justify-center py-12 text-center">
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#4F9DFF]/20 shadow-[0_0_28px_rgba(79,157,255,0.25)]"
        >
          <Sparkles size={32} className="text-[#7EC8FF]" />
        </motion.div>
        <p className="text-lg font-medium text-white">No recent AI activity</p>
        <p className="mt-2 max-w-sm text-base text-[#A8BDD4]">
          Your AI agent sessions and generated content will appear here.
        </p>
      </div>
    </motion.section>
  );
}
