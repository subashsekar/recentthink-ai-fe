'use client';

import { useQuery } from '@tanstack/react-query';
import { leetcodeApi } from '@/services/api/leetcode';
import { leetcodeKeys } from './queryKeys';

export { useAiModels } from '@/hooks/useAiModels';

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
