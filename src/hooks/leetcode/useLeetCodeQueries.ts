'use client';

import { useQuery } from '@tanstack/react-query';
import { leetcodeApi } from '@/services/api/leetcode';
import { getAiModels } from '@/services/api/models';
import { useAuthStore } from '@/store/authStore';
import { sortModels } from '@/utils/leetcodeModels';
import { leetcodeKeys } from './queryKeys';
import type { ModelsResponse } from '@/types/ai-models';

function normalizeModelsResponse(data: ModelsResponse): ModelsResponse {
  const models = sortModels(data.models.filter((m) => m.enabled));
  return {
    default_model: data.default_model,
    models,
  };
}

export function useLeetCodeHistory(params?: { limit?: number; offset?: number; q?: string }) {
  return useQuery({
    queryKey: leetcodeKeys.history(params),
    queryFn: () => leetcodeApi.getHistory(params),
  });
}

export function useLeetCodeSession(sessionId: string | null) {
  return useQuery({
    queryKey: leetcodeKeys.session(sessionId ?? ''),
    queryFn: () => leetcodeApi.getSession(sessionId!),
    enabled: Boolean(sessionId),
  });
}

export function useLeetCodeModes() {
  return useQuery({
    queryKey: leetcodeKeys.modes(),
    queryFn: () => leetcodeApi.getModes(),
  });
}

export function useLeetCodeProgress() {
  return useQuery({
    queryKey: leetcodeKeys.progress(),
    queryFn: () => leetcodeApi.getProgress(),
  });
}

export function useLeetCodeExamples() {
  return useQuery({
    queryKey: leetcodeKeys.examples(),
    queryFn: () => leetcodeApi.getExamples(),
  });
}

export function useAiModels() {
  const accessToken = useAuthStore((s) => s.accessToken);

  return useQuery({
    queryKey: leetcodeKeys.models(),
    queryFn: () => getAiModels(accessToken!),
    enabled: Boolean(accessToken),
    staleTime: 5 * 60 * 1000,
    select: normalizeModelsResponse,
  });
}
