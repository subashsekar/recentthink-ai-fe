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

export default function AdminAnalyticsPage() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin', 'analytics'],
    queryFn: adminApi.getAnalytics,
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Insights</p>
        <h1 className="mt-1 font-heading text-2xl font-semibold text-foreground sm:text-3xl">
          Analytics
        </h1>
        <p className="mt-1 text-sm text-muted">AI sessions, conversations, and averages</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : isError ? (
        <Alert variant="error">
          <span className="flex flex-wrap items-center gap-2">
            {getAxiosErrorMessage(error, 'Failed to load analytics')}
            <button type="button" className="underline" onClick={() => refetch()}>
              Retry
            </button>
          </span>
        </Alert>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard label="AI sessions" value={formatNumber(data?.ai_sessions)} />
          <StatCard label="Conversations" value={formatNumber(data?.conversations)} />
          <StatCard label="Avg latency (ms)" value={formatNumber(data?.avg_latency_ms)} />
          <StatCard label="Avg tokens" value={formatNumber(data?.avg_tokens)} />
          <StatCard label="Avg cost" value={formatNumber(data?.avg_cost)} />
        </div>
      )}
    </div>
  );
}
