'use client';

import { useState, type ReactNode } from 'react';
import { Check, Copy, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/utils/cn';
import { ChatMarkdown } from '@/components/leetcode-agent/ChatMarkdown';
import type { FollowUpFeature, FollowUpUiMessage } from '@/types/followUpChat';
import { RejectedGuidanceCard } from './RejectedGuidanceCard';

interface FollowUpMessageProps {
  message: FollowUpUiMessage;
  feature: FollowUpFeature;
  onAskAboutSession?: () => void;
  onStartNewSession?: () => void;
  renderMarkdown?: (content: string, isStreaming?: boolean) => ReactNode;
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

export function FollowUpMessage({
  message,
  feature,
  onAskAboutSession,
  onStartNewSession,
  renderMarkdown,
}: FollowUpMessageProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';
  const isRejected = Boolean(message.rejected);

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

  if (isUser) {
    return (
      <article className="flex w-full justify-end" data-testid="follow-up-user">
        <div className="max-w-[min(100%,720px)] space-y-2">
          {message.createdAt ? (
            <div className="px-1 text-right text-[11px] text-muted/80">
              {formatTimestamp(message.createdAt)}
            </div>
          ) : null}
          <div className="chat-bubble-user ml-auto">
            <p className="whitespace-pre-wrap text-[15px] leading-7">{message.content}</p>
          </div>
        </div>
      </article>
    );
  }

  if (isRejected) {
    return (
      <article className="flex w-full justify-start">
        <div className="w-full max-w-[min(100%,720px)] space-y-2">
          <div className="flex items-center gap-2 px-1">
            <span className="inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-muted">
              <Sparkles size={12} className="text-primary" />
              Mentor
            </span>
            {message.createdAt ? (
              <span className="text-[11px] text-muted/80">
                {formatTimestamp(message.createdAt)}
              </span>
            ) : null}
          </div>
          <RejectedGuidanceCard
            content={message.content}
            currentFeature={feature}
            onAskAboutSession={() => onAskAboutSession?.()}
            onStartNewSession={onStartNewSession}
          />
        </div>
      </article>
    );
  }

  return (
    <article
      className="group flex w-full justify-start"
      data-testid="follow-up-assistant"
      data-rejected="false"
    >
      <div className="max-w-[min(100%,720px)] space-y-2">
        <div className="flex items-center gap-2 px-1">
          <span className="inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-muted">
            <Sparkles size={12} className="text-primary" />
            Mentor
          </span>
          {message.createdAt ? (
            <span className="text-[11px] text-muted/80">{formatTimestamp(message.createdAt)}</span>
          ) : null}
        </div>
        <div className="chat-bubble-assistant">
          {renderMarkdown ? (
            renderMarkdown(message.content, message.isStreaming)
          ) : (
            <ChatMarkdown content={message.content} isStreaming={message.isStreaming} />
          )}
        </div>
        {!message.isStreaming && message.content.trim() ? (
          <div
            className={cn(
              'flex flex-wrap items-center gap-1 px-1 opacity-100 transition-opacity',
              'sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100',
            )}
          >
            <button
              type="button"
              onClick={() => void handleCopy()}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] text-muted hover:bg-secondary-bg hover:text-foreground"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              Copy
            </button>
          </div>
        ) : null}
      </div>
    </article>
  );
}
