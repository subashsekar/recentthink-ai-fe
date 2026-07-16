'use client';

import toast from 'react-hot-toast';
import { ModelSelectDropdown } from '@/components/model-selector';
import { useHackerRankChatStore } from '@/store/hackerrankChatStore';
import { useUpdateSessionModelMutation } from '@/hooks/hackerrank/useHackerRankMutations';
import { useEffectiveModelId } from '@/hooks/hackerrank/useEffectiveModelId';

interface ModelSelectorProps {
  className?: string;
  compact?: boolean;
}

export function ModelSelector({ className, compact }: ModelSelectorProps) {
  const selectedModelId = useHackerRankChatStore((s) => s.selectedModelId);
  const setSelectedModelId = useHackerRankChatStore((s) => s.setSelectedModelId);
  const activeSessionId = useHackerRankChatStore((s) => s.activeSessionId);
  const effectiveModelId = useEffectiveModelId();
  const updateSessionModel = useUpdateSessionModelMutation();

  const handleSelect = async (modelId: string) => {
    if (modelId === effectiveModelId) return;

    const previousId = selectedModelId;
    setSelectedModelId(modelId);

    if (!activeSessionId) return;

    try {
      await updateSessionModel.mutateAsync({ sessionId: activeSessionId, modelId });
    } catch {
      setSelectedModelId(previousId);
      toast.error('Failed to update model for this conversation.');
    }
  };

  return (
    <ModelSelectDropdown
      selectedModelId={selectedModelId}
      onChange={handleSelect}
      compact={compact}
      className={className}
      isUpdating={updateSessionModel.isPending}
    />
  );
}
