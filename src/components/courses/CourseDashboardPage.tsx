'use client';

import Link from 'next/link';
import { BookOpen, Clock, Flame, Target } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { useCourseDashboard } from '@/hooks/courses/useCourseQueries';
import { ROUTES } from '@/constants';

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: typeof Flame;
}) {
  return (
    <div className="glass-panel rounded-2xl p-5">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon size={18} />
      </div>
      <p className="text-2xl font-semibold text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted">{label}</p>
    </div>
  );
}

export function CourseDashboardPage() {
  const { data, isLoading, isError, refetch } = useCourseDashboard();

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 bg-secondary-bg" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="glass-card space-y-3 p-6">
        <p className="text-sm text-error">Failed to load dashboard.</p>
        <Button variant="outline" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  const active = data?.active_course;
  const recent = data?.recent ?? [];

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">
            Learning dashboard
          </h1>
          <p className="mt-1 text-sm text-muted">Streak, hours, and active courses.</p>
        </div>
        <Link href={ROUTES.COURSES_NEW}>
          <Button className="rounded-xl">Create learning path</Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Courses created" value={data?.courses_created ?? 0} icon={BookOpen} />
        <StatCard label="Courses completed" value={data?.courses_completed ?? 0} icon={Target} />
        <StatCard label="Learning streak" value={`${data?.learning_streak ?? 0}d`} icon={Flame} />
        <StatCard label="Study hours" value={data?.study_hours ?? 0} icon={Clock} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Lessons completed" value={data?.lessons_completed ?? 0} icon={BookOpen} />
        <StatCard label="Quizzes completed" value={data?.quizzes_completed ?? 0} icon={Target} />
        <StatCard label="Projects completed" value={data?.projects_completed ?? 0} icon={Flame} />
      </div>

      {data?.favorite_skill && (
        <p className="text-sm text-secondary-text">
          Favorite skill: <span className="font-medium text-foreground">{data.favorite_skill}</span>
        </p>
      )}

      {active && (
        <section className="glass-card space-y-3 p-6">
          <h2 className="font-heading text-base font-semibold text-foreground">Active course</h2>
          <p className="text-sm text-foreground">{active.title || active.skill}</p>
          <p className="text-xs text-muted">
            {active.skill} · {active.completion_pct ?? 0}% complete
          </p>
          <Link href={`${ROUTES.COURSES}/${active.course_id}`}>
            <Button className="rounded-xl">Continue learning</Button>
          </Link>
        </section>
      )}

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-base font-semibold text-foreground">Recent</h2>
          <Link href={ROUTES.COURSES_HISTORY} className="text-xs text-primary underline">
            View all
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="text-sm text-muted">No recent courses.</p>
        ) : (
          <div className="space-y-2">
            {recent.map((item) => (
              <Link
                key={item.course_id}
                href={`${ROUTES.COURSES}/${item.course_id}`}
                className="glass-panel block rounded-2xl p-4 transition-colors hover:border-primary/30"
              >
                <p className="font-heading text-sm font-semibold text-foreground">
                  {item.title || item.skill}
                </p>
                <p className="mt-1 text-xs text-muted">
                  {item.goal} · {item.completion_pct ?? 0}%
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
