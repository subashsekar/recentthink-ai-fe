'use client';

import { useEffect } from 'react';
import { useCourseStore } from '@/store/courseStore';
import { useCourseDetail } from '@/hooks/courses/useCourseQueries';
import { CourseGenerateForm } from './CourseGenerateForm';
import { CourseWorkspace } from './CourseWorkspace';
import { CourseExampleCards } from './CourseExampleCards';
import { CourseModelSelector } from './CourseModelSelector';
import { Skeleton } from '@/components/ui/Skeleton';

export function CourseWorkspaceContent() {
  const selectedCourseId = useCourseStore((s) => s.selectedCourseId);
  const showNewForm = useCourseStore((s) => s.showNewForm);
  const detail = useCourseStore((s) => s.detail);
  const isGenerating = useCourseStore((s) => s.isGenerating);
  const hydrateFromDetail = useCourseStore((s) => s.hydrateFromDetail);

  const { data, isLoading, isFetching, isError, refetch } = useCourseDetail(
    showNewForm ? null : selectedCourseId,
  );

  // Avoid re-fetching when we already hydrated from generate/sidebar
  useEffect(() => {
    if (!data || !selectedCourseId) return;
    if (data.course_id !== selectedCourseId) return;
    if (detail?.course_id === selectedCourseId) return;
    hydrateFromDetail(data);
  }, [data, selectedCourseId, detail?.course_id, hydrateFromDetail]);

  const showForm = showNewForm || (!selectedCourseId && !detail);
  const loadingDetail =
    Boolean(selectedCourseId) &&
    !showNewForm &&
    !detail &&
    (isLoading || isFetching || isGenerating);

  return (
    <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-[24px] glass-panel shadow-lg">
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        {loadingDetail ? (
          <div className="space-y-4 p-6">
            <Skeleton className="h-8 w-1/2 bg-secondary-bg" />
            <Skeleton className="h-12 w-full bg-secondary-bg" />
            <Skeleton className="h-64 w-full bg-secondary-bg" />
          </div>
        ) : isError && selectedCourseId && !showForm ? (
          <div className="space-y-3 p-6">
            <p className="text-sm text-error">Failed to load course.</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="rounded-xl border border-border px-3 py-1.5 text-sm"
            >
              Retry
            </button>
          </div>
        ) : showForm ? (
          <div className="space-y-6 p-4 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <h1 className="font-heading text-2xl font-semibold text-foreground">
                  Create learning path
                </h1>
                <p className="mt-1 text-sm text-muted">
                  Generate a personalized course, then continue it from history anytime.
                </p>
              </div>
              <CourseModelSelector compact menuPlacement="below" className="shrink-0 self-start" />
            </div>
            <div>
              <h2 className="font-heading text-sm font-semibold text-foreground">Quick topics</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {['Python', 'FastAPI', 'AWS', 'AI', 'React'].map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() =>
                      useCourseStore.getState().setForm({
                        skill,
                        programming_language: skill,
                        goal: `Master ${skill}`,
                      })
                    }
                    className="rounded-xl border border-border bg-secondary-bg/40 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>
            <CourseExampleCards onSelect={() => undefined} />
            <CourseGenerateForm embedded />
          </div>
        ) : detail ? (
          <div className="p-4 sm:p-6">
            <CourseWorkspace course={detail} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
