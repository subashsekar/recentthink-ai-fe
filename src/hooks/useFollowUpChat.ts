'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { FollowUpChatStatus, FollowUpFeature, FollowUpUiMessage } from '@/types/followUpChat';
import { followUpChatAdaptive } from '@/services/api/followUpChatAdaptive';
import { ApiRequestError, isAbortError } from '@/utils/apiError';
import { normalizeFollowUpPayload, pickTeacherAnswer } from '@/utils/followUpChat';

export interface UseFollowUpChatOptions {
  feature: FollowUpFeature;
  sessionId: string | null;
  enabled: boolean;
  messages: FollowUpUiMessage[];
  onAppend: (message: FollowUpUiMessage) => void;
  onUpdate: (id: string, patch: Partial<FollowUpUiMessage>) => void;
  model?: string | null;
  modeId?: string | null;
  /** Called for non-rejected payloads so products can update teacher/report tabs. */
  onAcceptedResult?: (payload: unknown) => void;
}

export interface UseFollowUpChatResult {
  status: FollowUpChatStatus;
  error: string | null;
  isBusy: boolean;
  lastQuestion: string | null;
  streamStatus: string | null;
  send: (question: string, options?: { isRetry?: boolean }) => Promise<void>;
  clearError: () => void;
  abort: () => void;
}

export function useFollowUpChat({
  feature,
  sessionId,
  enabled,
  onAppend,
  onUpdate,
  model,
  modeId,
  onAcceptedResult,
}: UseFollowUpChatOptions): UseFollowUpChatResult {
  const [status, setStatus] = useState<FollowUpChatStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [lastQuestion, setLastQuestion] = useState<string | null>(null);
  const [streamStatus, setStreamStatus] = useState<string | null>(null);
  const [activeSessionId, setActiveSessionId] = useState(sessionId);
  const abortRef = useRef<AbortController | null>(null);

  // Reset chat UI state when the session changes (render-time adjustment, not an effect).
  if (sessionId !== activeSessionId) {
    setActiveSessionId(sessionId);
    setStatus('idle');
    setError(null);
    setStreamStatus(null);
    setLastQuestion(null);
  }

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const abort = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const send = useCallback(
    async (question: string, options?: { isRetry?: boolean }) => {
      const trimmed = question.trim();
      if (!enabled || !sessionId || !trimmed) return;
      if (status === 'sending' || status === 'streaming') return;

      setError(null);
      setStreamStatus(null);
      if (!options?.isRetry) setLastQuestion(trimmed);

      const userId = `user-${crypto.randomUUID()}`;
      const assistantId = `assistant-${crypto.randomUUID()}`;

      onAppend({
        id: userId,
        role: 'user',
        content: trimmed,
        createdAt: new Date().toISOString(),
      });
      onAppend({
        id: assistantId,
        role: 'assistant',
        content: '',
        createdAt: new Date().toISOString(),
        isStreaming: true,
      });

      setStatus('sending');
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      let latestAnswer = '';
      let applied = false;
      let finalMeta: ReturnType<typeof normalizeFollowUpPayload> | null = null;

      const finalize = (content: string, meta?: ReturnType<typeof normalizeFollowUpPayload>) => {
        const resolved = meta ?? finalMeta;
        onUpdate(assistantId, {
          content: content || 'No response received.',
          isStreaming: false,
          intent: resolved?.intent,
          rejected: resolved?.rejected,
          contextMatch: resolved?.contextMatch,
        });
        setStatus(resolved?.rejected ? 'rejected' : 'accepted');
        setStreamStatus(null);
      };

      try {
        await followUpChatAdaptive(
          feature,
          {
            session_id: sessionId,
            question: trimmed,
            model: model ?? null,
            mode_id: modeId ?? null,
          },
          {
            onJsonResponse: (payload) => {
              const normalized = normalizeFollowUpPayload(payload);
              finalMeta = normalized;
              latestAnswer = normalized.teacher || latestAnswer;
              applied = true;
              if (!normalized.rejected) {
                onAcceptedResult?.(payload);
              }
              finalize(latestAnswer || normalized.teacher, normalized);
            },
            onStreamEvent: (event) => {
              if (event.type === 'error') {
                throw new Error(
                  typeof event.message === 'string' ? event.message : 'Follow-up failed.',
                );
              }

              if (event.type === 'status') {
                setStatus('streaming');
                const label =
                  (typeof event.status === 'string' && event.status) ||
                  (typeof event.message === 'string' && event.message) ||
                  null;
                setStreamStatus(label);
                return;
              }

              if (event.type === 'delta') {
                const role = typeof event.role === 'string' ? event.role : 'teacher';
                if (role === 'teacher' || !event.role) {
                  const delta = typeof event.delta === 'string' ? event.delta : '';
                  latestAnswer = `${latestAnswer}${delta}`;
                  setStatus('streaming');
                  onUpdate(assistantId, { content: latestAnswer, isStreaming: true });
                }
                return;
              }

              if (event.type === 'message') {
                const role = typeof event.role === 'string' ? event.role : 'teacher';
                if (role === 'teacher' || !event.role) {
                  const content = typeof event.content === 'string' ? event.content : '';
                  latestAnswer = content || latestAnswer;
                  setStatus('streaming');
                  onUpdate(assistantId, { content: latestAnswer, isStreaming: true });
                }
                return;
              }

              if (event.type === 'complete') {
                const payload =
                  event.response && typeof event.response === 'object' ? event.response : event;
                const normalized = normalizeFollowUpPayload(payload);
                finalMeta = normalized;
                latestAnswer = normalized.teacher || pickTeacherAnswer(event) || latestAnswer;
                if (!applied) {
                  applied = true;
                  if (!normalized.rejected) {
                    onAcceptedResult?.(payload);
                  }
                }
                finalize(latestAnswer || normalized.teacher, normalized);
                return;
              }

              if (event.type === 'done') {
                if (!applied) {
                  finalize(latestAnswer, finalMeta ?? undefined);
                  applied = true;
                }
              }
            },
          },
          abortRef.current.signal,
        );

        if (!applied) {
          finalize(latestAnswer, finalMeta ?? undefined);
        }
      } catch (err) {
        if (isAbortError(err)) return;

        let message = 'Failed to send follow-up. Please try again.';
        if (err instanceof ApiRequestError) {
          message = err.message;
        } else if (err instanceof Error && err.message) {
          message = err.message;
        }

        setError(message);
        setStatus('error');
        setStreamStatus(null);
        onUpdate(assistantId, {
          content: message,
          isStreaming: false,
        });
      }
    },
    [enabled, sessionId, status, feature, model, modeId, onAppend, onUpdate, onAcceptedResult],
  );

  return {
    status,
    error,
    isBusy: status === 'sending' || status === 'streaming',
    lastQuestion,
    streamStatus,
    send,
    clearError,
    abort,
  };
}
