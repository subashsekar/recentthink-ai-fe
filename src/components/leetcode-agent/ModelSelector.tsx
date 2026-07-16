'use client';

import toast from 'react-hot-toast';
import { ModelSelectDropdown } from '@/components/model-selector';
import { useChatStore } from '@/store/chatStore';
import { useUpdateSessionModelMutation } from '@/hooks/leetcode/useLeetCodeMutations';
import { useEffectiveModelId } from '@/hooks/leetcode/useEffectiveModelId';

interface ModelSelectorProps {
  className?: string;
  compact?: boolean;
}

export function ModelSelector({ className, compact }: ModelSelectorProps) {
  const selectedModelId = useChatStore((s) => s.selectedModelId);
  const setSelectedModelId = useChatStore((s) => s.setSelectedModelId);
  const activeSessionId = useChatStore((s) => s.activeSessionId);
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
