'use client';

import type { PatternGenerateResponse, PatternPracticeProblem } from '@/types/dsaPattern';

interface PracticeTabProps {
  lesson: PatternGenerateResponse;
}

function ProblemList({ title, items }: { title: string; items?: PatternPracticeProblem[] }) {
  if (!items?.length) return null;
  return (
    <section className="space-y-2">
      <h3 className="font-heading text-sm font-semibold text-foreground">{title}</h3>
      <div className="space-y-2">
        {items.map((problem) => (
          <div
            key={`${problem.title}-${problem.platform ?? ''}`}
            className="rounded-xl border border-border bg-surface/40 px-4 py-3"
          >
            <div className="flex flex-wrap items-center gap-2">
              {problem.url ? (
                <a
                  href={problem.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-medium text-primary underline-offset-2 hover:underline"
                >
                  {problem.title}
                </a>
              ) : (
                <p className="text-sm font-medium text-foreground">{problem.title}</p>
              )}
              {problem.difficulty && (
                <span className="rounded-md bg-secondary-bg px-2 py-0.5 text-[11px] text-secondary-text">
                  {problem.difficulty}
                </span>
              )}
              {problem.platform && (
                <span className="rounded-md bg-secondary-bg px-2 py-0.5 text-[11px] text-secondary-text">
                  {problem.platform}
                </span>
              )}
            </div>
            {problem.why && <p className="mt-1 text-xs text-muted">{problem.why}</p>}
            {problem.tags && problem.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {problem.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded bg-secondary-bg px-1.5 py-0.5 text-[10px] text-muted"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export function PracticeTab({ lesson }: PracticeTabProps) {
  const practice = lesson.practice;
  if (!practice) {
    return <p className="text-sm text-muted">No practice set in this lesson.</p>;
  }

  return (
    <div className="space-y-6">
      {practice.roadmap && practice.roadmap.length > 0 && (
        <section className="space-y-2">
          <h3 className="font-heading text-sm font-semibold text-foreground">Practice roadmap</h3>
          <ol className="list-decimal space-y-1 pl-5 text-sm text-secondary-text">
            {practice.roadmap.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </section>
      )}
      <ProblemList title="Easy" items={practice.easy} />
      <ProblemList title="Medium" items={practice.medium} />
      <ProblemList title="Hard" items={practice.hard} />
      <ProblemList title="Interview" items={practice.interview} />
      <ProblemList title="Contest" items={practice.contest} />
      <ProblemList title="Revision" items={practice.revision} />
    </div>
  );
}
