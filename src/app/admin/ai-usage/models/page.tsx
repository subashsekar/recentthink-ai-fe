'use client';

import { useQuery } from '@tanstack/react-query';
import { AdminQueryState } from '@/components/admin/AdminQueryState';
import { adminApi } from '@/services/api/admin';
import { formatCost, formatInt, formatMs, formatRate } from '@/utils/adminFormat';

export default function AiUsageModelsPage() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin', 'analytics', 'models'],
    queryFn: adminApi.getModelAnalytics,
  });

  const items = data?.items ?? [];

  return (
    <AdminQueryState
      isLoading={isLoading}
      isError={isError}
      error={error}
      onRetry={() => refetch()}
      isEmpty={items.length === 0}
      emptyMessage="No model analytics"
    >
      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-border bg-secondary-bg/60 text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Model Name</th>
                <th className="px-4 py-3 font-semibold">Provider</th>
                <th className="px-4 py-3 font-semibold">Requests</th>
                <th className="px-4 py-3 font-semibold">Prompt Tokens</th>
                <th className="px-4 py-3 font-semibold">Completion Tokens</th>
                <th className="px-4 py-3 font-semibold">Total Tokens</th>
                <th className="px-4 py-3 font-semibold">Estimated Cost</th>
                <th className="px-4 py-3 font-semibold">Average Latency</th>
                <th className="px-4 py-3 font-semibold">Success Rate</th>
                <th className="px-4 py-3 font-semibold">Failure Rate</th>
              </tr>
            </thead>
            <tbody>
              {items.map((row) => (
                <tr
                  key={`${row.provider ?? ''}-${row.model}`}
                  className="border-b border-border/70 last:border-0"
                >
                  <td className="px-4 py-3 font-medium text-foreground">{row.model}</td>
                  <td className="px-4 py-3 text-secondary-text">{row.provider || '—'}</td>
                  <td className="px-4 py-3 text-secondary-text">{formatInt(row.requests)}</td>
                  <td className="px-4 py-3 text-secondary-text">{formatInt(row.prompt_tokens)}</td>
                  <td className="px-4 py-3 text-secondary-text">
                    {formatInt(row.completion_tokens)}
                  </td>
                  <td className="px-4 py-3 text-secondary-text">{formatInt(row.total_tokens)}</td>
                  <td className="px-4 py-3 text-secondary-text">
                    {formatCost(row.estimated_cost)}
                  </td>
                  <td className="px-4 py-3 text-secondary-text">
                    {formatMs(row.average_latency_ms)}
                  </td>
                  <td className="px-4 py-3 text-secondary-text">{formatRate(row.success_rate)}</td>
                  <td className="px-4 py-3 text-secondary-text">{formatRate(row.failure_rate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminQueryState>
  );
}
