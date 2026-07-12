'use client';

import { useState } from 'react';
import { CheckSquare, Square } from 'lucide-react';
import { PatternMarkdown } from '../PatternMarkdown';
import type { PatternGenerateResponse } from '@/types/dsaPattern';
import { cn } from '@/utils/cn';

interface RecognitionTabProps {
  lesson: PatternGenerateResponse;
}

export function RecognitionTab({ lesson }: RecognitionTabProps) {
  const recognition = lesson.recognition;
  const [checked, setChecked] = useState<Record<number, boolean>>({});

  if (!recognition) {
    return <p className="text-sm text-muted">Recognition guide is not available yet.</p>;
  }

  const keywords = recognition.keywords ?? [];
  const checklist = recognition.checklist ?? [];
  const decisionTree = recognition.decision_tree ?? [];
  const signals = recognition.signals ?? [];
  const rules = recognition.recognition_rules ?? [];
  const clues = recognition.common_clues ?? [];

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/10 via-surface/80 to-surface/40 p-5 sm:p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
          Recognition Guide
        </p>
        <h2 className="mt-2 font-heading text-xl font-semibold text-foreground sm:text-2xl">
          How to spot this pattern
        </h2>
        {recognition.how_to_identify && (
          <div className="mt-4">
            <PatternMarkdown content={recognition.how_to_identify} />
          </div>
        )}
      </section>

      {keywords.length > 0 && (
        <section className="space-y-3">
          <h3 className="font-heading text-sm font-semibold text-foreground">
            If you see these keywords → think this pattern
          </h3>
          <div className="flex flex-wrap gap-2">
            {keywords.map((keyword) => (
              <span
                key={keyword}
                className="rounded-lg border border-primary/20 bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary"
              >
                {keyword}
              </span>
            ))}
          </div>
        </section>
      )}

      {clues.length > 0 && (
        <section className="space-y-2">
          <h3 className="font-heading text-sm font-semibold text-foreground">Common clues</h3>
          <ul className="list-disc space-y-1 pl-5 text-sm text-secondary-text">
            {clues.map((clue) => (
              <li key={clue}>{clue}</li>
            ))}
          </ul>
        </section>
      )}

      {signals.length > 0 && (
        <section className="space-y-2">
          <h3 className="font-heading text-sm font-semibold text-foreground">Signals</h3>
          <ul className="list-disc space-y-1 pl-5 text-sm text-secondary-text">
            {signals.map((signal) => (
              <li key={signal}>{signal}</li>
            ))}
          </ul>
        </section>
      )}

      {rules.length > 0 && (
        <section className="space-y-2">
          <h3 className="font-heading text-sm font-semibold text-foreground">Recognition rules</h3>
          <ul className="list-disc space-y-1 pl-5 text-sm text-secondary-text">
            {rules.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
        </section>
      )}

      {decisionTree.length > 0 && (
        <section className="space-y-3">
          <h3 className="font-heading text-sm font-semibold text-foreground">Decision tree</h3>
          <ol className="space-y-3">
            {decisionTree.map((step, index) => (
              <li
                key={`${index}-${step.slice(0, 24)}`}
                className="flex gap-3 rounded-xl border border-border bg-surface/50 p-4"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary text-xs font-semibold text-white">
                  {index + 1}
                </span>
                <p className="text-sm leading-relaxed text-secondary-text">{step}</p>
              </li>
            ))}
          </ol>
        </section>
      )}

      {checklist.length > 0 && (
        <section className="space-y-3">
          <h3 className="font-heading text-sm font-semibold text-foreground">Checklist</h3>
          <div className="space-y-2">
            {checklist.map((item, index) => {
              const isChecked = Boolean(checked[index]);
              return (
                <button
                  key={`${index}-${item.slice(0, 24)}`}
                  type="button"
                  onClick={() => setChecked((prev) => ({ ...prev, [index]: !prev[index] }))}
                  className={cn(
                    'flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left transition-colors',
                    isChecked
                      ? 'border-primary/40 bg-primary/10'
                      : 'border-border bg-surface/40 hover:border-primary/25',
                  )}
                >
                  {isChecked ? (
                    <CheckSquare size={18} className="mt-0.5 shrink-0 text-primary" />
                  ) : (
                    <Square size={18} className="mt-0.5 shrink-0 text-muted" />
                  )}
                  <span
                    className={cn(
                      'text-sm',
                      isChecked ? 'text-foreground line-through opacity-80' : 'text-secondary-text',
                    )}
                  >
                    {item}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
