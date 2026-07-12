'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, BookOpen, MoreVertical, Plus, RefreshCw, Search, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/utils/cn';
import { ROUTES } from '@/constants';
import { useCourseHistory } from '@/hooks/courses/useCourseQueries';
import { useDeleteCourseMutation } from '@/hooks/courses/useCourseMutations';
import { coursesApi } from '@/services/api/courses';
import { useCourseStore } from '@/store/courseStore';
import { handleCourseApiError } from '@/utils/courseError';
import type { CourseHistoryItem } from '@/types/course';
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
  if (s === 'MANUAL_REQUIRED') return 'warning';
  return 'default';
}

export function CourseHistorySidebar() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const selectedCourseId = useCourseStore((s) => s.selectedCourseId);
  const setSelectedCourseId = useCourseStore((s) => s.setSelectedCourseId);
  const hydrateFromDetail = useCourseStore((s) => s.hydrateFromDetail);
  const clearDetail = useCourseStore((s) => s.clearDetail);

  const {
    data: history,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useCourseHistory({
    limit: 50,
    offset: 0,
    q: debouncedQuery || undefined,
  });

  const deleteCourse = useDeleteCourseMutation();
  const items = history?.items ?? [];
  const menuItem = items.find((c) => c.course_id === menuOpenId);

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
    useCourseStore.setState({
      selectedCourseId: null,
      detail: null,
      showNewForm: true,
      isGenerating: false,
    });
    setMenuOpenId(null);
    router.push(ROUTES.COURSES_NEW);
  };

  const handleSelect = async (item: CourseHistoryItem) => {
    setMenuOpenId(null);
    if (item.course_id === selectedCourseId) return;

    setSelectedCourseId(item.course_id);
    router.push(`${ROUTES.COURSES}/${item.course_id}`);
    try {
      const detail = await coursesApi.getChatHistory(item.course_id);
      hydrateFromDetail(detail);
    } catch (err) {
      toast.error(handleCourseApiError(err, 'Failed to load course.'));
      clearDetail();
    }
  };

  const handleDelete = async (courseId: string) => {
    if (!window.confirm('Delete this course from history?')) return;
    try {
      await deleteCourse.mutateAsync(courseId);
      if (selectedCourseId === courseId) {
        useCourseStore.setState({
          selectedCourseId: null,
          detail: null,
          showNewForm: true,
          isGenerating: false,
        });
        router.push(ROUTES.COURSES);
      }
      setMenuOpenId(null);
      toast.success('Course deleted successfully.');
    } catch (err) {
      toast.error(handleCourseApiError(err, 'Failed to delete course.'));
    }
  };

  const totalLabel = history?.total ?? items.length;
  const showingCount = items.length;

  return (
    <aside className="hidden w-[320px] min-w-0 shrink-0 flex-col rounded-[24px] glass-panel shadow-lg lg:flex">
      <div className="border-b border-border p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-heading text-base font-semibold text-foreground">Chat history</h2>
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
            placeholder="Search chats..."
            className="glass-input h-9 w-full rounded-xl py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/15"
          />
        </div>

        <button
          type="button"
          onClick={handleNew}
          className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-medium text-white shadow-sm transition-all hover:bg-primary-hover hover:shadow-[0_0_20px_rgba(79,157,255,0.25)]"
        >
          <Plus size={16} />
          New course
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
            <BookOpen size={28} className="text-muted" />
            <div>
              <p className="text-sm font-medium text-foreground">No chats yet</p>
              <p className="mt-1 text-xs text-muted">Generate a learning path to get started.</p>
            </div>
            <button
              type="button"
              onClick={handleNew}
              className="rounded-xl bg-primary px-3 py-1.5 text-xs font-medium text-white"
            >
              New course
            </button>
          </div>
        )}

        {!isLoading &&
          !isError &&
          items.map((item) => (
            <HistoryItem
              key={item.course_id}
              item={item}
              isActive={selectedCourseId === item.course_id}
              menuOpen={menuOpenId === item.course_id}
              onSelect={() => void handleSelect(item)}
              onMenuToggle={() =>
                setMenuOpenId((prev) => (prev === item.course_id ? null : item.course_id))
              }
            />
          ))}

        {menuOpenId && menuItem && (
          <div
            ref={menuRef}
            className="absolute left-2 right-2 z-20 rounded-2xl glass-panel p-2 shadow-xl"
            style={{
              top: `${Math.max(8, items.findIndex((c) => c.course_id === menuOpenId) * 72 + 8)}px`,
            }}
          >
            <button
              type="button"
              onClick={() => void handleDelete(menuItem.course_id)}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-error transition-colors hover:bg-red-50 dark:hover:bg-red-950/30"
            >
              <Trash2 size={15} />
              Delete
            </button>
            <div className="mt-2 space-y-1 border-t border-border px-3 pb-1 pt-2 text-xs text-muted">
              <p>
                <span className="text-foreground/70">Updated:</span>{' '}
                {formatRelativeTime(menuItem.updated_at || menuItem.created_at)}
              </p>
              <p>
                <span className="text-foreground/70">Status:</span> {menuItem.status}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-border px-4 py-3 text-xs text-muted">
        <span>
          {isLoading
            ? 'Loading...'
            : `Showing ${showingCount}${totalLabel ? ` of ${totalLabel}` : ''} chats`}
        </span>
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="rounded-lg p-1 transition-colors hover-surface hover:text-foreground disabled:opacity-50"
          aria-label="Refresh chat history"
        >
          <RefreshCw size={14} className={cn(isFetching && 'animate-spin')} />
        </button>
      </div>
    </aside>
  );
}

