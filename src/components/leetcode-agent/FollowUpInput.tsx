'use client';

import { useEffect, useRef, useState } from 'react';
import { AlertCircle, RefreshCw, RotateCcw, Send } from 'lucide-react';
import { FOLLOW_UP_SUGGESTIONS } from './data';
import { ModelSelector } from './ModelSelector';
import { useChatStore } from '@/store/chatStore';
import { followUpAdaptive } from '@/services/api/followUpAdaptive';
import { useInvalidateLeetCodeQueries } from '@/hooks/leetcode/useLeetCodeMutations';
import { useEffectiveModelId } from '@/hooks/leetcode/useEffectiveModelId';
import { useEffectiveModeId } from '@/hooks/leetcode/useEffectiveModeId';
import { ApiRequestError } from '@/utils/apiError';
import toast from 'react-hot-toast';
import { cn } from '@/utils/cn';

export function FollowUpInput() {
  const [value, setValue] = useState('');
  const [lastQuestion, setLastQuestion] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const activeSessionId = useChatStore((s) => s.activeSessionId);
  const isStreaming = useChatStore((s) => s.isStreaming);
  const isAnalyzing = useChatStore((s) => s.isAnalyzing);
  const applyFollowUpResult = useChatStore((s) => s.applyFollowUpResult);
  const applyStreamEvent = useChatStore((s) => s.applyStreamEvent);
  const setAnalyzing = useChatStore((s) => s.setAnalyzing);
  const setStreaming = useChatStore((s) => s.setStreaming);
  const effectiveModelId = useEffectiveModelId();
  const effectiveModeId = useEffectiveModeId();
  const { invalidateAll } = useInvalidateLeetCodeQueries();

  const isBusy = isStreaming || isAnalyzing;
  const canSend = Boolean(activeSessionId && value.trim() && !isBusy);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const sendFollowUp = async (question: string, isRetry = false) => {
    if (!activeSessionId) {
      toast.error('Start or select a conversation first.');
      return;
    }

    const trimmed = question.trim();
    if (!trimmed) return;
    if (isBusy) return;

    setError(null);
    if (!isRetry) setLastQuestion(trimmed);
    setAnalyzing(true);
    setStreaming(false);
    abortRef.current?.abort();
    abortRef.current = new AbortController();

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
            applyFollowUpResult(payload);
          },
          onStreamEvent: (event) => {
            if (event.type === 'error') {
              throw new Error(event.message);
            }
            if (event.type === 'message' && event.role === 'teacher') {
              applyFollowUpResult({
                session_id: event.session_id,
                teacher: event.content,
              });
              return;
            }
            if (event.type === 'complete') {
              applyFollowUpResult(event);
              return;
            }
            applyStreamEvent(event);
          },
        },
        abortRef.current.signal,
      );

      setValue('');
      invalidateAll(activeSessionId);
      toast.success('Follow-up answer ready. See the Teacher tab.');
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
    } finally {
      setAnalyzing(false);
      setStreaming(false);
    }
  };

  const handleSend = () => void sendFollowUp(value);
  const handleRetry = () => {
    if (lastQuestion) void sendFollowUp(lastQuestion, true);
  };
  const handleRegenerate = () => {
    if (lastQuestion) void sendFollowUp(lastQuestion, true);
  };

  return (
    <section className="border-t border-border px-5 py-5 lg:px-8">
      <div className="rounded-2xl glass-panel p-4 shadow-sm">
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
                {lastQuestion && (
                  <button
                    type="button"
                    onClick={handleRegenerate}
                    className="inline-flex items-center gap-1 rounded-lg glass-panel px-2 py-1 text-xs font-medium text-foreground hover-surface"
                  >
                    <RotateCcw size={12} />
                    Regenerate
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              if (canSend) handleSend();
            }
          }}
          placeholder={
            activeSessionId
              ? 'Ask a follow-up question...'
              : 'Analyze a problem to start chatting...'
          }
          rows={2}
          disabled={!activeSessionId || isBusy}
          className="w-full resize-none bg-transparent text-sm text-foreground placeholder:text-muted focus:outline-none disabled:opacity-60"
        />

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {FOLLOW_UP_SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => setValue(suggestion)}
                disabled={!activeSessionId || isBusy}
                className="glass-chip rounded-full px-3 py-1.5 text-xs font-medium disabled:opacity-50"
              >
                {suggestion}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <ModelSelector compact />
            <button
              type="button"
              onClick={handleSend}
              disabled={!canSend}
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-sm transition-all hover:bg-primary-hover hover:shadow-[0_0_16px_rgba(79,157,255,0.3)]',
                !canSend && 'cursor-not-allowed opacity-50',
              )}
              aria-label="Send message"
            >
              <Send size={16} />
            </button>
          </div>
        </div>

        {isBusy && <p className="mt-2 text-xs text-muted">Generating response...</p>}
      </div>
    </section>
  );
}
