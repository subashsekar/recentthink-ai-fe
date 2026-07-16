'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, MessageSquare, RefreshCw, RotateCcw, Send, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/utils/cn';
import { FOLLOW_UP_SUGGESTIONS } from './data';
import { ModelSelector } from './ModelSelector';
import { MentorMessage } from './MentorMessage';
import { useChatStore } from '@/store/chatStore';
import { followUpAdaptive } from '@/services/api/followUpAdaptive';
import { useInvalidateLeetCodeQueries } from '@/hooks/leetcode/useLeetCodeMutations';
import { useEffectiveModelId } from '@/hooks/leetcode/useEffectiveModelId';
import { useEffectiveModeId } from '@/hooks/leetcode/useEffectiveModeId';
import { ApiRequestError } from '@/utils/apiError';
import { hasReportContent } from '@/utils/leetcodeSession';

function pickTeacherAnswer(payload: unknown): string {
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
        for (const nestedKey of ['content', 'output', 'text', 'message', 'response']) {
          const nestedVal = obj[nestedKey];
          if (typeof nestedVal === 'string' && nestedVal.trim()) return nestedVal.trim();
        }
      }
    }
  }
  return '';
}

export function PersistentMentorChat() {
  const [value, setValue] = useState('');
  const [lastQuestion, setLastQuestion] = useState<string | null>(null);
  const [lastAssistantId, setLastAssistantId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const activeSessionId = useChatStore((s) => s.activeSessionId);
  const conversation = useChatStore((s) => s.conversation);
  const isStreaming = useChatStore((s) => s.isStreaming);
  const isAnalyzing = useChatStore((s) => s.isAnalyzing);
  const applyFollowUpResult = useChatStore((s) => s.applyFollowUpResult);
  const setAnalyzing = useChatStore((s) => s.setAnalyzing);
  const setStreaming = useChatStore((s) => s.setStreaming);
  const appendConversationMessage = useChatStore((s) => s.appendConversationMessage);
  const updateConversationMessage = useChatStore((s) => s.updateConversationMessage);

  const chatEnabled = useChatStore((s) =>
    hasReportContent({
      activeSessionId: s.activeSessionId,
      session: s.session,
      problemStatement: s.problemStatement,
      problemStatementMarkdown: s.problemStatementMarkdown,
      problemStatementHtml: s.problemStatementHtml,
      roleContent: s.roleContent,
    }),
  );

  const effectiveModelId = useEffectiveModelId();
  const effectiveModeId = useEffectiveModeId();
  const { invalidateAll } = useInvalidateLeetCodeQueries();

  const isBusy = isStreaming || isAnalyzing;
  const canSend = Boolean(chatEnabled && activeSessionId && value.trim() && !isBusy);
  const suggestions = useMemo(() => FOLLOW_UP_SUGGESTIONS, []);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation, isBusy, chatEnabled]);

  const finalizeAssistant = (assistantId: string, content: string) => {
    updateConversationMessage(assistantId, {
      content,
      isStreaming: false,
    });
  };

  const sendFollowUp = useCallback(
    async (question: string, isRetry = false) => {
      if (!chatEnabled || !activeSessionId) {
        toast.error('Analyze a problem first to start chatting.');
        return;
      }

      const trimmed = question.trim();
      if (!trimmed || isBusy) return;

      setError(null);
      if (!isRetry) setLastQuestion(trimmed);

      const userId = `user-${crypto.randomUUID()}`;
      const assistantId = `assistant-${crypto.randomUUID()}`;
      setLastAssistantId(assistantId);

      appendConversationMessage({
        id: userId,
        role: 'user',
        content: trimmed,
        createdAt: new Date().toISOString(),
      });
      appendConversationMessage({
        id: assistantId,
        role: 'assistant',
        content: '',
        createdAt: new Date().toISOString(),
        isStreaming: true,
      });

      setAnalyzing(true);
      setStreaming(true);
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      let latestAnswer = '';
      let appliedResult = false;

      try {
        await followUpAdaptive(
          {
            session_id: activeSessionId,
            question: trimmed,
            model_id: effectiveModelId ?? undefined,
            mode_id: effectiveModeId || undefined,
          },
          {
            onJsonResponse: (payload) => {
              latestAnswer = pickTeacherAnswer(payload) || latestAnswer;
              applyFollowUpResult(payload);
              appliedResult = true;
              finalizeAssistant(assistantId, latestAnswer || 'No response received.');
            },
            onStreamEvent: (event) => {
              if (event.type === 'error') {
                throw new Error(event.message);
              }

              if (event.type === 'delta' && event.role === 'teacher') {
                latestAnswer = `${latestAnswer}${event.delta}`;
                updateConversationMessage(assistantId, {
                  content: latestAnswer,
                  isStreaming: true,
                });
                return;
              }

              if (event.type === 'message' && event.role === 'teacher') {
                latestAnswer = event.content || latestAnswer;
                updateConversationMessage(assistantId, {
                  content: latestAnswer,
                  isStreaming: true,
                });
                return;
              }

              if (event.type === 'complete') {
                latestAnswer = pickTeacherAnswer(event) || latestAnswer;
                if (!appliedResult) {
                  applyFollowUpResult(event);
                  appliedResult = true;
                }
                finalizeAssistant(assistantId, latestAnswer || 'No response received.');
                return;
              }

              if (event.type === 'done') {
                finalizeAssistant(assistantId, latestAnswer || 'No response received.');
              }
            },
          },
          abortRef.current.signal,
        );

        if (!appliedResult && latestAnswer) {
          applyFollowUpResult({ teacher: latestAnswer, session_id: activeSessionId });
          finalizeAssistant(assistantId, latestAnswer);
        } else if (!appliedResult && !latestAnswer) {
          finalizeAssistant(assistantId, 'No response received.');
        }

        setValue('');
        invalidateAll(activeSessionId);
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;

        let message = 'Failed to send follow-up. Please try again.';
        if (err instanceof ApiRequestError) {
          message = err.message;
        } else if (err instanceof Error && err.message) {
          message = err.message;
        }
        setError(message);
        toast.error(message);
        updateConversationMessage(assistantId, {
          content: message,
          isStreaming: false,
        });
      } finally {
        setAnalyzing(false);
        setStreaming(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      chatEnabled,
      activeSessionId,
      isBusy,
      effectiveModelId,
      effectiveModeId,
      appendConversationMessage,
      updateConversationMessage,
      applyFollowUpResult,
      setAnalyzing,
      setStreaming,
      invalidateAll,
    ],
  );

  const handleRetry = () => {
    if (lastQuestion) void sendFollowUp(lastQuestion, true);
  };
  const handleRegenerate = () => {
    if (lastQuestion) void sendFollowUp(lastQuestion, true);
  };
  const handleContinue = () => {
    void sendFollowUp('Continue from where you left off.');
  };

  return (
    <section className="border-t border-border px-5 py-6 lg:px-8">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <MessageSquare size={18} />
        </div>
        <div>
          <h2 className="font-heading text-base font-semibold text-foreground">AI Mentor Chat</h2>
          <p className="text-xs text-muted">Ask follow-up questions about the analyzed problem</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl glass-panel shadow-sm">
        <div className="max-h-[min(520px,55vh)] min-h-[220px] space-y-4 overflow-y-auto px-4 py-4 lg:px-5">
          {!chatEnabled ? (
            <div className="flex h-full min-h-[180px] flex-col items-center justify-center gap-3 px-4 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Sparkles size={22} />
              </div>
              <p className="max-w-md text-sm leading-relaxed text-muted">
                Paste a LeetCode URL and click Analyze to start an AI-guided discussion.
              </p>
            </div>
          ) : conversation.length === 0 ? (
            <div className="flex h-full min-h-[160px] flex-col items-center justify-center gap-2 px-4 text-center">
              <p className="text-sm text-foreground">
                Analysis ready — ask anything about this problem.
              </p>
              <p className="text-xs text-muted">
                Try “Explain again”, “Show Java solution”, or “Explain time complexity”.
              </p>
            </div>
          ) : (
            conversation.map((message) => {
              const isLastAssistant =
                message.role === 'assistant' && message.id === lastAssistantId;
              return (
                <MentorMessage
                  key={message.id}
                  message={message}
                  showActions={!message.isStreaming}
                  onRetry={isLastAssistant ? handleRetry : undefined}
                  onRegenerate={isLastAssistant ? handleRegenerate : undefined}
                  onContinue={isLastAssistant ? handleContinue : undefined}
                />
              );
            })
          )}

          {chatEnabled && isBusy && conversation.every((m) => !m.isStreaming) ? (
            <div className="chat-bubble-assistant inline-flex items-center gap-2 text-sm text-muted">
              <span className="inline-flex gap-1">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.2s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.1s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary" />
              </span>
              Mentor is typing…
            </div>
          ) : null}

          <div ref={bottomRef} />
        </div>

        <div className="border-t border-border px-4 py-3 lg:px-5">
          {error && (
            <div className="mb-3 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-error">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <p>{error}</p>
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={handleRetry}
                    className="inline-flex items-center gap-1 rounded-lg glass-panel px-2 py-1 text-xs font-medium text-foreground hover-surface"
                  >
                    <RefreshCw size={12} />
                    Retry
                  </button>
                  {lastQuestion ? (
                    <button
                      type="button"
                      onClick={handleRegenerate}
                      className="inline-flex items-center gap-1 rounded-lg glass-panel px-2 py-1 text-xs font-medium text-foreground hover-surface"
                    >
                      <RotateCcw size={12} />
                      Regenerate
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          )}

          <div className="mb-3 flex flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => {
                  if (!chatEnabled || isBusy) return;
                  setValue(suggestion);
                  textareaRef.current?.focus();
                }}
                disabled={!chatEnabled || isBusy}
                className="glass-chip rounded-full px-3 py-1.5 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-40"
              >
                {suggestion}
              </button>
            ))}
          </div>

          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (canSend) void sendFollowUp(value);
              }
            }}
            placeholder="Ask anything about this problem..."
            rows={2}
            disabled={!chatEnabled || isBusy}
            className="w-full resize-none bg-transparent text-sm text-foreground placeholder:text-muted focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          />

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <p className="text-[11px] text-muted">
              {chatEnabled
                ? 'Enter to send · Shift+Enter for new line'
                : 'Chat unlocks after Analyze succeeds'}
            </p>
            <div className="flex items-center gap-2">
              <ModelSelector compact />
              <button
                type="button"
                onClick={() => void sendFollowUp(value)}
                disabled={!canSend}
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-sm transition-all hover:bg-primary-hover',
                  !canSend && 'cursor-not-allowed opacity-50',
                )}
                aria-label="Send message"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
