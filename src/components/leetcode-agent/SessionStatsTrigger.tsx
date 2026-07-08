'use client';

import { PanelRightOpen } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useChatStore } from '@/store/chatStore';

interface SessionStatsTriggerProps {
  className?: string;
}

export function SessionStatsTrigger({ className }: SessionStatsTriggerProps) {
  const statsDrawerOpen = useChatStore((s) => s.statsDrawerOpen);
  const setStatsDrawerOpen = useChatStore((s) => s.setStatsDrawerOpen);

  return (
    <button
      type="button"
      onClick={() => setStatsDrawerOpen(!statsDrawerOpen)}
      className={cn(
        'rounded-2xl p-2.5 text-muted transition-all duration-200 hover:bg-secondary-bg hover:text-foreground',
        statsDrawerOpen && 'bg-secondary-bg text-foreground',
        className,
      )}
      aria-label={statsDrawerOpen ? 'Close session stats' : 'Open session stats'}
      aria-expanded={statsDrawerOpen}
    >
      <PanelRightOpen size={20} />
    </button>
  );
}
