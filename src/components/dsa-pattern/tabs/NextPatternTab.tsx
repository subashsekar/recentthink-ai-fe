'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useDsaPatternStore } from '@/store/dsaPatternStore';
import { ROUTES } from '@/constants';
import type { PatternGenerateResponse } from '@/types/dsaPattern';

interface NextPatternTabProps {
  lesson: PatternGenerateResponse;
}

export function NextPatternTab({ lesson }: NextPatternTabProps) {
  const router = useRouter();
  const recommendation = lesson.next_pattern_recommendation;
  const prefillPattern = useDsaPatternStore((s) => s.prefillPattern);

  if (!recommendation?.pattern) {
    return <p className="text-sm text-muted">No next-pattern recommendation yet.</p>;
  }

  const onGenerateNext = () => {
    prefillPattern(recommendation.pattern);
    router.push(ROUTES.DSA_PATTERN_NEW);
  };

  return (
    <div className="rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/10 via-surface/70 to-surface/40 p-6 sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
        Progress · Next pattern
      </p>
      <h2 className="mt-2 font-heading text-2xl font-semibold text-foreground">
        {recommendation.pattern}
      </h2>
      {recommendation.reason && (
        <p className="mt-3 text-sm leading-relaxed text-secondary-text">{recommendation.reason}</p>
      )}
      <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted">
        {recommendation.estimated_study_time && (
          <span>Est. {recommendation.estimated_study_time}</span>
        )}
        {Array.isArray(recommendation.prerequisites_met) &&
          recommendation.prerequisites_met.length > 0 && (
            <span>Prereqs: {recommendation.prerequisites_met.join(', ')}</span>
          )}
        {typeof recommendation.prerequisites_met === 'boolean' && (
          <span>Prerequisites {recommendation.prerequisites_met ? 'met' : 'not fully met'}</span>
        )}
      </div>
      <Button className="mt-6 rounded-2xl" size="lg" onClick={onGenerateNext}>
        Generate next pattern lesson
        <ArrowRight size={16} />
      </Button>
    </div>
  );
}
