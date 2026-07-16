'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { StatCard } from '@/components/admin/StatCard';
import { AdminQueryState } from '@/components/admin/AdminQueryState';
import { adminApi } from '@/services/api/admin';
import { ROUTES } from '@/constants';
import { formatCost, formatInt, formatMs, formatNullable } from '@/utils/adminFormat';

export default function AdminDashboardPage() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: adminApi.getDashboard,
  });

  const mostActive = data?.most_active_user;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Overview</p>
          <h1 className="mt-1 font-heading text-2xl font-semibold text-foreground sm:text-3xl">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted">Platform metrics and user cohorts</p>
        </div>
        <Link
          href={ROUTES.ADMIN_AI_USAGE}
          className="text-sm font-medium text-primary hover:underline"
        >
          Open AI Usage Analytics →
        </Link>
      </div>

      <AdminQueryState
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={() => refetch()}
        isEmpty={!data}
      >
        {data ? (
          <>
            <div>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.12em] text-muted">
                Platform AI usage
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                <StatCard label="Total tokens" value={formatInt(data.platform_total_tokens)} />
                <StatCard label="Total cost" value={formatCost(data.platform_total_cost)} />
                <StatCard label="Total requests" value={formatInt(data.platform_total_requests)} />
                <StatCard label="Active users today" value={formatInt(data.active_users_today)} />
                <StatCard label="Avg response time" value={formatMs(data.average_response_time)} />
                <StatCard
                  label="Avg execution time"
                  value={formatMs(data.average_execution_time)}
                />
                <StatCard
                  label="Most used feature"
                  value={formatNullable(data.most_used_ai_feature)}
                />
                <StatCard label="Most used model" value={formatNullable(data.most_used_ai_model)} />
                <StatCard
                  label="Most used provider"
                  value={formatNullable(data.most_used_provider)}
                />
                <StatCard
                  label="Most active user"
                  value={mostActive ? formatInt(mostActive.total_tokens) : '—'}
                  hint={
                    mostActive
                      ? `${mostActive.email || mostActive.user_id} · ${formatInt(mostActive.total_requests)} req · ${formatCost(mostActive.estimated_cost)}`
                      : undefined
                  }
                />
              </div>
            </div>

            <div>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.12em] text-muted">
                Users
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                <StatCard label="Total users" value={formatInt(data.total_users)} />
                <StatCard label="Active users" value={formatInt(data.active_users)} />
                <StatCard label="New today" value={formatInt(data.new_users_today)} />
                <StatCard label="Verified" value={formatInt(data.verified_users)} />
                <StatCard label="Blocked" value={formatInt(data.blocked_users)} />
              </div>
            </div>

            <div>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.12em] text-muted">
                By status
              </h2>
              <div className="grid gap-4 sm:grid-cols-3">
                <StatCard label="Students" value={formatInt(data.students)} />
                <StatCard label="Professionals" value={formatInt(data.professionals)} />
                <StatCard label="Job seekers" value={formatInt(data.job_seekers)} />
              </div>
            </div>
          </>
        ) : null}
      </AdminQueryState>
    </div>
  );
}
