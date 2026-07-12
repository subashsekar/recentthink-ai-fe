'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/utils/cn';

const STEPS = [
  'Mapping the recognition guide…',
  'Building mental models & analogies…',
  'Drawing ASCII visualizations…',
  'Writing templates, examples & quiz…',
];

interface PatternGeneratingStateProps {
  className?: string;
}

export function PatternGeneratingState({ className }: PatternGeneratingStateProps) {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setStepIndex((prev) => (prev + 1) % STEPS.length);
    }, 8000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className={cn('glass-card space-y-6 p-6 sm:p-8', className)}>
      <div className="flex items-start gap-3">
        <Loader2 className="mt-0.5 h-5 w-5 shrink-0 animate-spin text-primary" />
        <div>
          <h2 className="font-heading text-lg font-semibold text-foreground">
            Crafting your pattern lesson…
          </h2>
          <p className="mt-1 text-sm text-muted">
            This usually takes 30–90 seconds. Keep this tab open.
          </p>
          <p className="mt-3 text-sm font-medium text-primary">{STEPS[stepIndex]}</p>
        </div>
      </div>

      <div className="space-y-3">
        <Skeleton className="h-8 w-2/3 bg-secondary-bg" />
        <Skeleton className="h-4 w-full bg-secondary-bg" />
        <Skeleton className="h-4 w-5/6 bg-secondary-bg" />
        <div className="grid gap-3 pt-2 sm:grid-cols-3">
          <Skeleton className="h-24 bg-secondary-bg" />
          <Skeleton className="h-24 bg-secondary-bg" />
          <Skeleton className="h-24 bg-secondary-bg" />
        </div>
        <Skeleton className="h-40 w-full bg-secondary-bg" />
      </div>
    </div>
  );
}
