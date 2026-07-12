'use client';

import { PanelRightOpen } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useHackerRankChatStore } from '@/store/hackerrankChatStore';

interface SessionStatsTriggerProps {
  className?: string;
}

export function SessionStatsTrigger({ className }: SessionStatsTriggerProps) {
  const statsDrawerOpen = useHackerRankChatStore((s) => s.statsDrawerOpen);
  const setStatsDrawerOpen = useHackerRankChatStore((s) => s.setStatsDrawerOpen);

  return (
    <button
      type="button"
      onClick={() => setStatsDrawerOpen(!statsDrawerOpen)}
      className={cn(
        'rounded-2xl p-2.5 text-muted transition-all duration-200 nav-item-hover hover:text-foreground',
        statsDrawerOpen && 'bg-[rgba(79,157,255,0.12)] text-foreground',
        className,
      )}
      aria-label={statsDrawerOpen ? 'Close session stats' : 'Open session stats'}
      aria-expanded={statsDrawerOpen}
    >
      <PanelRightOpen size={20} />
    </button>
  );
}
