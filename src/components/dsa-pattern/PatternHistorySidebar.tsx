'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle, MoreVertical, Plus, RefreshCw, Search, Shapes, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/utils/cn';
import { ROUTES } from '@/constants';
import { useDsaPatternHistory } from '@/hooks/dsa-pattern/useDsaPatternQueries';
import { useDeletePatternMutation } from '@/hooks/dsa-pattern/useDsaPatternMutations';
import { dsaPatternApi } from '@/services/api/dsaPattern';
import { useDsaPatternStore } from '@/store/dsaPatternStore';
import { handlePatternApiError } from '@/utils/dsaPatternError';
import type { PatternHistoryItem } from '@/types/dsaPattern';
import { Badge } from '@/components/ui/Badge';

function formatRelativeTime(value: string): string {
  try {
    const date = new Date(value);
    const diffMs = Date.now() - date.getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
    }).format(date);
  } catch {
    return value;
  }
}

function ConversationSkeleton() {
  return (
    <div className="mb-1 animate-pulse rounded-xl border border-transparent bg-secondary-bg/60 px-3 py-3">
      <div className="h-4 w-3/4 rounded bg-border/80" />
      <div className="mt-2 h-3 w-1/2 rounded bg-border/60" />
    </div>
  );
}

function statusVariant(status: string): 'default' | 'success' | 'warning' | 'error' | 'info' {
  const s = status.toUpperCase();
  if (s === 'COMPLETED') return 'success';
  if (s === 'FAILED') return 'error';
  if (s === 'IN_PROGRESS' || s === 'PENDING') return 'info';
  return 'default';
}

