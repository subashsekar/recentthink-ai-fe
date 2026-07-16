'use client';

import { useResolvedModelId } from '@/hooks/useAiModels';
import { useChatStore } from '@/store/chatStore';

export function useEffectiveModelId(): string | null {
  const selectedModelId = useChatStore((s) => s.selectedModelId);
  return useResolvedModelId(selectedModelId);
}
