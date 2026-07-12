'use client';

import { useRouter } from 'next/navigation';
import { AlertCircle, BookOpen } from 'lucide-react';
import { useCourseExamples } from '@/hooks/courses/useCourseQueries';
import { useCourseStore } from '@/store/courseStore';
import { ROUTES } from '@/constants';
import { cn } from '@/utils/cn';
import type { CourseExample } from '@/types/course';

function ExampleSkeleton() {
  return (
    <div className="h-[140px] animate-pulse rounded-2xl border border-border bg-secondary-bg/60" />
  );
}

interface CourseExampleCardsProps {
  onSelect?: (example: CourseExample) => void;
  className?: string;
}

export function CourseExampleCards({ onSelect, className }: CourseExampleCardsProps) {
  const router = useRouter();
  const applyExample = useCourseStore((s) => s.applyExample);
  const { data: examples = [], isLoading, isError, refetch } = useCourseExamples();

  const handleSelect = (example: CourseExample) => {
    applyExample(example);
    onSelect?.(example);
    if (!onSelect) {
      router.push(ROUTES.COURSES_NEW);
    }
  };

  return (
    <div className={cn('space-y-3', className)}>
      {isError && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-error dark:border-red-900/40 dark:bg-red-950/30">
          <AlertCircle size={16} />
          <span className="flex-1">Failed to load examples.</span>
          <button type="button" onClick={() => refetch()} className="text-xs font-medium underline">
            Retry
          </button>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading && Array.from({ length: 3 }).map((_, i) => <ExampleSkeleton key={i} />)}

        {!isLoading && !isError && examples.length === 0 && (
          <p className="col-span-full py-6 text-sm text-muted">No example courses available.</p>
        )}

        {!isLoading &&
          examples.map((example, index) => (
            <button
              key={example.id ?? `${example.skill}-${index}`}
              type="button"
              onClick={() => handleSelect(example)}
              className="group glass-panel flex flex-col rounded-2xl p-5 text-left shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
            >
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <BookOpen size={18} />
              </div>
              <h3 className="font-heading text-sm font-semibold text-foreground">
                {example.title || example.skill}
              </h3>
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">
                {example.description || example.goal}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {example.level && (
                  <span className="rounded-md bg-secondary-bg px-2 py-0.5 text-[11px] text-secondary-text">
                    {example.level}
                  </span>
                )}
                {example.duration_days != null && (
                  <span className="rounded-md bg-secondary-bg px-2 py-0.5 text-[11px] text-secondary-text">
                    {example.duration_days}d
                  </span>
                )}
              </div>
            </button>
          ))}
      </div>
    </div>
  );
}
