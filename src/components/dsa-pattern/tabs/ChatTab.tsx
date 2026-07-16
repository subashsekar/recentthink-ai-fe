'use client';

import { useCallback, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { FollowUpChat } from '@/components/follow-up-chat';
import { PatternMarkdown } from '../PatternMarkdown';
import { PatternModelSelector } from '../PatternModelSelector';
import { useDsaPatternStore } from '@/store/dsaPatternStore';
import { useResolvedModelId } from '@/hooks/useAiModels';
import { dsaPatternKeys } from '@/hooks/dsa-pattern/queryKeys';
import type { PatternHistoryDetail } from '@/types/dsaPattern';
import type { FollowUpUiMessage } from '@/types/followUpChat';
import { historyToFollowUpMessages } from '@/utils/followUpChat';

interface ChatTabProps {
  lesson: PatternHistoryDetail;
  variant?: 'panel' | 'embedded';
}

export function ChatTab({ lesson, variant = 'panel' }: ChatTabProps) {
  const sessionId = lesson.session_id ?? null;
  const queryClient = useQueryClient();
  const storeMessages = useDsaPatternStore((s) =>
    sessionId ? (s.chatBySession[sessionId] ?? []) : [],
  );
  const selectedModelId = useDsaPatternStore((s) => s.form.model_id ?? null);
  const effectiveModelId = useResolvedModelId(selectedModelId);
  const appendMessageToDetail = useDsaPatternStore((s) => s.appendMessageToDetail);
  const updateMessageInDetail = useDsaPatternStore((s) => s.updateMessageInDetail);
  const startNewLesson = useDsaPatternStore((s) => s.startNewLesson);

  const messages = useMemo(
    () =>
      storeMessages.length > 0
        ? historyToFollowUpMessages(storeMessages)
        : historyToFollowUpMessages(lesson.messages),
    [storeMessages, lesson.messages],
  );

  const onAppend = useCallback(
    (message: FollowUpUiMessage) => {
      appendMessageToDetail({
        id: message.id,
        role: message.role,
        agent_name: message.role === 'assistant' ? 'teacher' : null,
        content: message.content,
        created_at: message.createdAt,
        intent: message.intent,
        rejected: message.rejected,
        context_match: message.contextMatch,
        isStreaming: message.isStreaming,
      });
    },
    [appendMessageToDetail],
  );

  const onUpdate = useCallback(
    (id: string, patch: Partial<FollowUpUiMessage>) => {
      updateMessageInDetail(id, {
        content: patch.content,
        intent: patch.intent,
        rejected: patch.rejected,
        context_match: patch.contextMatch,
        isStreaming: patch.isStreaming,
      });
    },
    [updateMessageInDetail],
  );

  const onAcceptedResult = useCallback(() => {
    if (sessionId) {
      void queryClient.invalidateQueries({ queryKey: dsaPatternKeys.detail(sessionId) });
    }
  }, [queryClient, sessionId]);

  return (
    <FollowUpChat
      key={sessionId ?? 'no-session'}
      feature="dsa_pattern"
      sessionId={sessionId}
      enabled={Boolean(sessionId)}
      messages={messages}
      onAppend={onAppend}
      onUpdate={onUpdate}
      model={effectiveModelId}
      onAcceptedResult={onAcceptedResult}
      onStartNewSession={startNewLesson}
      variant={variant}
      className={variant === 'embedded' ? 'border-0 p-0' : undefined}
      modelSelector={<PatternModelSelector compact />}
      renderMarkdown={(content, isStreaming) => (
        <PatternMarkdown content={content} className={isStreaming ? 'opacity-90' : undefined} />
      )}
    />
  );
}
