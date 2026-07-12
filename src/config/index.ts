const gatewayBaseUrl =
  process.env.NEXT_PUBLIC_GATEWAY_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:8000';

export const config = {
  api: {
    // Single gateway base URL (frontend -> gateway -> services).
    // Keep legacy env vars as fallbacks.
    baseUrl: gatewayBaseUrl,
    // Optional prefix for non-root mounted APIs.
    // If your gateway serves routes at root, set NEXT_PUBLIC_API_PREFIX="".
    prefix: process.env.NEXT_PUBLIC_API_PREFIX ?? '',
    timeout: 30000,
    // Debug logs (URL + status only). Never logs headers/tokens.
    debug: process.env.NEXT_PUBLIC_API_DEBUG === '1',
    // HackerRank mentor routes. Use direct AI service in local dev when gateway proxy is pending.
    hackerrankBaseUrl: process.env.NEXT_PUBLIC_HACKERRANK_SERVICE_URL || gatewayBaseUrl,
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
