'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { hackerrankApi } from '@/services/api/hackerrank';
import { hackerrankKeys } from './queryKeys';

export function usePatchSessionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sessionId,
      patch,
    }: {
      sessionId: string;
      patch: Partial<{
        title: string;
        is_pinned: boolean;
        is_archived: boolean;
        restore: boolean;
        model_id: string;
        mode_id: string;
      }>;
    }) => hackerrankApi.patchSession(sessionId, patch),
    onSuccess: (_data, { sessionId }) => {
      queryClient.invalidateQueries({ queryKey: hackerrankKeys.all });
      queryClient.invalidateQueries({ queryKey: hackerrankKeys.session(sessionId) });
    },
  });
}

export function useUpdateSessionModelMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sessionId, modelId }: { sessionId: string; modelId: string }) =>
      hackerrankApi.patchSession(sessionId, { model_id: modelId }),
    onSuccess: (_data, { sessionId }) => {
      queryClient.invalidateQueries({ queryKey: hackerrankKeys.all });
      queryClient.invalidateQueries({ queryKey: hackerrankKeys.session(sessionId) });
    },
  });
}

export function useUpdateSessionModeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sessionId, modeId }: { sessionId: string; modeId: string }) =>
      hackerrankApi.patchSession(sessionId, { mode_id: modeId }),
    onSuccess: (_data, { sessionId }) => {
      queryClient.invalidateQueries({ queryKey: hackerrankKeys.all });
      queryClient.invalidateQueries({ queryKey: hackerrankKeys.session(sessionId) });
    },
  });
}

export function useDeleteSessionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => hackerrankApi.deleteSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hackerrankKeys.all });
    },
  });
}

export function useInvalidateHackerRankQueries() {
  const queryClient = useQueryClient();

  return {
    invalidateHistory: () => queryClient.invalidateQueries({ queryKey: hackerrankKeys.all }),
    invalidateSession: (sessionId: string) =>
      queryClient.invalidateQueries({ queryKey: hackerrankKeys.session(sessionId) }),
    invalidateProgress: () =>
      queryClient.invalidateQueries({ queryKey: hackerrankKeys.progress() }),
    invalidateAll: (sessionId?: string | null) => {
      queryClient.invalidateQueries({ queryKey: hackerrankKeys.all });
      if (sessionId) {
        queryClient.invalidateQueries({ queryKey: hackerrankKeys.session(sessionId) });
      }
    },
  };
}
