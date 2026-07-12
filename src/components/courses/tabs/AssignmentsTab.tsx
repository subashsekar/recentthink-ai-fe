'use client';

import { CourseMarkdown } from '../CourseMarkdown';
import type { CourseGenerateResponse } from '@/types/course';

interface AssignmentsTabProps {
  course: CourseGenerateResponse;
}

export function AssignmentsTab({ course }: AssignmentsTabProps) {
  const assignments = course.assignments ?? [];

  if (assignments.length === 0) {
    return <p className="text-sm text-muted">No assignments available for this course.</p>;
  }

  return (
    <div className="space-y-4">
      {assignments.map((assignment, index) => (
        <article
          key={assignment.id ?? `assignment-${index}`}
          className="space-y-4 rounded-2xl border border-border bg-surface/50 p-5"
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-xs text-primary">
                {assignment.week != null ? `Week ${assignment.week}` : 'Assignment'}
                {assignment.type ? ` · ${assignment.type}` : ''}
              </p>
              <h3 className="font-heading text-base font-semibold text-foreground">
                {assignment.title}
              </h3>
            </div>
            {assignment.estimated_hours != null && (
              <span className="rounded-md bg-secondary-bg px-2 py-0.5 text-xs text-secondary-text">
                {assignment.estimated_hours}h
              </span>
            )}
          </div>

          {assignment.description && <CourseMarkdown content={assignment.description} />}

          {assignment.tasks?.length > 0 && (
            <section>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                Tasks
              </h4>
              <ul className="list-disc space-y-1 pl-5 text-sm text-secondary-text">
                {assignment.tasks.map((task) => (
                  <li key={task}>{task}</li>
                ))}
              </ul>
            </section>
          )}

          {assignment.coding_exercises?.length > 0 && (
            <section>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                Coding exercises
              </h4>
              <ul className="space-y-2">
                {assignment.coding_exercises.map((ex) => (
                  <li
                    key={ex}
                    className="rounded-lg bg-secondary-bg/70 px-3 py-2 font-mono text-xs text-foreground"
                  >
                    {ex}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {assignment.review_questions?.length > 0 && (
            <section>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                Review questions
              </h4>
              <ul className="list-disc space-y-1 pl-5 text-sm text-secondary-text">
                {assignment.review_questions.map((q) => (
                  <li key={q}>{q}</li>
                ))}
              </ul>
            </section>
          )}
        </article>
      ))}
    </div>
  );
}
