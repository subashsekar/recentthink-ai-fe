'use client';

import { useResolvedModelId } from '@/hooks/useAiModels';
import { useHackerRankChatStore } from '@/store/hackerrankChatStore';

export function useEffectiveModelId(): string | null {
  const selectedModelId = useHackerRankChatStore((s) => s.selectedModelId);
  return useResolvedModelId(selectedModelId);
}
