'use client';

import { Sparkles } from 'lucide-react';

export function SearchEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-10 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Sparkles size={18} />
      </div>
      <p className="text-sm font-medium text-foreground">Search RecentThink</p>
      <p className="max-w-xs text-xs leading-relaxed text-muted">
        Navigate pages, start AI sessions, or try “Teach Binary Search” / “Generate Python Course”.
      </p>
    </div>
  );
}
