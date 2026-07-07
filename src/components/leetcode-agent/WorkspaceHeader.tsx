'use client';

import { useState } from 'react';
import { BookOpen, ChevronDown, GraduationCap, Users, Zap } from 'lucide-react';
import { cn } from '@/utils/cn';
import { AGENT_MODES } from './data';

const modeIcons = {
  book: BookOpen,
  graduation: GraduationCap,
  users: Users,
  zap: Zap,
};

export function WorkspaceHeader() {
  const [activeMode, setActiveMode] = useState('learning');

  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-border px-5 py-3.5">
      <button
        type="button"
        className="flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-secondary-bg"
      >
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/15 text-[10px] text-primary">
          ✦
        </span>
        Claude Sonnet 4
        <ChevronDown size={14} className="text-muted" />
      </button>

      <div className="mx-auto flex items-center gap-1 rounded-2xl border border-border bg-secondary-bg p-1">
        {AGENT_MODES.map((mode) => {
          const Icon = modeIcons[mode.icon];
          const isActive = activeMode === mode.id;
          return (
            <button
              key={mode.id}
              type="button"
              onClick={() => setActiveMode(mode.id)}
              className={cn(
                'flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium transition-all sm:text-sm',
                isActive ? 'bg-surface text-primary shadow-sm' : 'text-muted hover:text-foreground',
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
