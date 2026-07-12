'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { PatternMarkdown } from '../PatternMarkdown';
import type { PatternExampleWalkthrough, PatternGenerateResponse } from '@/types/dsaPattern';
import { cn } from '@/utils/cn';

interface ExamplesTabProps {
  lesson: PatternGenerateResponse;
}

type DiffKey = 'easy' | 'medium' | 'hard';

function Collapsible({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-xl border border-border">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left"
      >
        <span className="text-sm font-medium text-foreground">{title}</span>
        <ChevronDown
          size={16}
          className={cn('text-muted transition-transform', open && 'rotate-180')}
        />
      </button>
      {open && <div className="border-t border-border px-4 py-3">{children}</div>}
    </div>
  );
}

function Walkthrough({ example }: { example: PatternExampleWalkthrough }) {
  return (
    <div className="space-y-3">
      <div>
        <h3 className="font-heading text-base font-semibold text-foreground">
          {example.title || 'Example'}
        </h3>
        {example.difficulty && (
          <p className="mt-1 text-xs uppercase tracking-wide text-muted">{example.difficulty}</p>
        )}
      </div>

      {example.problem_statement && (
        <Collapsible title="Problem" defaultOpen>
          <PatternMarkdown content={example.problem_statement} />
        </Collapsible>
      )}
      {example.pattern_recognition && (
        <Collapsible title="Pattern recognition" defaultOpen>
          <PatternMarkdown content={example.pattern_recognition} />
        </Collapsible>
      )}
      {example.approach && (
        <Collapsible title="Approach">
          <PatternMarkdown content={example.approach} />
        </Collapsible>
      )}
      {example.dry_run && example.dry_run.length > 0 && (
        <Collapsible title="Dry run">
          <ol className="list-decimal space-y-1 pl-5 text-sm text-secondary-text">
            {example.dry_run.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </Collapsible>
      )}
      {example.visualization && (
        <Collapsible title="Visualization">
          <pre className="overflow-x-auto rounded-lg bg-[#0b1220] p-3 font-mono text-xs text-[#d7e6ff]">
            {example.visualization}
          </pre>
        </Collapsible>
      )}
      {example.code && (
        <Collapsible title={`Code${example.language ? ` (${example.language})` : ''}`}>
          <pre className="overflow-x-auto rounded-lg bg-[#0b1220] p-3 font-mono text-xs text-[#d7e6ff]">
            {example.code}
          </pre>
        </Collapsible>
      )}
      {example.line_by_line && example.line_by_line.length > 0 && (
        <Collapsible title="Line by line">
          <ol className="list-decimal space-y-1 pl-5 text-sm text-secondary-text">
            {example.line_by_line.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ol>
        </Collapsible>
      )}
      {(example.time_complexity || example.space_complexity) && (
        <Collapsible title="Complexity">
          <dl className="space-y-1 text-sm text-secondary-text">
            {example.time_complexity && (
              <div>
                <dt className="inline font-medium text-foreground">Time: </dt>
                <dd className="inline">{example.time_complexity}</dd>
              </div>
            )}
            {example.space_complexity && (
              <div>
                <dt className="inline font-medium text-foreground">Space: </dt>
                <dd className="inline">{example.space_complexity}</dd>
              </div>
            )}
          </dl>
        </Collapsible>
      )}
      {example.edge_cases && example.edge_cases.length > 0 && (
        <Collapsible title="Edge cases">
          <ul className="list-disc space-y-1 pl-5 text-sm text-secondary-text">
            {example.edge_cases.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Collapsible>
      )}
      {example.common_mistakes && example.common_mistakes.length > 0 && (
        <Collapsible title="Common mistakes">
          <ul className="list-disc space-y-1 pl-5 text-sm text-secondary-text">
            {example.common_mistakes.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Collapsible>
      )}
    </div>
  );
}

export function ExamplesTab({ lesson }: ExamplesTabProps) {
  const map: Record<DiffKey, PatternExampleWalkthrough | undefined> = {
    easy: lesson.easy_example,
    medium: lesson.medium_example,
    hard: lesson.hard_example,
  };
  const available = (['easy', 'medium', 'hard'] as DiffKey[]).filter((k) => map[k]);
  const [active, setActive] = useState<DiffKey>(available[0] ?? 'easy');

  if (!available.length) {
    return <p className="text-sm text-muted">No worked examples in this lesson.</p>;
  }

  const current = map[active]!;

  return (
    <div className="space-y-4">
      <div className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1">
        {available.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setActive(key)}
            className={cn(
              'shrink-0 rounded-xl px-3 py-2 text-sm font-medium capitalize transition-colors',
              active === key
                ? 'bg-primary text-white'
                : 'text-secondary-text hover:bg-secondary-bg',
            )}
          >
            {key}
          </button>
        ))}
      </div>
      <Walkthrough example={current} />
    </div>
  );
}
