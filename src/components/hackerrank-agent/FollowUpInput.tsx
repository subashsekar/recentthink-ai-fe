'use client';

import { useCallback } from 'react';
import { FollowUpChat } from '@/components/follow-up-chat';
import { ModelSelector } from './ModelSelector';
import { useHackerRankChatStore } from '@/store/hackerrankChatStore';
import { useEffectiveModelId } from '@/hooks/hackerrank/useEffectiveModelId';
import { useEffectiveModeId } from '@/hooks/hackerrank/useEffectiveModeId';
import { useInvalidateHackerRankQueries } from '@/hooks/hackerrank/useHackerRankMutations';
import { hasReportContent } from '@/utils/hackerrankSession';
import type { FollowUpUiMessage } from '@/types/followUpChat';

export function FollowUpInput() {
  const activeSessionId = useHackerRankChatStore((s) => s.activeSessionId);
  const conversation = useHackerRankChatStore((s) => s.conversation);
  const applyFollowUpResult = useHackerRankChatStore((s) => s.applyFollowUpResult);
  const appendConversationMessage = useHackerRankChatStore((s) => s.appendConversationMessage);
  const updateConversationMessage = useHackerRankChatStore((s) => s.updateConversationMessage);
  const startNewChat = useHackerRankChatStore((s) => s.startNewChat);

  const chatEnabled = useHackerRankChatStore((s) =>
    hasReportContent({
      activeSessionId: s.activeSessionId,
      session: s.session,
      problemStatement: s.problemStatement,
      problemStatementMarkdown: s.problemStatementMarkdown,
      problemStatementHtml: s.problemStatementHtml,
      roleContent: s.roleContent,
    }),
  );

  const effectiveModelId = useEffectiveModelId();
  const effectiveModeId = useEffectiveModeId();
  const { invalidateAll } = useInvalidateHackerRankQueries();

  const onAppend = useCallback(
    (message: FollowUpUiMessage) => {
      appendConversationMessage(message);
    },
    [appendConversationMessage],
  );

  const onUpdate = useCallback(
    (id: string, patch: Partial<FollowUpUiMessage>) => {
      updateConversationMessage(id, patch);
    },
    [updateConversationMessage],
  );

  const onAcceptedResult = useCallback(
    (payload: unknown) => {
      applyFollowUpResult(payload);
      if (activeSessionId) invalidateAll(activeSessionId);
    },
    [applyFollowUpResult, activeSessionId, invalidateAll],
  );

  return (
    <FollowUpChat
      feature="hackerrank"
      sessionId={activeSessionId}
      enabled={chatEnabled}
      messages={conversation}
      onAppend={onAppend}
      onUpdate={onUpdate}
      model={effectiveModelId}
      modeId={effectiveModeId}
      onAcceptedResult={onAcceptedResult}
      onStartNewSession={startNewChat}
      modelSelector={<ModelSelector compact />}
    />
  );
}
