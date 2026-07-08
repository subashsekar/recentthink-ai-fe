'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useAiModels } from '@/hooks/leetcode/useLeetCodeQueries';
import { useChatStore } from '@/store/chatStore';
import { getModelLabel } from '@/utils/leetcodeModels';
import { useInvalidateLeetCodeQueries } from '@/hooks/leetcode/useLeetCodeMutations';

interface ModelSelectorProps {
  className?: string;
  compact?: boolean;
}

export function ModelSelector({ className, compact }: ModelSelectorProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { data: models = [], isLoading, isError } = useAiModels();
  const selectedModelId = useChatStore((s) => s.selectedModelId);
  const setSelectedModelId = useChatStore((s) => s.setSelectedModelId);
  const activeSessionId = useChatStore((s) => s.activeSessionId);
  const { invalidateSession } = useInvalidateLeetCodeQueries();

  useEffect(() => {
    if (!selectedModelId && models.length > 0) {
      setSelectedModelId(models[0].id);
    }
  }, [models, selectedModelId, setSelectedModelId]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (modelId: string) => {
    setSelectedModelId(modelId);
    setOpen(false);
    if (activeSessionId) {
      invalidateSession(activeSessionId);
    }
  };

  const label = isLoading
    ? 'Loading models...'
    : isError
      ? 'Models unavailable'
      : getModelLabel(selectedModelId, models);

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => !isLoading && !isError && setOpen((v) => !v)}
        disabled={isLoading || isError || models.length === 0}
        className={cn(
          'flex items-center gap-1.5 rounded-xl border border-border bg-secondary-bg text-foreground transition-colors hover:bg-secondary-bg/80',
          compact ? 'px-2.5 py-1.5 text-xs' : 'px-3 py-2 text-sm',
          (isLoading || isError) && 'cursor-not-allowed opacity-70',
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {isLoading ? <Loader2 size={14} className="animate-spin text-muted" /> : null}
        <span className="max-w-[140px] truncate font-medium">{label}</span>
        <ChevronDown size={14} className="shrink-0 text-muted" />
      </button>

      {open && models.length > 0 && (
        <div
          role="listbox"
          className="absolute bottom-full left-0 z-30 mb-2 min-w-[200px] overflow-hidden rounded-xl border border-border bg-surface p-1 shadow-xl"
        >
          {models.map((model) => {
            const isActive = model.id === selectedModelId;
            return (
              <button
                key={model.id}
                type="button"
                role="option"
                aria-selected={isActive}
                onClick={() => handleSelect(model.id)}
                className={cn(
                  'flex w-full items-center rounded-lg px-3 py-2 text-left text-sm transition-colors',
                  isActive
                    ? 'bg-primary/10 font-medium text-primary'
                    : 'text-foreground hover:bg-secondary-bg',
                )}
              >
                {model.name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
