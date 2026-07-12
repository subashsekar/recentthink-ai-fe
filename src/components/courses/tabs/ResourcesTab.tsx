'use client';

import { ExternalLink } from 'lucide-react';
import type { CourseGenerateResponse } from '@/types/course';

interface ResourcesTabProps {
  course: CourseGenerateResponse;
}

export function ResourcesTab({ course }: ResourcesTabProps) {
  const resources = course.resources ?? [];

  if (resources.length === 0) {
    return <p className="text-sm text-muted">No resources available for this course.</p>;
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {resources.map((resource, index) => (
        <article
          key={`${resource.title}-${index}`}
          className="rounded-2xl border border-border bg-surface/50 p-4"
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[11px] uppercase tracking-wide text-muted">
                {resource.type}
                {resource.week != null ? ` · Week ${resource.week}` : ''}
              </p>
              <h3 className="mt-1 font-heading text-sm font-semibold text-foreground">
                {resource.title}
              </h3>
            </div>
            {resource.url && (
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg p-1.5 text-primary hover:bg-primary/10"
                aria-label={`Open ${resource.title}`}
              >
                <ExternalLink size={16} />
              </a>
            )}
          </div>
          {resource.description && (
            <p className="mt-2 text-sm text-secondary-text">{resource.description}</p>
          )}
        </article>
      ))}
    </div>
  );
}
