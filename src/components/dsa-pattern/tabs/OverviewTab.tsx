'use client';

import { PatternMarkdown } from '../PatternMarkdown';
import type { PatternGenerateResponse } from '@/types/dsaPattern';

interface OverviewTabProps {
  lesson: PatternGenerateResponse;
}

function ListBlock({ title, items }: { title: string; items?: string[] }) {
  if (!items?.length) return null;
  return (
    <section className="space-y-2">
      <h3 className="font-heading text-sm font-semibold text-foreground">{title}</h3>
      <ul className="list-disc space-y-1 pl-5 text-sm text-secondary-text">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

export function OverviewTab({ lesson }: OverviewTabProps) {
  const overview = lesson.overview;
  const planner = lesson.planner;
  const pattern =
    overview?.pattern || planner?.pattern || lesson.request?.pattern || 'Untitled pattern';

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-heading text-xl font-semibold text-foreground">{pattern}</h2>
          {(overview?.difficulty || planner?.difficulty) && (
            <span className="rounded-md bg-secondary-bg px-2 py-0.5 text-xs text-secondary-text">
              {overview?.difficulty || planner?.difficulty}
            </span>
          )}
          {(overview?.category || planner?.category) && (
            <span className="rounded-md bg-secondary-bg px-2 py-0.5 text-xs text-secondary-text">
              {overview?.category || planner?.category}
            </span>
          )}
        </div>
        {overview?.definition && (
          <p className="text-sm leading-relaxed text-secondary-text">{overview.definition}</p>
        )}
        {(overview?.estimated_study_time || planner?.estimated_study_time) && (
          <p className="text-xs text-muted">
            Est. study time: {overview?.estimated_study_time || planner?.estimated_study_time}
          </p>
        )}
      </section>

      {overview?.why_it_exists && (
        <section className="space-y-2">
          <h3 className="font-heading text-sm font-semibold text-foreground">Why it exists</h3>
          <PatternMarkdown content={overview.why_it_exists} />
        </section>
      )}

      {overview?.history && (
        <section className="space-y-2">
          <h3 className="font-heading text-sm font-semibold text-foreground">History</h3>
          <PatternMarkdown content={overview.history} />
        </section>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <ListBlock
          title="Learning objectives"
          items={overview?.learning_objectives ?? planner?.learning_objectives}
        />
        <ListBlock
          title="Prerequisites"
          items={overview?.prerequisites ?? planner?.prerequisites}
        />
        <ListBlock title="Real-world use cases" items={overview?.real_world_use_cases} />
        <ListBlock title="Roadmap" items={planner?.roadmap} />
      </div>

      {overview?.beginner_explanation && (
        <section className="space-y-2 rounded-2xl border border-border p-4">
          <h3 className="font-heading text-sm font-semibold text-foreground">Beginner</h3>
          <PatternMarkdown content={overview.beginner_explanation} />
        </section>
      )}
      {overview?.intermediate_explanation && (
        <section className="space-y-2 rounded-2xl border border-border p-4">
          <h3 className="font-heading text-sm font-semibold text-foreground">Intermediate</h3>
          <PatternMarkdown content={overview.intermediate_explanation} />
        </section>
      )}
      {overview?.advanced_explanation && (
        <section className="space-y-2 rounded-2xl border border-border p-4">
          <h3 className="font-heading text-sm font-semibold text-foreground">Advanced</h3>
          <PatternMarkdown content={overview.advanced_explanation} />
        </section>
      )}

      {lesson.teacher_summary?.trim() && (
        <section className="space-y-3 rounded-2xl border border-border bg-surface/60 p-5">
          <h3 className="font-heading text-sm font-semibold text-foreground">Teacher summary</h3>
          <PatternMarkdown content={lesson.teacher_summary} />
        </section>
      )}

      {lesson.common_mistakes && lesson.common_mistakes.length > 0 && (
        <ListBlock title="Common mistakes" items={lesson.common_mistakes} />
      )}
    </div>
  );
}
