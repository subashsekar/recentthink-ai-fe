'use client';

import { useQuery } from '@tanstack/react-query';
import { AdminQueryState } from '@/components/admin/AdminQueryState';
import { StatCard } from '@/components/admin/StatCard';
import { SimpleSeriesChart } from '@/components/admin/SimpleSeriesChart';
import { adminApi } from '@/services/api/admin';
import { formatCost, formatInt, topItemLabel, topItemValue } from '@/utils/adminFormat';
import type { ChartSeriesItem, TopListItem } from '@/types/admin';

function toSeries(items?: ChartSeriesItem[] | TopListItem[] | null): ChartSeriesItem[] {
  if (!items) return [];
  return items.map((item) => {
    if ('label' in item && typeof item.label === 'string' && 'value' in item) {
      return { label: item.label, value: Number(item.value) || 0 };
    }
    return {
      label: topItemLabel(item as TopListItem),
      value: topItemValue(item as TopListItem),
    };
  });
}

export default function AiUsageCostsPage() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin', 'analytics', 'costs'],
    queryFn: adminApi.getCostAnalytics,
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
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <StatCard label="Total cost" value={formatCost(data.total_cost)} />
            <StatCard label="Average cost" value={formatCost(data.average_cost)} />
            <StatCard label="Daily cost" value={formatCost(data.daily_cost)} />
            <StatCard label="Weekly cost" value={formatCost(data.weekly_cost)} />
            <StatCard label="Monthly cost" value={formatCost(data.monthly_cost)} />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <SimpleSeriesChart
              title="Cost by feature"
              data={toSeries(data.cost_by_feature)}
              valueFormatter={(v) => formatCost(v)}
            />
            <SimpleSeriesChart
              title="Cost by model"
              data={toSeries(data.cost_by_model)}
              valueFormatter={(v) => formatCost(v)}
            />
            <SimpleSeriesChart
              title="Cost by provider"
              data={toSeries(data.cost_by_provider)}
              valueFormatter={(v) => formatCost(v)}
            />
            <SimpleSeriesChart
              title="Cost per day"
              data={data.cost_per_day}
              variant="line"
              valueFormatter={(v) => formatCost(v)}
            />
          </div>

          <p className="text-xs text-muted">
            Chart values use {formatInt(toSeries(data.cost_by_feature).length)} feature rows when
            available.
          </p>
        </div>
      ) : null}
    </AdminQueryState>
  );
}
