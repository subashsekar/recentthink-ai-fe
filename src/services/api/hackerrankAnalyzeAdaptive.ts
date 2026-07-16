import { config } from '@/config';
import { getHackerRankApiBase } from '@/utils/hackerrankApiBase';
import { storage } from '@/utils/storage';
import { createApiRequestError, createNetworkFetchError, isAbortError } from '@/utils/apiError';
import { normalizeAnalyzeResponse } from '@/utils/hackerrankSession';
import type { HackerRankAnalyzeRequest, HackerRankStreamEvent } from '@/types/hackerrank';
import { processStreamResponse } from './streaming';

const shouldDebug = () => config.api.debug && process.env.NODE_ENV !== 'production';

export interface AnalyzeHandlers {
  onStreamEvent: (event: HackerRankStreamEvent) => void;
  onJsonResponse: (payload: unknown) => void;
}

export async function hackerrankAnalyzeAdaptive(
  data: HackerRankAnalyzeRequest,
  handlers: AnalyzeHandlers,
  signal?: AbortSignal,
) {
  const accessToken = storage.get<string>(config.auth.tokenKey);
  const headers: HeadersInit = {
    Accept: 'text/event-stream, application/json',
    'Content-Type': 'application/json',
  };
  if (accessToken) {
    (headers as Record<string, string>).Authorization = `Bearer ${accessToken}`;
  }

  const apiBase = getHackerRankApiBase();
  // Canonical stream path: POST /hackerrank/analyze?stream=true
  const endpoint = `${apiBase}/hackerrank/analyze?stream=true`;

  let res: Response;
  try {
    res = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        problem_url: data.problem_url ?? null,
        problem_statement: data.problem_statement ?? null,
        title: data.title ?? null,
        model_id: data.model_id ?? null,
        mode_id: data.mode_id ?? null,
      }),
      signal,
    });
  } catch (err) {
    if (isAbortError(err)) throw err;
    throw createNetworkFetchError(apiBase, err);
  }

  if (shouldDebug()) {
    console.debug('[hackerrank][analyze]', res.status, endpoint);
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
    await processStreamResponse<HackerRankStreamEvent>(res, handlers.onStreamEvent);
    return;
  }

  const text = await res.text();
  if (!text.trim()) return;

  try {
    const json = JSON.parse(text) as unknown;
    if (json && typeof json === 'object' && 'type' in (json as Record<string, unknown>)) {
      handlers.onStreamEvent(json as HackerRankStreamEvent);
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
