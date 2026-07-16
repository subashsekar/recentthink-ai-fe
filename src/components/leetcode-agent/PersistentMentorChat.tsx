'use client';

import { useCallback, useMemo } from 'react';
import { FollowUpChat } from '@/components/follow-up-chat';
import { ModelSelector } from './ModelSelector';
import { useChatStore } from '@/store/chatStore';
import { useEffectiveModelId } from '@/hooks/leetcode/useEffectiveModelId';
import { useEffectiveModeId } from '@/hooks/leetcode/useEffectiveModeId';
import { useInvalidateLeetCodeQueries } from '@/hooks/leetcode/useLeetCodeMutations';
import { hasReportContent } from '@/utils/leetcodeSession';
import type { FollowUpUiMessage } from '@/types/followUpChat';
import type { MentorConversationMessage } from '@/utils/leetcodeConversation';

function toUiMessage(message: MentorConversationMessage): FollowUpUiMessage {
  return {
    id: message.id,
    role: message.role,
    content: message.content,
    createdAt: message.createdAt,
    isStreaming: message.isStreaming,
    intent: message.intent,
    rejected: message.rejected,
    contextMatch: message.contextMatch,
  };
}

export function PersistentMentorChat() {
  const activeSessionId = useChatStore((s) => s.activeSessionId);
  const conversation = useChatStore((s) => s.conversation);
  const applyFollowUpResult = useChatStore((s) => s.applyFollowUpResult);
  const appendConversationMessage = useChatStore((s) => s.appendConversationMessage);
  const updateConversationMessage = useChatStore((s) => s.updateConversationMessage);
  const startNewChat = useChatStore((s) => s.startNewChat);

  const chatEnabled = useChatStore((s) =>
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
  const { invalidateAll } = useInvalidateLeetCodeQueries();

  const messages = useMemo(() => conversation.map(toUiMessage), [conversation]);

  const onAppend = useCallback(
    (message: FollowUpUiMessage) => {
      appendConversationMessage({
        id: message.id,
        role: message.role,
        content: message.content,
        createdAt: message.createdAt,
        isStreaming: message.isStreaming,
        intent: message.intent,
        rejected: message.rejected,
        contextMatch: message.contextMatch,
      });
    },
    [appendConversationMessage],
  );

  const onUpdate = useCallback(
    (id: string, patch: Partial<FollowUpUiMessage>) => {
      updateConversationMessage(id, {
        content: patch.content,
        isStreaming: patch.isStreaming,
        intent: patch.intent,
        rejected: patch.rejected,
        contextMatch: patch.contextMatch,
      });
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
      feature="leetcode"
      sessionId={activeSessionId}
      enabled={chatEnabled}
      messages={messages}
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
