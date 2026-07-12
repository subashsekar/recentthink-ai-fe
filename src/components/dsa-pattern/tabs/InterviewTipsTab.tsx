'use client';

import type { PatternGenerateResponse } from '@/types/dsaPattern';

interface InterviewTipsTabProps {
  lesson: PatternGenerateResponse;
}

function ListBlock({ title, items }: { title: string; items?: string[] }) {
  if (!items?.length) return null;
  return (
    <section className="space-y-2">
      <h3 className="font-heading text-sm font-semibold text-foreground">{title}</h3>
      <ul className="list-disc space-y-1 pl-5 text-sm text-secondary-text">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

export function InterviewTipsTab({ lesson }: InterviewTipsTabProps) {
  const tips = lesson.interview_tips;
  if (!tips) {
    return <p className="text-sm text-muted">Interview tips are not available yet.</p>;
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <ListBlock title="Interview questions" items={tips.interview_questions} />
      <ListBlock title="Hints" items={tips.hints} />
      <ListBlock title="Expected thought process" items={tips.expected_thought_process} />
      <ListBlock title="Follow-up questions" items={tips.follow_up_questions} />
      <ListBlock title="Optimization discussion" items={tips.optimization_discussion} />
    </div>
  );
}
