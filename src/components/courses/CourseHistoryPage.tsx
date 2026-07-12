'use client';

import { useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Search, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { useCourseHistory } from '@/hooks/courses/useCourseQueries';
import { useDeleteCourseMutation } from '@/hooks/courses/useCourseMutations';
import { handleCourseApiError } from '@/utils/courseError';
import { ROUTES } from '@/constants';

export function CourseHistoryPage() {
  const [q, setQ] = useState('');
  const [search, setSearch] = useState('');
  const {
    data: history,
    isLoading,
    isError,
    refetch,
  } = useCourseHistory({
    limit: 50,
    offset: 0,
    q: search || undefined,
  });
  const items = history?.items ?? [];
  const deleteCourse = useDeleteCourseMutation();

  const onDelete = async (courseId: string) => {
    if (!window.confirm('Delete this course?')) return;
    try {
      await deleteCourse.mutateAsync(courseId);
      toast.success('Deleted');
    } catch (err) {
      toast.error(handleCourseApiError(err, 'Failed to delete.'));
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">Course history</h1>
          <p className="mt-1 text-sm text-muted">Past learning paths and progress.</p>
        </div>
        <Link href={ROUTES.COURSES_NEW}>
          <Button className="rounded-xl">Create learning path</Button>
        </Link>
      </div>

      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          setSearch(q.trim());
        }}
      >
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by title, skill, or goal…"
            className="h-10 w-full rounded-xl border border-border bg-surface pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <Button type="submit" variant="outline" className="rounded-xl">
          Search
        </Button>
      </form>

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 bg-secondary-bg" />
          ))}
        </div>
      )}

      {isError && (
        <div className="glass-card space-y-3 p-5">
          <p className="text-sm text-error">Failed to load history.</p>
          <Button variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      )}

      {!isLoading && !isError && items.length === 0 && (
        <p className="py-10 text-center text-sm text-muted">No courses yet.</p>
      )}

      <div className="space-y-3">
        {items.map((item) => (
          <article
            key={item.course_id}
            className="glass-panel flex flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <Link href={`${ROUTES.COURSES}/${item.course_id}`} className="min-w-0 flex-1">
              <h2 className="truncate font-heading text-sm font-semibold text-foreground">
                {item.title || item.skill}
              </h2>
              <p className="mt-1 truncate text-xs text-muted">
                {item.skill} · {item.goal}
              </p>
              <p className="mt-1 text-xs text-secondary-text">
                {item.level} · {item.status} · {item.completion_pct ?? 0}% ·{' '}
                {item.updated_at ? new Date(item.updated_at).toLocaleDateString() : '—'}
              </p>
            </Link>
            <Button
              size="sm"
              variant="ghost"
              className="rounded-xl text-error"
              onClick={() => void onDelete(item.course_id)}
              isLoading={deleteCourse.isPending}
            >
              <Trash2 size={16} />
              Delete
            </Button>
          </article>
        ))}
      </div>
    </div>
  );
}
