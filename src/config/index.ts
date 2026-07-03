export const config = {
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001',
    timeout: 30000,
  },
  auth: {
    tokenKey: 'access_token',
    refreshTokenKey: 'refresh_token',
    userKey: 'user',
  },
  pagination: {
    defaultPageSize: 20,
  },
} as const;
