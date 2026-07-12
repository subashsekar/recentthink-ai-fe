'use client';

import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { Alert } from '@/components/ui/Alert';
import { adminApi } from '@/services/api/admin';
import { getAxiosErrorMessage } from '@/utils/courseError';
import { cn } from '@/utils/cn';

function statusVariant(status: string): 'success' | 'warning' | 'error' | 'default' {
  const s = status.toLowerCase();
  if (s === 'healthy' || s === 'up' || s === 'ok') return 'success';
  if (s === 'warning' || s === 'degraded') return 'warning';
  if (s === 'down' || s === 'error' || s === 'unhealthy') return 'error';
  return 'default';
}

export default function AdminSystemHealthPage() {
  const { data, isLoading, isError, error, refetch, dataUpdatedAt } = useQuery({
    queryKey: ['admin', 'system-health'],
    queryFn: adminApi.getSystemHealth,
    refetchInterval: 30_000,
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Ops</p>
        <h1 className="mt-1 font-heading text-2xl font-semibold text-foreground sm:text-3xl">
          System health
        </h1>
        <p className="mt-1 text-sm text-muted">
          Gateway and service status
          {dataUpdatedAt ? ` · Updated ${new Date(dataUpdatedAt).toLocaleTimeString()}` : ''}
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : isError ? (
        <Alert variant="error">
          <span className="flex flex-wrap items-center gap-2">
            {getAxiosErrorMessage(error, 'Failed to load system health')}
            <button type="button" className="underline" onClick={() => refetch()}>
              Retry
            </button>
          </span>
        </Alert>
      ) : data ? (
        <>
          <div className="rounded-2xl border border-border bg-surface p-5">
            <p className="text-sm text-muted">Overall</p>
            <div className="mt-2 flex items-center gap-3">
              <span
                className={cn(
                  'h-3 w-3 rounded-full',
                  statusVariant(String(data.overall)) === 'success' && 'bg-success',
                  statusVariant(String(data.overall)) === 'warning' && 'bg-warning',
                  statusVariant(String(data.overall)) === 'error' && 'bg-error',
                  statusVariant(String(data.overall)) === 'default' && 'bg-muted',
                )}
              />
              <Badge variant={statusVariant(String(data.overall))}>{String(data.overall)}</Badge>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {(data.services ?? []).map((service) => (
              <div key={service.name} className="rounded-2xl border border-border bg-surface p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium capitalize text-foreground">{service.name}</p>
                    <p className="mt-1 text-xs text-muted">
                      {service.response_time_ms != null ? `${service.response_time_ms} ms` : '—'}
                    </p>
                  </div>
                  <Badge variant={statusVariant(String(service.status))}>
                    {String(service.status)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
