'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Loader2, Star } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useAiModels, useResolvedModelId } from '@/hooks/useAiModels';
import { getModelById, getModelLabel } from '@/utils/leetcodeModels';

export interface ModelSelectDropdownProps {
  selectedModelId: string | null;
  onChange: (modelId: string) => void | Promise<void>;
  disabled?: boolean;
  compact?: boolean;
  className?: string;
  /** Optional visible label rendered above the trigger */
  label?: string;
  /** Disable options while a session model update is in flight */
  isUpdating?: boolean;
  /** Menu opens above the trigger by default (matches LeetCode / HackerRank) */
  menuPlacement?: 'above' | 'below';
}

export function ModelSelectDropdown({
  selectedModelId,
  onChange,
  disabled = false,
  compact,
  className,
  label,
  isUpdating = false,
  menuPlacement = 'above',
}: ModelSelectDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { data: modelsData, isLoading, isError, refetch } = useAiModels();
  const models = modelsData?.models ?? [];
  const effectiveModelId = useResolvedModelId(selectedModelId);

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
    setOpen(false);
    await onChange(modelId);
  };

  const activeModel = getModelById(effectiveModelId, models);
  const triggerLabel = isLoading
    ? 'Loading models...'
    : isError
      ? 'Models unavailable'
      : activeModel
        ? activeModel.name
        : getModelLabel(effectiveModelId, models);

  const isDisabled = disabled || isLoading || isUpdating;
  const canOpen = !disabled && !isLoading && !isUpdating && !isError && models.length > 0;

  return (
    <div ref={ref} className={cn('relative', className)}>
      {label ? <p className="mb-1.5 text-xs font-medium text-muted">{label}</p> : null}
      <button
        type="button"
        onClick={() => {
          if (isError) {
            void refetch();
            return;
          }
          if (canOpen) setOpen((v) => !v);
        }}
        disabled={isDisabled}
        className={cn(
          'flex items-center gap-1.5 rounded-xl border border-border bg-secondary-bg text-foreground transition-colors hover-surface/80',
          compact ? 'px-2.5 py-1.5 text-xs' : 'px-3 py-2 text-sm',
          isDisabled && 'cursor-not-allowed opacity-70',
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label ?? 'Select model'}
      >
        {isLoading ? <Loader2 size={14} className="animate-spin text-muted" /> : null}
        <span className="max-w-[140px] truncate font-medium">{triggerLabel}</span>
        <ChevronDown size={14} className="shrink-0 text-muted" />
      </button>

      {open && models.length > 0 && (
        <div
          role="listbox"
          className={cn(
            'absolute left-0 z-30 max-h-[320px] w-[min(280px,calc(100vw-2rem))] overflow-y-auto rounded-xl glass-panel p-1 shadow-xl',
            menuPlacement === 'above' ? 'bottom-full mb-2' : 'top-full mt-2',
          )}
        >
          {models.map((model) => {
            const isActive = model.id === effectiveModelId;
            return (
              <button
                key={model.id}
                type="button"
                role="option"
                aria-selected={isActive}
                disabled={isUpdating || disabled}
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
        <div
          className={cn(
            'absolute left-0 z-30 min-w-[200px] rounded-xl glass-panel p-3 text-xs text-muted shadow-xl',
            menuPlacement === 'above' ? 'bottom-full mb-2' : 'top-full mt-2',
          )}
        >
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
