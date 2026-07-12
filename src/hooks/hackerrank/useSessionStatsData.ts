'use client';

import { useEffect, useMemo } from 'react';
import { useHackerRankChatStore } from '@/store/hackerrankChatStore';
import { useAiModels, useHackerRankModes, useHackerRankSession } from './useHackerRankQueries';
import { getModelLabel } from '@/utils/leetcodeModels';
import { buildSessionStatsDisplay } from '@/utils/sessionStatsDisplay';
import { useEffectiveModeId } from './useEffectiveModeId';

export function useSessionStatsData() {
  const activeSessionId = useHackerRankChatStore((s) => s.activeSessionId);
  const liveStats = useHackerRankChatStore((s) => s.stats);
  const liveSession = useHackerRankChatStore((s) => s.session);
  const selectedModelId = useHackerRankChatStore((s) => s.selectedModelId);
  const effectiveModeId = useEffectiveModeId();
  const isStreaming = useHackerRankChatStore((s) => s.isStreaming);
  const isAnalyzing = useHackerRankChatStore((s) => s.isAnalyzing);
  const statsDrawerOpen = useHackerRankChatStore((s) => s.statsDrawerOpen);

  const { data: modelsData } = useAiModels();
  const { data: modes = [] } = useHackerRankModes();

  const {
    data: fetchedSession,
    isLoading,
    isError,
    error,
    refetch,
  } = useHackerRankSession(activeSessionId);

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
