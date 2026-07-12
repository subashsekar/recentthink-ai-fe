'use client';

import { useQuery } from '@tanstack/react-query';
import { StatCard } from '@/components/admin/StatCard';
import { Spinner } from '@/components/ui/Spinner';
import { Alert } from '@/components/ui/Alert';
import { adminApi } from '@/services/api/admin';
import { getAxiosErrorMessage } from '@/utils/courseError';

function formatNumber(value: unknown) {
  if (typeof value === 'number') return value.toLocaleString();
  if (value == null) return '—';
  return String(value);
}

export default function AdminUsagePage() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin', 'usage'],
    queryFn: adminApi.getUsage,
  });

  const topFeatures = data?.top_features ?? [];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Insights</p>
        <h1 className="mt-1 font-heading text-2xl font-semibold text-foreground sm:text-3xl">
          Usage
        </h1>
        <p className="mt-1 text-sm text-muted">Requests, tokens, features, and estimated cost</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : isError ? (
        <Alert variant="error">
          <span className="flex flex-wrap items-center gap-2">
            {getAxiosErrorMessage(error, 'Failed to load usage')}
            <button type="button" className="underline" onClick={() => refetch()}>
              Retry
            </button>
          </span>
        </Alert>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Requests" value={formatNumber(data?.requests)} />
            <StatCard label="Tokens" value={formatNumber(data?.tokens)} />
            <StatCard label="Estimated cost" value={formatNumber(data?.estimated_cost)} />
            <StatCard
              label="Provider / Model"
              value={[data?.provider, data?.model].filter(Boolean).join(' / ') || '—'}
            />
          </div>

          <div className="rounded-2xl border border-border bg-surface p-5">
            <h2 className="mb-3 text-sm font-semibold text-foreground">Top features</h2>
            {topFeatures.length === 0 ? (
              <p className="text-sm text-muted">No feature usage data</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-border text-xs uppercase tracking-wide text-muted">
                    <tr>
                      <th className="px-3 py-2 font-semibold">Feature</th>
                      <th className="px-3 py-2 font-semibold">Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topFeatures.map((item) => (
                      <tr key={item.name} className="border-b border-border/60 last:border-0">
                        <td className="px-3 py-2 text-foreground">{item.name}</td>
                        <td className="px-3 py-2 text-secondary-text">
                          {item.count.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
