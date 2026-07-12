'use client';

import { useQuery } from '@tanstack/react-query';
import { profileApi } from '@/services/api/profile';
import { profileKeys } from './queryKeys';

export function useMyProfile(enabled = true) {
  return useQuery({
    queryKey: profileKeys.me(),
    queryFn: () => profileApi.getMe(),
    enabled,
  });
}

export function useProfileStatistics(enabled = true) {
  return useQuery({
    queryKey: profileKeys.stats(),
    queryFn: () => profileApi.getStatistics(),
    enabled,
  });
}

export function usePublicProfile(username: string | null) {
  return useQuery({
    queryKey: profileKeys.public(username ?? ''),
    queryFn: () => profileApi.getPublic(username!),
    enabled: Boolean(username),
    retry: (failureCount, error) => {
      const status =
        error && typeof error === 'object' && 'response' in error
          ? (error as { response?: { status?: number } }).response?.status
          : undefined;
      if (status === 404) return false;
      return failureCount < 2;
    },
  });
}
