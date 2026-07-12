'use client';

import Link from 'next/link';
import { Clock, Flame, Shapes, Target } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { useDsaPatternDashboard } from '@/hooks/dsa-pattern/useDsaPatternQueries';
import { useDsaPatternStore } from '@/store/dsaPatternStore';
import { ROUTES } from '@/constants';
import type { PatternNextRecommendation } from '@/types/dsaPattern';

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

function resolveRecommended(
  value: PatternNextRecommendation | string | null | undefined,
): PatternNextRecommendation | null {
  if (!value) return null;
  if (typeof value === 'string') return { pattern: value };
  return value;
}

export function PatternDashboardPage() {
  const { data, isLoading, isError, refetch } = useDsaPatternDashboard();
  const prefillPattern = useDsaPatternStore((s) => s.prefillPattern);
  const recommended = resolveRecommended(data?.recommended_next);

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

  const recent = data?.recent_sessions ?? [];
  const mastery = data?.mastery ?? [];
  const studyHours = Math.round(((data?.study_minutes ?? 0) / 60) * 10) / 10;

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">
            Pattern Coach dashboard
          </h1>
          <p className="mt-1 text-sm text-muted">
            Patterns learned, streak, and recommended next steps.
          </p>
        </div>
        <Link href={ROUTES.DSA_PATTERN_NEW}>
          <Button className="rounded-xl">New pattern lesson</Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Patterns learned" value={data?.patterns_learned ?? 0} icon={Shapes} />
        <StatCard label="Patterns mastered" value={data?.patterns_mastered ?? 0} icon={Target} />
        <StatCard label="Learning streak" value={`${data?.learning_streak ?? 0}d`} icon={Flame} />
        <StatCard label="Study time (hrs)" value={studyHours} icon={Clock} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard label="Quiz average" value={`${data?.quiz_average ?? 0}%`} icon={Target} />
        <StatCard label="Study minutes" value={data?.study_minutes ?? 0} icon={Clock} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="glass-card space-y-3 p-6">
          <h2 className="font-heading text-base font-semibold text-foreground">Strong patterns</h2>
          {(data?.strong_patterns ?? []).length === 0 ? (
            <p className="text-sm text-muted">No strong patterns yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {data!.strong_patterns!.map((p) => (
                <span
                  key={p}
                  className="rounded-lg bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-600"
                >
                  {p}
                </span>
              ))}
            </div>
          )}
        </section>
        <section className="glass-card space-y-3 p-6">
          <h2 className="font-heading text-base font-semibold text-foreground">Weak patterns</h2>
          {(data?.weak_patterns ?? []).length === 0 ? (
            <p className="text-sm text-muted">No weak patterns flagged.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {data!.weak_patterns!.map((p) => (
                <span
                  key={p}
                  className="rounded-lg bg-amber-500/10 px-2.5 py-1 text-xs text-amber-700"
                >
                  {p}
                </span>
              ))}
            </div>
          )}
        </section>
      </div>

      {recommended && (
        <section className="glass-card space-y-3 p-6">
          <h2 className="font-heading text-base font-semibold text-foreground">
            Recommended next pattern
          </h2>
          <p className="text-lg font-medium text-foreground">{recommended.pattern}</p>
          {recommended.reason && (
            <p className="text-sm text-secondary-text">{recommended.reason}</p>
          )}
          <Button
            className="rounded-xl"
            onClick={() => {
              prefillPattern(recommended.pattern);
              window.location.assign(ROUTES.DSA_PATTERN_NEW);
            }}
          >
            Generate this lesson
          </Button>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="font-heading text-base font-semibold text-foreground">Mastery list</h2>
        {mastery.length === 0 ? (
          <p className="text-sm text-muted">Complete quizzes and practice to build mastery.</p>
        ) : (
          <div className="space-y-2">
            {mastery.map((item) => (
              <div
                key={item.pattern}
                className="glass-panel flex items-center justify-between rounded-2xl p-4"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{item.pattern}</p>
                  <p className="text-xs text-muted">
                    {item.completion_pct ?? 0}% · quiz {item.quiz_score ?? '—'}%
                  </p>
                </div>
                {item.mastered && (
                  <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[11px] text-primary">
                    Mastered
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-base font-semibold text-foreground">Recent sessions</h2>
          <Link href={ROUTES.DSA_PATTERN} className="text-xs text-primary underline">
            Open coach
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="text-sm text-muted">No recent sessions.</p>
        ) : (
          <div className="space-y-2">
            {recent.map((item) => (
              <Link
                key={item.session_id}
                href={`${ROUTES.DSA_PATTERN}/session/${item.session_id}`}
                className="glass-panel block rounded-2xl p-4 transition-colors hover:border-primary/30"
              >
                <p className="font-heading text-sm font-semibold text-foreground">
                  {item.title || item.pattern || 'Pattern lesson'}
                </p>
                <p className="mt-1 text-xs text-muted">
                  {[item.level, item.language].filter(Boolean).join(' · ')} ·{' '}
                  {item.completion_pct ?? 0}%
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
