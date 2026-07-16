import { config } from '@/config';
import { storage } from '@/utils/storage';
import {
  createApiRequestError,
  createNetworkFetchError,
  isAbortError,
  ApiRequestError,
} from '@/utils/apiError';
import type {
  FollowUpFeature,
  FollowUpRequestBody,
  FollowUpStreamEvent,
} from '@/types/followUpChat';
import { processStreamResponse } from './streaming';

const gatewayBase = config.api.baseUrl.replace(/\/+$/, '');

export interface FollowUpChatHandlers {
  onStreamEvent: (event: FollowUpStreamEvent) => void;
  onJsonResponse: (payload: unknown) => void;
}

const FEATURE_PATH: Record<FollowUpFeature, { primary: string; alias: string }> = {
  leetcode: { primary: '/chat/leetcode/follow-up', alias: '/leetcode/follow-up' },
  hackerrank: { primary: '/chat/hackerrank/follow-up', alias: '/hackerrank/follow-up' },
  dsa_pattern: { primary: '/chat/dsa_pattern/follow-up', alias: '/dsa-pattern/follow-up' },
  course_generator: {
    primary: '/chat/course_generator/follow-up',
    alias: '/courses/follow-up',
  },
};

/**
 * Prefer the gateway for every product (same as LeetCode).
 * HackerRank `/hackerrank/*` is gateway-proxied — do not prefer a direct AI host.
 */
function candidateBases(): string[] {
  return [gatewayBase];
}

async function postFollowUp(
  url: string,
  body: FollowUpRequestBody,
  signal?: AbortSignal,
): Promise<Response> {
  const accessToken = storage.get<string>(config.auth.tokenKey);
  const headers: HeadersInit = {
    Accept: 'text/event-stream, application/json',
    'Content-Type': 'application/json',
  };
  if (accessToken) {
    (headers as Record<string, string>).Authorization = `Bearer ${accessToken}`;
  }

  try {
    return await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        session_id: body.session_id,
        question: body.question,
        model: body.model ?? null,
        mode_id: body.mode_id ?? null,
      }),
      signal,
    });
  } catch (err) {
    if (isAbortError(err)) throw err;
    const base = url
      .replace(/\/chat\/.*$/, '')
      .replace(/\/(leetcode|hackerrank|dsa-pattern|courses)\/.*$/, '');
    throw createNetworkFetchError(base || url, err);
  }
}

async function consumeResponse(res: Response, handlers: FollowUpChatHandlers): Promise<void> {
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
      handlers.onStreamEvent(json as FollowUpStreamEvent);
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

/**
 * Adaptive follow-up client for all four learning products.
 * Tries `/chat/{feature}/follow-up`, then product aliases. Never hardcodes only LeetCode.
 */
export async function followUpChatAdaptive(
  feature: FollowUpFeature,
  data: FollowUpRequestBody,
  handlers: FollowUpChatHandlers,
  signal?: AbortSignal,
): Promise<void> {
  const paths = FEATURE_PATH[feature];
  const bases = candidateBases();
  const urls = bases.flatMap((base) => [`${base}${paths.primary}`, `${base}${paths.alias}`]);
  // De-dupe while preserving order
  const uniqueUrls = [...new Set(urls)];

  let lastNetworkError: unknown = null;

  for (const url of uniqueUrls) {
    try {
      const res = await postFollowUp(url, data, signal);
      if (res.status === 404) {
        await res.text().catch(() => '');
        continue;
      }
      if (!res.ok) {
        const detail = await res.text();
        throw createApiRequestError(res.status, detail);
      }
      await consumeResponse(res, handlers);
      return;
    } catch (err) {
      if (isAbortError(err)) throw err;
      if (err instanceof ApiRequestError) throw err;
      lastNetworkError = err;
    }
  }

  if (lastNetworkError instanceof Error) {
    throw lastNetworkError;
  }

  throw createApiRequestError(404, 'Follow-up endpoint not found for this product.');
}
