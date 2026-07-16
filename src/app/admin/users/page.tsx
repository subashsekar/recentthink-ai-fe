'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  ConfirmReasonModal,
  type ConfirmReasonAction,
} from '@/components/admin/ConfirmReasonModal';
import { UserStatusBadges } from '@/components/admin/UserStatusBadges';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Alert } from '@/components/ui/Alert';
import { adminApi } from '@/services/api/admin';
import { ROUTES } from '@/constants';
import { config } from '@/config';
import type { AdminUser } from '@/types/admin';
import { getAxiosErrorMessage } from '@/utils/courseError';
import { formatCost, formatDateTime, formatInt, formatNullable } from '@/utils/adminFormat';

function fullName(user: AdminUser) {
  return `${user.first_name} ${user.last_name}`.trim() || user.email;
}

function formatDate(value?: string | null) {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleDateString();
  } catch {
    return value;
  }
}

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const pageSize = config.pagination.defaultPageSize;

  const [actionUser, setActionUser] = useState<AdminUser | null>(null);
  const [action, setAction] = useState<ConfirmReasonAction | null>(null);

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['admin', 'users', { page, page_size: pageSize }],
    queryFn: () =>
      adminApi.getUsers({
        page,
        page_size: pageSize,
        sort: 'created_at',
        order: 'desc',
      }),
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    void queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
  };

  const mutation = useMutation({
    mutationFn: async ({
      action: act,
      userId,
      reason,
    }: {
      action: ConfirmReasonAction;
      userId: string;
      reason?: string;
    }) => {
      const body = reason ? { reason } : undefined;
      switch (act) {
        case 'block':
          return adminApi.blockUser(userId, body);
        case 'unblock':
          return adminApi.unblockUser(userId, body);
        case 'activate':
          return adminApi.activateUser(userId, body);
        case 'deactivate':
          return adminApi.deactivateUser(userId, body);
        case 'delete':
          return adminApi.deleteUser(userId, reason);
      }
    },
    onSuccess: (_, vars) => {
      toast.success(`User ${vars.action} successful`);
      setAction(null);
      setActionUser(null);
      invalidate();
    },
    onError: (err) => {
      toast.error(getAxiosErrorMessage(err, 'Action failed'));
    },
  });

  const openAction = (user: AdminUser, next: ConfirmReasonAction) => {
    setActionUser(user);
    setAction(next);
  };

  const totalPages = data?.total_pages ?? Math.max(1, Math.ceil((data?.total ?? 0) / pageSize));

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Management</p>
        <h1 className="mt-1 font-heading text-2xl font-semibold text-foreground sm:text-3xl">
          Users
        </h1>
        <p className="mt-1 text-sm text-muted">
          All accounts. Blocked and Disabled are separate states.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : isError ? (
        <Alert variant="error">
          <span className="flex flex-wrap items-center gap-2">
            {getAxiosErrorMessage(error, 'Failed to load users')}
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
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">Role</th>
                  <th className="px-4 py-3 font-semibold">Verified</th>
                  <th className="px-4 py-3 font-semibold">Active</th>
                  <th className="px-4 py-3 font-semibold">Blocked</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Requests</th>
                  <th className="px-4 py-3 font-semibold">Tokens</th>
                  <th className="px-4 py-3 font-semibold">Cost</th>
                  <th className="px-4 py-3 font-semibold">Last AI</th>
                  <th className="px-4 py-3 font-semibold">Top feature</th>
                  <th className="px-4 py-3 font-semibold">Top model</th>
                  <th className="px-4 py-3 font-semibold">Plan</th>
                  <th className="px-4 py-3 font-semibold">Created</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(data?.items ?? []).length === 0 ? (
                  <tr>
                    <td colSpan={16} className="px-4 py-10 text-center text-muted">
                      No users found
                    </td>
                  </tr>
                ) : (
                  (data?.items ?? []).map((user) => (
                    <tr key={user.id} className="border-b border-border/70 last:border-0">
                      <td className="px-4 py-3">
                        <Link
                          href={ROUTES.ADMIN_USER_DETAIL(user.id)}
                          className="font-medium text-foreground hover:text-primary"
                        >
                          {fullName(user)}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-secondary-text">{user.email}</td>
                      <td className="px-4 py-3 text-secondary-text">{user.role}</td>
                      <td className="px-4 py-3 text-secondary-text">
                        {user.is_verified ? 'Yes' : 'No'}
                      </td>
                      <td className="px-4 py-3 text-secondary-text">
                        {user.is_active ? 'Yes' : 'Disabled'}
                      </td>
                      <td className="px-4 py-3 text-secondary-text">
                        {user.is_blocked ? 'Yes' : 'No'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <UserStatusBadges user={user} />
                          {user.current_status ? (
                            <p className="text-xs text-muted">{user.current_status}</p>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-secondary-text">
                        {formatInt(user.total_requests)}
                      </td>
                      <td className="px-4 py-3 text-secondary-text">
                        <div className="space-y-0.5">
                          <p>{formatInt(user.total_tokens)}</p>
                          <p className="text-xs text-muted">
                            P {formatInt(user.prompt_tokens)} / C{' '}
                            {formatInt(user.completion_tokens)}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-secondary-text">
                        {formatCost(user.estimated_cost)}
                      </td>
                      <td className="px-4 py-3 text-secondary-text">
                        {formatDateTime(user.last_ai_activity)}
                      </td>
                      <td className="px-4 py-3 text-secondary-text">
                        {formatNullable(user.most_used_feature)}
                      </td>
                      <td className="px-4 py-3 text-secondary-text">
                        {formatNullable(user.most_used_model)}
                      </td>
                      <td className="px-4 py-3 text-secondary-text">
                        {formatNullable(user.current_plan)}
                      </td>
                      <td className="px-4 py-3 text-secondary-text">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          <Link href={ROUTES.ADMIN_AI_USAGE_USER(user.id)}>
                            <Button type="button" size="sm" variant="ghost" className="rounded-lg">
                              AI usage
                            </Button>
                          </Link>
                          {user.is_blocked ? (
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              className="rounded-lg"
                              onClick={() => openAction(user, 'unblock')}
                            >
                              Unblock
                            </Button>
                          ) : (
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              className="rounded-lg"
                              onClick={() => openAction(user, 'block')}
                            >
                              Block
                            </Button>
                          )}
                          {user.is_active ? (
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              className="rounded-lg"
                              onClick={() => openAction(user, 'deactivate')}
                            >
                              Deactivate
                            </Button>
                          ) : (
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              className="rounded-lg"
                              onClick={() => openAction(user, 'activate')}
                            >
                              Activate
                            </Button>
                          )}
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className="rounded-lg text-error"
                            onClick={() => openAction(user, 'delete')}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3">
            <p className="text-xs text-muted">
              {data?.total ?? 0} total
              {isFetching ? ' · Updating…' : ''}
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

      <ConfirmReasonModal
        open={Boolean(action && actionUser)}
        action={action}
        userLabel={actionUser ? fullName(actionUser) : undefined}
        isLoading={mutation.isPending}
        onClose={() => {
          setAction(null);
          setActionUser(null);
        }}
        onConfirm={(reason) => {
          if (!action || !actionUser) return;
          mutation.mutate({ action, userId: actionUser.id, reason });
        }}
      />
    </div>
  );
}
