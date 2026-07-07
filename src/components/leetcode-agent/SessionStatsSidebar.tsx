'use client';

import {
  BarChart3,
  Bookmark,
  Brain,
  Clock,
  Coins,
  Copy,
  Flame,
  Hash,
  MessageSquare,
  MoreVertical,
  RefreshCw,
  Share2,
  Sparkles,
  Target,
  Download,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import toast from 'react-hot-toast';
import { useChatStore } from '@/store/chatStore';
import { APP_EVENTS, emitAppEvent } from '@/utils/events';

const sessionStats = [
  {
    label: 'Current Model',
    value: 'Claude Sonnet 4',
    icon: Brain,
    color: 'text-primary bg-primary/10',
  },
  { label: 'Session Time', value: '12 min 34 sec', icon: Clock, color: 'text-blue-600 bg-blue-50' },
  {
    label: 'Tokens Used',
    value: '1,421 tokens',
    icon: BarChart3,
    color: 'text-violet-600 bg-violet-50',
  },
  { label: 'Estimated Cost', value: '$0.0042', icon: Coins, color: 'text-amber-600 bg-amber-50' },
  {
    label: 'Difficulty',
    value: 'Easy',
    icon: Target,
    color: 'text-green-600 bg-green-50',
    tag: 'success',
  },
  { label: 'Pattern', value: 'Hash Map', icon: Hash, color: 'text-rose-600 bg-rose-50' },
  { label: 'Current Streak', value: '12 days', icon: Flame, color: 'text-orange-600 bg-orange-50' },
  { label: 'Problems Solved', value: '48', icon: Sparkles, color: 'text-indigo-600 bg-indigo-50' },
];

const quickActions = [
  { label: 'Copy Session', icon: Copy },
  { label: 'Share', icon: Share2 },
  { label: 'Bookmark', icon: Bookmark },
  { label: 'Reset Session', icon: RefreshCw },
];

export function SessionStatsSidebar() {
  const startNewChat = useChatStore((s) => s.startNewChat);
  const handleNewChat = () => {
    startNewChat();
    emitAppEvent(APP_EVENTS.LEETCODE_NEW_CHAT);
    toast.success('Start a new chat by pasting a LeetCode URL.');
  };

  return (
    <aside className="hidden w-[280px] min-w-0 shrink-0 flex-col gap-4 lg:flex">
      <div className="flex items-center justify-end gap-2 px-1">
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-2 text-xs font-medium text-foreground shadow-sm transition-colors hover:bg-secondary-bg"
        >
          <Download size={14} />
          Download
        </button>
        <button
          type="button"
          className="rounded-xl border border-border bg-surface p-2 text-muted shadow-sm transition-colors hover:bg-secondary-bg hover:text-foreground"
          aria-label="More options"
        >
          <MoreVertical size={16} />
        </button>
      </div>

      <div className="rounded-[24px] border border-border bg-surface p-4 shadow-lg">
        <h2 className="mb-3 font-heading text-base font-semibold text-foreground">Session Stats</h2>
        <div className="space-y-2">
          {sessionStats.map((stat) => (
            <div
              key={stat.label}
              className="flex items-center gap-3 rounded-xl border border-border/60 bg-secondary-bg/50 px-3 py-2.5"
            >
              <div
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                  stat.color,
                )}
              >
                <stat.icon size={15} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-medium uppercase tracking-wide text-muted">
                  {stat.label}
                </p>
                <p className="truncate text-sm font-semibold text-foreground">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[24px] border border-border bg-surface p-4 shadow-lg">
        <h2 className="mb-3 font-heading text-base font-semibold text-foreground">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-2">
          {quickActions.map((action) => (
            <button
              key={action.label}
              type="button"
              className="flex flex-col items-center gap-1.5 rounded-xl border border-border bg-secondary-bg/50 px-2 py-3 text-xs font-medium text-foreground transition-colors hover:border-primary/20 hover:bg-secondary-bg"
            >
              <action.icon size={16} className="text-muted" />
              {action.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={handleNewChat}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-secondary-bg py-2.5 text-sm font-medium text-foreground transition-colors hover:border-primary/20 hover:bg-secondary-bg"
        >
          <MessageSquare size={16} className="text-muted" />
          New Chat
        </button>
      </div>
    </aside>
  );
}
