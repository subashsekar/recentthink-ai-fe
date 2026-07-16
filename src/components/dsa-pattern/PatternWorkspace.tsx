'use client';

import { useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { ChevronDown, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useDsaPatternDashboard } from '@/hooks/dsa-pattern/useDsaPatternQueries';
import { useDeletePatternMutation } from '@/hooks/dsa-pattern/useDsaPatternMutations';
import { handlePatternApiError } from '@/utils/dsaPatternError';
import { ROUTES } from '@/constants';
import { cn } from '@/utils/cn';
import { useDsaPatternStore } from '@/store/dsaPatternStore';
import type { PatternHistoryDetail } from '@/types/dsaPattern';
import { PatternExportMenu } from './PatternExportMenu';
import { PatternModelSelector } from './PatternModelSelector';
import { OverviewTab } from './tabs/OverviewTab';
import { MentalModelTab } from './tabs/MentalModelTab';
import { RecognitionTab } from './tabs/RecognitionTab';
import { VisualizationTab } from './tabs/VisualizationTab';
import { TemplatesTab } from './tabs/TemplatesTab';
import { ExamplesTab } from './tabs/ExamplesTab';
import { InterviewTipsTab } from './tabs/InterviewTipsTab';
import { PatternComparisonTab } from './tabs/PatternComparisonTab';
import { PracticeTab } from './tabs/PracticeTab';
import { QuizTab } from './tabs/QuizTab';
import { NextPatternTab } from './tabs/NextPatternTab';
import { ChatTab } from './tabs/ChatTab';

const TABS = [
  { id: 'recognition', label: 'Recognition' },
  { id: 'overview', label: 'Overview' },
  { id: 'mental_model', label: 'Mental Model' },
  { id: 'visualization', label: 'Visualization' },
  { id: 'templates', label: 'Templates' },
  { id: 'examples', label: 'Examples' },
  { id: 'interview', label: 'Interview Tips' },
  { id: 'comparison', label: 'Comparison' },
  { id: 'practice', label: 'Practice' },
  { id: 'quiz', label: 'Quiz' },
  { id: 'next', label: 'Next Pattern' },
  { id: 'chat', label: 'Chat' },
] as const;

type TabId = (typeof TABS)[number]['id'];

interface PatternWorkspaceProps {
  lesson: PatternHistoryDetail;
}

export function PatternWorkspace({ lesson }: PatternWorkspaceProps) {
  const router = useRouter();
  const { data: dashboard } = useDsaPatternDashboard();
  const [tab, setTab] = useState<TabId>('recognition');
  const [traceOpen, setTraceOpen] = useState(false);
  const followUpRef = useRef<HTMLDivElement>(null);
  const deletePattern = useDeletePatternMutation();

  const patternSessionId = lesson.pattern_session_id || lesson.progress?.pattern_session_id || '';
  const title =
    lesson.overview?.pattern ||
    lesson.planner?.pattern ||
    lesson.pattern ||
    lesson.title ||
    'Pattern lesson';
  const meta = [
    lesson.level || lesson.request?.level,
    lesson.language || lesson.request?.language,
    lesson.learning_style || lesson.request?.learning_style,
  ]
    .filter(Boolean)
    .join(' · ');

  const visibleTabs = useMemo(() => {
    return TABS.filter((t) => {
      if (t.id === 'recognition' || t.id === 'overview' || t.id === 'chat') return true;
      if (t.id === 'mental_model') return Boolean(lesson.mental_model);
      if (t.id === 'visualization') return Boolean(lesson.visualization);
      if (t.id === 'templates') return (lesson.templates?.length ?? 0) > 0;
      if (t.id === 'examples') {
        return Boolean(lesson.easy_example || lesson.medium_example || lesson.hard_example);
      }
      if (t.id === 'interview') return Boolean(lesson.interview_tips);
      if (t.id === 'comparison') return (lesson.pattern_comparison?.length ?? 0) > 0;
      if (t.id === 'practice') return Boolean(lesson.practice);
      if (t.id === 'quiz') return Boolean(lesson.quiz);
      if (t.id === 'next') return Boolean(lesson.next_pattern_recommendation?.pattern);
      return true;
    });
  }, [lesson]);

  const openFollowUp = () => {
    setTab('chat');
    window.requestAnimationFrame(() => {
      followUpRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const onDelete = async () => {
    if (!lesson.session_id) return;
    if (!window.confirm('Delete this pattern lesson from history?')) return;
    try {
      await deletePattern.mutateAsync(lesson.session_id);
      toast.success('Pattern lesson deleted.');
      useDsaPatternStore.getState().startNewLesson();
      router.push(ROUTES.DSA_PATTERN);
    } catch (err) {
      toast.error(handlePatternApiError(err, 'Failed to delete.'));
    }
  };

  const progress = lesson.progress;
  const usage = lesson.usage;
  const streak = dashboard?.learning_streak;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_240px]">
      <div className="min-w-0 space-y-5">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-primary">
              DSA Pattern Coach
            </p>
            <h1 className="mt-1 truncate font-heading text-2xl font-semibold text-foreground">
              {title}
            </h1>
            <p className="mt-1 text-sm text-muted">{meta || 'Pattern lesson'}</p>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <PatternModelSelector compact menuPlacement="below" />
            <PatternExportMenu patternSessionId={patternSessionId} />
            <Button
              size="sm"
              variant="danger"
              className="rounded-xl"
              onClick={() => void onDelete()}
              isLoading={deletePattern.isPending}
            >
              <Trash2 size={16} />
              Delete
            </Button>
          </div>
        </header>

        {lesson.teacher_summary?.trim() && (
          <div className="rounded-2xl border border-border bg-surface/50 px-4 py-3 text-sm text-secondary-text">
            <span className="font-medium text-foreground">Teacher: </span>
            {lesson.teacher_summary.length > 220
              ? `${lesson.teacher_summary.slice(0, 220)}…`
              : lesson.teacher_summary}
          </div>
        )}

        <div className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1 scrollbar-none">
          {visibleTabs.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                if (item.id === 'chat') openFollowUp();
                else setTab(item.id);
              }}
              className={cn(
                'shrink-0 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
                tab === item.id
                  ? 'bg-primary text-white'
                  : 'text-secondary-text hover:bg-secondary-bg hover:text-foreground',
                item.id === 'recognition' && tab !== item.id && 'ring-1 ring-primary/25',
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="min-h-[320px] rounded-2xl border border-border bg-surface/40 p-4 sm:p-6">
          {tab === 'recognition' && <RecognitionTab lesson={lesson} />}
          {tab === 'overview' && <OverviewTab lesson={lesson} />}
          {tab === 'mental_model' && <MentalModelTab lesson={lesson} />}
          {tab === 'visualization' && <VisualizationTab lesson={lesson} />}
          {tab === 'templates' && <TemplatesTab lesson={lesson} />}
          {tab === 'examples' && <ExamplesTab lesson={lesson} />}
          {tab === 'interview' && <InterviewTipsTab lesson={lesson} />}
          {tab === 'comparison' && <PatternComparisonTab lesson={lesson} />}
          {tab === 'practice' && <PracticeTab lesson={lesson} />}
          {tab === 'quiz' && <QuizTab lesson={lesson} />}
          {tab === 'next' && <NextPatternTab lesson={lesson} />}
          {tab === 'chat' && (
            <p className="text-sm text-muted">
              Follow-up chat stays scoped to this pattern session — use the composer below.
            </p>
          )}
        </div>

        <div ref={followUpRef} id="pattern-follow-up">
          <ChatTab key={lesson.session_id ?? 'no-session'} lesson={lesson} variant="panel" />
        </div>

        {usage && (
          <footer className="flex flex-wrap gap-x-4 gap-y-1 rounded-xl border border-border/70 px-4 py-3 text-[11px] text-muted">
            {usage.total_tokens != null && <span>{usage.total_tokens} tokens</span>}
            {usage.latency_ms != null && <span>{usage.latency_ms} ms latency</span>}
            {usage.execution_time_ms != null && <span>{usage.execution_time_ms} ms execution</span>}
            {usage.estimated_cost != null && (
              <span>~${Number(usage.estimated_cost).toFixed(4)}</span>
            )}
            {usage.model && <span>{usage.model}</span>}
          </footer>
        )}

        {(lesson.execution_trace?.length ?? 0) > 0 && (
          <div className="rounded-xl border border-border">
            <button
              type="button"
              onClick={() => setTraceOpen((v) => !v)}
              className="flex w-full items-center justify-between px-4 py-3 text-left text-sm"
            >
              <span className="font-medium text-foreground">Execution trace</span>
              <ChevronDown
                size={16}
                className={cn('text-muted transition-transform', traceOpen && 'rotate-180')}
              />
            </button>
            {traceOpen && (
              <ul className="space-y-1 border-t border-border px-4 py-3 text-xs text-muted">
                {lesson.execution_trace!.map((node, i) => (
                  <li key={`${node.node}-${i}`} className="flex justify-between gap-2">
                    <span>{node.node}</span>
                    <span>{node.status}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <aside className="h-fit space-y-4 rounded-2xl border border-border bg-surface/40 p-5 lg:sticky lg:top-4">
        <h2 className="font-heading text-sm font-semibold text-foreground">Progress</h2>
        {progress ? (
          <>
            <div>
              <div className="mb-1 flex justify-between text-xs text-muted">
                <span>Completion</span>
                <span>{progress.completion_pct ?? 0}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-secondary-bg">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{
                    width: `${Math.min(100, Math.max(0, progress.completion_pct ?? 0))}%`,
                  }}
                />
              </div>
            </div>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-2">
                <dt className="text-muted">Practice done</dt>
                <dd className="font-medium text-foreground">{progress.practice_completed ?? 0}</dd>
              </div>
              {progress.quiz_score != null && (
                <div className="flex justify-between gap-2">
                  <dt className="text-muted">Quiz score</dt>
                  <dd className="font-medium text-foreground">{progress.quiz_score}%</dd>
                </div>
              )}
              <div className="flex justify-between gap-2">
                <dt className="text-muted">Study mins</dt>
                <dd className="font-medium text-foreground">{progress.study_minutes ?? 0}</dd>
              </div>
              {streak != null && (
                <div className="flex justify-between gap-2">
                  <dt className="text-muted">Streak</dt>
                  <dd className="font-medium text-foreground">{streak} days</dd>
                </div>
              )}
            </dl>
          </>
        ) : (
          <div className="flex items-center gap-2 text-sm text-muted">
            <Loader2 size={14} className="animate-spin" />
            No progress yet
          </div>
        )}

        <Button size="sm" variant="outline" className="w-full rounded-xl" onClick={openFollowUp}>
          Open follow-up chat
        </Button>
      </aside>
    </div>
  );
}
