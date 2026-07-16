'use client';

import { useState } from 'react';
import { Check, Copy, CornerDownLeft, Loader2, RefreshCw, RotateCcw, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/utils/cn';
import { ChatMarkdown } from './ChatMarkdown';
import type { MentorConversationMessage } from '@/utils/leetcodeConversation';

interface MentorMessageProps {
  message: MentorConversationMessage;
  onRetry?: () => void;
  onRegenerate?: () => void;
  onContinue?: () => void;
  showActions?: boolean;
}

function formatTimestamp(iso: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(iso));
  } catch {
    return '';
  }
}

export function MentorMessage({
  message,
  onRetry,
  onRegenerate,
  onContinue,
  showActions = true,
}: MentorMessageProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      toast.success('Copied to clipboard');
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error('Could not copy');
    }
  };

  return (
    <article className={cn('group flex w-full', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn('max-w-[min(100%,720px)] space-y-2', isUser ? 'items-end' : 'items-start')}
      >
        <div className="flex items-center gap-2 px-1">
          {!isUser && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-muted">
              <Sparkles size={12} className="text-primary" />
              {message.isAnalysis ? 'Analysis' : 'Mentor'}
            </span>
          )}
          {message.createdAt ? (
            <span className="text-[11px] text-muted/80">{formatTimestamp(message.createdAt)}</span>
          ) : null}
        </div>

        <div className={cn(isUser ? 'chat-bubble-user ml-auto' : 'chat-bubble-assistant')}>
          {isUser ? (
            <p className="whitespace-pre-wrap text-[15px] leading-7">{message.content}</p>
          ) : (
            <ChatMarkdown content={message.content} isStreaming={message.isStreaming} />
          )}
        </div>

        {!isUser && showActions && !message.isStreaming && message.content.trim() ? (
          <div className="flex flex-wrap items-center gap-1 px-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100">
            <button
              type="button"
              onClick={() => void handleCopy()}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] text-muted hover:bg-secondary-bg hover:text-foreground"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              Copy
            </button>
            {onRetry ? (
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] text-muted hover:bg-secondary-bg hover:text-foreground"
              >
                <RefreshCw size={12} />
                Retry
              </button>
            ) : null}
            {onRegenerate ? (
              <button
                type="button"
                onClick={onRegenerate}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] text-muted hover:bg-secondary-bg hover:text-foreground"
              >
                <RotateCcw size={12} />
                Regenerate
              </button>
            ) : null}
            {onContinue ? (
              <button
                type="button"
                onClick={onContinue}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] text-muted hover:bg-secondary-bg hover:text-foreground"
              >
                <CornerDownLeft size={12} />
                Continue
              </button>
            ) : null}
          </div>
        ) : null}

        {message.isStreaming && !message.content.trim() ? (
          <div className="flex items-center gap-2 px-1 text-xs text-muted">
            <Loader2 size={12} className="animate-spin" />
            Generating…
          </div>
        ) : null}
      </div>
    </article>
  );
}
