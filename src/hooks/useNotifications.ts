'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '@/services/api/notifications';
import { useAuthStore } from '@/store/authStore';

const POLL_MS = 45_000;

export const notificationKeys = {
  all: ['notifications'] as const,
  list: (params?: { unread_only?: boolean; page?: number }) =>
    [...notificationKeys.all, 'list', params] as const,
};

function useDocumentVisible() {
  const [visible, setVisible] = useState(
    typeof document === 'undefined' ? true : document.visibilityState === 'visible',
  );

  useEffect(() => {
    const onChange = () => setVisible(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', onChange);
    return () => document.removeEventListener('visibilitychange', onChange);
  }, []);

  return visible;
}

export function useNotifications(options?: { unreadOnly?: boolean; pageSize?: number }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const visible = useDocumentVisible();
  const unreadOnly = options?.unreadOnly;
  const pageSize = options?.pageSize ?? 20;

  return useQuery({
    queryKey: notificationKeys.list({ unread_only: unreadOnly, page: 1 }),
    queryFn: () =>
      notificationsApi.list({
        page: 1,
        page_size: pageSize,
        unread_only: unreadOnly,
      }),
    enabled: isAuthenticated,
    refetchInterval: isAuthenticated && visible ? POLL_MS : false,
    refetchOnWindowFocus: true,
  });
}

export function useNotificationMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: notificationKeys.all });
  };

  const markRead = useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: invalidate,
  });

  const markAllRead = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: invalidate,
  });

  return { markRead, markAllRead };
}