function HistoryItem({
  item,
  isActive,
  menuOpen,
  onSelect,
  onMenuToggle,
}: {
  item: CourseHistoryItem;
  isActive: boolean;
  menuOpen: boolean;
  onSelect: () => void;
  onMenuToggle: () => void;
}) {
  const subtitle =
    item.skill && item.goal
      ? `${item.skill} → ${item.goal}`
      : item.skill || item.goal || item.level || 'Learning path';
  const pct = Math.min(100, Math.max(0, item.completion_pct ?? 0));
  const showStatus = String(item.status || '').toUpperCase() !== 'COMPLETED';

  return (
    <div
      className={cn(
        'group relative mb-1 rounded-xl px-3 py-2.5 transition-colors',
        isActive ? 'nav-item-active' : 'hover-row',
        menuOpen && 'ring-1 ring-primary/20',
      )}
    >
      <div className="flex items-start gap-2">
        <button type="button" onClick={onSelect} className="min-w-0 flex-1 text-left">
          <p className="truncate text-sm font-medium text-foreground">
            {item.title || item.skill || 'Untitled course'}
          </p>
          <p className="mt-0.5 truncate text-xs text-muted">{subtitle}</p>
          {item.preview?.trim() && (
            <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-secondary-text">
              {item.preview}
            </p>
          )}
          <div className="mt-2 flex items-center gap-2">
            <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-secondary-bg">
              <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
            </div>
            <span className="shrink-0 text-[10px] text-muted">{pct}%</span>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            {showStatus && (
              <Badge variant={statusVariant(String(item.status))} className="text-[10px]">
                {item.status}
              </Badge>
            )}
            {typeof item.message_count === 'number' && (
              <span className="text-[10px] text-muted">{item.message_count} msgs</span>
            )}
            <span className="text-[10px] text-muted">
              {formatRelativeTime(item.updated_at || item.created_at)}
            </span>
          </div>
        </button>
        <button
          type="button"
          onClick={onMenuToggle}
          className={cn(
            'mt-0.5 shrink-0 rounded-lg p-1 text-muted transition-all nav-item-hover hover:text-foreground',
            menuOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
          )}
          aria-label="Chat options"
        >
          <MoreVertical size={14} />
        </button>
      </div>
    </div>
  );
}
