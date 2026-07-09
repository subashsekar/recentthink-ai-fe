'use client';

import { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  Edit3,
  MessageSquare,
  MoreVertical,
  Pin,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import toast from 'react-hot-toast';
import { useChatStore } from '@/store/chatStore';
import { APP_EVENTS, emitAppEvent } from '@/utils/events';
import { useLeetCodeHistory, useAiModels } from '@/hooks/leetcode/useLeetCodeQueries';
import {
  useDeleteSessionMutation,
  usePatchSessionMutation,
} from '@/hooks/leetcode/useLeetCodeMutations';
import { normalizeAnalyzeResponse } from '@/utils/leetcodeSession';
import { leetcodeApi } from '@/services/api/leetcode';
import type { LeetCodeSessionSummary } from '@/types/leetcode';
import { getModelLabel, resolveDefaultModelId } from '@/utils/leetcodeModels';

function formatDate(value: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function ConversationSkeleton() {
  return (
    <div className="mb-1 animate-pulse rounded-xl border border-transparent bg-secondary-bg/60 px-3 py-2.5">
      <div className="h-4 w-3/4 rounded bg-border/80" />
    </div>
  );
}

export function ConversationsSidebar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  const activeSessionId = useChatStore((s) => s.activeSessionId);
  const startNewChat = useChatStore((s) => s.startNewChat);
  const setActiveSessionId = useChatStore((s) => s.setActiveSessionId);
  const hydrateFromSession = useChatStore((s) => s.hydrateFromSession);

  const { data: modelsData } = useAiModels();
  const defaultModelId = resolveDefaultModelId(modelsData);
  const modelList = modelsData?.models ?? [];
  const {
    data: history,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useLeetCodeHistory({ limit: 50, offset: 0, q: debouncedQuery || undefined });

  const patchSession = usePatchSessionMutation();
  const deleteSession = useDeleteSessionMutation();

  const conversations = history?.items ?? [];
  const menuConversation = conversations.find((c) => c.session_id === menuOpenId);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(searchQuery.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpenId(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNewChat = () => {
    startNewChat();
    setMenuOpenId(null);
    emitAppEvent(APP_EVENTS.LEETCODE_NEW_CHAT);
    toast.success('Start a new chat by pasting a LeetCode URL.');
  };

  const handleSelectConversation = async (conversation: LeetCodeSessionSummary) => {
    setMenuOpenId(null);
    if (conversation.session_id === activeSessionId) return;

    setActiveSessionId(conversation.session_id);
    try {
      const session = await leetcodeApi.getSession(conversation.session_id);
      hydrateFromSession(normalizeAnalyzeResponse(session), defaultModelId);
    } catch {
      toast.error('Failed to load conversation.');
      setActiveSessionId(null);
    }
  };

  const handleRename = async (sessionId: string) => {
    const title = renameValue.trim();
    if (!title) {
      toast.error('Title cannot be empty.');
      return;
    }
    try {
      await patchSession.mutateAsync({ sessionId, patch: { title } });
      setRenamingId(null);
      setMenuOpenId(null);
      toast.success('Conversation renamed.');
    } catch {
      toast.error('Failed to rename conversation.');
    }
  };

  const handleTogglePin = async (conversation: LeetCodeSessionSummary) => {
    try {
      await patchSession.mutateAsync({
        sessionId: conversation.session_id,
        patch: { is_pinned: !conversation.is_pinned },
      });
      setMenuOpenId(null);
    } catch {
      toast.error('Failed to update conversation.');
    }
  };

  const handleDelete = async (sessionId: string) => {
    try {
      await deleteSession.mutateAsync(sessionId);
      if (activeSessionId === sessionId) {
        startNewChat();
        emitAppEvent(APP_EVENTS.LEETCODE_NEW_CHAT);
      }
      setMenuOpenId(null);
      toast.success('Conversation deleted.');
    } catch {
      toast.error('Failed to delete conversation.');
    }
  };

  const totalLabel = history?.total ?? conversations.length;
  const showingCount = conversations.length;

  return (
    <aside className="hidden w-[320px] min-w-0 shrink-0 flex-col rounded-[24px] border border-border bg-surface shadow-lg lg:flex">
      <div className="border-b border-border p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-heading text-base font-semibold text-foreground">Conversations</h2>
        </div>

        <div className="relative">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="h-9 w-full rounded-xl border border-border bg-secondary-bg py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted focus:border-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/15"
          />
        </div>

        <button
          type="button"
          onClick={handleNewChat}
          className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-medium text-white shadow-sm transition-all hover:bg-primary-hover hover:shadow-[0_0_20px_rgba(255,90,54,0.25)]"
        >
          <Plus size={16} />
          New Chat
        </button>
      </div>

      <div className="relative flex-1 overflow-y-auto p-2">
        {isLoading && (
          <div className="space-y-1 p-1">
            {Array.from({ length: 6 }).map((_, i) => (
              <ConversationSkeleton key={i} />
            ))}
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center gap-3 px-4 py-10 text-center">
            <AlertCircle size={28} className="text-error" />
            <p className="text-sm text-muted">
              {error instanceof Error ? error.message : 'Failed to load conversations.'}
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="rounded-xl border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary-bg"
            >
              Try again
            </button>
          </div>
        )}

        {!isLoading && !isError && conversations.length === 0 && (
          <div className="flex flex-col items-center gap-3 px-4 py-12 text-center">
            <MessageSquare size={28} className="text-muted" />
            <div>
              <p className="text-sm font-medium text-foreground">No conversations yet</p>
              <p className="mt-1 text-xs text-muted">
                Paste a LeetCode URL to start your first analysis.
              </p>
            </div>
          </div>
        )}

        {!isLoading &&
          !isError &&
          conversations.map((conversation) => (
            <ConversationItem
              key={conversation.session_id}
              conversation={conversation}
              isActive={activeSessionId === conversation.session_id}
              isRenaming={renamingId === conversation.session_id}
              renameValue={renameValue}
              onRenameValueChange={setRenameValue}
              onRenameSubmit={() => handleRename(conversation.session_id)}
              onRenameStart={() => {
                setRenamingId(conversation.session_id);
                setRenameValue(conversation.title);
                setMenuOpenId(null);
              }}
              onRenameCancel={() => setRenamingId(null)}
              onSelect={() => handleSelectConversation(conversation)}
              onMenuToggle={() =>
                setMenuOpenId((prev) =>
                  prev === conversation.session_id ? null : conversation.session_id,
                )
              }
              menuOpen={menuOpenId === conversation.session_id}
            />
          ))}

        {menuOpenId && menuConversation && (
          <div
            ref={menuRef}
            className="absolute left-2 right-2 z-20 rounded-2xl border border-border bg-surface p-2 shadow-xl"
            style={{
              top: `${conversations.findIndex((c) => c.session_id === menuOpenId) * 44 + 8}px`,
            }}
          >
            <ContextMenu
              conversation={menuConversation}
              modelLabel={getModelLabel(menuConversation.model_id, modelList)}
              onRename={() => {
                setRenamingId(menuConversation.session_id);
                setRenameValue(menuConversation.title);
                setMenuOpenId(null);
              }}
              onPin={() => handleTogglePin(menuConversation)}
              onDelete={() => handleDelete(menuConversation.session_id)}
              onClose={() => setMenuOpenId(null)}
            />
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-border px-4 py-3 text-xs text-muted">
        <span>
          {isLoading
            ? 'Loading...'
            : `Showing ${showingCount}${totalLabel ? ` of ${totalLabel}` : ''} conversations`}
        </span>
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="rounded-lg p-1 transition-colors hover:bg-secondary-bg hover:text-foreground disabled:opacity-50"
          aria-label="Refresh conversations"
        >
          <RefreshCw size={14} className={cn(isFetching && 'animate-spin')} />
        </button>
      </div>
    </aside>
  );
}

function ConversationItem({
  conversation,
  isActive,
  isRenaming,
  renameValue,
  onRenameValueChange,
  onRenameSubmit,
  onRenameStart,
  onRenameCancel,
  onSelect,
  onMenuToggle,
  menuOpen,
}: {
  conversation: LeetCodeSessionSummary;
  isActive: boolean;
  isRenaming: boolean;
  renameValue: string;
  onRenameValueChange: (value: string) => void;
  onRenameSubmit: () => void;
  onRenameStart: () => void;
  onRenameCancel: () => void;
  onSelect: () => void;
  onMenuToggle: () => void;
  menuOpen: boolean;
}) {
  if (isRenaming) {
    return (
      <div className="mb-1 rounded-xl border border-primary/30 bg-secondary-bg px-3 py-2">
        <input
          autoFocus
          value={renameValue}
          onChange={(e) => onRenameValueChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onRenameSubmit();
            if (e.key === 'Escape') onRenameCancel();
          }}
          className="w-full bg-transparent text-sm text-foreground focus:outline-none"
        />
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            onClick={onRenameSubmit}
            className="rounded-lg bg-primary px-2 py-1 text-xs text-white"
          >
            Save
          </button>
          <button
            type="button"
            onClick={onRenameCancel}
            className="rounded-lg border border-border px-2 py-1 text-xs text-muted"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'group relative mb-1 flex items-center gap-2 rounded-xl px-3 py-2.5 transition-colors',
        isActive ? 'border border-border bg-secondary-bg' : 'hover:bg-secondary-bg/70',
        menuOpen && 'ring-1 ring-primary/20',
      )}
    >
      <button
        type="button"
        onClick={onSelect}
        onDoubleClick={onRenameStart}
        className="min-w-0 flex-1 truncate text-left text-sm font-medium text-foreground"
      >
        {conversation.title}
      </button>
      {conversation.is_pinned && (
        <Pin size={13} className="shrink-0 text-muted" fill="currentColor" />
      )}
      <button
        type="button"
        onClick={onMenuToggle}
        className={cn(
          'shrink-0 rounded-lg p-1 text-muted transition-all hover:bg-surface hover:text-foreground',
          menuOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
        )}
        aria-label="Conversation options"
      >
        <MoreVertical size={14} />
      </button>
    </div>
  );
}

function ContextMenu({
  conversation,
  modelLabel,
  onRename,
  onPin,
  onDelete,
  onClose,
}: {
  conversation: LeetCodeSessionSummary;
  modelLabel: string;
  onRename: () => void;
  onPin: () => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  return (
    <>
      <button
        type="button"
        onClick={onRename}
        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-foreground transition-colors hover:bg-secondary-bg"
      >
        <Edit3 size={15} className="text-muted" />
        Rename
      </button>
      <button
        type="button"
        onClick={() => {
          onPin();
          onClose();
        }}
        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-foreground transition-colors hover:bg-secondary-bg"
      >
        <Pin size={15} className="text-muted" />
        {conversation.is_pinned ? 'Unpin' : 'Pin'}
      </button>
      <button
        type="button"
        onClick={() => {
          onDelete();
          onClose();
        }}
        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-error transition-colors hover:bg-red-50"
      >
        <Trash2 size={15} />
        Delete
      </button>

      <div className="mt-2 border-t border-border pt-2">
        <p className="px-3 pb-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
          Details
        </p>
        <div className="space-y-1 px-3 pb-1 text-xs text-muted">
          <p>
            <span className="text-foreground/70">Created:</span>{' '}
            {formatDate(conversation.created_at)}
          </p>
          <p>
            <span className="text-foreground/70">Last Updated:</span>{' '}
            {formatDate(conversation.updated_at)}
          </p>
          <p>
            <span className="text-foreground/70">Model Used:</span> {modelLabel}
          </p>
          <p>
            <span className="text-foreground/70">Messages:</span>{' '}
            {conversation.messages_count ?? '—'}
          </p>
          <p>
            <span className="text-foreground/70">Tokens:</span>{' '}
            {conversation.tokens_used != null ? conversation.tokens_used.toLocaleString() : '—'}
          </p>
        </div>
      </div>
    </>
  );
}
