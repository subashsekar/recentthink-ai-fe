'use client';

import Link from 'next/link';
import { Compass, MessageCircle, Sparkles } from 'lucide-react';
import type { FollowUpFeature } from '@/types/followUpChat';
import { ChatMarkdown } from '@/components/leetcode-agent/ChatMarkdown';
import { OTHER_AI_PRODUCTS } from './suggestions';

interface RejectedGuidanceCardProps {
  content: string;
  currentFeature: FollowUpFeature;
  onAskAboutSession: () => void;
  onStartNewSession?: () => void;
}

export function RejectedGuidanceCard({
  content,
  currentFeature,
  onAskAboutSession,
  onStartNewSession,
}: RejectedGuidanceCardProps) {
  const otherProducts = OTHER_AI_PRODUCTS.filter((p) => p.feature !== currentFeature);

  return (
    <div
      role="status"
      className="rounded-2xl border border-amber-200/80 bg-amber-50/90 px-4 py-4 text-sm text-amber-950 shadow-sm dark:border-amber-500/30 dark:bg-amber-950/40 dark:text-amber-50"
      data-testid="follow-up-rejected"
    >
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-amber-800 dark:text-amber-200">
        <Compass size={14} />
        Outside this session
      </div>
      <div className="prose-sm max-w-none text-[15px] leading-7">
        <ChatMarkdown content={content} />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onAskAboutSession}
          className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300/80 bg-white/80 px-3 py-1.5 text-xs font-medium text-amber-950 transition-colors hover:bg-white dark:border-amber-500/40 dark:bg-amber-900/50 dark:text-amber-50 dark:hover:bg-amber-900"
        >
          <MessageCircle size={13} />
          Ask about this session
        </button>
        {onStartNewSession ? (
          <button
            type="button"
            onClick={onStartNewSession}
            className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300/80 bg-white/80 px-3 py-1.5 text-xs font-medium text-amber-950 transition-colors hover:bg-white dark:border-amber-500/40 dark:bg-amber-900/50 dark:text-amber-50 dark:hover:bg-amber-900"
          >
            <Sparkles size={13} />
            Start a new session
          </button>
        ) : null}
      </div>
      <div className="mt-3">
        <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-amber-700/90 dark:text-amber-200/80">
          Open another AI product
        </p>
        <div className="flex flex-wrap gap-2">
          {otherProducts.map((product) => (
            <Link
              key={product.feature}
              href={product.href}
              className="rounded-full border border-amber-300/70 px-2.5 py-1 text-[11px] font-medium text-amber-900 transition-colors hover:bg-white/70 dark:border-amber-500/40 dark:text-amber-100 dark:hover:bg-amber-900/60"
            >
              {product.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
