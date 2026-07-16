'use client';

import { useQuery } from '@tanstack/react-query';
import { hackerrankApi } from '@/services/api/hackerrank';
import { hackerrankKeys } from './queryKeys';
import type { ModeInfo } from '@/types/hackerrank';

export { useAiModels } from '@/hooks/useAiModels';

export function useHackerRankHistory(params?: { limit?: number; offset?: number; q?: string }) {
  return useQuery({
    queryKey: hackerrankKeys.history(params),
    queryFn: () => hackerrankApi.getHistory(params),
  });
}

export function useHackerRankSession(sessionId: string | null) {
  return useQuery({
    queryKey: hackerrankKeys.session(sessionId ?? ''),
    queryFn: () => hackerrankApi.getSession(sessionId!),
    enabled: Boolean(sessionId),
  });
}

const FALLBACK_MODES: ModeInfo[] = [
  {
    id: 'learning',
    label: 'Learning',
    description: 'Step-by-step guidance with explanations.',
    icon: 'graduation',
    recommended: true,
  },
  {
    id: 'interview',
    label: 'Interview',
    description: 'Concise hints + complexity focus.',
    icon: 'zap',
    recommended: false,
  },
];

export function useHackerRankModes() {
  return useQuery({
    queryKey: hackerrankKeys.modes(),
    queryFn: async () => {
      try {
        const modes = await hackerrankApi.getModes();
        return modes;
      } catch {
        return FALLBACK_MODES;
      }
    },
  });
}

export function useHackerRankProgress() {
  return useQuery({
    queryKey: hackerrankKeys.progress(),
    queryFn: () => hackerrankApi.getProgress(),
  });
}

export function useHackerRankExamples() {
  return useQuery({
    queryKey: hackerrankKeys.examples(),
    queryFn: () => hackerrankApi.getExamples(),
  });
}
