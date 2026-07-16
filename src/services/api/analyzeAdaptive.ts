import { config } from '@/config';
import { storage } from '@/utils/storage';
import { createApiRequestError, createNetworkFetchError, isAbortError } from '@/utils/apiError';
import { normalizeAnalyzeResponse } from '@/utils/leetcodeSession';
import type { LeetCodeAnalyzeRequest, LeetCodeStreamEvent } from '@/types/leetcode';
import { processStreamResponse } from './streaming';

const shouldDebug = () => config.api.debug && process.env.NODE_ENV !== 'production';

export interface AnalyzeHandlers {
  onStreamEvent: (event: LeetCodeStreamEvent) => void;
  onJsonResponse: (payload: unknown) => void;
}

export async function analyzeAdaptive(
  data: LeetCodeAnalyzeRequest,
  handlers: AnalyzeHandlers,
  signal?: AbortSignal,
) {
  const gatewayBase = config.api.baseUrl.replace(/\/+$/, '');
  const endpoint = `${gatewayBase}/leetcode/analyze`;
  const accessToken = storage.get<string>(config.auth.tokenKey);
  const headers: HeadersInit = {
    Accept: 'text/event-stream, application/json',
    'Content-Type': 'application/json',
  };
  if (accessToken) {
    (headers as Record<string, string>).Authorization = `Bearer ${accessToken}`;
  }

  let res: Response;
  try {
    res = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
      signal,
    });
  } catch (err) {
    if (isAbortError(err)) throw err;
    throw createNetworkFetchError(gatewayBase, err);
  }

  if (shouldDebug()) {
    console.debug('[analyze]', res.status, endpoint);
  }

  if (!res.ok) {
    const detail = await res.text();
    throw createApiRequestError(res.status, detail);
  }

  const contentType = res.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    const json = await res.json();
    handlers.onJsonResponse(json);
    return;
  }

  if (contentType.includes('text/event-stream') || contentType.includes('ndjson')) {
    await processStreamResponse(res, handlers.onStreamEvent);
    return;
  }

  const text = await res.text();
  if (!text.trim()) return;

  try {
    const json = JSON.parse(text) as unknown;
    if (json && typeof json === 'object' && 'type' in (json as Record<string, unknown>)) {
      handlers.onStreamEvent(json as LeetCodeStreamEvent);
      return;
    }
    handlers.onJsonResponse(json);
  } catch {
    handlers.onStreamEvent({
      type: 'error',
      message: 'Unexpected analyze response format',
      detail: text,
    });
  }
}

export function parseJsonAnalyzePayload(payload: unknown) {
  return normalizeAnalyzeResponse(payload);
}
