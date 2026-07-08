'use client';

import { useEffect } from 'react';
import { AlertCircle, MessageSquare, RefreshCw, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import { useChatStore } from '@/store/chatStore';
import { useSessionStatsData } from '@/hooks/leetcode/useSessionStatsData';
import { SESSION_STATS_FIELDS } from '@/utils/sessionStatsDisplay';

function StatRowSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-border/60 bg-secondary-bg/40 px-3 py-2.5">
      <div className="mb-1.5 h-2 w-20 rounded bg-border/70" />
      <div className="h-3.5 w-28 rounded bg-border/70" />
    </div>
  );
}

export function SessionStatsDrawer() {
  const statsDrawerOpen = useChatStore((s) => s.statsDrawerOpen);
  const setStatsDrawerOpen = useChatStore((s) => s.setStatsDrawerOpen);
  const { display, hasSession, isLoading, isError, error, refetch } = useSessionStatsData();

  useEffect(() => {
    if (!statsDrawerOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setStatsDrawerOpen(false);
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [statsDrawerOpen, setStatsDrawerOpen]);

  return (
    <AnimatePresence>
      {statsDrawerOpen && (
        <>
          <motion.button
            type="button"
            aria-label="Close session stats"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 bg-black/20"
            onClick={() => setStatsDrawerOpen(false)}
          />

          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Session stats"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed inset-y-0 right-0 z-50 flex w-[320px] flex-col rounded-l-[24px] border border-border bg-surface shadow-2xl"
          >
            <div className="flex items-start justify-between border-b border-border p-4">
              <div>
                <h2 className="font-heading text-base font-semibold text-foreground">
                  Session Stats
                </h2>
                <p className="mt-0.5 text-xs text-muted">Live metrics for the active session</p>
              </div>
              <button
                type="button"
                onClick={() => setStatsDrawerOpen(false)}
                className="rounded-xl p-1.5 text-muted transition-colors hover:bg-secondary-bg hover:text-foreground"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {!hasSession && (
                <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-secondary-bg/40 px-4 py-10 text-center">
                  <MessageSquare size={28} className="text-muted" />
                  <div>
                    <p className="text-sm font-medium text-foreground">No active session</p>
                    <p className="mt-1 text-xs text-muted">
                      Start or select a conversation to view session statistics.
                    </p>
                  </div>
                </div>
              )}

              {hasSession && isError && (
                <div className="flex flex-col items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-8 text-center">
                  <AlertCircle size={24} className="text-error" />
                  <p className="text-sm text-error">
                    {error instanceof Error ? error.message : 'Failed to load session stats.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => refetch()}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary-bg"
                  >
                    <RefreshCw size={12} />
                    Try again
                  </button>
                </div>
              )}

              {hasSession && !isError && isLoading && (
                <div className="space-y-2">
                  {Array.from({ length: SESSION_STATS_FIELDS.length }).map((_, index) => (
                    <StatRowSkeleton key={index} />
                  ))}
                </div>
              )}

              {hasSession && !isError && !isLoading && (
                <div className="space-y-2">
                  {SESSION_STATS_FIELDS.map((field) => (
                    <div
                      key={field.key}
                      className="rounded-xl border border-border/60 bg-secondary-bg/40 px-3 py-2.5"
                    >
                      <p className="text-[10px] font-medium uppercase tracking-wide text-muted">
                        {field.label}
                      </p>
                      <p
                        className={cn(
                          'mt-0.5 text-sm font-medium text-foreground',
                          field.key === 'problemTags' && 'whitespace-normal break-words',
                          field.key !== 'problemTags' && 'truncate',
                        )}
                      >
                        {display[field.key]}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