export function PatternHistorySidebar() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const selectedSessionId = useDsaPatternStore((s) => s.selectedSessionId);
  const setSelectedSessionId = useDsaPatternStore((s) => s.setSelectedSessionId);
  const hydrateFromDetail = useDsaPatternStore((s) => s.hydrateFromDetail);
  const clearDetail = useDsaPatternStore((s) => s.clearDetail);

  const {
    data: history,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useDsaPatternHistory({
    limit: 50,
    offset: 0,
    q: debouncedQuery || undefined,
  });

  const deletePattern = useDeletePatternMutation();
  const items = history?.items ?? [];
  const menuItem = items.find((c) => c.session_id === menuOpenId);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(searchQuery.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpenId(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNew = () => {
    useDsaPatternStore.getState().startNewLesson();
    setMenuOpenId(null);
    router.push(ROUTES.DSA_PATTERN_NEW);
  };

  const handleSelect = async (item: PatternHistoryItem) => {
    setMenuOpenId(null);
    if (item.session_id === selectedSessionId) return;

    setSelectedSessionId(item.session_id);
    router.push(`${ROUTES.DSA_PATTERN}/session/${item.session_id}`);
    try {
      const detail = await dsaPatternApi.getHistoryDetail(item.session_id);
      hydrateFromDetail(detail);
    } catch (err) {
      toast.error(handlePatternApiError(err, 'Failed to load pattern lesson.'));
      clearDetail();
    }
  };

  const handleDelete = async (sessionId: string) => {
    if (!window.confirm('Delete this pattern lesson from history?')) return;
    try {
      await deletePattern.mutateAsync(sessionId);
      if (selectedSessionId === sessionId) {
        useDsaPatternStore.getState().startNewLesson();
        router.push(ROUTES.DSA_PATTERN);
      }
      setMenuOpenId(null);
      toast.success('Pattern lesson deleted.');
    } catch (err) {
      toast.error(handlePatternApiError(err, 'Failed to delete.'));
    }
  };

  return (
    <aside className="hidden w-full min-w-0 shrink-0 flex-col rounded-[24px] glass-panel shadow-lg lg:flex">
      <div className="border-b border-border p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-heading text-base font-semibold text-foreground">Recent lessons</h2>
          <div className="flex items-center gap-1">
            <Link
              href={ROUTES.DSA_PATTERN_DASHBOARD}
              className="rounded-lg px-2 py-1 text-[11px] font-medium text-primary hover:bg-secondary-bg"
            >
              Dashboard
            </Link>
            <button
              type="button"
              onClick={() => refetch()}
              className="rounded-lg p-1.5 text-muted hover:bg-secondary-bg hover:text-foreground"
              aria-label="Refresh history"
            >
              <RefreshCw size={14} className={cn(isFetching && 'animate-spin')} />
            </button>
          </div>
        </div>

        <div className="relative">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search patterns..."
            className="glass-input h-9 w-full rounded-xl py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/15"
          />
        </div>

        <button
          type="button"
          onClick={handleNew}
          className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-medium text-white shadow-sm transition-all hover:bg-primary-hover hover:shadow-[0_0_20px_rgba(79,157,255,0.25)]"
        >
          <Plus size={16} />
          New pattern lesson
        </button>
      </div>

      <div className="relative flex-1 overflow-y-auto p-2">
        {isLoading && (
          <div className="space-y-1 p-1">
            {Array.from({ length: 6 }).map((_, i) => (
              <ConversationSkeleton key={i} />
            ))}
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center gap-3 px-4 py-10 text-center">
            <AlertCircle size={28} className="text-error" />
            <p className="text-sm text-muted">
              {error instanceof Error ? error.message : 'Failed to load history.'}
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="rounded-xl border border-border px-3 py-1.5 text-xs font-medium text-foreground hover-surface"
            >
              Try again
            </button>
          </div>
        )}

        {!isLoading && !isError && items.length === 0 && (
          <div className="flex flex-col items-center gap-3 px-4 py-12 text-center">
            <Shapes size={28} className="text-muted" />
            <div>
              <p className="text-sm font-medium text-foreground">No lessons yet</p>
              <p className="mt-1 text-xs text-muted">Generate a pattern lesson to get started.</p>
            </div>
          </div>
        )}

        {!isLoading &&
          !isError &&
          items.map((item) => {
            const active = item.session_id === selectedSessionId;
            const title = item.title || item.pattern || 'Untitled pattern';
            return (
              <div
                key={item.session_id}
                className={cn(
                  'group relative mb-1 rounded-xl px-3 py-3 transition-colors',
                  active ? 'bg-primary/10 ring-1 ring-primary/30' : 'hover:bg-secondary-bg/80',
                  menuOpenId === item.session_id && 'ring-1 ring-primary/20',
                )}
              >
                <div className="flex items-start gap-2">
                  <button
                    type="button"
                    onClick={() => void handleSelect(item)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <p className="line-clamp-1 text-sm font-medium text-foreground">{title}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      {item.level && <span className="text-[11px] text-muted">{item.level}</span>}
                      {item.status && (
                        <Badge variant={statusVariant(String(item.status))} className="text-[10px]">
                          {item.status}
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 text-[11px] text-muted">
                      {formatRelativeTime(item.updated_at || item.created_at)}
                    </p>
                  </button>
                  <button
                    type="button"
                    className="mt-0.5 shrink-0 rounded-lg p-1 text-muted opacity-0 transition-all hover:bg-border hover:text-foreground group-hover:opacity-100"
                    onClick={() =>
                      setMenuOpenId((id) => (id === item.session_id ? null : item.session_id))
                    }
                    aria-label="More actions"
                  >
                    <MoreVertical size={14} />
                  </button>
                </div>

                {menuOpenId === item.session_id && menuItem && (
                  <div
                    ref={menuRef}
                    className="absolute right-2 top-10 z-20 w-40 overflow-hidden rounded-xl border border-border bg-surface shadow-lg"
                  >
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-error hover:bg-secondary-bg"
                      onClick={() => void handleDelete(item.session_id)}
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            );
          })}
      </div>

      <div className="border-t border-border px-4 py-2 text-[11px] text-muted">
        {history?.total ?? items.length} sessions
      </div>
    </aside>
  );
}
