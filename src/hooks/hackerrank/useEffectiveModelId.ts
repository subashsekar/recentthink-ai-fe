'use client';

import { useHackerRankChatStore } from '@/store/hackerrankChatStore';
import { useAiModels } from './useHackerRankQueries';
import { resolveDefaultModelId } from '@/utils/leetcodeModels';

/** Selected model, falling back to backend default when none is chosen. */
export function useEffectiveModelId(): string | null {
  const selectedModelId = useHackerRankChatStore((s) => s.selectedModelId);
  const { data } = useAiModels();
  return selectedModelId ?? resolveDefaultModelId(data);
}
