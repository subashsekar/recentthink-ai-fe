'use client';

import { useQuery } from '@tanstack/react-query';
import { AdminQueryState } from '@/components/admin/AdminQueryState';
import { SimpleSeriesChart } from '@/components/admin/SimpleSeriesChart';
import { adminApi } from '@/services/api/admin';
import { formatCost, formatInt } from '@/utils/adminFormat';

export default function AiUsageChartsPage() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin', 'analytics', 'charts'],
    queryFn: adminApi.getAnalyticsCharts,
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
        <div className="grid gap-4 lg:grid-cols-2">
          <SimpleSeriesChart
            title="Daily token usage"
            data={data.daily_token_usage}
            variant="line"
            valueFormatter={formatInt}
          />
          <SimpleSeriesChart
            title="Weekly token usage"
            data={data.weekly_token_usage}
            valueFormatter={formatInt}
          />
          <SimpleSeriesChart
            title="Monthly token usage"
            data={data.monthly_token_usage}
            valueFormatter={formatInt}
          />
          <SimpleSeriesChart
            title="Requests per day"
            data={data.requests_per_day}
            variant="line"
            valueFormatter={formatInt}
          />
          <SimpleSeriesChart
            title="Top features"
            data={data.top_features}
            valueFormatter={formatInt}
          />
          <SimpleSeriesChart title="Top models" data={data.top_models} valueFormatter={formatInt} />
          <SimpleSeriesChart
            title="Top providers"
            data={data.top_providers}
            valueFormatter={formatInt}
          />
          <SimpleSeriesChart title="Top users" data={data.top_users} valueFormatter={formatInt} />
          <SimpleSeriesChart
            title="Cost per day"
            data={data.cost_per_day}
            variant="line"
            valueFormatter={(v) => formatCost(v)}
          />
          <SimpleSeriesChart
            title="Tokens per feature"
            data={data.tokens_per_feature}
            valueFormatter={formatInt}
          />
        </div>
      ) : null}
    </AdminQueryState>
  );
}
