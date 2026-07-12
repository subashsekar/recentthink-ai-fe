'use client';

import { Search } from 'lucide-react';
import { cn } from '@/utils/cn';

interface SearchBarProps {
  className?: string;
  glass?: boolean;
}

export function SearchBar({ className, glass = false }: SearchBarProps) {
  return (
    <div className={cn('relative w-full max-w-xl', className)}>
      <Search
        size={18}
        className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-muted"
      />
      <input
        type="search"
        placeholder="Search anything..."
        className={cn(
          'h-12 w-full rounded-2xl py-3 pl-12 pr-20 text-base shadow-sm transition-all duration-[250ms] ease-out placeholder:text-muted',
          glass
            ? 'glass-input'
            : 'border border-border bg-surface text-foreground focus:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/20',
        )}
      />
      <kbd
        className={cn(
          'pointer-events-none absolute right-4 top-1/2 hidden -translate-y-1/2 items-center gap-0.5 rounded-lg px-2 py-1 text-xs font-medium text-muted sm:inline-flex',
          glass
            ? 'border border-[rgba(110,180,255,0.14)] bg-[rgba(79,157,255,0.08)]'
            : 'border border-border bg-secondary-bg',
        )}
      >
        <span className="text-[10px]">⌘</span>K
      </kbd>
    </div>
  );
}
