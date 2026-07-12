'use client';

import {
  BookOpen,
  Clock,
  Flame,
  GraduationCap,
  Shapes,
  Trophy,
  type LucideIcon,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Loading } from '@/components/ui/Loading';
import { Button } from '@/components/ui/Button';
import { useProfileStatistics } from '@/hooks/profile/useProfileQueries';
import type { StatisticsResponse } from '@/types/profile';
import { formatLastActive } from '@/utils/profile';
import { handleProfileApiError } from '@/utils/profileError';

const METRICS: Array<{
  key: keyof Omit<StatisticsResponse, 'last_active'>;
  label: string;
  icon: LucideIcon;
}> = [
  { key: 'problems_solved', label: 'Problems Solved', icon: Trophy },
  { key: 'courses_completed', label: 'Courses Completed', icon: BookOpen },
  { key: 'patterns_learned', label: 'Patterns Learned', icon: Shapes },
  { key: 'current_streak', label: 'Current Streak', icon: Flame },
  { key: 'longest_streak', label: 'Longest Streak', icon: Flame },
  { key: 'learning_hours', label: 'Learning Hours', icon: Clock },
];

const metricTileClass =
  'rounded-xl border border-border bg-surface/50 px-4 py-4 transition hover:-translate-y-0.5 hover:border-primary/30';

export function ProfileStatistics() {
  const { data, isLoading, isPending, isError, error, refetch, isFetching } =
    useProfileStatistics();

  if (isLoading || isPending) {
    return (
      <div className="profile-panel rounded-2xl p-6 sm:p-8">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Learning Statistics</h2>
        <Loading message="Loading statistics…" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="profile-panel rounded-2xl p-6 sm:p-8">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Learning Statistics</h2>
        <p className="mb-3 text-sm text-muted">
          {handleProfileApiError(error, 'Could not load statistics')}
        </p>
        <Button variant="outline" size="sm" onClick={() => refetch()} isLoading={isFetching}>
          Retry
        </Button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="profile-panel rounded-2xl p-6 sm:p-8">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Learning Statistics</h2>
        <p className="text-sm text-muted">
          No statistics available yet. Start learning to see your progress here.
        </p>
      </div>
    );
  }

  const stats = data;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="profile-panel rounded-2xl p-6 sm:p-8"
    >
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
            Learning Statistics
          </h2>
          <p className="mt-1 text-sm text-muted">Read-only metrics from your learning activity</p>
        </div>
        <GraduationCap className="h-5 w-5 shrink-0 text-muted" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {METRICS.map(({ key, label, icon: Icon }) => (
          <div key={key} className={metricTileClass}>
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted">
              <Icon className="h-3.5 w-3.5" />
              {label}
            </div>
            <p className="mt-2 text-2xl font-semibold tabular-nums text-foreground">
              {stats[key] ?? 0}
            </p>
          </div>
        ))}
      </div>

      <p className="mt-5 flex items-center gap-2 text-sm text-muted">
        <Clock className="h-4 w-4" />
        Last active: {formatLastActive(stats.last_active)}
      </p>
    </motion.div>
  );
}

interface PublicStatisticsProps {
  statistics: StatisticsResponse;
}

export function PublicStatistics({ statistics }: PublicStatisticsProps) {
  const stats = statistics ?? {
    problems_solved: 0,
    courses_completed: 0,
    patterns_learned: 0,
    current_streak: 0,
    longest_streak: 0,
    learning_hours: 0,
    last_active: null,
  };

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {METRICS.map(({ key, label, icon: Icon }) => (
        <div key={key} className={metricTileClass}>
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted">
            <Icon className="h-3.5 w-3.5" />
            {label}
          </div>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-foreground">
            {stats[key] ?? 0}
          </p>
        </div>
      ))}
      <div className={`${metricTileClass} sm:col-span-2 lg:col-span-3`}>
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted">
          <Clock className="h-3.5 w-3.5" />
          Last Active
        </div>
        <p className="mt-2 text-base font-medium text-foreground">
          {formatLastActive(stats.last_active)}
        </p>
      </div>
    </div>
  );
}
