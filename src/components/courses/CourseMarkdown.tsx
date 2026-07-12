'use client';

import { ReportContent } from '@/components/leetcode-agent/ReportContent';
import { cn } from '@/utils/cn';

interface CourseMarkdownProps {
  content?: unknown;
  className?: string;
}

/** Backend fields are often markdown strings, but sometimes objects/arrays. */
export function toMarkdownString(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === 'string') return `- ${item}`;
        if (item && typeof item === 'object') {
          const record = item as Record<string, unknown>;
          const text =
            record.text ??
            record.content ??
            record.description ??
            record.criterion ??
            record.title ??
            record.question;
          if (typeof text === 'string') return `- ${text}`;
          return `- ${JSON.stringify(item)}`;
        }
        return `- ${String(item)}`;
      })
      .join('\n');
  }
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    if (typeof record.markdown === 'string') return record.markdown;
    if (typeof record.content === 'string') return record.content;
    if (typeof record.text === 'string') return record.text;
    if (typeof record.description === 'string') return record.description;
    try {
      return `\`\`\`json\n${JSON.stringify(value, null, 2)}\n\`\`\``;
    } catch {
      return String(value);
    }
  }
  return '';
}

export function CourseMarkdown({ content, className }: CourseMarkdownProps) {
  const markdown = toMarkdownString(content).trim();
  if (!markdown) return null;
  return (
    <ReportContent
      markdown={markdown}
      className={cn('prose-sm max-w-none text-foreground/90', className)}
    />
  );
}
