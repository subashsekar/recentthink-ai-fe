'use client';

import { useCallback, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { FollowUpChat } from '@/components/follow-up-chat';
import { CourseMarkdown } from '../CourseMarkdown';
import { CourseModelSelector } from '../CourseModelSelector';
import { useCourseStore } from '@/store/courseStore';
import { useResolvedModelId } from '@/hooks/useAiModels';
import { courseKeys } from '@/hooks/courses/queryKeys';
import type { CourseHistoryDetail } from '@/types/course';
import type { FollowUpUiMessage } from '@/types/followUpChat';
import { historyToFollowUpMessages } from '@/utils/followUpChat';

interface ChatTabProps {
  course: CourseHistoryDetail;
  variant?: 'panel' | 'embedded';
}

export function ChatTab({ course, variant = 'panel' }: ChatTabProps) {
  const sessionId = course.session_id ?? null;
  const courseId = course.course_id;
  const queryClient = useQueryClient();
  const storeMessages = useCourseStore((s) =>
    sessionId ? (s.chatBySession[sessionId] ?? []) : [],
  );
  const selectedModelId = useCourseStore((s) => s.form.model_id ?? null);
  const effectiveModelId = useResolvedModelId(selectedModelId);
  const appendMessageToDetail = useCourseStore((s) => s.appendMessageToDetail);
  const updateMessageInDetail = useCourseStore((s) => s.updateMessageInDetail);
  const startNewCourse = useCourseStore((s) => s.startNewCourse);

  const messages = useMemo(
    () =>
      storeMessages.length > 0
        ? historyToFollowUpMessages(storeMessages)
        : historyToFollowUpMessages(course.messages),
    [storeMessages, course.messages],
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
    if (courseId) {
      void queryClient.invalidateQueries({ queryKey: courseKeys.detail(courseId) });
    }
  }, [queryClient, courseId]);

  return (
    <FollowUpChat
      key={sessionId ?? 'no-session'}
      feature="course_generator"
      sessionId={sessionId}
      enabled={Boolean(sessionId)}
      messages={messages}
      onAppend={onAppend}
      onUpdate={onUpdate}
      model={effectiveModelId}
      onAcceptedResult={onAcceptedResult}
      onStartNewSession={startNewCourse}
      variant={variant}
      className={variant === 'embedded' ? 'border-0 p-0' : undefined}
      modelSelector={<CourseModelSelector compact />}
      renderMarkdown={(content, isStreaming) => (
        <CourseMarkdown content={content} className={isStreaming ? 'opacity-90' : undefined} />
      )}
    />
  );
}
