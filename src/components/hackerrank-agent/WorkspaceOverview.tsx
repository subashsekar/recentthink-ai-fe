'use client';

import { Activity, Flame, Target, TrendingUp } from 'lucide-react';
import {
  useHackerRankExamples,
  useHackerRankHistory,
  useHackerRankProgress,
} from '@/hooks/hackerrank/useHackerRankQueries';
import { cn } from '@/utils/cn';
import toast from 'react-hot-toast';

const QUICK_ACTIONS = ['Algorithms', 'SQL', 'Java', 'Python'] as const;

interface WorkspaceOverviewProps {
  onQuickAction: (url: string) => void;
}

export function WorkspaceOverview({ onQuickAction }: WorkspaceOverviewProps) {
  const { data: progress } = useHackerRankProgress();
  const { data: history } = useHackerRankHistory({ limit: 5, offset: 0 });
  const { data: examples = [] } = useHackerRankExamples();
  const recent = history?.items?.slice(0, 4) ?? [];

  const stats = [
    { label: 'Solved', value: progress?.solved ?? 0, icon: Target },
    { label: 'Attempted', value: progress?.attempted ?? 0, icon: Activity },
    { label: 'Streak', value: `${progress?.current_streak ?? 0}d`, icon: Flame },
    {
      label: 'Strongest',
      value: progress?.favorite_pattern || progress?.strong_topics?.[0] || '—',
      icon: TrendingUp,
    },
  ];

  const handleQuickAction = (label: string) => {
    const match = examples.find((ex) => {
      const hay = `${ex.title ?? ''} ${ex.pattern ?? ''} ${ex.difficulty ?? ''}`.toLowerCase();
      return hay.includes(label.toLowerCase());
    });
    if (match?.url) {
      onQuickAction(match.url);
      return;
    }
    toast(`Paste a HackerRank ${label} challenge URL to begin analysis.`, { icon: '💡' });
  };

  return (
    <section className="space-y-6 border-t border-border px-5 py-6 lg:px-8">
      <div>
        <h2 className="font-heading text-base font-semibold text-foreground">Quick actions</h2>
        <p className="mt-1 text-xs text-muted">Practice modes and recent challenge themes.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {QUICK_ACTIONS.map((label) => (
            <button
              key={label}
              type="button"
              onClick={() => handleQuickAction(label)}
              className="rounded-xl border border-border bg-secondary-bg/40 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h2 className="font-heading text-base font-semibold text-foreground">Learning progress</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="glass-panel rounded-2xl p-4">
              <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <stat.icon size={16} />
              </div>
              <p className="truncate text-lg font-semibold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="font-heading text-base font-semibold text-foreground">Recent challenges</h2>
        {recent.length === 0 ? (
          <p className="mt-2 text-sm text-muted">
            Analyze a challenge to build your session history.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {recent.map((item) => (
              <li
                key={item.session_id}
                className={cn(
                  'rounded-xl border border-border/70 bg-secondary-bg/25 px-3 py-2.5 text-sm text-foreground',
                )}
              >
                <p className="truncate font-medium">{item.title || 'Untitled challenge'}</p>
                <p className="mt-0.5 text-xs text-muted">
                  {item.mode_id ? `Mode · ${item.mode_id}` : 'HackerRank session'}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
