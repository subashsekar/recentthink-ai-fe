import type { FollowUpNormalizedResult, FollowUpUiMessage } from '@/types/followUpChat';

export function pickTeacherAnswer(payload: unknown): string {
  if (!payload || typeof payload !== 'object') return '';
  const raw = payload as Record<string, unknown>;
  const nested = (raw.data ?? raw.result ?? raw.response ?? raw.payload) as
    Record<string, unknown> | undefined;
  const sources = [raw, nested].filter(Boolean) as Record<string, unknown>[];

  for (const src of sources) {
    for (const key of ['teacher', 'answer', 'content', 'message', 'response']) {
      const value = src[key];
      if (typeof value === 'string' && value.trim()) return value.trim();
      if (value && typeof value === 'object') {
        const obj = value as Record<string, unknown>;
        for (const nestedKey of ['content', 'output', 'text', 'message', 'response', 'teacher']) {
          const nestedVal = obj[nestedKey];
          if (typeof nestedVal === 'string' && nestedVal.trim()) return nestedVal.trim();
        }
      }
    }
  }

  return '';
}

function asBoolean(value: unknown): boolean | undefined {
  if (typeof value === 'boolean') return value;
  return undefined;
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function readMeta(payload: unknown): {
  sessionId?: string;
  intent?: string;
  contextMatch?: boolean;
  rejected?: boolean;
} {
  if (!payload || typeof payload !== 'object') return {};
  const raw = payload as Record<string, unknown>;
  const nested = (raw.response ?? raw.data ?? raw.result ?? raw.payload) as
    Record<string, unknown> | undefined;
  const sources = [raw, nested].filter(Boolean) as Record<string, unknown>[];

  let sessionId: string | undefined;
  let intent: string | undefined;
  let contextMatch: boolean | undefined;
  let rejected: boolean | undefined;

  for (const src of sources) {
    sessionId ??= asString(src.session_id);
    intent ??= asString(src.intent);
    contextMatch ??= asBoolean(src.context_match);
    rejected ??= asBoolean(src.rejected);
  }

  return { sessionId, intent, contextMatch, rejected };
}

export function isRejectedFollowUp(meta: {
  rejected?: boolean;
  contextMatch?: boolean;
  intent?: string;
}): boolean {
  if (meta.rejected === true) return true;
  if (meta.contextMatch === false) return true;
  if (meta.intent === 'out_of_context') return true;
  return false;
}

export function normalizeFollowUpPayload(payload: unknown): FollowUpNormalizedResult {
  const meta = readMeta(payload);
  const rejected = isRejectedFollowUp({
    rejected: meta.rejected,
    contextMatch: meta.contextMatch,
    intent: meta.intent,
  });

  return {
    sessionId: meta.sessionId,
    intent: meta.intent,
    teacher:
      pickTeacherAnswer(payload) ||
      (rejected
        ? 'That question is outside this session. Ask about the current problem, pattern, or course instead.'
        : ''),
    contextMatch: meta.contextMatch ?? !rejected,
    rejected,
    raw: payload,
  };
}

export function toFollowUpUiMessage(message: {
  id: string;
  role: string;
  content?: string;
  message?: string;
  created_at?: string;
  createdAt?: string;
  intent?: string;
  rejected?: boolean;
  context_match?: boolean;
  contextMatch?: boolean;
  isStreaming?: boolean;
}): FollowUpUiMessage | null {
  const role = message.role === 'user' ? 'user' : message.role === 'assistant' ? 'assistant' : null;
  if (!role) return null;

  const content = message.content || message.message || '';
  const rejected = isRejectedFollowUp({
    rejected: message.rejected,
    contextMatch: message.contextMatch ?? message.context_match,
    intent: message.intent,
  });

  return {
    id: message.id,
    role,
    content,
    intent: message.intent,
    rejected: rejected || undefined,
    contextMatch: message.contextMatch ?? message.context_match,
    createdAt: message.createdAt || message.created_at || new Date().toISOString(),
    isStreaming: message.isStreaming,
  };
}

export function historyToFollowUpMessages(
  messages: Array<{
    id: string;
    role: string;
    content?: string;
    message?: string;
    created_at?: string;
    intent?: string;
    rejected?: boolean;
    context_match?: boolean;
    isStreaming?: boolean;
  }> = [],
): FollowUpUiMessage[] {
  return messages
    .map((m) => toFollowUpUiMessage(m))
    .filter((m): m is FollowUpUiMessage => Boolean(m));
}

export const EMPTY_SESSION_HELPER =
  'Run Analyze/Generate first, then ask follow-up questions about this session.';
