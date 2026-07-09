'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { leetcodeApi } from '@/services/api/leetcode';
import { leetcodeKeys } from './queryKeys';

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
      }>;
    }) => leetcodeApi.patchSession(sessionId, patch),
    onSuccess: (_data, { sessionId }) => {
      queryClient.invalidateQueries({ queryKey: leetcodeKeys.all });
      queryClient.invalidateQueries({ queryKey: leetcodeKeys.session(sessionId) });
    },
  });
}

export function useUpdateSessionModelMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sessionId, modelId }: { sessionId: string; modelId: string }) =>
      leetcodeApi.patchSession(sessionId, { model_id: modelId }),
    onSuccess: (_data, { sessionId }) => {
      queryClient.invalidateQueries({ queryKey: leetcodeKeys.all });
      queryClient.invalidateQueries({ queryKey: leetcodeKeys.session(sessionId) });
    },
  });
}

export function useDeleteSessionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => leetcodeApi.deleteSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leetcodeKeys.all });
    },
  });
}

export function useInvalidateLeetCodeQueries() {
  const queryClient = useQueryClient();

  return {
    invalidateHistory: () => queryClient.invalidateQueries({ queryKey: leetcodeKeys.all }),
    invalidateSession: (sessionId: string) =>
      queryClient.invalidateQueries({ queryKey: leetcodeKeys.session(sessionId) }),
    invalidateProgress: () => queryClient.invalidateQueries({ queryKey: leetcodeKeys.progress() }),
    invalidateAll: (sessionId?: string | null) => {
      queryClient.invalidateQueries({ queryKey: leetcodeKeys.all });
      if (sessionId) {
        queryClient.invalidateQueries({ queryKey: leetcodeKeys.session(sessionId) });
      }
    },
  };
}
