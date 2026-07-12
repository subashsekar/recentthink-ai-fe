'use client';

import { ReportContent } from '@/components/leetcode-agent/ReportContent';
import { toMarkdownString } from '@/components/courses/CourseMarkdown';
import { cn } from '@/utils/cn';

interface PatternMarkdownProps {
  content?: unknown;
  className?: string;
}

export function PatternMarkdown({ content, className }: PatternMarkdownProps) {
  const markdown = toMarkdownString(content).trim();
  if (!markdown) return null;
  return (
    <ReportContent
      markdown={markdown}
      className={cn('prose-sm max-w-none text-foreground/90', className)}
    />
  );
}
