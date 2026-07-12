'use client';

import { UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';

interface ProfileEmptyStateProps {
  onStart: () => void;
}

export function ProfileEmptyState({ onStart }: ProfileEmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="profile-hero rounded-2xl border border-border p-10 text-center sm:p-14"
    >
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary">
        <UserPlus className="h-7 w-7" />
      </div>
      <h2 className="mt-5 font-heading text-2xl font-semibold text-foreground">
        Complete your profile
      </h2>
      <p className="mx-auto mt-2 max-w-lg text-sm text-muted sm:text-base">
        Set a username, bio, platforms, and skills so recruiters can find you. Your first save
        creates the profile.
      </p>
      <Button className="mt-7 rounded-xl px-6" size="lg" onClick={onStart}>
        Get started
      </Button>
    </motion.div>
  );
}
