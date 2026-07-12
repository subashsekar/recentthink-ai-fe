'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import toast from 'react-hot-toast';
import { Send } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { useCourseFollowUpMutation } from '@/hooks/courses/useCourseMutations';
import { courseKeys } from '@/hooks/courses/queryKeys';
import { useCourseStore } from '@/store/courseStore';
import { handleCourseApiError } from '@/utils/courseError';
import { CourseMarkdown } from '../CourseMarkdown';
import type { CourseHistoryDetail } from '@/types/course';
import { cn } from '@/utils/cn';

const QUICK_ACTIONS = [
  'Explain this lesson again',
  'More examples',
  'Extra quiz',
  'Next lesson recommendation',
  'Simplify this concept',
];

interface ChatTabProps {
  course: CourseHistoryDetail;
}

export function ChatTab({ course }: ChatTabProps) {
  const sessionId = course.session_id;
  const courseId = course.course_id;
  const queryClient = useQueryClient();
  const messages = useCourseStore((s) => (sessionId ? (s.chatBySession[sessionId] ?? []) : []));
  const appendMessageToDetail = useCourseStore((s) => s.appendMessageToDetail);
  const followUp = useCourseFollowUpMutation();
  const [question, setQuestion] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, followUp.isPending]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!sessionId || !trimmed || followUp.isPending) return;

    appendMessageToDetail({
      id: `user-${crypto.randomUUID()}`,
      role: 'user',
      content: trimmed,
      created_at: new Date().toISOString(),
    });
    setQuestion('');

    try {
      const res = await followUp.mutateAsync({
        session_id: sessionId,
        question: trimmed,
      });
      const teacher =
        (typeof res.teacher === 'string' && res.teacher) ||
        (typeof res.answer === 'string' && res.answer) ||
        (typeof res.content === 'string' && res.content) ||
        'No response received.';
      appendMessageToDetail({
        id: `assistant-${crypto.randomUUID()}`,
        role: 'assistant',
        agent_name: 'teacher',
        content: teacher,
        created_at: new Date().toISOString(),
      });
      if (courseId) {
        void queryClient.invalidateQueries({ queryKey: courseKeys.detail(courseId) });
      }
    } catch (err) {
      toast.error(handleCourseApiError(err, 'Follow-up failed.'));
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void send(question);
  };

  return (
    <div className="flex h-[min(70vh,720px)] flex-col rounded-2xl border border-border bg-surface/50">
      {!sessionId && (
        <div className="border-b border-border px-4 py-3 text-sm text-muted">
          Follow-up chat needs a session id from history detail.
        </div>
      )}
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.length === 0 && (
          <p className="text-sm text-muted">No saved messages yet. Ask a follow-up below.</p>
        )}
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              'max-w-[90%] rounded-2xl px-4 py-3 text-sm',
              message.role === 'user'
                ? 'ml-auto bg-primary text-white'
                : 'bg-secondary-bg text-foreground',
            )}
          >
            {message.role !== 'user' && message.agent_name && (
              <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-muted">
                {message.agent_name}
              </p>
            )}
            {message.role === 'user' ? (
              <p>{message.content}</p>
            ) : (
              <CourseMarkdown content={message.content} />
            )}
          </div>
        ))}
        {followUp.isPending && <p className="text-sm text-muted">Thinking…</p>}
        <div ref={bottomRef} />
      </div>

      <div className="space-y-3 border-t border-border p-4">
        <div className="flex flex-wrap gap-2">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action}
              type="button"
              disabled={followUp.isPending || !sessionId}
              onClick={() => void send(action)}
              className="rounded-full border border-border px-3 py-1 text-xs text-secondary-text transition-colors hover:border-primary/40 hover:text-foreground disabled:opacity-50"
            >
              {action}
            </button>
          ))}
        </div>
        <form onSubmit={onSubmit} className="flex gap-2">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a follow-up about this course…"
            className="h-11 flex-1 rounded-xl border border-border bg-surface px-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <Button
            type="submit"
            className="rounded-xl"
            isLoading={followUp.isPending}
            disabled={!sessionId}
          >
            <Send size={16} />
          </Button>
        </form>
      </div>
    </div>
  );
}
