import { config } from '@/config';

/**
 * Base URL for `/hackerrank/*` mentor API calls.
 * Defaults to the gateway (proxies `/hackerrank/*` → AI service).
 */
export function getHackerRankApiBase(): string {
  return config.api.hackerrankBaseUrl.replace(/\/+$/, '');
}
