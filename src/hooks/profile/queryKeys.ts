export const profileKeys = {
  all: ['profile'] as const,
  me: () => [...profileKeys.all, 'me'] as const,
  stats: () => [...profileKeys.all, 'stats'] as const,
  public: (username: string) => [...profileKeys.all, 'public', username.toLowerCase()] as const,
};
