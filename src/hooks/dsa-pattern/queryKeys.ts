export const dsaPatternKeys = {
  all: ['dsa-pattern'] as const,
  history: (params?: { limit?: number; offset?: number; q?: string }) =>
    [...dsaPatternKeys.all, 'history', params ?? {}] as const,
  detail: (sessionId: string) => [...dsaPatternKeys.all, 'history', 'detail', sessionId] as const,
  progress: () => [...dsaPatternKeys.all, 'progress'] as const,
  dashboard: () => [...dsaPatternKeys.all, 'dashboard'] as const,
  examples: () => [...dsaPatternKeys.all, 'examples'] as const,
};
