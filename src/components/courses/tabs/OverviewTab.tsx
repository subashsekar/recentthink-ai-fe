'use client';

import { CourseMarkdown } from '../CourseMarkdown';
import type { CourseGenerateResponse } from '@/types/course';

interface OverviewTabProps {
  course: CourseGenerateResponse;
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

export function OverviewTab({ course }: OverviewTabProps) {
  const overview = course.overview;
  const learning_tips = course.learning_tips ?? [];
  const next_recommendations = course.next_recommendations ?? [];
  const adaptive = course.adaptive;
  const teacher_summary = course.teacher_summary;

  const title = overview?.title || course.planner?.skill || 'Untitled course';
  const description =
    overview?.description ||
    course.planner?.goal ||
    'Overview is not available for this course yet.';
  const difficulty = overview?.difficulty || course.planner?.difficulty;
  const durationDays = overview?.estimated_duration_days ?? course.planner?.duration_days;
  const studyHours = overview?.estimated_study_hours ?? course.planner?.estimated_study_hours;

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-heading text-xl font-semibold text-foreground">{title}</h2>
          {difficulty ? (
            <span className="rounded-md bg-secondary-bg px-2 py-0.5 text-xs text-secondary-text">
              {difficulty}
            </span>
          ) : null}
        </div>
        <p className="text-sm leading-relaxed text-secondary-text">{description}</p>
        {(durationDays != null || studyHours != null) && (
          <p className="text-xs text-muted">
            {durationDays != null ? `~${durationDays} days` : null}
            {durationDays != null && studyHours != null ? ' · ' : null}
            {studyHours != null ? `${studyHours} study hours` : null}
          </p>
        )}
      </section>

      <div className="grid gap-6 md:grid-cols-3">
        <ListBlock
          title="Learning objectives"
          items={overview?.learning_objectives ?? course.planner?.learning_objectives}
        />
        <ListBlock
          title="Prerequisites"
          items={overview?.prerequisites ?? course.planner?.prerequisites}
        />
        <ListBlock title="Expected outcomes" items={overview?.expected_outcomes} />
      </div>

      {teacher_summary?.trim() && (
        <section className="space-y-3 rounded-2xl border border-border bg-surface/60 p-5">
          <h3 className="font-heading text-sm font-semibold text-foreground">Teacher summary</h3>
          <CourseMarkdown content={teacher_summary} />
        </section>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <ListBlock title="Learning tips" items={learning_tips} />
        <ListBlock title="Next recommendations" items={next_recommendations} />
        <ListBlock title="If struggling" items={adaptive?.struggling} />
        <ListBlock title="If excelling" items={adaptive?.excelling} />
      </div>
    </div>
  );
}
