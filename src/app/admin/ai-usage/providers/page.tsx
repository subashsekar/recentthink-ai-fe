'use client';

import { useQuery } from '@tanstack/react-query';
import { AdminQueryState } from '@/components/admin/AdminQueryState';
import { adminApi } from '@/services/api/admin';
import { formatCost, formatInt } from '@/utils/adminFormat';

const KNOWN_PROVIDERS = ['OpenRouter', 'Gemini', 'Groq', 'OpenAI', 'Anthropic'];

export default function AiUsageProvidersPage() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin', 'analytics', 'providers'],
    queryFn: adminApi.getProviderAnalytics,
  });

  const items = data?.items ?? [];

  return (
    <AdminQueryState
      isLoading={isLoading}
      isError={isError}
      error={error}
      onRetry={() => refetch()}
      isEmpty={items.length === 0}
      emptyMessage="No provider analytics"
    >
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((row) => (
            <div key={row.provider} className="rounded-2xl border border-border bg-surface p-5">
              <h3 className="font-heading text-lg font-semibold text-foreground">{row.provider}</h3>
              <dl className="mt-4 grid grid-cols-3 gap-3 text-sm">
                <div>
                  <dt className="text-muted">Requests</dt>
                  <dd className="mt-1 font-medium">{formatInt(row.requests)}</dd>
                </div>
                <div>
                  <dt className="text-muted">Tokens</dt>
                  <dd className="mt-1 font-medium">{formatInt(row.tokens)}</dd>
                </div>
                <div>
                  <dt className="text-muted">Cost</dt>
                  <dd className="mt-1 font-medium">{formatCost(row.cost)}</dd>
                </div>
              </dl>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted">
          Common providers when present: {KNOWN_PROVIDERS.join(' / ')}
        </p>
      </div>
    </AdminQueryState>
  );
}
