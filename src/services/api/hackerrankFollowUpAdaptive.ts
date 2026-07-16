import { config } from '@/config';
import { getHackerRankApiBase } from '@/utils/hackerrankApiBase';
import { storage } from '@/utils/storage';
import { createApiRequestError, createNetworkFetchError, isAbortError } from '@/utils/apiError';
import type { HackerRankFollowUpRequest, HackerRankStreamEvent } from '@/types/hackerrank';
import { processStreamResponse } from './streaming';

export interface FollowUpHandlers {
  onStreamEvent: (event: HackerRankStreamEvent) => void;
  onJsonResponse: (payload: unknown) => void;
}

export async function hackerrankFollowUpAdaptive(
  data: HackerRankFollowUpRequest,
  handlers: FollowUpHandlers,
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
  const primary = `${apiBase}/chat/hackerrank/follow-up`;
  const alias = `${apiBase}/hackerrank/follow-up`;
  const body = {
    session_id: data.session_id,
    question: data.question,
    mode_id: data.mode_id ?? null,
    model: data.model ?? data.model_id ?? null,
  };

  let res: Response;
  try {
    res = await fetch(primary, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal,
    });
    if (res.status === 404) {
      await res.text().catch(() => '');
      res = await fetch(alias, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal,
      });
    }
  } catch (err) {
    if (isAbortError(err)) throw err;
    throw createNetworkFetchError(apiBase, err);
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
      message: 'Unexpected follow-up response format',
      detail: text,
    });
  }
}
