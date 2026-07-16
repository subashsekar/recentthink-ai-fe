'use client';

import { Loader2 } from 'lucide-react';

export function SearchLoading() {
  return (
    <div
      className="flex items-center justify-center gap-2 px-6 py-8 text-sm text-muted"
      role="status"
      aria-live="polite"
    >
      <Loader2 size={16} className="animate-spin text-primary" />
      Searching…
    </div>
  );
}
