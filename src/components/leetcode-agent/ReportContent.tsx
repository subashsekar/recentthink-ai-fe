'use client';

import type { Components } from 'react-markdown';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';
import { plainTextToLeetCodeMarkdown } from '@/utils/formatProblemStatement';

export interface ReportContentProps {
  markdown?: string;
  html?: string;
  plain?: string;
  isLoading?: boolean;
  className?: string;
  /** LeetCode-style layout for problem statement (screen + PDF). */
  variant?: 'default' | 'leetcode-problem';
}

const leetcodeMarkdownComponents: Components = {
  h3: ({ children }) => (
    <h3 className="lc-section-title mb-2 mt-6 text-base font-semibold text-foreground first:mt-0">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="lc-paragraph mb-4 text-[15px] leading-7 text-foreground/90">{children}</p>
  ),
  strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
  code: ({ className, children, ...props }) => {
    const isBlock = Boolean(className);
    if (isBlock) {
      return (
        <code
          className={cn(
            'lc-code-block my-2 block overflow-x-auto rounded-lg bg-[#f7f8fa] px-4 py-3 font-mono text-[13px] leading-6 text-foreground',
            className,
          )}
          {...props}
        >
          {children}
        </code>
      );
    }
    return (
      <code
        className="lc-inline-code rounded px-1.5 py-0.5 font-mono text-[13px] text-foreground"
        {...props}
      >
        {children}
      </code>
    );
  },
  pre: ({ children }) => <pre className="lc-pre my-2 overflow-x-auto">{children}</pre>,
  ul: ({ children }) => (
    <ul className="lc-list my-3 list-disc space-y-2 pl-6 text-[15px] leading-7">{children}</ul>
  ),
  li: ({ children }) => <li className="text-foreground/90">{children}</li>,
};

export function ReportContent({
  markdown,
  html,
  plain,
  isLoading,
  className,
  variant = 'default',
}: ReportContentProps) {
  const resolvedMarkdown =
    markdown?.trim() ||
    (variant === 'leetcode-problem' && plain?.trim() ? plainTextToLeetCodeMarkdown(plain) : '');

  const hasContent = Boolean(resolvedMarkdown || html?.trim() || plain?.trim());

  if (isLoading && !hasContent) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted">
        <Loader2 size={16} className="animate-spin" />
        Generating response...
      </div>
    );
  }

  if (!hasContent) {
    return <p className="text-sm text-muted">No content available yet.</p>;
  }

  const isLeetCode = variant === 'leetcode-problem';

  if (html?.trim() && !resolvedMarkdown) {
    return (
      <div
        className={cn(
          isLeetCode ? 'leetcode-problem' : 'report-html',
          'prose prose-sm max-w-none text-sm leading-relaxed text-foreground',
          className,
        )}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  if (resolvedMarkdown) {
    return (
      <div
        className={cn(
          isLeetCode ? 'leetcode-problem' : 'report-markdown',
          'max-w-none text-sm leading-relaxed text-foreground',
          className,
        )}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={isLeetCode ? leetcodeMarkdownComponents : undefined}
        >
          {resolvedMarkdown}
        </ReactMarkdown>
      </div>
    );
  }

  return (
    <div className={cn('whitespace-pre-wrap text-sm leading-relaxed text-foreground', className)}>
      {plain}
    </div>
  );
}
