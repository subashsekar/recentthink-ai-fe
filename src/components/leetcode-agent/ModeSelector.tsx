'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { BookOpen, ChevronDown, Loader2, Star, Users, Zap, GraduationCap } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/utils/cn';
import { useChatStore } from '@/store/chatStore';
import { useLeetCodeModes } from '@/hooks/leetcode/useLeetCodeQueries';
import { useUpdateSessionModeMutation } from '@/hooks/leetcode/useLeetCodeMutations';
import { useEffectiveModeId } from '@/hooks/leetcode/useEffectiveModeId';
import type { ModeInfo } from '@/types/leetcode';

const DEFAULT_FALLBACK_MODE_ID = 'learning';

const iconMap = {
  book: BookOpen,
  zap: Zap,
  users: Users,
  graduation: GraduationCap,
} as const;

function getIcon(icon?: string) {
  if (!icon) return BookOpen;
  const key = icon.toLowerCase().trim() as keyof typeof iconMap;
  return iconMap[key] ?? BookOpen;
}

function computeDefaultModeId(modes: ModeInfo[]): string {
  const recommended = modes.find((m) => m.recommended)?.id;
  return recommended || modes[0]?.id || DEFAULT_FALLBACK_MODE_ID;
}

export function ModeSelector({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const { data, isLoading, isError } = useLeetCodeModes();
  const modes = useMemo(() => (data ?? []) as ModeInfo[], [data]);

  const activeSessionId = useChatStore((s) => s.activeSessionId);
  const sessionModeId = useChatStore((s) => s.session?.mode_id);
  const selectedModeId = useChatStore((s) => s.selectedModeId);
  const defaultModeId = useChatStore((s) => s.defaultModeId);
  const setModes = useChatStore((s) => s.setModes);
  const setDefaultModeId = useChatStore((s) => s.setDefaultModeId);
  const setSelectedModeId = useChatStore((s) => s.setSelectedModeId);
  const effectiveModeId = useEffectiveModeId();
  const updateSessionMode = useUpdateSessionModeMutation();

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

  useEffect(() => {
    if (modes.length === 0) return;
    setModes(modes);
    const computedDefault = computeDefaultModeId(modes);
    if (!defaultModeId) setDefaultModeId(computedDefault);
    if (!selectedModeId) {
      setSelectedModeId(sessionModeId ?? computedDefault);
    }
  }, [
    modes,
    setModes,
    defaultModeId,
    setDefaultModeId,
    selectedModeId,
    setSelectedModeId,
    sessionModeId,
  ]);

  useEffect(() => {
    if (!sessionModeId) return;
    setSelectedModeId(sessionModeId);
  }, [sessionModeId, setSelectedModeId]);

  useEffect(() => {
    if (isError) toast.error('Failed to load coaching modes.');
  }, [isError]);

  const activeMode = useMemo(
    () => modes.find((m) => m.id === effectiveModeId) ?? modes.find((m) => m.id === defaultModeId),
    [modes, effectiveModeId, defaultModeId],
  );

  const label = isLoading ? 'Loading modes…' : (activeMode?.label ?? 'Coaching Mode');

  const handleSelect = async (modeId: string) => {
    if (modeId === effectiveModeId) {
      setOpen(false);
      return;
    }

    const prev = selectedModeId ?? defaultModeId;
    setSelectedModeId(modeId);
    setOpen(false);

    if (!activeSessionId) return;

    try {
      await updateSessionMode.mutateAsync({ sessionId: activeSessionId, modeId });
    } catch {
      setSelectedModeId(prev);
      toast.error('Failed to update coaching mode for this conversation.');
    }
  };

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => {
          if (!isLoading && !isError) setOpen((v) => !v);
        }}
        disabled={isLoading || isError || modes.length === 0}
        className={cn(
          'flex items-center gap-2 rounded-xl border border-border bg-secondary-bg px-3 py-2 text-sm font-medium text-foreground transition-colors hover-surface/80',
          (isLoading || isError) && 'cursor-not-allowed opacity-70',
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {isLoading ? <Loader2 size={14} className="animate-spin text-muted" /> : null}
        <span className="max-w-[220px] truncate">{label}</span>
        <ChevronDown size={14} className="shrink-0 text-muted" />
      </button>

      {open && modes.length > 0 && (
        <div
          role="listbox"
          className="absolute top-full z-30 mt-2 w-[min(420px,calc(100vw-2rem))] overflow-hidden rounded-2xl glass-panel shadow-xl"
        >
          <div className="max-h-[340px] overflow-y-auto p-1">
            {modes.map((mode) => {
              const isActive = mode.id === effectiveModeId;
              const Icon = getIcon(mode.icon);
              return (
                <button
                  key={mode.id}
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  disabled={updateSessionMode.isPending}
                  onClick={() => void handleSelect(mode.id)}
                  className={cn(
                    'flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition-colors',
                    isActive ? 'bg-primary/10' : 'hover-surface',
                  )}
                >
                  <div
                    className={cn(
                      'mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl border',
                      isActive ? 'border-primary/30 bg-white' : 'border-border bg-secondary-bg',
                    )}
                  >
                    <Icon size={16} className={isActive ? 'text-primary' : 'text-muted'} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          'truncate text-sm',
                          isActive ? 'font-semibold text-primary' : 'font-medium text-foreground',
                        )}
                      >
                        {mode.label}
                      </span>
                      {mode.recommended ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                          <Star size={12} className="fill-amber-400 text-amber-400" />
                          Recommended
                        </span>
                      ) : null}
                    </div>
                    {mode.description ? (
                      <p className="mt-1 line-clamp-2 text-xs text-muted">{mode.description}</p>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
