import { storage } from '@/utils/storage';
import type { RecentPageEntry, RecentSearchEntry } from './types';

const SEARCH_KEY = 'recentthink:command-palette:recent-searches';
const PAGES_KEY = 'recentthink:command-palette:recent-pages';
const MAX_RECENT = 10;

export function getRecentSearches(): RecentSearchEntry[] {
  return storage.get<RecentSearchEntry[]>(SEARCH_KEY) ?? [];
}

export function addRecentSearch(
  entry: Omit<RecentSearchEntry, 'id' | 'timestamp'>,
): RecentSearchEntry[] {
  const next: RecentSearchEntry = {
    ...entry,
    id: `rs-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: Date.now(),
  };

  const existing = getRecentSearches().filter(
    (item) => item.query.toLowerCase() !== entry.query.toLowerCase(),
  );
  const updated = [next, ...existing].slice(0, MAX_RECENT);
  storage.set(SEARCH_KEY, updated);
  return updated;
}

export function clearRecentSearches() {
  storage.remove(SEARCH_KEY);
}

export function getRecentPages(): RecentPageEntry[] {
  return storage.get<RecentPageEntry[]>(PAGES_KEY) ?? [];
}

export function addRecentPage(entry: Omit<RecentPageEntry, 'id' | 'timestamp'>): RecentPageEntry[] {
  const next: RecentPageEntry = {
    ...entry,
    id: `rp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: Date.now(),
  };

  const existing = getRecentPages().filter((item) => item.href !== entry.href);
  const updated = [next, ...existing].slice(0, MAX_RECENT);
  storage.set(PAGES_KEY, updated);
  return updated;
}
