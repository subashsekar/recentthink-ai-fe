'use client';

import { useQuery } from '@tanstack/react-query';
import { StatCard } from '@/components/admin/StatCard';
import { Spinner } from '@/components/ui/Spinner';
import { Alert } from '@/components/ui/Alert';
import { adminApi } from '@/services/api/admin';
import { getAxiosErrorMessage } from '@/utils/courseError';

export default function AdminDashboardPage() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: adminApi.getDashboard,
  });

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Overview</p>
        <h1 className="mt-1 font-heading text-2xl font-semibold text-foreground sm:text-3xl">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted">Platform metrics and user cohorts</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : isError ? (
        <Alert variant="error">
          <span className="flex flex-wrap items-center gap-2">
            {getAxiosErrorMessage(error, 'Failed to load dashboard')}
            <button
              type="button"
              className="underline underline-offset-2"
              onClick={() => refetch()}
            >
              Retry
            </button>
          </span>
        </Alert>
      ) : data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <StatCard label="Total users" value={data.total_users} />
            <StatCard label="Active users" value={data.active_users} />
            <StatCard label="New today" value={data.new_users_today} />
            <StatCard label="Verified" value={data.verified_users} />
            <StatCard label="Blocked" value={data.blocked_users} />
          </div>

          <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.12em] text-muted">
              By status
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard label="Students" value={data.students} />
              <StatCard label="Professionals" value={data.professionals} />
              <StatCard label="Job seekers" value={data.job_seekers} />
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
