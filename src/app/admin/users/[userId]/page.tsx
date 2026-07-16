'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
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
import { getAxiosErrorMessage } from '@/utils/courseError';
import { cn } from '@/utils/cn';

type TabId = 'profile' | 'statistics' | 'ai_history' | 'usage' | 'usage_analytics' | 'actions';

const TABS: Array<{ id: TabId; label: string }> = [
  { id: 'profile', label: 'Profile' },
  { id: 'statistics', label: 'Statistics' },
  { id: 'ai_history', label: 'AI History' },
  { id: 'usage', label: 'Usage' },
  { id: 'usage_analytics', label: 'Usage Analytics' },
  { id: 'actions', label: 'Actions' },
];

function JsonBlock({ value }: { value: unknown }) {
  if (value == null) {
    return <p className="text-sm text-muted">No data</p>;
  }
  return (
    <pre className="overflow-x-auto rounded-xl border border-border bg-secondary-bg/50 p-4 text-xs text-secondary-text">
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}

export default function AdminUserDetailPage() {
  const params = useParams();
  const userId = String(params.userId ?? '');
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<TabId>('profile');
  const [action, setAction] = useState<ConfirmReasonAction | null>(null);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin', 'user', userId],
    queryFn: () => adminApi.getUser(userId),
    enabled: Boolean(userId),
  });

  const user = data?.user;

  const mutation = useMutation({
    mutationFn: async ({
      action: act,
      reason,
    }: {
      action: ConfirmReasonAction;
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
      void queryClient.invalidateQueries({ queryKey: ['admin', 'user', userId] });
      void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
    onError: (err) => {
      toast.error(getAxiosErrorMessage(err, 'Action failed'));
    },
  });

  const title = useMemo(() => {
    if (!user) return 'User detail';
    return `${user.first_name} ${user.last_name}`.trim() || user.email;
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !user) {
    return (
      <Alert variant="error">
        <span className="flex flex-wrap items-center gap-2">
          {getAxiosErrorMessage(error, 'Failed to load user')}
          <button type="button" className="underline" onClick={() => refetch()}>
            Retry
          </button>
        </span>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href={ROUTES.ADMIN_USERS}
            className="text-sm text-muted transition hover:text-foreground"
          >
            ← Back to users
          </Link>
          <h1 className="mt-2 font-heading text-2xl font-semibold text-foreground sm:text-3xl">
            {title}
          </h1>
          <p className="mt-1 text-sm text-muted">{user.email}</p>
          <div className="mt-3">
            <UserStatusBadges user={user} />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 border-b border-border pb-px">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={cn(
              'rounded-t-xl px-4 py-2.5 text-sm font-medium transition-colors',
              tab === item.id
                ? 'border border-b-0 border-border bg-surface text-foreground'
                : 'text-muted hover:text-foreground',
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
        {tab === 'profile' && (
          <div className="space-y-4">
            <dl className="grid gap-3 sm:grid-cols-2">
              {[
                ['Role', user.role],
                ['Username', user.username || '—'],
                ['Status', user.current_status || '—'],
                ['Primary skill', user.primary_skill || '—'],
                ['Created', user.created_at || '—'],
                ['Disabled at', user.disabled_at || '—'],
                ['Blocked at', user.blocked_at || '—'],
                ['Blocked reason', user.blocked_reason || '—'],
                ['Total requests', user.total_requests ?? '—'],
                ['Total tokens', user.total_tokens ?? '—'],
                ['Estimated cost', user.estimated_cost ?? '—'],
                ['Last AI activity', user.last_ai_activity || '—'],
                ['Most used feature', user.most_used_feature || '—'],
                ['Most used model', user.most_used_model || '—'],
                ['Current plan', user.current_plan || '—'],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
                    {label}
                  </dt>
                  <dd className="mt-1 text-sm text-foreground">{value}</dd>
                </div>
              ))}
            </dl>
            <div>
              <h3 className="mb-2 text-sm font-semibold text-foreground">Profile payload</h3>
              <JsonBlock value={data.profile} />
            </div>
          </div>
        )}

        {tab === 'statistics' && <JsonBlock value={data.statistics} />}

        {tab === 'ai_history' && (
          <div className="space-y-4">
            <div>
              <h3 className="mb-2 text-sm font-semibold text-foreground">Sessions</h3>
              <JsonBlock value={data.ai_history?.sessions ?? []} />
            </div>
            <div>
              <h3 className="mb-2 text-sm font-semibold text-foreground">Usage</h3>
              <JsonBlock value={data.ai_history?.usage ?? []} />
            </div>
          </div>
        )}

        {tab === 'usage' && <JsonBlock value={data.usage} />}

        {tab === 'usage_analytics' && (
          <div className="space-y-4">
            <Link
              href={ROUTES.ADMIN_AI_USAGE_USER(userId)}
              className="text-sm font-medium text-primary hover:underline"
            >
              Open full AI usage detail →
            </Link>
            <JsonBlock value={data.usage_analytics ?? null} />
          </div>
        )}

        {tab === 'actions' && (
          <div className="space-y-4">
            <p className="text-sm text-muted">
              Admin actions update blocked vs disabled independently. Blocked users cannot
              self-enable.
            </p>
            <div className="flex flex-wrap gap-2">
              {user.is_blocked ? (
                <Button type="button" className="rounded-xl" onClick={() => setAction('unblock')}>
                  Unblock
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="danger"
                  className="rounded-xl"
                  onClick={() => setAction('block')}
                >
                  Block
                </Button>
              )}
              {user.is_active ? (
                <Button
                  type="button"
                  className="rounded-xl"
                  onClick={() => setAction('deactivate')}
                >
                  Deactivate
                </Button>
              ) : (
                <Button type="button" className="rounded-xl" onClick={() => setAction('activate')}>
                  Activate
                </Button>
              )}
              <Button
                type="button"
                variant="danger"
                className="rounded-xl"
                onClick={() => setAction('delete')}
              >
                Delete
              </Button>
            </div>
          </div>
        )}
      </div>

      <ConfirmReasonModal
        open={Boolean(action)}
        action={action}
        userLabel={title}
        isLoading={mutation.isPending}
        onClose={() => setAction(null)}
        onConfirm={(reason) => {
          if (!action) return;
          mutation.mutate({ action, reason });
        }}
      />
    </div>
  );
}
