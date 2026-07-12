'use client';

import { useQuery } from '@tanstack/react-query';
import { Spinner } from '@/components/ui/Spinner';
import { Alert } from '@/components/ui/Alert';
import { adminApi } from '@/services/api/admin';
import { getAxiosErrorMessage } from '@/utils/courseError';

export default function AdminModelsPage() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin', 'models'],
    queryFn: adminApi.getModels,
  });

  const providers = data?.provider_usage ?? [];
  const models = data?.model_usage ?? [];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Insights</p>
        <h1 className="mt-1 font-heading text-2xl font-semibold text-foreground sm:text-3xl">
          Models
        </h1>
        <p className="mt-1 text-sm text-muted">Provider and model usage</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : isError ? (
        <Alert variant="error">
          <span className="flex flex-wrap items-center gap-2">
            {getAxiosErrorMessage(error, 'Failed to load models')}
            <button type="button" className="underline" onClick={() => refetch()}>
              Retry
            </button>
          </span>
        </Alert>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-surface p-5">
            <h2 className="mb-3 text-sm font-semibold text-foreground">Provider usage</h2>
            {providers.length === 0 ? (
              <p className="text-sm text-muted">No provider data</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-border text-xs uppercase tracking-wide text-muted">
                    <tr>
                      <th className="px-3 py-2 font-semibold">Provider</th>
                      <th className="px-3 py-2 font-semibold">Count</th>
                      <th className="px-3 py-2 font-semibold">Tokens</th>
                      <th className="px-3 py-2 font-semibold">Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {providers.map((row) => (
                      <tr key={row.provider} className="border-b border-border/60 last:border-0">
                        <td className="px-3 py-2 text-foreground">{row.provider}</td>
                        <td className="px-3 py-2 text-secondary-text">{row.count}</td>
                        <td className="px-3 py-2 text-secondary-text">{row.tokens ?? '—'}</td>
                        <td className="px-3 py-2 text-secondary-text">{row.cost ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-surface p-5">
            <h2 className="mb-3 text-sm font-semibold text-foreground">Model usage</h2>
            {models.length === 0 ? (
              <p className="text-sm text-muted">No model data</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-border text-xs uppercase tracking-wide text-muted">
                    <tr>
                      <th className="px-3 py-2 font-semibold">Model</th>
                      <th className="px-3 py-2 font-semibold">Provider</th>
                      <th className="px-3 py-2 font-semibold">Count</th>
                      <th className="px-3 py-2 font-semibold">Tokens</th>
                      <th className="px-3 py-2 font-semibold">Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {models.map((row) => (
                      <tr
                        key={`${row.provider ?? ''}-${row.model}`}
                        className="border-b border-border/60 last:border-0"
                      >
                        <td className="px-3 py-2 text-foreground">{row.model}</td>
                        <td className="px-3 py-2 text-secondary-text">{row.provider ?? '—'}</td>
                        <td className="px-3 py-2 text-secondary-text">{row.count}</td>
                        <td className="px-3 py-2 text-secondary-text">{row.tokens ?? '—'}</td>
                        <td className="px-3 py-2 text-secondary-text">{row.cost ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
