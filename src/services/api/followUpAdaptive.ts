import { config } from '@/config';
import { storage } from '@/utils/storage';
import { createApiRequestError } from '@/utils/apiError';
import { normalizeAnalyzeResponse } from '@/utils/leetcodeSession';
import type { LeetCodeFollowUpRequest, LeetCodeStreamEvent } from '@/types/leetcode';
import { processStreamResponse } from './streaming';

const gatewayBase = config.api.baseUrl.replace(/\/+$/, '');

export interface FollowUpHandlers {
  onStreamEvent: (event: LeetCodeStreamEvent) => void;
  onJsonResponse: (payload: unknown) => void;
}

export async function followUpAdaptive(
  data: LeetCodeFollowUpRequest,
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

  const res = await fetch(`${gatewayBase}/leetcode/follow-up`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
    signal,
  });

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
      message: 'Unexpected follow-up response format',
      detail: text,
    });
  }
}

export function parseJsonFollowUpPayload(payload: unknown) {
  return normalizeAnalyzeResponse(payload);
}
