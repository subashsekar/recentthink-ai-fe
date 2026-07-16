'use client';

import { SearchX } from 'lucide-react';

interface SearchNoResultsProps {
  query: string;
}

export function SearchNoResults({ query }: SearchNoResultsProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-10 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary-bg text-muted">
        <SearchX size={18} />
      </div>
      <p className="text-sm font-medium text-foreground">No results for “{query}”</p>
      <p className="max-w-xs text-xs leading-relaxed text-muted">
        Try a page name, AI action, problem title, or natural language like “Open Profile”.
      </p>
    </div>
  );
}
