export const hackerrankKeys = {
  all: ['hackerrank'] as const,
  history: (params?: { limit?: number; offset?: number; q?: string }) =>
    [...hackerrankKeys.all, 'history', params ?? {}] as const,
  session: (sessionId: string) => [...hackerrankKeys.all, 'session', sessionId] as const,
  modes: () => [...hackerrankKeys.all, 'modes'] as const,
  progress: () => [...hackerrankKeys.all, 'progress'] as const,
  examples: () => [...hackerrankKeys.all, 'examples'] as const,
  models: () => ['ai-models'] as const,
};
