'use client';

import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { useUpdatePatternProgressMutation } from '@/hooks/dsa-pattern/useDsaPatternMutations';
import { handlePatternApiError } from '@/utils/dsaPatternError';
import type { PatternGenerateResponse, PatternQuizQuestion } from '@/types/dsaPattern';
import { cn } from '@/utils/cn';

interface QuizTabProps {
  lesson: PatternGenerateResponse;
}

function normalizeAnswer(value: string) {
  return value.trim().toLowerCase();
}

function isCorrect(question: PatternQuizQuestion, userAnswer: string) {
  if (!question.answer) return false;
  return normalizeAnswer(userAnswer) === normalizeAnswer(question.answer);
}

function collectQuestions(lesson: PatternGenerateResponse): PatternQuizQuestion[] {
  const quiz = lesson.quiz;
  if (!quiz) return [];
  return [
    ...(quiz.mcqs ?? []),
    ...(quiz.recognition_questions ?? []),
    ...(quiz.scenario_questions ?? []),
    ...(quiz.coding_questions ?? []),
    ...(quiz.mini_assessment ?? []),
  ];
}

export function QuizTab({ lesson }: QuizTabProps) {
  const questions = useMemo(() => collectQuestions(lesson), [lesson]);
  const flashcards = lesson.quiz?.flashcards ?? [];
  const patternSessionId = lesson.pattern_session_id || lesson.progress?.pattern_session_id;

  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  const [flashIndex, setFlashIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const updateProgress = useUpdatePatternProgressMutation();

  const scorePct = useMemo(() => {
    if (!questions.length) return 0;
    const correct = questions.filter((q, i) => isCorrect(q, answers[i] ?? '')).length;
    return Math.round((correct / questions.length) * 100);
  }, [answers, questions]);

  const submit = async () => {
    const pct = (() => {
      if (!questions.length) return 0;
      const correct = questions.filter((q, i) => isCorrect(q, answers[i] ?? '')).length;
      return Math.round((correct / questions.length) * 100);
    })();
    setSubmitted(true);
    if (!patternSessionId) return;
    try {
      await updateProgress.mutateAsync({
        pattern_session_id: patternSessionId,
        quizzes_completed_delta: 1,
        quiz_score: pct,
      });
      toast.success(`Quiz scored ${pct}%`);
    } catch (err) {
      toast.error(handlePatternApiError(err, 'Could not save quiz score.'));
    }
  };

  const currentFlash = flashcards[flashIndex];

  if (!questions.length && !flashcards.length) {
    return <p className="text-sm text-muted">No quiz content in this lesson.</p>;
  }

  return (
    <div className="space-y-6">
      {lesson.quiz?.title && (
        <h3 className="font-heading text-base font-semibold text-foreground">
          {lesson.quiz.title}
        </h3>
      )}

      <div className="space-y-4">
        {questions.map((question, qi) => {
          const type = (question.type || 'mcq').toLowerCase();
          const isMcq = (question.options?.length ?? 0) > 0 || type.includes('mcq');
          return (
            <div
              key={`${question.question}-${qi}`}
              className="rounded-xl border border-border/70 p-4"
            >
              <p className="text-sm font-medium text-foreground">
                {qi + 1}. {question.question}
              </p>
              <p className="mt-1 text-[11px] uppercase tracking-wide text-muted">
                {[question.type, question.difficulty].filter(Boolean).join(' · ')}
              </p>

              {isMcq ? (
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
                          question.answer &&
                          normalizeAnswer(option) === normalizeAnswer(question.answer) &&
                          'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/20',
                      )}
                    >
                      <input
                        type="radio"
                        name={`pattern-quiz-${qi}`}
                        disabled={submitted}
                        checked={answers[qi] === option}
                        onChange={() => setAnswers((prev) => ({ ...prev, [qi]: option }))}
                      />
                      {option}
                    </label>
                  ))}
                </div>
              ) : (
                <textarea
                  disabled={submitted}
                  value={answers[qi] ?? ''}
                  onChange={(e) => setAnswers((prev) => ({ ...prev, [qi]: e.target.value }))}
                  rows={type.includes('coding') ? 4 : 2}
                  className="mt-3 w-full rounded-lg border border-border bg-surface px-3 py-2 font-mono text-sm"
                  placeholder="Your answer…"
                />
              )}

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
                      : `Answer: ${question.answer ?? '—'}`}
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

      {questions.length > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          <Button
            className="rounded-xl"
            onClick={() => void submit()}
            disabled={submitted}
            isLoading={updateProgress.isPending}
          >
            {submitted ? `Score: ${scorePct}%` : 'Submit quiz'}
          </Button>
          {submitted && (
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => {
                setAnswers({});
                setSubmitted(false);
              }}
            >
              Retry
            </Button>
          )}
        </div>
      )}

      {flashcards.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-sm font-semibold text-foreground">Flashcards</h3>
            <Button
              size="sm"
              variant="outline"
              className="rounded-xl"
              onClick={() => {
                setShowFlash((v) => !v);
                setFlipped(false);
              }}
            >
              {showFlash ? 'Hide' : 'Practice flashcards'}
            </Button>
          </div>

          {showFlash && currentFlash && (
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setFlipped((v) => !v)}
                className="flex min-h-[140px] w-full items-center justify-center rounded-2xl border border-border bg-surface/60 p-6 text-center transition-transform hover:border-primary/30"
              >
                <p className="text-sm text-foreground">
                  {flipped ? currentFlash.back : currentFlash.front}
                </p>
              </button>
              <div className="flex items-center justify-between text-xs text-muted">
                <button
                  type="button"
                  disabled={flashIndex === 0}
                  onClick={() => {
                    setFlashIndex((i) => Math.max(0, i - 1));
                    setFlipped(false);
                  }}
                  className="rounded-lg border border-border px-2 py-1 disabled:opacity-40"
                >
                  Prev
                </button>
                <span>
                  {flashIndex + 1} / {flashcards.length} · tap card to flip
                </span>
                <button
                  type="button"
                  disabled={flashIndex >= flashcards.length - 1}
                  onClick={() => {
                    setFlashIndex((i) => Math.min(flashcards.length - 1, i + 1));
                    setFlipped(false);
                  }}
                  className="rounded-lg border border-border px-2 py-1 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
