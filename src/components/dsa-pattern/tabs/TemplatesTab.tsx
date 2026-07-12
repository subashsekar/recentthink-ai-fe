'use client';

import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { PatternGenerateResponse } from '@/types/dsaPattern';
import { cn } from '@/utils/cn';

interface TemplatesTabProps {
  lesson: PatternGenerateResponse;
}

export function TemplatesTab({ lesson }: TemplatesTabProps) {
  const templates = lesson.templates ?? [];
  const languages = useMemo(
    () => Array.from(new Set(templates.map((t) => t.language).filter(Boolean))),
    [templates],
  );
  const [activeLang, setActiveLang] = useState(languages[0] ?? '');
  const [copied, setCopied] = useState(false);

  if (!templates.length) {
    return <p className="text-sm text-muted">No reusable templates in this lesson.</p>;
  }

  const current = templates.find((t) => t.language === activeLang) ?? templates[0];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(current.template);
      setCopied(true);
      toast.success('Template copied');
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error('Could not copy template');
    }
  };

  return (
    <div className="space-y-4">
      <div className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1">
        {languages.map((lang) => (
          <button
            key={lang}
            type="button"
            onClick={() => setActiveLang(lang)}
            className={cn(
              'shrink-0 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
              (activeLang || languages[0]) === lang
                ? 'bg-primary text-white'
                : 'text-secondary-text hover:bg-secondary-bg',
            )}
          >
            {lang}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-surface/50 p-4 sm:p-5">
        <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted">{current.language}</p>
            {current.description && (
              <p className="mt-1 text-sm text-secondary-text">{current.description}</p>
            )}
            {current.when_to_use && (
              <p className="mt-1 text-xs text-muted">When to use: {current.when_to_use}</p>
            )}
          </div>
          <Button size="sm" variant="outline" className="rounded-xl" onClick={() => void copy()}>
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Copied' : 'Copy'}
          </Button>
        </div>
        <pre className="overflow-x-auto rounded-xl border border-border bg-[#0b1220] p-4 font-mono text-xs leading-relaxed text-[#d7e6ff] sm:text-sm">
          {current.template}
        </pre>
      </div>
    </div>
  );
}
