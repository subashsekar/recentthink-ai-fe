'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { AdminQueryState } from '@/components/admin/AdminQueryState';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { adminApi } from '@/services/api/admin';
import { ROUTES } from '@/constants';
import { config } from '@/config';
import { formatCost, formatDateTime, formatInt, formatNullable } from '@/utils/adminFormat';
import toast from 'react-hot-toast';
import { getAxiosErrorMessage } from '@/utils/courseError';

const SORT_OPTIONS = [
  { value: 'total_tokens', label: 'Total tokens' },
  { value: 'total_requests', label: 'Total requests' },
  { value: 'estimated_cost', label: 'Estimated cost' },
  { value: 'last_active', label: 'Last active' },
  { value: 'prompt_tokens', label: 'Prompt tokens' },
  { value: 'completion_tokens', label: 'Completion tokens' },
] as const;

export default function AiUsageUsersPage() {
  const [page, setPage] = useState(1);
  const [searchDraft, setSearchDraft] = useState('');
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [currentStatus, setCurrentStatus] = useState('');
  const [sort, setSort] = useState('total_tokens');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const pageSize = config.pagination.defaultPageSize;

  const params = useMemo(
    () => ({
      page,
      page_size: pageSize,
      sort,
      order,
      search: search || undefined,
      role: role || undefined,
      current_status: currentStatus || undefined,
    }),
    [page, pageSize, sort, order, search, role, currentStatus],
  );

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['admin', 'analytics', 'users', params],
    queryFn: () => adminApi.getAnalyticsUsers(params),
  });

  const items = data?.items ?? [];
  const totalPages = data?.total_pages ?? Math.max(1, Math.ceil((data?.total ?? 0) / pageSize));

  const exportUser = async () => {
    try {
      await adminApi.exportAnalyticsReport('user_usage', 'csv');
      toast.success('Export started');
    } catch (err) {
      toast.error(getAxiosErrorMessage(err, 'Export failed'));
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 rounded-2xl border border-border bg-surface p-4 sm:grid-cols-2 lg:grid-cols-5">
        <Input
          id="analytics_user_search"
          label="Search"
          placeholder="Name or email"
          value={searchDraft}
          onChange={(e) => setSearchDraft(e.target.value)}
        />
        <label className="block space-y-1.5 text-sm">
          <span className="font-medium text-foreground">Role</span>
          <select
            className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm"
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Any</option>
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
            <option value="SUPER_ADMIN">SUPER_ADMIN</option>
          </select>
        </label>
        <Input
          id="analytics_user_status"
          label="Current status"
          value={currentStatus}
          onChange={(e) => {
            setCurrentStatus(e.target.value);
            setPage(1);
          }}
        />
        <label className="block space-y-1.5 text-sm">
          <span className="font-medium text-foreground">Sort</span>
          <select
            className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block space-y-1.5 text-sm">
          <span className="font-medium text-foreground">Order</span>
          <select
            className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm"
            value={order}
            onChange={(e) => setOrder(e.target.value as 'asc' | 'desc')}
          >
            <option value="desc">Desc</option>
            <option value="asc">Asc</option>
          </select>
        </label>
        <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-5">
          <Button
            type="button"
            className="rounded-xl"
            onClick={() => {
              setSearch(searchDraft.trim());
              setPage(1);
            }}
          >
            Apply
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="rounded-xl"
            onClick={() => {
              setSearchDraft('');
              setSearch('');
              setRole('');
              setCurrentStatus('');
              setSort('total_tokens');
              setOrder('desc');
              setPage(1);
            }}
          >
            Reset
          </Button>
        </div>
      </div>

      <AdminQueryState
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={() => refetch()}
        isEmpty={items.length === 0}
        emptyMessage="No user usage rows"
      >
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-border bg-secondary-bg/60 text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-3 py-3 font-semibold">User</th>
                  <th className="px-3 py-3 font-semibold">Email</th>
                  <th className="px-3 py-3 font-semibold">Role</th>
                  <th className="px-3 py-3 font-semibold">Status</th>
                  <th className="px-3 py-3 font-semibold">Requests</th>
                  <th className="px-3 py-3 font-semibold">Prompt</th>
                  <th className="px-3 py-3 font-semibold">Completion</th>
                  <th className="px-3 py-3 font-semibold">Total tokens</th>
                  <th className="px-3 py-3 font-semibold">Cost</th>
                  <th className="px-3 py-3 font-semibold">Avg tokens</th>
                  <th className="px-3 py-3 font-semibold">Last active</th>
                  <th className="px-3 py-3 font-semibold">Plan</th>
                  <th className="px-3 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((row) => (
                  <tr key={row.user_id} className="border-b border-border/70 last:border-0">
                    <td className="px-3 py-3">
                      <Link
                        href={ROUTES.ADMIN_AI_USAGE_USER(row.user_id)}
                        className="font-medium text-foreground hover:text-primary"
                      >
                        {row.user_name || row.user_id}
                      </Link>
                    </td>
                    <td className="px-3 py-3 text-secondary-text">{formatNullable(row.email)}</td>
                    <td className="px-3 py-3 text-secondary-text">{formatNullable(row.role)}</td>
                    <td className="px-3 py-3 text-secondary-text">
                      {formatNullable(row.current_status)}
                    </td>
                    <td className="px-3 py-3 text-secondary-text">
                      {formatInt(row.total_requests)}
                    </td>
                    <td className="px-3 py-3 text-secondary-text">
                      {formatInt(row.prompt_tokens)}
                    </td>
                    <td className="px-3 py-3 text-secondary-text">
                      {formatInt(row.completion_tokens)}
                    </td>
                    <td className="px-3 py-3 text-secondary-text">{formatInt(row.total_tokens)}</td>
                    <td className="px-3 py-3 text-secondary-text">
                      {formatCost(row.estimated_cost)}
                    </td>
                    <td className="px-3 py-3 text-secondary-text">
                      {formatInt(row.average_tokens_per_request)}
                    </td>
                    <td className="px-3 py-3 text-secondary-text">
                      {formatDateTime(row.last_active)}
                    </td>
                    <td className="px-3 py-3 text-secondary-text">
                      {formatNullable(row.current_plan)}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-1">
                        <Link href={ROUTES.ADMIN_AI_USAGE_USER(row.user_id)}>
                          <Button type="button" size="sm" variant="ghost" className="rounded-lg">
                            View Details
                          </Button>
                        </Link>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="rounded-lg"
                          onClick={() => exportUser()}
                        >
                          Export
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3">
            <p className="text-xs text-muted">
              {data?.total ?? 0} total{isFetching ? ' · Updating…' : ''}
            </p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="rounded-xl"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <span className="text-sm text-secondary-text">
                Page {page} / {totalPages}
              </span>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="rounded-xl"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </AdminQueryState>
    </div>
  );
}
