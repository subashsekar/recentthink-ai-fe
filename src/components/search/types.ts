import type { LucideIcon } from 'lucide-react';

export type CommandCategory =
  | 'navigation'
  | 'ai-action'
  | 'leetcode'
  | 'course'
  | 'history'
  | 'bookmark'
  | 'recent'
  | 'suggestion'
  | 'quick-action';

export type CommandActionType =
  | 'navigate'
  | 'logout'
  | 'leetcode-problem'
  | 'generate-course'
  | 'start-session'
  | 'resume-session'
  | 'custom';

export interface CommandAction {
  type: CommandActionType;
  href?: string;
  problemUrl?: string;
  problemTitle?: string;
  skill?: string;
  goal?: string;
  agentId?: string;
  query?: string;
}

export interface CommandItemData {
  id: string;
  title: string;
  subtitle?: string;
  category: CommandCategory;
  keywords: string[];
  icon: LucideIcon;
  badge?: string;
  keyboardHint?: string;
  route?: string;
  action: CommandAction;
}

export interface AgentRegistryEntry {
  id: string;
  name: string;
  description: string;
  route: string;
  keywords: string[];
  icon: LucideIcon;
  /** Shown under AI Actions */
  startActionTitle?: string;
  startActionSubtitle?: string;
}

export interface CommandGroupData {
  id: string;
  label: string;
  items: CommandItemData[];
}

export interface RecentSearchEntry {
  id: string;
  query: string;
  title: string;
  href?: string;
  category?: CommandCategory;
  timestamp: number;
}

export interface RecentPageEntry {
  id: string;
  title: string;
  href: string;
  subtitle?: string;
  timestamp: number;
}

export const CATEGORY_LABELS: Record<CommandCategory, string> = {
  navigation: 'Navigation',
  'ai-action': 'AI Actions',
  leetcode: 'LeetCode Problems',
  course: 'Courses',
  history: 'History',
  bookmark: 'Bookmarks',
  recent: 'Recent',
  suggestion: 'Suggestions',
  'quick-action': 'Quick Actions',
};
