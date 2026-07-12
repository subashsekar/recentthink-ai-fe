'use client';

import { useRef } from 'react';
import { AlertCircle, ChevronRight, GitBranch, Hash, Layers, Merge, Timer } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useLeetCodeExamples } from '@/hooks/leetcode/useLeetCodeQueries';

const iconMap: Record<string, typeof Hash> = {
  hash: Hash,
  window: Timer,
  cache: Layers,
  graph: GitBranch,
  intervals: Merge,
};

const difficultyColors: Record<string, string> = {
  Easy: 'bg-green-50 text-green-700 border-green-200',
  Medium: 'bg-amber-50 text-amber-700 border-amber-200',
  Hard: 'bg-red-50 text-red-700 border-red-200',
};

function ExampleSkeleton() {
  return (
    <div className="h-[132px] w-[148px] shrink-0 animate-pulse rounded-2xl border border-border bg-secondary-bg/60" />
  );
}

interface ExampleCardsProps {
  onSelectExample?: (url: string) => void;
}

export function ExampleCards({ onSelectExample }: ExampleCardsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { data: examples = [], isLoading, isError, refetch } = useLeetCodeExamples();

  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: 200, behavior: 'smooth' });
  };

  return (
    <section className="border-t border-border px-5 py-5 lg:px-8">
      <h2 className="mb-4 font-heading text-base font-semibold text-foreground">
        Choose an Example
      </h2>

      {isError && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-error">
          <AlertCircle size={16} />
          <span className="flex-1">Failed to load examples.</span>
          <button type="button" onClick={() => refetch()} className="text-xs font-medium underline">
            Retry
          </button>
        </div>
      )}

      <div className="relative">
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto pb-1 scrollbar-none"
          style={{ scrollbarWidth: 'none' }}
        >
          {isLoading && Array.from({ length: 5 }).map((_, i) => <ExampleSkeleton key={i} />)}

          {!isLoading && !isError && examples.length === 0 && (
            <p className="py-4 text-sm text-muted">No example problems available.</p>
          )}

          {!isLoading &&
            examples.map((problem) => {
              const Icon = iconMap[problem.icon ?? ''] ?? Hash;
              const difficultyClass =
                difficultyColors[problem.difficulty] ?? 'bg-secondary-bg text-muted border-border';
              return (
                <button
                  key={problem.id}
                  type="button"
                  onClick={() => onSelectExample?.(problem.url)}
                  className="group flex w-[148px] shrink-0 flex-col rounded-2xl glass-panel p-4 text-left shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
                >
                  <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                    <Icon size={18} />
                  </div>
                  <p className="mb-2 text-sm font-semibold text-foreground">{problem.title}</p>
                  <div className="flex flex-wrap gap-1.5">
                    <span
                      className={cn(
                        'rounded-md border px-1.5 py-0.5 text-[10px] font-medium',
                        difficultyClass,
                      )}
                    >
                      {problem.difficulty}
                    </span>
                    <span className="rounded-md border border-border bg-secondary-bg px-1.5 py-0.5 text-[10px] font-medium text-muted">
                      {problem.pattern}
                    </span>
                  </div>
                </button>
              );
            })}
        </div>

        {examples.length > 0 && (
          <button
            type="button"
            onClick={scrollRight}
            className="absolute -right-1 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full glass-panel text-muted shadow-md transition-colors hover:text-foreground"
            aria-label="Scroll examples"
          >
            <ChevronRight size={16} />
          </button>
        )}
      </div>
    </section>
  );
}
