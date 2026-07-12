'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { CheckCircle2, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useUpdateCourseProgressMutation } from '@/hooks/courses/useCourseMutations';
import { handleCourseApiError } from '@/utils/courseError';
import { CourseMarkdown } from '../CourseMarkdown';
import type { CourseGenerateResponse, CourseLesson } from '@/types/course';
import { cn } from '@/utils/cn';

interface LessonsTabProps {
  course: CourseGenerateResponse;
}

function LessonDetail({ lesson }: { lesson: CourseLesson }) {
  return (
    <div className="space-y-5 border-t border-border pt-4">
      {lesson.objectives?.length > 0 && (
        <section>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
            Objectives
          </h4>
          <ul className="list-disc space-y-1 pl-5 text-sm text-secondary-text">
            {lesson.objectives.map((o) => (
              <li key={o}>{o}</li>
            ))}
          </ul>
        </section>
      )}
      {[
        ['Concept explanation', lesson.concept_explanation],
        ['Examples', lesson.examples],
        ['Visual analogies', lesson.visual_analogies],
        ['Common mistakes', lesson.common_mistakes],
        ['Best practices', lesson.best_practices],
        ['Summary', lesson.summary],
      ].map(([title, content]) =>
        content ? (
          <section key={title as string}>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
              {title}
            </h4>
            <CourseMarkdown content={content as string} />
          </section>
        ) : null,
      )}
    </div>
  );
}

export function LessonsTab({ course }: LessonsTabProps) {
  const lessons = course.lessons ?? [];
  const [openId, setOpenId] = useState<string | null>(null);
  const updateProgress = useUpdateCourseProgressMutation();

  if (lessons.length === 0) {
    return <p className="text-sm text-muted">No lessons available for this course.</p>;
  }

  const markComplete = async (lesson: CourseLesson, index: number) => {
    try {
      await updateProgress.mutateAsync({
        course_id: course.course_id,
        current_week: lesson.week ?? course.progress?.current_week ?? 1,
        current_lesson: index + 1,
        lessons_completed_delta: 1,
        study_hours_delta: 0.5,
      });
      toast.success('Lesson marked complete');
    } catch (err) {
      toast.error(handleCourseApiError(err, 'Failed to update progress.'));
    }
  };

  return (
    <div className="space-y-3">
      {lessons.map((lesson, index) => {
        const key = lesson.id ?? `lesson-${index}`;
        const isOpen = openId === key;
        return (
          <article key={key} className="rounded-2xl border border-border bg-surface/50">
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : key)}
              className="flex w-full items-center gap-3 px-4 py-4 text-left"
            >
              <div className="min-w-0 flex-1">
                <p className="text-xs text-primary">
                  {lesson.week != null ? `Week ${lesson.week}` : 'Lesson'}
                </p>
                <h3 className="font-heading text-sm font-semibold text-foreground">
                  {lesson.title}
                </h3>
              </div>
              <ChevronDown
                size={18}
                className={cn('shrink-0 text-muted transition-transform', isOpen && 'rotate-180')}
              />
            </button>
            {isOpen && (
              <div className="space-y-4 px-4 pb-4">
                <LessonDetail lesson={lesson} />
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-xl"
                  isLoading={updateProgress.isPending}
                  onClick={() => markComplete(lesson, index)}
                >
                  <CheckCircle2 size={16} />
                  Mark complete
                </Button>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
