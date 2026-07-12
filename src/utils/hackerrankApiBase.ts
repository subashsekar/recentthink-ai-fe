import { config } from '@/config';

/** Base URL for `/hackerrank/*` mentor API calls (gateway or direct AI service). */
export function getHackerRankApiBase(): string {
  return config.api.hackerrankBaseUrl.replace(/\/+$/, '');
}
