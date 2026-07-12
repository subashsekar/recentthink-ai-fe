export const courseKeys = {
  all: ['courses'] as const,
  history: (params?: { limit?: number; offset?: number; q?: string }) =>
    [...courseKeys.all, 'chat-history', params ?? {}] as const,
  detail: (courseId: string) => [...courseKeys.all, 'chat-history', 'detail', courseId] as const,
  sessionChat: (sessionId: string) =>
    [...courseKeys.all, 'session-chat-history', sessionId] as const,
  progress: () => [...courseKeys.all, 'progress'] as const,
  dashboard: () => [...courseKeys.all, 'dashboard'] as const,
  examples: () => [...courseKeys.all, 'examples'] as const,
};
