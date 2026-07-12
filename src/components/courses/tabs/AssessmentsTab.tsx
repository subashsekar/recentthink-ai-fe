'use client';

import { CourseMarkdown, toMarkdownString } from '../CourseMarkdown';
import type { CourseGenerateResponse } from '@/types/course';

interface AssessmentsTabProps {
  course: CourseGenerateResponse;
}

function questionText(question: string | Record<string, unknown>, index: number): string {
  if (typeof question === 'string') return question;
  const text =
    question.question ?? question.text ?? question.content ?? question.prompt ?? question.title;
  if (typeof text === 'string') return text;
  return `Question ${index + 1}`;
}

export function AssessmentsTab({ course }: AssessmentsTabProps) {
  const assessments = course.assessments ?? [];

  if (assessments.length === 0) {
    return <p className="text-sm text-muted">No assessments available for this course.</p>;
  }

  return (
    <div className="space-y-4">
      {assessments.map((assessment, index) => (
        <article
          key={assessment.id ?? `assessment-${index}`}
          className="space-y-4 rounded-2xl border border-border bg-surface/50 p-5"
        >
          <div>
            <p className="text-xs text-primary">
              {assessment.week != null ? `Week ${assessment.week}` : 'Assessment'}
              {assessment.type ? ` · ${assessment.type}` : ''}
            </p>
            <h3 className="font-heading text-base font-semibold text-foreground">
              {assessment.title}
            </h3>
          </div>

          {assessment.questions?.length > 0 && (
            <section>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                Questions
              </h4>
              <ol className="list-decimal space-y-2 pl-5 text-sm text-secondary-text">
                {assessment.questions.map((q, qi) => (
                  <li key={`${assessment.id ?? index}-q-${qi}`}>{questionText(q, qi)}</li>
                ))}
              </ol>
            </section>
          )}

          {toMarkdownString(assessment.rubric).trim() && (
            <section>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                Rubric
              </h4>
              <CourseMarkdown content={assessment.rubric} />
            </section>
          )}

          {toMarkdownString(assessment.scoring).trim() && (
            <section>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                Scoring
              </h4>
              <CourseMarkdown content={assessment.scoring} />
            </section>
          )}

          {toMarkdownString(assessment.completion_criteria).trim() && (
            <section>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                Completion criteria
              </h4>
              <CourseMarkdown content={assessment.completion_criteria} />
            </section>
          )}
        </article>
      ))}
    </div>
  );
}
