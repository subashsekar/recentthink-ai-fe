'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Copy,
  Download,
  Edit3,
  Filter,
  MoreVertical,
  Pin,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { MOCK_CONVERSATIONS, type Conversation } from './data';
import toast from 'react-hot-toast';
import { useChatStore } from '@/store/chatStore';
import { APP_EVENTS, emitAppEvent } from '@/utils/events';

export function ConversationsSidebar() {
  const [activeId, setActiveId] = useState('1');
  const [menuOpenId, setMenuOpenId] = useState<string | null>('1');
  const menuRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const startNewChat = useChatStore((s) => s.startNewChat);

  const activeConversation = MOCK_CONVERSATIONS.find((c) => c.id === menuOpenId);

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
    setActiveId('');
    setMenuOpenId(null);
    emitAppEvent(APP_EVENTS.LEETCODE_NEW_CHAT);
    toast.success('Start a new chat by pasting a LeetCode URL.');
  };

  return (
    <aside className="hidden w-[320px] min-w-0 shrink-0 flex-col rounded-[24px] border border-border bg-surface shadow-lg lg:flex">
      <div className="border-b border-border p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-heading text-base font-semibold text-foreground">Conversations</h2>
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="rounded-lg p-1.5 text-muted transition-colors hover:bg-secondary-bg hover:text-foreground"
              aria-label="New conversation"
            >
              <Edit3 size={16} />
            </button>
            <button
              type="button"
              className="rounded-lg p-1.5 text-muted transition-colors hover:bg-secondary-bg hover:text-foreground"
              aria-label="Filter conversations"
            >
              <Filter size={16} />
            </button>
          </div>
        </div>

        <div className="relative">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            type="search"
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

      <div ref={listRef} className="relative flex-1 overflow-y-auto p-2">
        {MOCK_CONVERSATIONS.map((conversation) => (
          <ConversationItem
            key={conversation.id}
            conversation={conversation}
            isActive={activeId === conversation.id}
            onSelect={() => setActiveId(conversation.id)}
            onMenuToggle={() =>
              setMenuOpenId((prev) => (prev === conversation.id ? null : conversation.id))
            }
            menuOpen={menuOpenId === conversation.id}
          />
        ))}

        {menuOpenId && activeConversation && (
          <div
            ref={menuRef}
            className="absolute left-2 right-2 z-20 rounded-2xl border border-border bg-surface p-2 shadow-xl"
            style={{
              top: `${MOCK_CONVERSATIONS.findIndex((c) => c.id === menuOpenId) * 44 + 8}px`,
            }}
          >
            <ContextMenu conversation={activeConversation} onClose={() => setMenuOpenId(null)} />
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-border px-4 py-3 text-xs text-muted">
        <span>Showing 20 of 120+ conversations</span>
        <button
          type="button"
          className="rounded-lg p-1 transition-colors hover:bg-secondary-bg hover:text-foreground"
          aria-label="Refresh conversations"
        >
          <RefreshCw size={14} />
        </button>
      </div>
    </aside>
  );
}

function ConversationItem({
  conversation,
  isActive,
  onSelect,
  onMenuToggle,
  menuOpen,
}: {
  conversation: Conversation;
  isActive: boolean;
  onSelect: () => void;
  onMenuToggle: () => void;
  menuOpen: boolean;
}) {
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
        className="min-w-0 flex-1 truncate text-left text-sm font-medium text-foreground"
      >
        {conversation.title}
      </button>
      {conversation.isPinned && (
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
  onClose,
}: {
  conversation: Conversation;
  onClose: () => void;
}) {
  const menuItems = [
    { label: 'Rename', icon: Edit3 },
    { label: 'Pin', icon: Pin },
    { label: 'Duplicate', icon: Copy },
    { label: 'Export', icon: Download },
  ];

  return (
    <>
      {menuItems.map((item) => (
        <button
          key={item.label}
          type="button"
          onClick={onClose}
          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-foreground transition-colors hover:bg-secondary-bg"
        >
          <item.icon size={15} className="text-muted" />
          {item.label}
        </button>
      ))}
      <button
        type="button"
        onClick={onClose}
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
            <span className="text-foreground/70">Created:</span> {conversation.createdAt}
          </p>
          <p>
            <span className="text-foreground/70">Last Updated:</span> {conversation.lastUpdated}
          </p>
          <p>
            <span className="text-foreground/70">Model Used:</span> {conversation.model}
          </p>
          <p>
            <span className="text-foreground/70">Messages:</span> {conversation.messages}
          </p>
          <p>
            <span className="text-foreground/70">Tokens:</span>{' '}
            {conversation.tokens.toLocaleString()}
          </p>
        </div>
      </div>
    </>
  );
}
