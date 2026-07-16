'use client';

import { Clock } from 'lucide-react';
import type { RecentSearchEntry } from './types';
import { cn } from '@/utils/cn';

interface RecentSearchesProps {
  items: RecentSearchEntry[];
  onSelect: (item: RecentSearchEntry) => void;
  glass?: boolean;
}

export function RecentSearches({ items, onSelect, glass = false }: RecentSearchesProps) {
  if (items.length === 0) return null;

  return (
    <div className="px-2 py-2" role="group" aria-label="Recent searches">
      <h3 className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
        Recent Searches
      </h3>
      <ul className="space-y-0.5">
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => onSelect(item)}
              className={cn(
                'flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition-colors',
                glass ? 'hover:bg-white/5' : 'hover:bg-secondary-bg',
              )}
            >
              <Clock size={14} className="text-muted" />
              <span className="truncate text-foreground">{item.title || item.query}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
