'use client';

import { useEffect, useMemo } from 'react';
import { useChatStore } from '@/store/chatStore';
import {
  useAiModels,
  useLeetCodeModes,
  useLeetCodeSession,
} from '@/hooks/leetcode/useLeetCodeQueries';
import { getModelLabel } from '@/utils/leetcodeModels';
import { buildSessionStatsDisplay } from '@/utils/sessionStatsDisplay';
import { useEffectiveModeId } from './useEffectiveModeId';

export function useSessionStatsData() {
  const activeSessionId = useChatStore((s) => s.activeSessionId);
  const liveStats = useChatStore((s) => s.stats);
  const liveSession = useChatStore((s) => s.session);
  const selectedModelId = useChatStore((s) => s.selectedModelId);
  const effectiveModeId = useEffectiveModeId();
  const isStreaming = useChatStore((s) => s.isStreaming);
  const isAnalyzing = useChatStore((s) => s.isAnalyzing);
  const statsDrawerOpen = useChatStore((s) => s.statsDrawerOpen);

  const { data: modelsData } = useAiModels();
  const { data: modes = [] } = useLeetCodeModes();

  const {
    data: fetchedSession,
    isLoading,
    isError,
    error,
    refetch,
  } = useLeetCodeSession(activeSessionId);

  const session = fetchedSession ?? liveSession;
  const hasSession = Boolean(activeSessionId || session);

  useEffect(() => {
    if (!activeSessionId) return;
    void refetch();
  }, [activeSessionId, selectedModelId, refetch]);

  useEffect(() => {
    if (!activeSessionId) return;
    if (isStreaming || isAnalyzing) return;
    void refetch();
  }, [activeSessionId, isStreaming, isAnalyzing, liveStats, refetch]);

  useEffect(() => {
    if (statsDrawerOpen && activeSessionId) {
      void refetch();
    }
  }, [statsDrawerOpen, activeSessionId, refetch]);

  const modelLabel = getModelLabel(session?.model_id ?? selectedModelId, modelsData?.models ?? []);

  const modeLabel =
    modes.find((mode) => mode.id === (session?.mode_id ?? effectiveModeId))?.label ?? '';

  const display = useMemo(
    () =>
      buildSessionStatsDisplay({
        session,
        liveStats,
        modelLabel,
        modeLabel,
      }),
    [session, liveStats, modelLabel, modeLabel],
  );

  return {
    display,
    hasSession,
    session,
    isLoading: hasSession && isLoading && !session,
    isError: isError && !session,
    error,
    refetch,
  };
}
