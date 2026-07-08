'use client';

import { BookOpen, GraduationCap, Users, Zap } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useChatStore } from '@/store/chatStore';
import { useLeetCodeModes } from '@/hooks/leetcode/useLeetCodeQueries';

const modeIcons: Record<string, typeof BookOpen> = {
  learning: BookOpen,
  teacher: GraduationCap,
  interview: Users,
  quick: Zap,
  book: BookOpen,
  graduation: GraduationCap,
  users: Users,
  zap: Zap,
};

export function WorkspaceHeader() {
  const activeModeId = useChatStore((s) => s.activeModeId);
  const setActiveModeId = useChatStore((s) => s.setActiveModeId);
  const { data: modes = [], isLoading } = useLeetCodeModes();

  return (
    <div className="flex flex-wrap items-center justify-center border-b border-border px-5 py-3.5">
      <div className="flex items-center gap-1 rounded-2xl border border-border bg-secondary-bg p-1">
        {isLoading && <div className="h-9 w-32 animate-pulse rounded-xl bg-border/60" />}
        {!isLoading &&
          modes.map((mode) => {
            const Icon = modeIcons[mode.id] ?? BookOpen;
            const isActive = activeModeId === mode.id;
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => setActiveModeId(mode.id)}
                className={cn(
                  'flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium transition-all sm:text-sm',
                  isActive
                    ? 'bg-surface text-primary shadow-sm'
                    : 'text-muted hover:text-foreground',
                )}
              >
                <Icon size={14} className={isActive ? 'text-primary' : undefined} />
                <span className="hidden sm:inline">{mode.label}</span>
                <span className="sm:hidden">{mode.label.split(' ')[0]}</span>
              </button>
            );
          })}
      </div>
    </div>
  );
}
