'use client';

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export function RecentActivity() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-[28px] border border-border bg-surface p-8 shadow-lg md:p-10"
    >
      <h2 className="font-heading text-2xl font-semibold text-foreground">Recent Activity</h2>

      <div className="mt-10 flex flex-col items-center justify-center py-12 text-center">
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10"
        >
          <Sparkles size={32} className="text-primary" />
        </motion.div>
        <p className="text-lg font-medium text-foreground">No recent AI activity</p>
        <p className="mt-2 max-w-sm text-base text-muted">
          Your AI agent sessions and generated content will appear here.
        </p>
      </div>
    </motion.section>
  );
}
