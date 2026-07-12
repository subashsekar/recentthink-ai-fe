'use client';

import { useHackerRankChatStore } from '@/store/hackerrankChatStore';

/** Selected mode, falling back to backend-recommended (or "learning"). */
export function useEffectiveModeId(): string {
  const selectedModeId = useHackerRankChatStore((s) => s.selectedModeId);
  const defaultModeId = useHackerRankChatStore((s) => s.defaultModeId);
  return selectedModeId ?? defaultModeId;
}
