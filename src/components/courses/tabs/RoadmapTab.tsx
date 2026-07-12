'use client';

import { Badge } from '@/components/ui/Badge';
import type { CourseGenerateResponse } from '@/types/course';

interface RoadmapTabProps {
  course: CourseGenerateResponse;
}

export function RoadmapTab({ course }: RoadmapTabProps) {
  const weeks = course.roadmap ?? [];

  if (weeks.length === 0) {
    return <p className="text-sm text-muted">No roadmap available for this course.</p>;
  }

  return (
    <div className="space-y-4">
      {weeks.map((week) => (
        <article
          key={week.week}
          className="rounded-2xl border border-border bg-surface/50 p-5 transition-colors hover:border-primary/25"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-primary">
                Week {week.week}
              </p>
              <h3 className="mt-1 font-heading text-base font-semibold text-foreground">
                {week.title}
              </h3>
              <p className="mt-1 text-sm text-secondary-text">{week.focus}</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {week.is_revision_week && <Badge variant="info">Revision</Badge>}
              {week.is_project_week && <Badge variant="warning">Project</Badge>}
              {week.is_assessment_week && <Badge variant="success">Assessment</Badge>}
              {week.study_hours != null && <Badge variant="default">{week.study_hours}h</Badge>}
            </div>
          </div>

          {week.daily_topics?.length > 0 && (
            <ul className="mt-4 space-y-2 border-t border-border pt-4">
              {week.daily_topics.map((topic, idx) => (
                <li
                  key={`${week.week}-${idx}-${topic.topic}`}
                  className="flex flex-wrap items-baseline gap-2 text-sm"
                >
                  {topic.day != null && (
                    <span className="w-14 shrink-0 text-xs font-medium text-muted">
                      Day {topic.day}
                    </span>
                  )}
                  <span className="text-foreground">{topic.topic}</span>
                  {topic.activity_type && (
                    <span className="text-xs text-muted">· {topic.activity_type}</span>
                  )}
                  {topic.study_hours != null && (
                    <span className="text-xs text-muted">· {topic.study_hours}h</span>
                  )}
                </li>
              ))}
            </ul>
          )}

          {week.milestones?.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-medium text-muted">Milestones</p>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-secondary-text">
                {week.milestones.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            </div>
          )}
        </article>
      ))}
    </div>
  );
}
