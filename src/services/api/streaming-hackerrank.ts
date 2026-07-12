import { config } from '@/config';
import { getHackerRankApiBase } from '@/utils/hackerrankApiBase';
import { storage } from '@/utils/storage';
import type { HackerRankStreamEvent } from '@/types/hackerrank';
import { processStreamResponse } from './streaming';

type StreamHandler = (event: HackerRankStreamEvent) => void;

export async function streamHackerRank(
  path: string,
  init: {
    method: string;
    headers?: HeadersInit;
    signal?: AbortSignal;
    body?: unknown;
    credentials?: RequestCredentials;
    cache?: RequestCache;
    redirect?: RequestRedirect;
    referrer?: string;
    referrerPolicy?: ReferrerPolicy;
    integrity?: string;
    keepalive?: boolean;
    mode?: RequestMode;
  },
  onEvent: StreamHandler,
) {
  const accessToken = storage.get<string>(config.auth.tokenKey);
  const headers: HeadersInit = {
    Accept: 'text/event-stream, application/json',
    'Content-Type': 'application/json',
    ...(init.headers ?? {}),
  };
  if (accessToken) {
    (headers as Record<string, string>).Authorization = `Bearer ${accessToken}`;
  }

  const res = await fetch(`${getHackerRankApiBase()}${path}`, {
    ...init,
    headers,
    body: init.body ? JSON.stringify(init.body) : undefined,
  });

  if (!res.ok) {
    onEvent({ type: 'error', message: `Request failed (${res.status})`, detail: await res.text() });
    return;
  }

  await processStreamResponse<HackerRankStreamEvent>(res, onEvent);
}
