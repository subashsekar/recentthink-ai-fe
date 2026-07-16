'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { AdminQueryState } from '@/components/admin/AdminQueryState';
import { StatCard } from '@/components/admin/StatCard';
import { adminApi } from '@/services/api/admin';
import { ROUTES } from '@/constants';
import {
  formatCost,
  formatDateTime,
  formatInt,
  formatMs,
  formatNullable,
} from '@/utils/adminFormat';

function JsonList({ title, value }: { title: string; value: unknown }) {
  const empty =
    value == null ||
    (Array.isArray(value) && value.length === 0) ||
    (typeof value === 'object' &&
      !Array.isArray(value) &&
      Object.keys(value as object).length === 0);

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <h3 className="mb-3 text-sm font-semibold text-foreground">{title}</h3>
      {empty ? (
        <p className="text-sm text-muted">No data</p>
      ) : (
        <pre className="overflow-x-auto rounded-xl bg-secondary-bg/50 p-3 text-xs text-secondary-text">
          {JSON.stringify(value, null, 2)}
        </pre>
      )}
    </div>
  );
}

export default function AiUsageUserDetailPage() {
  const params = useParams();
  const userId = String(params.userId ?? '');

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin', 'analytics', 'user', userId],
    queryFn: () => adminApi.getAnalyticsUser(userId),
    enabled: Boolean(userId),
  });

  const user = data?.user as
    { first_name?: string; last_name?: string; email?: string; id?: string } | null | undefined;
  const title =
    user && typeof user === 'object'
      ? `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim() || user.email || userId
      : userId;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={ROUTES.ADMIN_AI_USAGE_USERS}
          className="text-sm text-muted hover:text-foreground"
        >
          ← Back to user usage
        </Link>
        <h2 className="mt-2 font-heading text-xl font-semibold text-foreground">{title}</h2>
        <p className="text-sm text-muted">
          {user && typeof user === 'object' ? formatNullable(user.email) : userId}
        </p>
      </div>

      <AdminQueryState
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={() => refetch()}
        isEmpty={!data}
      >
        {data ? (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <StatCard label="Total requests" value={formatInt(data.total_requests)} />
              <StatCard label="Prompt tokens" value={formatInt(data.prompt_tokens)} />
              <StatCard label="Completion tokens" value={formatInt(data.completion_tokens)} />
              <StatCard label="Total tokens" value={formatInt(data.total_tokens)} />
              <StatCard label="Estimated cost" value={formatCost(data.estimated_cost)} />
              <StatCard
                label="Avg execution time"
                value={formatMs(data.average_execution_time_ms)}
              />
              <StatCard label="Last activity" value={formatDateTime(data.last_activity)} />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <JsonList title="Profile" value={data.profile} />
              <JsonList title="User" value={data.user} />
              <JsonList title="Feature breakdown" value={data.feature_breakdown} />
              <JsonList title="Model usage" value={data.model_usage} />
              <JsonList title="Provider usage" value={data.provider_usage} />
              <JsonList title="Session history" value={data.session_history} />
              <JsonList title="Recent conversations" value={data.recent_conversations} />
            </div>
          </div>
        ) : null}
      </AdminQueryState>
    </div>
  );
}
