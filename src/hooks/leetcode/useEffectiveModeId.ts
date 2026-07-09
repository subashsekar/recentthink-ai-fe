'use client';

import { useChatStore } from '@/store/chatStore';

/** Selected mode, falling back to backend-recommended (or "learning"). */
export function useEffectiveModeId(): string {
  const selectedModeId = useChatStore((s) => s.selectedModeId);
  const defaultModeId = useChatStore((s) => s.defaultModeId);
  return selectedModeId ?? defaultModeId;
}
