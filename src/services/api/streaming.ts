import { config } from '@/config';
import { storage } from '@/utils/storage';
import type { LeetCodeStreamEvent } from '@/types/leetcode';

type StreamHandler = (event: LeetCodeStreamEvent) => void;

const decoder = new TextDecoder();

const joinUrl = (...parts: Array<string | undefined>) =>
  parts
    .filter(Boolean)
    .map((p) => String(p))
    .join('/')
    .replace(/([^:]\/)\/+/g, '$1')
    .replace(/\/+$/, '');

const apiBase = joinUrl(config.api.baseUrl, config.api.prefix);
const gatewayBase = joinUrl(config.api.baseUrl);

function parseSseChunk(chunk: string): string[] {
  // Split into SSE events by blank line; return raw event blocks.
  return chunk
    .split(/\n\n+/g)
    .map((s) => s.trim())
    .filter(Boolean);
}

function extractSseDataLines(block: string): string[] {
  return block
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.startsWith('data:'))
    .map((l) => l.replace(/^data:\s?/, ''));
}

function safeJsonParse<T>(input: string): T | null {
  try {
    return JSON.parse(input) as T;
  } catch {
    return null;
  }
}

export async function streamLeetCode(
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

  // LeetCode endpoints are mounted at gateway root.
  const res = await fetch(`${gatewayBase}${path}`, {
    ...init,
    headers,
    body: init.body ? JSON.stringify(init.body) : undefined,
  });

  if (!res.ok) {
    onEvent({ type: 'error', message: `Request failed (${res.status})`, detail: await res.text() });
    return;
  }

  await processStreamResponse(res, onEvent);
}

export async function processStreamResponse(res: Response, onEvent: StreamHandler) {
  const contentType = res.headers.get('content-type') ?? '';
  const isSse = contentType.includes('text/event-stream');

  if (!res.body) {
    const text = await res.text();
    const json = safeJsonParse<LeetCodeStreamEvent | unknown>(text);
    if (json && typeof json === 'object' && json && 'type' in (json as Record<string, unknown>)) {
      onEvent(json as LeetCodeStreamEvent);
    }
    return;
  }

  const reader = res.body.getReader();
  let buffer = '';

  // Supports:
  // - SSE: "data: {...}\n\n"
  // - NDJSON: one JSON per line
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    if (isSse) {
      const parts = buffer.split(/\n\n+/g);
      buffer = parts.pop() ?? '';
      for (const block of parts) {
        for (const data of extractSseDataLines(block)) {
          if (data === '[DONE]') {
            onEvent({ type: 'done', session_id: '' });
            continue;
          }
          const evt = safeJsonParse<LeetCodeStreamEvent>(data);
          if (evt) onEvent(evt);
        }
      }
    } else {
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        const evt = safeJsonParse<LeetCodeStreamEvent>(trimmed);
        if (evt) onEvent(evt);
      }
    }
  }

  // flush last buffered line/block if it looks complete
  const tail = buffer.trim();
  if (tail) {
    if (isSse) {
      for (const block of parseSseChunk(tail)) {
        for (const data of extractSseDataLines(block)) {
          const evt = safeJsonParse<LeetCodeStreamEvent>(data);
          if (evt) onEvent(evt);
        }
      }
    } else {
      const evt = safeJsonParse<LeetCodeStreamEvent>(tail);
      if (evt) onEvent(evt);
    }
  }
}
