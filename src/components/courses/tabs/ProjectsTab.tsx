'use client';

import { Badge } from '@/components/ui/Badge';
import { CourseMarkdown } from '../CourseMarkdown';
import type { CourseGenerateResponse } from '@/types/course';

interface ProjectsTabProps {
  course: CourseGenerateResponse;
}

export function ProjectsTab({ course }: ProjectsTabProps) {
  const projects = course.projects ?? [];

  if (projects.length === 0) {
    return <p className="text-sm text-muted">No projects available for this course.</p>;
  }

  return (
    <div className="space-y-4">
      {projects.map((project, index) => (
        <article
          key={project.id ?? `project-${index}`}
          className="space-y-4 rounded-2xl border border-border bg-surface/50 p-5"
        >
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-heading text-base font-semibold text-foreground">
              {project.title}
            </h3>
            {project.level && <Badge variant="info">{project.level}</Badge>}
            {project.is_resume_project && <Badge variant="success">Resume project</Badge>}
          </div>

          {project.description && <CourseMarkdown content={project.description} />}

          {project.requirements?.length > 0 && (
            <section>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                Requirements
              </h4>
              <ul className="list-disc space-y-1 pl-5 text-sm text-secondary-text">
                {project.requirements.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </section>
          )}

          {project.architecture && (
            <section>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                Architecture
              </h4>
              <CourseMarkdown content={project.architecture} />
            </section>
          )}

          {project.implementation_steps?.length > 0 && (
            <section>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                Implementation steps
              </h4>
              <ol className="list-decimal space-y-1 pl-5 text-sm text-secondary-text">
                {project.implementation_steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </section>
          )}

          {project.expected_output && (
            <section>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                Expected output
              </h4>
              <CourseMarkdown content={project.expected_output} />
            </section>
          )}

          {project.evaluation_criteria?.length > 0 && (
            <section>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                Evaluation criteria
              </h4>
              <ul className="list-disc space-y-1 pl-5 text-sm text-secondary-text">
                {project.evaluation_criteria.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </section>
          )}
        </article>
      ))}
    </div>
  );
}
