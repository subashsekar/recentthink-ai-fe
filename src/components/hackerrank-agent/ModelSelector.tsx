'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Loader2, Star } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useAiModels } from '@/hooks/hackerrank/useHackerRankQueries';
import { useHackerRankChatStore } from '@/store/hackerrankChatStore';
import { getModelById, getModelLabel } from '@/utils/leetcodeModels';
import { useUpdateSessionModelMutation } from '@/hooks/hackerrank/useHackerRankMutations';
import { useEffectiveModelId } from '@/hooks/hackerrank/useEffectiveModelId';
import toast from 'react-hot-toast';

interface ModelSelectorProps {
  className?: string;
  compact?: boolean;
}

export function ModelSelector({ className, compact }: ModelSelectorProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { data: modelsData, isLoading, isError, refetch } = useAiModels();
  const models = modelsData?.models ?? [];
  const selectedModelId = useHackerRankChatStore((s) => s.selectedModelId);
  const setSelectedModelId = useHackerRankChatStore((s) => s.setSelectedModelId);
  const activeSessionId = useHackerRankChatStore((s) => s.activeSessionId);
  const effectiveModelId = useEffectiveModelId();
  const updateSessionModel = useUpdateSessionModelMutation();

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

  const handleSelect = async (modelId: string) => {
    if (modelId === effectiveModelId) {
      setOpen(false);
      return;
    }

    const previousId = selectedModelId;
    setSelectedModelId(modelId);
    setOpen(false);

    if (!activeSessionId) return;

    try {
      await updateSessionModel.mutateAsync({ sessionId: activeSessionId, modelId });
    } catch {
      setSelectedModelId(previousId);
      toast.error('Failed to update model for this conversation.');
    }
  };

  const activeModel = getModelById(effectiveModelId, models);

  const label = isLoading
    ? 'Loading models...'
    : isError
      ? 'Models unavailable'
      : activeModel
        ? activeModel.name
        : getModelLabel(effectiveModelId, models);

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => {
          if (!isLoading && !isError) setOpen((v) => !v);
        }}
        disabled={isLoading || isError || models.length === 0}
        className={cn(
          'flex items-center gap-1.5 rounded-xl border border-border bg-secondary-bg text-foreground transition-colors hover-surface/80',
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
          className="absolute bottom-full left-0 z-30 mb-2 max-h-[320px] w-[min(280px,calc(100vw-2rem))] overflow-y-auto rounded-xl glass-panel p-1 shadow-xl"
        >
          {models.map((model) => {
            const isActive = model.id === effectiveModelId;
            return (
              <button
                key={model.id}
                type="button"
                role="option"
                aria-selected={isActive}
                disabled={updateSessionModel.isPending}
                onClick={() => void handleSelect(model.id)}
                className={cn(
                  'flex w-full flex-col rounded-lg px-3 py-2.5 text-left transition-colors',
                  isActive ? 'bg-primary/10' : 'text-foreground hover-surface',
                )}
              >
                <div className="flex items-center gap-1.5">
                  {model.recommended ? (
                    <Star size={12} className="shrink-0 fill-amber-400 text-amber-400" />
                  ) : null}
                  <span
                    className={cn(
                      'truncate text-sm',
                      isActive ? 'font-semibold text-primary' : 'font-medium',
                    )}
                  >
                    {model.name}
                  </span>
                  {model.default ? (
                    <span className="shrink-0 rounded-md bg-secondary-bg px-1.5 py-0.5 text-[10px] font-medium text-muted">
                      Default
                    </span>
                  ) : null}
                </div>
                <p className="mt-0.5 truncate text-xs text-muted">
                  {model.provider}
                  {model.description ? ` · ${model.description}` : ''}
                </p>
              </button>
            );
          })}
        </div>
      )}

      {open && isError && (
        <div className="absolute bottom-full left-0 z-30 mb-2 min-w-[200px] rounded-xl glass-panel p-3 text-xs text-muted shadow-xl">
          <p>Could not load models.</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-2 font-medium text-primary hover:underline"
          >
            Try again
          </button>
        </div>
      )}
    </div>
  );
}
