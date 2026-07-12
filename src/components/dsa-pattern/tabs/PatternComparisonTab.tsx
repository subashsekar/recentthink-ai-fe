'use client';

import type { PatternGenerateResponse } from '@/types/dsaPattern';

interface PatternComparisonTabProps {
  lesson: PatternGenerateResponse;
}

export function PatternComparisonTab({ lesson }: PatternComparisonTabProps) {
  const items = lesson.pattern_comparison ?? [];
  if (!items.length) {
    return <p className="text-sm text-muted">No pattern comparisons in this lesson.</p>;
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <article
          key={item.other_pattern}
          className="space-y-3 rounded-2xl border border-border bg-surface/50 p-5"
        >
          <h3 className="font-heading text-base font-semibold text-foreground">
            vs {item.other_pattern}
          </h3>
          {item.summary && <p className="text-sm text-secondary-text">{item.summary}</p>}
          <div className="grid gap-4 sm:grid-cols-2">
            {item.when_to_choose_this && (
              <div className="rounded-xl border border-border/70 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-primary">
                  Choose this
                </p>
                <p className="mt-1 text-sm text-secondary-text">{item.when_to_choose_this}</p>
              </div>
            )}
            {item.when_to_choose_other && (
              <div className="rounded-xl border border-border/70 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted">
                  Choose {item.other_pattern}
                </p>
                <p className="mt-1 text-sm text-secondary-text">{item.when_to_choose_other}</p>
              </div>
            )}
          </div>
          {item.key_differences && item.key_differences.length > 0 && (
            <ul className="list-disc space-y-1 pl-5 text-sm text-secondary-text">
              {item.key_differences.map((diff) => (
                <li key={diff}>{diff}</li>
              ))}
            </ul>
          )}
        </article>
      ))}
    </div>
  );
}
