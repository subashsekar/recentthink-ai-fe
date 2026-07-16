'use client';

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Clock, MessageSquare } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useCourseStore } from '@/store/courseStore';
import { useChatStore } from '@/store/chatStore';
import { emitAppEvent, APP_EVENTS } from '@/utils/events';
import { ROUTES } from '@/constants';
import { buildCommandCatalog, getQuickActionItems, getSuggestionItems } from './registry';
import { searchCommands } from './fuzzySearch';
import { resolveNaturalLanguage } from './naturalLanguage';
import { addRecentPage, addRecentSearch, getRecentPages, getRecentSearches } from './recentStorage';
import { useDebouncedValue } from './useDebouncedValue';
import { useCommandPaletteStore } from './commandPaletteStore';
import type { CommandGroupData, CommandItemData } from './types';
import { CATEGORY_LABELS } from './types';

const CATALOG = buildCommandCatalog();

export function useCommandPalette() {
  const router = useRouter();
  const pathname = usePathname();
  const logout = useAuthStore((s) => s.logout);
  const instanceId = useId();

  const open = useCommandPaletteStore((s) => s.open);
  const query = useCommandPaletteStore((s) => s.query);
  const selectedIndex = useCommandPaletteStore((s) => s.selectedIndex);
  const activeInstanceId = useCommandPaletteStore((s) => s.activeInstanceId);
  const openPaletteStore = useCommandPaletteStore((s) => s.openPalette);
  const closePalette = useCommandPaletteStore((s) => s.closePalette);
  const togglePalette = useCommandPaletteStore((s) => s.togglePalette);
  const setQuery = useCommandPaletteStore((s) => s.setQuery);
  const setSelectedIndex = useCommandPaletteStore((s) => s.setSelectedIndex);

  const isActiveInstance = open && activeInstanceId === instanceId;

  const [recentSearches, setRecentSearches] = useState(() => getRecentSearches());
  const [recentPages, setRecentPages] = useState(() => getRecentPages());

  const debouncedQuery = useDebouncedValue(query, 200);
  const isSearching = query !== debouncedQuery;
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const openPalette = useCallback(() => {
    setRecentSearches(getRecentSearches());
    setRecentPages(getRecentPages());
    openPaletteStore(instanceId);
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [openPaletteStore, instanceId]);

  useEffect(() => {
    if (!pathname) return;
    const match = CATALOG.find((item) => item.route === pathname || item.action.href === pathname);
    if (match) {
      addRecentPage({
        title: match.title,
        href: pathname,
        subtitle: match.subtitle,
      });
    }
  }, [pathname]);

  const emptyGroups = useMemo((): CommandGroupData[] => {
    const recentItems: CommandItemData[] = [
      ...recentPages.slice(0, 4).map((page): CommandItemData => ({
        id: `recent-page-${page.id}`,
        title: page.title,
        subtitle: page.subtitle ?? 'Recently opened page',
        category: 'recent',
        keywords: [],
        icon: Clock,
        badge: 'Page',
        action: { type: 'navigate', href: page.href },
      })),
      ...recentSearches.slice(0, 3).map((search): CommandItemData => ({
        id: `recent-search-${search.id}`,
        title: search.title || search.query,
        subtitle: 'Recent AI / search',
        category: 'recent',
        keywords: [],
        icon: MessageSquare,
        badge: 'Search',
        action: search.href
          ? { type: 'navigate', href: search.href }
          : { type: 'navigate', href: pathname },
      })),
    ];

    const groups: CommandGroupData[] = [];
    if (recentItems.length > 0) {
      groups.push({ id: 'recent', label: 'Recent', items: recentItems });
    }
    groups.push({ id: 'suggestions', label: 'Suggestions', items: getSuggestionItems() });
    groups.push({ id: 'quick-actions', label: 'Quick Actions', items: getQuickActionItems() });
    return groups;
  }, [recentPages, recentSearches, pathname]);

  const resultGroups = useMemo((): CommandGroupData[] => {
    const q = debouncedQuery.trim();
    if (!q) return emptyGroups;

    const nl = resolveNaturalLanguage(q);
    const scored = searchCommands(q, CATALOG);
    const seen = new Set<string>();
    const items: CommandItemData[] = [];

    if (nl) {
      items.push(nl);
      seen.add(nl.id);
    }

    for (const { item } of scored) {
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      items.push(item);
    }

    if (items.length === 0) return [];

    const byCategory = new Map<string, CommandItemData[]>();
    for (const item of items) {
      const list = byCategory.get(item.category) ?? [];
      list.push(item);
      byCategory.set(item.category, list);
    }

    const order: Array<CommandItemData['category']> = [
      'navigation',
      'ai-action',
      'leetcode',
      'course',
      'history',
      'bookmark',
      'quick-action',
      'suggestion',
      'recent',
    ];

    return order
      .filter((cat) => byCategory.has(cat))
      .map((cat) => ({
        id: cat,
        label: CATEGORY_LABELS[cat],
        items: byCategory.get(cat)!,
      }));
  }, [debouncedQuery, emptyGroups]);

  const flatItems = useMemo(() => resultGroups.flatMap((group) => group.items), [resultGroups]);

  useEffect(() => {
    if (selectedIndex >= flatItems.length) {
      setSelectedIndex(Math.max(0, flatItems.length - 1));
    }
  }, [flatItems.length, selectedIndex, setSelectedIndex]);

  const executeItem = useCallback(
    (item: CommandItemData) => {
      const { action } = item;

      if (query.trim()) {
        const searches = addRecentSearch({
          query: query.trim(),
          title: item.title,
          href: action.href,
          category: item.category,
        });
        setRecentSearches(searches);
      }

      closePalette();

      switch (action.type) {
        case 'logout':
          logout();
          return;
        case 'leetcode-problem': {
          const params = new URLSearchParams();
          if (action.problemUrl) params.set('problemUrl', action.problemUrl);
          if (action.problemTitle) params.set('q', action.problemTitle);
          const href = `${action.href ?? ROUTES.LEETCODE_AGENT}?${params.toString()}`;
          if (action.problemTitle) {
            addRecentPage({ title: action.problemTitle, href, subtitle: 'LeetCode problem' });
          }
          router.push(href);
          return;
        }
        case 'generate-course': {
          if (action.skill || action.goal) {
            useCourseStore.getState().setForm({
              skill: action.skill ?? '',
              goal: action.goal ?? `Master ${action.skill ?? 'this skill'}`,
              programming_language: action.skill ?? '',
            });
          } else {
            useCourseStore.getState().startNewCourse();
          }
          router.push(action.href ?? ROUTES.COURSES);
          return;
        }
        case 'start-session': {
          if (action.agentId === 'leetcode') {
            useChatStore.getState().startNewChat();
            emitAppEvent(APP_EVENTS.LEETCODE_NEW_CHAT);
          } else if (action.agentId === 'hackerrank') {
            emitAppEvent(APP_EVENTS.HACKERRANK_NEW_CHAT);
          }
          router.push(action.href ?? '/dashboard');
          return;
        }
        case 'resume-session':
          router.push(action.href ?? ROUTES.LEETCODE_AGENT);
          return;
        case 'navigate':
        default:
          if (action.href) router.push(action.href);
      }
    },
    [query, closePalette, logout, router],
  );

  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!isActiveInstance) return;

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setSelectedIndex(flatItems.length === 0 ? 0 : (selectedIndex + 1) % flatItems.length);
          break;
        case 'ArrowUp':
          event.preventDefault();
          setSelectedIndex(
            flatItems.length === 0 ? 0 : (selectedIndex - 1 + flatItems.length) % flatItems.length,
          );
          break;
        case 'Enter':
          event.preventDefault();
          if (flatItems[selectedIndex]) executeItem(flatItems[selectedIndex]);
          break;
        case 'Escape':
          event.preventDefault();
          closePalette();
          break;
        case 'Tab':
          event.preventDefault();
          setSelectedIndex(flatItems.length === 0 ? 0 : (selectedIndex + 1) % flatItems.length);
          break;
        default:
          break;
      }
    },
    [isActiveInstance, flatItems, selectedIndex, executeItem, closePalette, setSelectedIndex],
  );

  return {
    open: isActiveInstance,
    globalOpen: open,
    query,
    setQuery,
    selectedIndex,
    setSelectedIndex,
    resultGroups,
    flatItems,
    isSearching: isSearching && query.trim().length > 0,
    hasQuery: debouncedQuery.trim().length > 0,
    openPalette,
    closePalette,
    togglePalette,
    executeItem,
    onKeyDown,
    containerRef,
    inputRef,
    instanceId,
  };
}
