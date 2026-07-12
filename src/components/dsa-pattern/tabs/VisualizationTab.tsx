'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { PatternMarkdown } from '../PatternMarkdown';
import type { PatternGenerateResponse } from '@/types/dsaPattern';
import { cn } from '@/utils/cn';

interface VisualizationTabProps {
  lesson: PatternGenerateResponse;
}

function AsciiBlock({ title, content }: { title: string; content?: string }) {
  if (!content?.trim()) return null;
  return (
    <section className="space-y-2">
      <h3 className="font-heading text-sm font-semibold text-foreground">{title}</h3>
      <pre className="overflow-x-auto rounded-xl border border-border bg-[#0b1220] p-4 font-mono text-xs leading-relaxed text-[#d7e6ff] sm:text-sm">
        {content}
      </pre>
    </section>
  );
}

export function VisualizationTab({ lesson }: VisualizationTabProps) {
  const viz = lesson.visualization;
  const [revealed, setRevealed] = useState(1);

  if (!viz) {
    return <p className="text-sm text-muted">Visualizations are not available yet.</p>;
  }

  const steps = viz.step_by_step ?? [];
  const diagrams = viz.ascii_diagrams ?? [];

  return (
    <div className="space-y-6">
      {viz.frontend_notes && <p className="text-sm text-muted">{viz.frontend_notes}</p>}

      {diagrams.map((diagram, index) => (
        <AsciiBlock key={index} title={`Diagram ${index + 1}`} content={diagram} />
      ))}

      <AsciiBlock title="Pointer animation" content={viz.pointer_animation} />
      <AsciiBlock title="Array visualization" content={viz.array_visualization} />
      <AsciiBlock title="Graph visualization" content={viz.graph_visualization} />
      <AsciiBlock title="Tree visualization" content={viz.tree_visualization} />
      <AsciiBlock title="Recursion stack" content={viz.recursion_stack} />
      <AsciiBlock title="Queue evolution" content={viz.queue_evolution} />
      <AsciiBlock title="Stack evolution" content={viz.stack_evolution} />

      {steps.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-heading text-sm font-semibold text-foreground">Step by step</h3>
            {revealed < steps.length && (
              <button
                type="button"
                onClick={() => setRevealed((n) => Math.min(steps.length, n + 1))}
                className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-xs text-secondary-text hover:border-primary/30"
              >
                Reveal next
                <ChevronDown size={12} />
              </button>
            )}
          </div>
          <ol className="space-y-2">
            {steps.slice(0, revealed).map((step, index) => (
              <li
                key={`${index}-${step.slice(0, 20)}`}
                className={cn(
                  'rounded-xl border border-border bg-surface/50 p-4 text-sm text-secondary-text',
                  'animate-in fade-in slide-in-from-bottom-1 duration-300',
                )}
              >
                <span className="mr-2 font-medium text-primary">{index + 1}.</span>
                {step}
              </li>
            ))}
          </ol>
        </section>
      )}

      {!diagrams.length && !steps.length && !viz.pointer_animation && !viz.array_visualization && (
        <PatternMarkdown content="No visualization content in this lesson." />
      )}
    </div>
  );
}
