'use client';

import { Search } from 'lucide-react';
import { cn } from '@/utils/cn';

interface SearchBarProps {
  className?: string;
}

export function SearchBar({ className }: SearchBarProps) {
  return (
    <div className={cn('relative w-full max-w-xl', className)}>
      <Search
        size={18}
        className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-muted"
      />
      <input
        type="search"
        placeholder="Search anything..."
        className="h-12 w-full rounded-2xl border border-border bg-surface py-3 pl-12 pr-20 text-base text-foreground shadow-sm transition-all duration-200 placeholder:text-muted focus:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
      <kbd className="pointer-events-none absolute right-4 top-1/2 hidden -translate-y-1/2 items-center gap-0.5 rounded-lg border border-border bg-secondary-bg px-2 py-1 text-xs font-medium text-muted sm:inline-flex">
        <span className="text-[10px]">⌘</span>K
      </kbd>
    </div>
  );
}
