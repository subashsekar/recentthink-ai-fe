'use client';

import { useQuery } from '@tanstack/react-query';
import { dsaPatternApi } from '@/services/api/dsaPattern';
import { getAiModels } from '@/services/api/models';
import { storage } from '@/utils/storage';
import { config } from '@/config';
import { dsaPatternKeys } from './queryKeys';

export function useDsaPatternHistory(params?: { limit?: number; offset?: number; q?: string }) {
  return useQuery({
    queryKey: dsaPatternKeys.history(params),
    queryFn: () => dsaPatternApi.listHistory(params),
  });
}

export function useDsaPatternDetail(sessionId: string | null) {
  return useQuery({
    queryKey: dsaPatternKeys.detail(sessionId ?? ''),
    queryFn: () => dsaPatternApi.getHistoryDetail(sessionId!),
    enabled: Boolean(sessionId),
  });
}

export function useDsaPatternProgress() {
  return useQuery({
    queryKey: dsaPatternKeys.progress(),
    queryFn: () => dsaPatternApi.getProgress(),
  });
}

export function useDsaPatternDashboard() {
  return useQuery({
    queryKey: dsaPatternKeys.dashboard(),
    queryFn: () => dsaPatternApi.getDashboard(),
  });
}

export function useDsaPatternExamples() {
  return useQuery({
    queryKey: dsaPatternKeys.examples(),
    queryFn: () => dsaPatternApi.getExamples(),
  });
}

export function useAiModels() {
  return useQuery({
    queryKey: ['ai-models'],
    queryFn: async () => {
      const token = storage.get<string>(config.auth.tokenKey) ?? '';
      return getAiModels(token);
    },
    staleTime: 5 * 60 * 1000,
  });
}
