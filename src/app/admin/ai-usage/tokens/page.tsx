'use client';

import { useQuery } from '@tanstack/react-query';
import { StatCard } from '@/components/admin/StatCard';
import { AdminQueryState } from '@/components/admin/AdminQueryState';
import { adminApi } from '@/services/api/admin';
import { formatCost, formatInt, topItemLabel, topItemValue } from '@/utils/adminFormat';
import type { TopListItem } from '@/types/admin';

function TopTable({
  title,
  items,
  valueLabel = 'Tokens',
}: {
  title: string;
  items?: TopListItem[];
  valueLabel?: string;
}) {
  const rows = items ?? [];
  return (
    <div className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
      <h3 className="mb-3 text-sm font-semibold text-foreground">{title}</h3>
      {rows.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted">No data</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-border text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-2 py-2 font-semibold">#</th>
                <th className="px-2 py-2 font-semibold">Name</th>
                <th className="px-2 py-2 font-semibold">{valueLabel}</th>
                <th className="px-2 py-2 font-semibold">Requests</th>
                <th className="px-2 py-2 font-semibold">Cost</th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 10).map((item, index) => (
                <tr key={`${topItemLabel(item)}-${index}`} className="border-b border-border/60">
                  <td className="px-2 py-2 text-muted">{index + 1}</td>
                  <td className="px-2 py-2 text-foreground">{topItemLabel(item)}</td>
                  <td className="px-2 py-2 text-secondary-text">{formatInt(topItemValue(item))}</td>
                  <td className="px-2 py-2 text-secondary-text">{formatInt(item.requests)}</td>
                  <td className="px-2 py-2 text-secondary-text">
                    {formatCost(
                      typeof item.estimated_cost === 'number'
                        ? item.estimated_cost
                        : typeof item.cost === 'number'
                          ? item.cost
                          : null,
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function AiUsageTokensPage() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin', 'analytics', 'tokens'],
    queryFn: adminApi.getTokenAnalytics,
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
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <StatCard label="Prompt tokens" value={formatInt(data.total_prompt_tokens)} />
            <StatCard label="Completion tokens" value={formatInt(data.total_completion_tokens)} />
            <StatCard label="Total tokens" value={formatInt(data.total_tokens)} />
            <StatCard label="Daily tokens" value={formatInt(data.daily_tokens)} />
            <StatCard label="Weekly tokens" value={formatInt(data.weekly_tokens)} />
            <StatCard label="Monthly tokens" value={formatInt(data.monthly_tokens)} />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <TopTable title="Top users" items={data.top_users} />
            <TopTable title="Top features" items={data.top_features} />
            <TopTable title="Top models" items={data.top_models} />
            <TopTable title="Top providers" items={data.top_providers} />
          </div>
        </div>
      ) : null}
    </AdminQueryState>
  );
}
