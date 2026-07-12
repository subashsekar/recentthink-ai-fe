'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { adminApi } from '@/services/api/admin';
import { getAxiosErrorMessage } from '@/utils/courseError';
import { config } from '@/config';

const ACTION_OPTIONS = [
  '',
  'USER_BLOCKED',
  'USER_UNBLOCKED',
  'USER_DELETED',
  'USER_ACTIVATED',
  'USER_DEACTIVATED',
  'ANNOUNCEMENT_SENT',
];

export default function AdminAuditLogsPage() {
  const [page, setPage] = useState(1);
  const [adminId, setAdminId] = useState('');
  const [targetUserId, setTargetUserId] = useState('');
  const [action, setAction] = useState('');
  const [applied, setApplied] = useState({
    admin_id: '',
    target_user_id: '',
    action: '',
  });

  const pageSize = config.pagination.defaultPageSize;

  const params = useMemo(
    () => ({
      page,
      page_size: pageSize,
      admin_id: applied.admin_id || undefined,
      target_user_id: applied.target_user_id || undefined,
      action: applied.action || undefined,
    }),
    [page, pageSize, applied],
  );

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['admin', 'audit-logs', params],
    queryFn: () => adminApi.getAuditLogs(params),
  });

  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / pageSize));

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Security</p>
        <h1 className="mt-1 font-heading text-2xl font-semibold text-foreground sm:text-3xl">
          Audit logs
        </h1>
        <p className="mt-1 text-sm text-muted">Read-only history of admin actions</p>
      </div>

      <div className="grid gap-3 rounded-2xl border border-border bg-surface p-4 sm:grid-cols-2 lg:grid-cols-4 sm:p-5">
        <Input
          id="audit_admin_id"
          label="Admin ID"
          value={adminId}
          onChange={(e) => setAdminId(e.target.value)}
        />
        <Input
          id="audit_target_user_id"
          label="Target user ID"
          value={targetUserId}
          onChange={(e) => setTargetUserId(e.target.value)}
        />
        <label className="block space-y-1.5 text-sm">
          <span className="font-medium text-foreground">Action</span>
          <select
            className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm text-foreground"
            value={action}
            onChange={(e) => setAction(e.target.value)}
          >
            {ACTION_OPTIONS.map((opt) => (
              <option key={opt || 'any'} value={opt}>
                {opt || 'Any'}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-end gap-2">
          <Button
            type="button"
            className="rounded-xl"
            onClick={() => {
              setApplied({
                admin_id: adminId.trim(),
                target_user_id: targetUserId.trim(),
                action,
              });
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
              setAdminId('');
              setTargetUserId('');
              setAction('');
              setApplied({ admin_id: '', target_user_id: '', action: '' });
              setPage(1);
            }}
          >
            Reset
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : isError ? (
        <Alert variant="error">
          <span className="flex flex-wrap items-center gap-2">
            {getAxiosErrorMessage(error, 'Failed to load audit logs')}
            <button type="button" className="underline" onClick={() => refetch()}>
              Retry
            </button>
          </span>
        </Alert>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-border bg-secondary-bg/60 text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold">Action</th>
                  <th className="px-4 py-3 font-semibold">Admin</th>
                  <th className="px-4 py-3 font-semibold">Target</th>
                  <th className="px-4 py-3 font-semibold">Reason</th>
                  <th className="px-4 py-3 font-semibold">When</th>
                </tr>
              </thead>
              <tbody>
                {(data?.items ?? []).length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-muted">
                      No audit events
                    </td>
                  </tr>
                ) : (
                  (data?.items ?? []).map((item) => (
                    <tr key={item.id} className="border-b border-border/70 last:border-0">
                      <td className="px-4 py-3">
                        <Badge variant="info">{item.action}</Badge>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-secondary-text">
                        {item.admin_id || '—'}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-secondary-text">
                        {item.target_user_id || '—'}
                      </td>
                      <td className="px-4 py-3 text-secondary-text">{item.reason || '—'}</td>
                      <td className="px-4 py-3 text-secondary-text">
                        {item.created_at ? new Date(item.created_at).toLocaleString() : '—'}
                      </td>
                    </tr>
                  ))
                )}
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
      )}
    </div>
  );
}
