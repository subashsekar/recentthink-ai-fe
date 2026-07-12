'use client';

import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import {
  useCourseAdaptiveMutation,
  useUpdateCourseProgressMutation,
} from '@/hooks/courses/useCourseMutations';
import { handleCourseApiError } from '@/utils/courseError';
import { AdaptiveBanner } from '../AdaptiveBanner';
import type {
  CourseAdaptiveResponse,
  CourseGenerateResponse,
  CourseQuiz,
  CourseQuizQuestion,
} from '@/types/course';
import { cn } from '@/utils/cn';

interface QuizzesTabProps {
  course: CourseGenerateResponse;
}

function normalizeAnswer(value: string) {
  return value.trim().toLowerCase();
}

function isCorrect(question: CourseQuizQuestion, userAnswer: string) {
  return normalizeAnswer(userAnswer) === normalizeAnswer(question.answer);
}

function QuizCard({
  quiz,
  courseId,
  onAdaptive,
}: {
  quiz: CourseQuiz;
  courseId: string;
  onAdaptive: (result: CourseAdaptiveResponse) => void;
}) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  const [flashIndex, setFlashIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const adaptive = useCourseAdaptiveMutation();
  const updateProgress = useUpdateCourseProgressMutation();

  const scorePct = useMemo(() => {
    if (!quiz.questions?.length) return 0;
    const correct = quiz.questions.filter((q, i) => isCorrect(q, answers[i] ?? '')).length;
    return Math.round((correct / quiz.questions.length) * 100);
  }, [answers, quiz.questions]);

  const submit = async () => {
    setSubmitted(true);
    const pct = (() => {
      if (!quiz.questions?.length) return 0;
      const correct = quiz.questions.filter((q, i) => isCorrect(q, answers[i] ?? '')).length;
      return Math.round((correct / quiz.questions.length) * 100);
    })();
    try {
      await updateProgress.mutateAsync({
        course_id: courseId,
        current_week: quiz.week,
        quizzes_completed_delta: 1,
      });
      const result = await adaptive.mutateAsync({
        course_id: courseId,
        score_pct: pct,
        week: quiz.week,
        topic: quiz.title,
      });
      onAdaptive(result);
    } catch (err) {
      toast.error(handleCourseApiError(err, 'Could not load adaptive feedback.'));
    }
  };

  const flashcards = quiz.flashcards ?? [];
  const currentFlash = flashcards[flashIndex];

  return (
    <article className="space-y-4 rounded-2xl border border-border bg-surface/50 p-5">
      <div>
        <p className="text-xs text-primary">{quiz.week != null ? `Week ${quiz.week}` : 'Quiz'}</p>
        <h3 className="font-heading text-base font-semibold text-foreground">{quiz.title}</h3>
      </div>

      <div className="space-y-4">
        {(quiz.questions ?? []).map((question, qi) => {
          const type = (question.type || 'mcq').toLowerCase();
          return (
            <div key={`${quiz.title}-${qi}`} className="rounded-xl border border-border/70 p-4">
              <p className="text-sm font-medium text-foreground">
                {qi + 1}. {question.question}
              </p>
              <p className="mt-1 text-[11px] uppercase tracking-wide text-muted">
                {question.type} · {question.difficulty}
              </p>

              {(() => {
                const isTrueFalse =
                  type.includes('true') || type.includes('t/f') || type.includes('boolean');
                const isFreeText =
                  type.includes('fill') || type.includes('coding') || type.includes('short');
                const isMcq =
                  !isTrueFalse &&
                  !isFreeText &&
                  (type.includes('mcq') ||
                    type.includes('multiple') ||
                    (question.options?.length ?? 0) > 0);

                if (isMcq) {
                  return (
                    <div className="mt-3 space-y-2">
                      {(question.options ?? []).map((option) => (
                        <label
                          key={option}
                          className={cn(
                            'flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm',
                            answers[qi] === option
                              ? 'border-primary bg-primary/10'
                              : 'border-border hover:border-primary/30',
                            submitted &&
                              normalizeAnswer(option) === normalizeAnswer(question.answer) &&
                              'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/20',
                          )}
                        >
                          <input
                            type="radio"
                            name={`${quiz.title}-${qi}`}
                            disabled={submitted}
                            checked={answers[qi] === option}
                            onChange={() => setAnswers((prev) => ({ ...prev, [qi]: option }))}
                          />
                          {option}
                        </label>
                      ))}
                    </div>
                  );
                }

                if (isTrueFalse) {
                  return (
                    <div className="mt-3 flex gap-2">
                      {['True', 'False'].map((option) => (
                        <button
                          key={option}
                          type="button"
                          disabled={submitted}
                          onClick={() => setAnswers((prev) => ({ ...prev, [qi]: option }))}
                          className={cn(
                            'rounded-lg border px-4 py-2 text-sm',
                            answers[qi] === option
                              ? 'border-primary bg-primary/10'
                              : 'border-border hover:border-primary/30',
                          )}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  );
                }

                return (
                  <textarea
                    disabled={submitted}
                    value={answers[qi] ?? ''}
                    onChange={(e) => setAnswers((prev) => ({ ...prev, [qi]: e.target.value }))}
                    rows={type.includes('coding') ? 4 : 2}
                    className="mt-3 w-full rounded-lg border border-border bg-surface px-3 py-2 font-mono text-sm"
                    placeholder={type.includes('coding') ? 'Write your answer…' : 'Your answer…'}
                  />
                );
              })()}

              {submitted && (
                <div className="mt-3 rounded-lg bg-secondary-bg/80 px-3 py-2 text-sm">
                  <p
                    className={cn(
                      'font-medium',
                      isCorrect(question, answers[qi] ?? '') ? 'text-emerald-600' : 'text-error',
                    )}
                  >
                    {isCorrect(question, answers[qi] ?? '')
                      ? 'Correct'
                      : `Answer: ${question.answer}`}
                  </p>
                  {question.explanation && (
                    <p className="mt-1 text-secondary-text">{question.explanation}</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {quiz.questions?.length > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          <Button
            onClick={submit}
            disabled={submitted || adaptive.isPending || updateProgress.isPending}
            isLoading={adaptive.isPending || updateProgress.isPending}
            className="rounded-xl"
          >
            Submit quiz
          </Button>
          {submitted && (
            <span className="text-sm font-medium text-foreground">Score: {scorePct}%</span>
          )}
        </div>
      )}

      {flashcards.length > 0 && (
        <div className="border-t border-border pt-4">
          <Button type="button" variant="ghost" size="sm" onClick={() => setShowFlash((v) => !v)}>
            {showFlash ? 'Hide flashcards' : `Flashcards (${flashcards.length})`}
          </Button>
          {showFlash && currentFlash && (
            <div className="mt-3 space-y-3">
              <button
                type="button"
                onClick={() => setFlipped((v) => !v)}
                className="flex min-h-[120px] w-full items-center justify-center rounded-2xl border border-border bg-secondary-bg/50 p-6 text-center text-sm text-foreground"
              >
                {flipped ? currentFlash.back : currentFlash.front}
              </button>
              <div className="flex items-center justify-between text-xs text-muted">
                <button
                  type="button"
                  disabled={flashIndex === 0}
                  onClick={() => {
                    setFlashIndex((i) => Math.max(0, i - 1));
                    setFlipped(false);
                  }}
                  className="underline disabled:opacity-40"
                >
                  Previous
                </button>
                <span>
                  {flashIndex + 1} / {flashcards.length}
                </span>
                <button
                  type="button"
                  disabled={flashIndex >= flashcards.length - 1}
                  onClick={() => {
                    setFlashIndex((i) => Math.min(flashcards.length - 1, i + 1));
                    setFlipped(false);
                  }}
                  className="underline disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </article>
  );
}

export function QuizzesTab({ course }: QuizzesTabProps) {
  const quizzes = course.quizzes ?? [];
  const [adaptiveResult, setAdaptiveResult] = useState<CourseAdaptiveResponse | null>(null);

  if (quizzes.length === 0) {
    return <p className="text-sm text-muted">No quizzes available for this course.</p>;
  }

  return (
    <div className="space-y-4">
      {adaptiveResult && (
        <AdaptiveBanner result={adaptiveResult} onDismiss={() => setAdaptiveResult(null)} />
      )}
      {quizzes.map((quiz, index) => (
        <QuizCard
          key={quiz.id ?? `quiz-${index}`}
          quiz={quiz}
          courseId={course.course_id}
          onAdaptive={setAdaptiveResult}
        />
      ))}
    </div>
  );
}
