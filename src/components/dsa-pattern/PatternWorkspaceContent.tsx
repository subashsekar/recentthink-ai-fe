'use client';

import { useEffect } from 'react';
import { useDsaPatternStore } from '@/store/dsaPatternStore';
import { useDsaPatternDetail } from '@/hooks/dsa-pattern/useDsaPatternQueries';
import { PatternGenerateForm } from './PatternGenerateForm';
import { PatternWorkspace } from './PatternWorkspace';
import { PatternExampleCards } from './PatternExampleCards';
import { Skeleton } from '@/components/ui/Skeleton';

export function PatternWorkspaceContent() {
  const selectedSessionId = useDsaPatternStore((s) => s.selectedSessionId);
  const showNewForm = useDsaPatternStore((s) => s.showNewForm);
  const detail = useDsaPatternStore((s) => s.detail);
  const isGenerating = useDsaPatternStore((s) => s.isGenerating);
  const hydrateFromDetail = useDsaPatternStore((s) => s.hydrateFromDetail);

  const { data, isLoading, isFetching, isError, refetch } = useDsaPatternDetail(
    showNewForm ? null : selectedSessionId,
  );

  useEffect(() => {
    if (!data || !selectedSessionId) return;
    if (data.session_id !== selectedSessionId) return;
    if (detail?.session_id === selectedSessionId) return;
    hydrateFromDetail(data);
  }, [data, selectedSessionId, detail?.session_id, hydrateFromDetail]);

  const showForm = showNewForm || (!selectedSessionId && !detail);
  const loadingDetail =
    Boolean(selectedSessionId) &&
    !showNewForm &&
    !detail &&
    (isLoading || isFetching || isGenerating);

  return (
    <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-[24px] glass-panel shadow-lg">
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        {loadingDetail ? (
          <div className="space-y-4 p-6">
            <Skeleton className="h-8 w-1/2 bg-secondary-bg" />
            <Skeleton className="h-12 w-full bg-secondary-bg" />
            <Skeleton className="h-64 w-full bg-secondary-bg" />
          </div>
        ) : isError && selectedSessionId && !showForm ? (
          <div className="space-y-3 p-6">
            <p className="text-sm text-error">Failed to load pattern lesson.</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="rounded-xl border border-border px-3 py-1.5 text-sm"
            >
              Retry
            </button>
          </div>
        ) : showForm ? (
          <div className="space-y-6 p-4 sm:p-6">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-primary">
                RecentThink
              </p>
              <h1 className="mt-1 font-heading text-2xl font-semibold text-foreground sm:text-3xl">
                DSA Pattern Coach
              </h1>
              <p className="mt-2 text-sm text-muted">Learn how to identify DSA patterns</p>
            </div>
            <PatternExampleCards />
            <PatternGenerateForm embedded />
          </div>
        ) : detail ? (
          <div className="p-4 sm:p-6">
            <PatternWorkspace lesson={detail} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
