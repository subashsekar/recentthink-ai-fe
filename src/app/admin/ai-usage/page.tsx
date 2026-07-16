'use client';

import { useQuery } from '@tanstack/react-query';
import { StatCard } from '@/components/admin/StatCard';
import { AdminQueryState } from '@/components/admin/AdminQueryState';
import { adminApi } from '@/services/api/admin';
import { formatCost, formatInt, formatMs, formatNullable } from '@/utils/adminFormat';
import type { PeriodUsage } from '@/types/admin';

function PeriodCards({ title, usage }: { title: string; usage?: PeriodUsage | null }) {
  return (
    <div>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.12em] text-muted">{title}</h2>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Requests" value={formatInt(usage?.requests)} />
        <StatCard label="Tokens" value={formatInt(usage?.tokens)} />
        <StatCard label="Cost" value={formatCost(usage?.cost)} />
        <StatCard label="Sessions" value={formatInt(usage?.sessions)} />
      </div>
    </div>
  );
}

export default function AiUsageOverviewPage() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin', 'analytics', 'dashboard'],
    queryFn: adminApi.getAnalyticsDashboard,
  });

  return (
    <AdminQueryState
      isLoading={isLoading}
      isError={isError}
      error={error}
      onRetry={() => refetch()}
      isEmpty={!data}
    >
      {data ? (
        <div className="space-y-8">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Total requests" value={formatInt(data.total_requests)} />
            <StatCard label="AI sessions" value={formatInt(data.total_ai_sessions)} />
            <StatCard label="Prompt tokens" value={formatInt(data.total_prompt_tokens)} />
            <StatCard label="Completion tokens" value={formatInt(data.total_completion_tokens)} />
            <StatCard label="Total tokens used" value={formatInt(data.total_tokens_used)} />
            <StatCard label="Estimated cost" value={formatCost(data.total_estimated_cost)} />
            <StatCard
              label="Avg tokens / request"
              value={formatInt(data.average_tokens_per_request)}
            />
            <StatCard
              label="Avg cost / request"
              value={formatCost(data.average_cost_per_request)}
            />
          </div>

          <PeriodCards title="Today" usage={data.todays_usage} />
          <PeriodCards title="This week" usage={data.weekly_usage} />
          <PeriodCards title="This month" usage={data.monthly_usage} />

          <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.12em] text-muted">
              Platform strip
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Platform tokens" value={formatInt(data.platform_total_tokens)} />
              <StatCard label="Platform cost" value={formatCost(data.platform_total_cost)} />
              <StatCard label="Platform requests" value={formatInt(data.platform_total_requests)} />
              <StatCard label="Active users today" value={formatInt(data.active_users_today)} />
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
                label="Avg response / execution"
                value={`${formatMs(data.average_response_time)} / ${formatMs(data.average_execution_time)}`}
              />
            </div>
          </div>
        </div>
      ) : null}
    </AdminQueryState>
  );
}
