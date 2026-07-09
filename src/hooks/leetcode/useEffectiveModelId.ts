'use client';

import { useChatStore } from '@/store/chatStore';
import { useAiModels } from './useLeetCodeQueries';
import { resolveDefaultModelId } from '@/utils/leetcodeModels';

/** Selected model, falling back to backend default when none is chosen. */
export function useEffectiveModelId(): string | null {
  const selectedModelId = useChatStore((s) => s.selectedModelId);
  const { data } = useAiModels();
  return selectedModelId ?? resolveDefaultModelId(data);
}
