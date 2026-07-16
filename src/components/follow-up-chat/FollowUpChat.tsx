'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AlertCircle, MessageSquare, RefreshCw, Send, Sparkles } from 'lucide-react';
import { cn } from '@/utils/cn';
import type { FollowUpFeature, FollowUpUiMessage } from '@/types/followUpChat';
import { useFollowUpChat } from '@/hooks/useFollowUpChat';
import { EMPTY_SESSION_HELPER } from '@/utils/followUpChat';
import { FOLLOW_UP_PLACEHOLDERS, FOLLOW_UP_SUGGESTIONS, FOLLOW_UP_TITLES } from './suggestions';
import { FollowUpMessage } from './FollowUpMessage';

export interface FollowUpChatProps {
  feature: FollowUpFeature;
  sessionId: string | null;
  enabled: boolean;
  messages: FollowUpUiMessage[];
  onAppend: (message: FollowUpUiMessage) => void;
  onUpdate: (id: string, patch: Partial<FollowUpUiMessage>) => void;
  model?: string | null;
  modeId?: string | null;
  onAcceptedResult?: (payload: unknown) => void;
  onStartNewSession?: () => void;
  suggestions?: string[];
  placeholder?: string;
  title?: string;
  subtitle?: string;
  className?: string;
  variant?: 'panel' | 'embedded';
  renderMarkdown?: (content: string, isStreaming?: boolean) => ReactNode;
  /** Optional model selector rendered next to send */
  modelSelector?: ReactNode;
}

export function FollowUpChat({
  feature,
  sessionId,
  enabled,
  messages,
  onAppend,
  onUpdate,
  model,
  modeId,
  onAcceptedResult,
  onStartNewSession,
  suggestions,
  placeholder,
  title,
  subtitle,
  className,
  variant = 'panel',
  renderMarkdown,
  modelSelector,
}: FollowUpChatProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const chat = useFollowUpChat({
    feature,
    sessionId,
    enabled,
    messages,
    onAppend,
    onUpdate,
    model,
    modeId,
    onAcceptedResult,
  });

  const chips = useMemo(
    () => suggestions ?? FOLLOW_UP_SUGGESTIONS[feature],
    [feature, suggestions],
  );
  const inputPlaceholder = placeholder ?? FOLLOW_UP_PLACEHOLDERS[feature];
  const heading = title ?? FOLLOW_UP_TITLES[feature];
  const canSend = Boolean(enabled && sessionId && value.trim() && !chat.isBusy);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chat.isBusy, enabled]);

  const focusComposer = () => {
    textareaRef.current?.focus();
  };

  const onSubmitValue = () => {
    if (!enabled || !sessionId || !value.trim() || chat.isBusy) return;
    const trimmed = value.trim();
    setValue('');
    void chat.send(trimmed);
  };

  const shellClass =
    variant === 'embedded'
      ? 'flex h-[min(70vh,720px)] flex-col rounded-2xl border border-border bg-surface/50'
      : 'overflow-hidden rounded-2xl glass-panel shadow-sm';

  return (
    <section
      className={cn(variant === 'panel' && 'border-t border-border px-5 py-6 lg:px-8', className)}
      data-testid="follow-up-chat"
      data-feature={feature}
    >
      {variant === 'panel' ? (
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <MessageSquare size={18} />
          </div>
          <div>
            <h2 className="font-heading text-base font-semibold text-foreground">{heading}</h2>
            <p className="text-xs text-muted">
              {subtitle ?? 'Ask follow-up questions about this learning session'}
            </p>
          </div>
        </div>
      ) : null}

      <div className={shellClass}>
        <div
          className={cn(
            'space-y-4 overflow-y-auto',
            variant === 'embedded'
              ? 'flex-1 p-4'
              : 'max-h-[min(520px,55vh)] min-h-[220px] px-4 py-4 lg:px-5',
          )}
        >
          {!enabled || !sessionId ? (
            <div className="flex h-full min-h-[160px] flex-col items-center justify-center gap-3 px-4 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Sparkles size={22} />
              </div>
              <p className="max-w-md text-sm leading-relaxed text-muted">{EMPTY_SESSION_HELPER}</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex h-full min-h-[140px] flex-col items-center justify-center gap-2 px-4 text-center">
              <p className="text-sm text-foreground">Session ready — ask a follow-up below.</p>
              <p className="text-xs text-muted">Questions stay scoped to this session only.</p>
            </div>
          ) : (
            messages.map((message) => (
              <FollowUpMessage
                key={message.id}
                message={message}
                feature={feature}
                onAskAboutSession={focusComposer}
                onStartNewSession={onStartNewSession}
                renderMarkdown={renderMarkdown}
              />
            ))
          )}

          {enabled && chat.isBusy && messages.every((m) => !m.isStreaming) ? (
            <div className="chat-bubble-assistant inline-flex items-center gap-2 text-sm text-muted">
              <span className="inline-flex gap-1">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.2s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.1s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary" />
              </span>
              {chat.streamStatus === 'thinking'
                ? 'Thinking…'
                : chat.streamStatus === 'generating'
                  ? 'Generating…'
                  : 'Mentor is typing…'}
            </div>
          ) : null}

          <div ref={bottomRef} />
        </div>

        <div className="border-t border-border px-4 py-3 lg:px-5">
          {chat.error ? (
            <div
              className="mb-3 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-error"
              data-testid="follow-up-error"
            >
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <p>{chat.error}</p>
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      chat.clearError();
                      if (chat.lastQuestion) void chat.send(chat.lastQuestion, { isRetry: true });
                    }}
                    className="inline-flex items-center gap-1 rounded-lg glass-panel px-2 py-1 text-xs font-medium text-foreground hover-surface"
                  >
                    <RefreshCw size={12} />
                    Retry
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          <div className="mb-3 flex flex-wrap gap-2">
            {chips.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => {
                  if (!enabled || !sessionId || chat.isBusy) return;
                  setValue(suggestion);
                  textareaRef.current?.focus();
                }}
                disabled={!enabled || !sessionId || chat.isBusy}
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
                onSubmitValue();
              }
            }}
            placeholder={enabled && sessionId ? inputPlaceholder : EMPTY_SESSION_HELPER}
            rows={2}
            disabled={!enabled || !sessionId || chat.isBusy}
            className="w-full resize-none bg-transparent text-sm text-foreground placeholder:text-muted focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={inputPlaceholder}
          />

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <p className="text-[11px] text-muted">
              {enabled && sessionId
                ? 'Enter to send · Shift+Enter for new line'
                : EMPTY_SESSION_HELPER}
            </p>
            <div className="flex items-center gap-2">
              {modelSelector}
              <button
                type="button"
                onClick={onSubmitValue}
                disabled={!canSend}
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-sm transition-all hover:bg-primary-hover',
                  !canSend && 'cursor-not-allowed opacity-50',
                )}
                aria-label="Send follow-up"
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
