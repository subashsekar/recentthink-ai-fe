'use client';

import { useRef } from 'react';
import { ChevronRight, GitBranch, Hash, Layers, Merge, Timer } from 'lucide-react';
import { cn } from '@/utils/cn';
import { EXAMPLE_PROBLEMS } from './data';

const iconMap = {
  hash: Hash,
  window: Timer,
  cache: Layers,
  graph: GitBranch,
  intervals: Merge,
};

const difficultyColors = {
  Easy: 'bg-green-50 text-green-700 border-green-200',
  Medium: 'bg-amber-50 text-amber-700 border-amber-200',
  Hard: 'bg-red-50 text-red-700 border-red-200',
};

export function ExampleCards() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: 200, behavior: 'smooth' });
  };

  return (
    <section className="border-t border-border px-5 py-5 lg:px-8">
      <h2 className="mb-4 font-heading text-base font-semibold text-foreground">
        Choose an Example
      </h2>

      <div className="relative">
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto pb-1 scrollbar-none"
          style={{ scrollbarWidth: 'none' }}
        >
          {EXAMPLE_PROBLEMS.map((problem) => {
            const Icon = iconMap[problem.icon as keyof typeof iconMap] ?? Hash;
            return (
              <button
                key={problem.id}
                type="button"
                className="group flex w-[148px] shrink-0 flex-col rounded-2xl border border-border bg-surface p-4 text-left shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
              >
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                  <Icon size={18} />
                </div>
                <p className="mb-2 text-sm font-semibold text-foreground">{problem.title}</p>
                <div className="flex flex-wrap gap-1.5">
                  <span
                    className={cn(
                      'rounded-md border px-1.5 py-0.5 text-[10px] font-medium',
                      difficultyColors[problem.difficulty],
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

        <button
          type="button"
          onClick={scrollRight}
          className="absolute -right-1 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-surface text-muted shadow-md transition-colors hover:text-foreground"
          aria-label="Scroll examples"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </section>
  );
}
