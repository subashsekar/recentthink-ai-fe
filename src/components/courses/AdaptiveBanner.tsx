'use client';

import { Sparkles, TrendingUp, AlertTriangle } from 'lucide-react';
import type { CourseAdaptiveResponse } from '@/types/course';
import { cn } from '@/utils/cn';

interface AdaptiveBannerProps {
  result: CourseAdaptiveResponse;
  onDismiss?: () => void;
  className?: string;
}

export function AdaptiveBanner({ result, onDismiss, className }: AdaptiveBannerProps) {
  const isStruggling = result.performance === 'struggling';
  const isExcelling = result.performance === 'excelling';

  return (
    <div
      className={cn(
        'rounded-2xl border px-4 py-3',
        isStruggling && 'border-amber-300/50 bg-amber-50/80 dark:bg-amber-950/30',
        isExcelling && 'border-emerald-300/50 bg-emerald-50/80 dark:bg-emerald-950/30',
        !isStruggling && !isExcelling && 'border-primary/30 bg-primary/5',
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 text-primary">
          {isStruggling ? (
            <AlertTriangle size={18} className="text-amber-600" />
          ) : isExcelling ? (
            <TrendingUp size={18} className="text-emerald-600" />
          ) : (
            <Sparkles size={18} />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">
            {isStruggling
              ? 'Soft coaching tip'
              : isExcelling
                ? 'You are excelling'
                : 'You are on track'}
          </p>
          {result.recommendations?.length > 0 && (
            <ul className="mt-2 space-y-1 text-sm text-secondary-text">
              {result.recommendations.map((tip) => (
                <li key={tip}>• {tip}</li>
              ))}
            </ul>
          )}
          {(result.unlock_advanced || result.skip_basics) && (
            <p className="mt-2 text-xs font-medium text-primary">
              {result.unlock_advanced && 'Advanced material unlocked. '}
              {result.skip_basics && 'You can skip basics.'}
            </p>
          )}
        </div>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="text-xs text-muted underline hover:text-foreground"
          >
            Dismiss
          </button>
        )}
      </div>
    </div>
  );
}
