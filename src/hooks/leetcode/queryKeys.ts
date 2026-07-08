export const leetcodeKeys = {
  all: ['leetcode'] as const,
  history: (params?: { limit?: number; offset?: number; q?: string }) =>
    [...leetcodeKeys.all, 'history', params ?? {}] as const,
  session: (sessionId: string) => [...leetcodeKeys.all, 'session', sessionId] as const,
  modes: () => [...leetcodeKeys.all, 'modes'] as const,
  progress: () => [...leetcodeKeys.all, 'progress'] as const,
  examples: () => [...leetcodeKeys.all, 'examples'] as const,
  models: () => ['ai', 'models'] as const,
};
