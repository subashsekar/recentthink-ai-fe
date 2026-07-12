'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNotificationMutations, notificationKeys } from '@/hooks/useNotifications';
import { notificationsApi } from '@/services/api/notifications';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { getAxiosErrorMessage } from '@/utils/courseError';
import { cn } from '@/utils/cn';
import { config } from '@/config';

export default function NotificationsPage() {
  const [page, setPage] = useState(1);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const pageSize = config.pagination.defaultPageSize;
  const { markRead, markAllRead } = useNotificationMutations();

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: notificationKeys.list({ unread_only: unreadOnly, page }),
    queryFn: () =>
      notificationsApi.list({
        page,
        page_size: pageSize,
        unread_only: unreadOnly || undefined,
      }),
  });

  const items = data?.items ?? [];
  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / pageSize));
  const unreadCount = data?.unread_count ?? items.filter((i) => !i.is_read).length;

  return (
    <div className="mx-auto w-full max-w-[900px] space-y-6 px-1 sm:px-2">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Inbox</p>
          <h1 className="mt-1 font-heading text-2xl font-semibold text-foreground sm:text-3xl">
            Notifications
          </h1>
          <p className="mt-1 text-sm text-muted">
            {unreadCount} unread · Polled while this app is focused
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="ghost"
            className="rounded-xl"
            onClick={() => {
              setUnreadOnly((v) => !v);
              setPage(1);
            }}
          >
            {unreadOnly ? 'Show all' : 'Unread only'}
          </Button>
          <Button
            type="button"
            className="rounded-xl"
            disabled={markAllRead.isPending || unreadCount === 0}
            isLoading={markAllRead.isPending}
            onClick={() => markAllRead.mutate()}
          >
            Mark all read
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
            {getAxiosErrorMessage(error, 'Failed to load notifications')}
            <button type="button" className="underline" onClick={() => refetch()}>
              Retry
            </button>
          </span>
        </Alert>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          {items.length === 0 ? (
            <p className="px-4 py-12 text-center text-sm text-muted">No notifications</p>
          ) : (
            <ul className="divide-y divide-border/70">
              {items.map((item) => (
                <li
                  key={item.id}
                  className={cn('px-4 py-4 sm:px-5', !item.is_read && 'bg-primary/5')}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-foreground">{item.title}</p>
                        <Badge variant="default">{item.type}</Badge>
                        {!item.is_read ? <Badge variant="info">Unread</Badge> : null}
                      </div>
                      <p className="mt-1 text-sm text-secondary-text">{item.message}</p>
                      <p className="mt-2 text-xs text-muted">
                        {new Date(item.created_at).toLocaleString()}
                      </p>
                    </div>
                    {!item.is_read ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="rounded-xl"
                        disabled={markRead.isPending}
                        onClick={() => markRead.mutate(item.id)}
                      >
                        Mark read
                      </Button>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}

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
