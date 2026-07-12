'use client';

import { PatternMarkdown } from '../PatternMarkdown';
import type { PatternGenerateResponse } from '@/types/dsaPattern';

interface MentalModelTabProps {
  lesson: PatternGenerateResponse;
}

export function MentalModelTab({ lesson }: MentalModelTabProps) {
  const model = lesson.mental_model;
  if (!model) {
    return <p className="text-sm text-muted">Mental model is not available yet.</p>;
  }

  return (
    <div className="space-y-6">
      {model.summary && (
        <section className="space-y-2">
          <h3 className="font-heading text-sm font-semibold text-foreground">Summary</h3>
          <PatternMarkdown content={model.summary} />
        </section>
      )}
      {model.intuition && (
        <section className="space-y-2">
          <h3 className="font-heading text-sm font-semibold text-foreground">Intuition</h3>
          <PatternMarkdown content={model.intuition} />
        </section>
      )}
      {model.analogies && model.analogies.length > 0 && (
        <section className="space-y-2">
          <h3 className="font-heading text-sm font-semibold text-foreground">Analogies</h3>
          <ul className="space-y-2">
            {model.analogies.map((item) => (
              <li
                key={item}
                className="rounded-xl border border-border bg-surface/50 px-4 py-3 text-sm text-secondary-text"
              >
                {item}
              </li>
            ))}
          </ul>
        </section>
      )}
      {model.key_insights && model.key_insights.length > 0 && (
        <section className="space-y-2">
          <h3 className="font-heading text-sm font-semibold text-foreground">Key insights</h3>
          <ul className="list-disc space-y-1 pl-5 text-sm text-secondary-text">
            {model.key_insights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
