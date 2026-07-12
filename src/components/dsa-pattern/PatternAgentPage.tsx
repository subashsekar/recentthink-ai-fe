'use client';

import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { IconRail } from '@/components/leetcode-agent/IconRail';
import { PatternHistorySidebar } from './PatternHistorySidebar';
import { PatternWorkspaceContent } from './PatternWorkspaceContent';
import { useDsaPatternStore } from '@/store/dsaPatternStore';
import { dsaPatternApi } from '@/services/api/dsaPattern';
import { handlePatternApiError } from '@/utils/dsaPatternError';

interface PatternAgentPageProps {
  sessionId?: string | null;
  mode?: 'default' | 'new';
}

export function PatternAgentPage({ sessionId = null, mode = 'default' }: PatternAgentPageProps) {
  const selectedSessionId = useDsaPatternStore((s) => s.selectedSessionId);
  const detailSessionId = useDsaPatternStore((s) => s.detail?.session_id ?? null);

  useEffect(() => {
    if (mode === 'new') {
      useDsaPatternStore.setState({
        selectedSessionId: null,
        detail: null,
        showNewForm: true,
        isGenerating: false,
      });
      return;
    }

    if (!sessionId) return;
    if (selectedSessionId === sessionId && detailSessionId === sessionId) return;

    useDsaPatternStore.setState({ selectedSessionId: sessionId, showNewForm: false });

    let cancelled = false;

    void (async () => {
      try {
        const next = await dsaPatternApi.getHistoryDetail(sessionId);
        if (!cancelled) {
          useDsaPatternStore.getState().hydrateFromDetail(next);
        }
      } catch (err) {
        if (!cancelled) {
          toast.error(handlePatternApiError(err, 'Failed to load pattern lesson.'));
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [sessionId, mode, selectedSessionId, detailSessionId]);

  return (
    <div className="min-h-0 w-full max-w-full overflow-x-hidden">
      <div className="grid min-h-0 w-full max-w-full grid-cols-1 gap-0 overflow-x-hidden lg:grid-cols-[72px_320px_minmax(0,1fr)] lg:gap-0">
        <IconRail />
        <PatternHistorySidebar />
        <PatternWorkspaceContent />
      </div>
    </div>
  );
}
