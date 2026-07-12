'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Loader2, Star } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useAiModels } from '@/hooks/dsa-pattern/useDsaPatternQueries';
import { useDsaPatternStore } from '@/store/dsaPatternStore';
import { getModelById, getModelLabel, sortModels } from '@/utils/leetcodeModels';

interface PatternModelSelectorProps {
  className?: string;
  compact?: boolean;
}

export function PatternModelSelector({ className, compact }: PatternModelSelectorProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { data: modelsData, isLoading, isError, refetch } = useAiModels();
  const models = sortModels(modelsData?.models ?? []);
  const modelId = useDsaPatternStore((s) => s.form.model_id);
  const setForm = useDsaPatternStore((s) => s.setForm);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const activeModel = getModelById(modelId ?? undefined, models);
  const label = isLoading
    ? 'Loading models...'
    : isError
      ? 'Models unavailable'
      : activeModel
        ? activeModel.name
        : modelId
          ? getModelLabel(modelId, models)
          : 'Auto model';

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => {
          if (isError) {
            void refetch();
            return;
          }
          if (!isLoading) setOpen((v) => !v);
        }}
        disabled={isLoading}
        className={cn(
          'flex w-full items-center justify-between gap-1.5 rounded-lg border border-border bg-surface text-foreground transition-colors hover:border-primary/30',
          compact ? 'px-2.5 py-1.5 text-xs' : 'h-10 px-3 text-sm',
        )}
      >
        <span className="truncate">{label}</span>
        {isLoading ? <Loader2 size={14} className="animate-spin" /> : <ChevronDown size={14} />}
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-11 z-30 max-h-64 overflow-y-auto rounded-xl border border-border bg-surface shadow-lg">
          <button
            type="button"
            className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm hover:bg-secondary-bg"
            onClick={() => {
              setForm({ model_id: null });
              setOpen(false);
            }}
          >
            Auto model
          </button>
          {models.map((model) => (
            <button
              key={model.id}
              type="button"
              className={cn(
                'flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm hover:bg-secondary-bg',
                modelId === model.id && 'bg-primary/10 text-primary',
              )}
              onClick={() => {
                setForm({ model_id: model.id });
                setOpen(false);
              }}
            >
              {model.recommended && <Star size={12} className="shrink-0 text-amber-400" />}
              <span className="truncate">{model.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
