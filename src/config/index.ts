const gatewayBaseUrl =
  process.env.NEXT_PUBLIC_GATEWAY_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:8000';

/**
 * HackerRank product routes (`/hackerrank/*`) are proxied by the gateway.
 * Always prefer the gateway base (same as LeetCode).
 *
 * Direct AI-service URL is opt-in only — when Docker publishes the AI port and
 * gateway proxy is unavailable. Setting NEXT_PUBLIC_HACKERRANK_SERVICE_URL alone
 * used to hijack all HR calls to a host port that often times out.
 */
const hackerrankBaseUrl =
  process.env.NEXT_PUBLIC_HACKERRANK_FORCE_DIRECT === '1' &&
  process.env.NEXT_PUBLIC_HACKERRANK_SERVICE_URL
    ? process.env.NEXT_PUBLIC_HACKERRANK_SERVICE_URL
    : gatewayBaseUrl;

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
    hackerrankBaseUrl,
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
