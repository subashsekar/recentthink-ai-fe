import {
  BarChart3,
  BookOpen,
  Bookmark,
  Code2,
  CreditCard,
  History,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Play,
  Settings,
  Shapes,
  Sparkles,
  Trophy,
  User,
} from 'lucide-react';
import { ROUTES } from '@/constants';
import type { AgentRegistryEntry, CommandItemData } from './types';

/**
 * Register new AI agents here — the command palette picks them up automatically.
 * Example future agents: Interview, Resume, System Design, Mock Interview.
 */
export const AGENT_REGISTRY: AgentRegistryEntry[] = [
  {
    id: 'leetcode',
    name: 'LeetCode Agent',
    description: 'Analyze and learn LeetCode problems with AI mentors',
    route: ROUTES.LEETCODE_AGENT,
    keywords: ['leetcode', 'dsa', 'coding', 'problems', 'algorithms', 'interview'],
    icon: Code2,
    startActionTitle: 'Start LeetCode Session',
    startActionSubtitle: 'Open LeetCode Agent and begin a new analysis',
  },
  {
    id: 'hackerrank',
    name: 'HackerRank Agent',
    description: 'Practice HackerRank challenges with AI guidance',
    route: ROUTES.HACKERRANK_AGENT,
    keywords: ['hackerrank', 'challenges', 'coding', 'practice'],
    icon: Trophy,
    startActionTitle: 'Start HackerRank Session',
    startActionSubtitle: 'Open HackerRank Agent and start practicing',
  },
  {
    id: 'courses',
    name: 'Course Generator',
    description: 'Generate personalized learning paths with AI',
    route: ROUTES.COURSES,
    keywords: ['course', 'learn', 'learning path', 'generator', 'curriculum'],
    icon: BookOpen,
    startActionTitle: 'Generate Course',
    startActionSubtitle: 'Create a new personalized learning path',
  },
  {
    id: 'dsa-coach',
    name: 'DSA Coach',
    description: 'Master DSA patterns with guided coaching',
    route: ROUTES.DSA_PATTERN,
    keywords: ['dsa', 'patterns', 'coach', 'algorithms', 'data structures'],
    icon: Shapes,
    startActionTitle: 'Start DSA Coach Session',
    startActionSubtitle: 'Open DSA pattern coaching',
  },
];

/** Curated LeetCode problems searchable from the palette */
export const LEETCODE_PROBLEMS: Array<{
  id: string;
  title: string;
  slug: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
  keywords: string[];
}> = [
  {
    id: 'two-sum',
    title: 'Two Sum',
    slug: 'two-sum',
    difficulty: 'Easy',
    tags: ['Array', 'Hash Table'],
    keywords: ['array', 'hash', 'easy', 'sum'],
  },
  {
    id: 'merge-intervals',
    title: 'Merge Intervals',
    slug: 'merge-intervals',
    difficulty: 'Medium',
    tags: ['Array', 'Sorting'],
    keywords: ['intervals', 'merge', 'medium', 'array'],
  },
  {
    id: 'reverse-linked-list',
    title: 'Reverse Linked List',
    slug: 'reverse-linked-list',
    difficulty: 'Easy',
    tags: ['Linked List', 'Recursion'],
    keywords: ['linked list', 'reverse', 'easy', 'pointer'],
  },
  {
    id: 'binary-search',
    title: 'Binary Search',
    slug: 'binary-search',
    difficulty: 'Easy',
    tags: ['Array', 'Binary Search'],
    keywords: ['binary search', 'search', 'easy', 'array', 'teach'],
  },
  {
    id: 'climbing-stairs',
    title: 'Climbing Stairs',
    slug: 'climbing-stairs',
    difficulty: 'Easy',
    tags: ['Dynamic Programming'],
    keywords: ['dp', 'dynamic programming', 'easy', 'stairs'],
  },
  {
    id: 'longest-palindromic-substring',
    title: 'Longest Palindromic Substring',
    slug: 'longest-palindromic-substring',
    difficulty: 'Medium',
    tags: ['String', 'Dynamic Programming'],
    keywords: ['dp', 'string', 'palindrome', 'medium'],
  },
  {
    id: 'number-of-islands',
    title: 'Number of Islands',
    slug: 'number-of-islands',
    difficulty: 'Medium',
    tags: ['Graph', 'DFS', 'BFS'],
    keywords: ['graph', 'dfs', 'bfs', 'medium', 'islands'],
  },
  {
    id: 'course-schedule',
    title: 'Course Schedule',
    slug: 'course-schedule',
    difficulty: 'Medium',
    tags: ['Graph', 'Topological Sort'],
    keywords: ['graph', 'topo', 'medium', 'cycle'],
  },
  {
    id: 'word-ladder',
    title: 'Word Ladder',
    slug: 'word-ladder',
    difficulty: 'Hard',
    tags: ['Graph', 'BFS'],
    keywords: ['graph', 'bfs', 'hard', 'words'],
  },
  {
    id: 'maximum-subarray',
    title: 'Maximum Subarray',
    slug: 'maximum-subarray',
    difficulty: 'Medium',
    tags: ['Array', 'Dynamic Programming'],
    keywords: ['kadane', 'dp', 'array', 'medium'],
  },
  {
    id: 'valid-parentheses',
    title: 'Valid Parentheses',
    slug: 'valid-parentheses',
    difficulty: 'Easy',
    tags: ['Stack', 'String'],
    keywords: ['stack', 'parentheses', 'easy'],
  },
  {
    id: 'lru-cache',
    title: 'LRU Cache',
    slug: 'lru-cache',
    difficulty: 'Medium',
    tags: ['Hash Table', 'Linked List', 'Design'],
    keywords: ['cache', 'lru', 'design', 'medium'],
  },
];

/** Sample generated courses for search */
export const SAMPLE_COURSES: Array<{
  id: string;
  title: string;
  skill: string;
  goal: string;
  keywords: string[];
}> = [
  {
    id: 'python-fundamentals',
    title: 'Python Fundamentals',
    skill: 'Python',
    goal: 'Build a solid foundation in Python',
    keywords: ['python', 'beginner', 'fundamentals', 'programming'],
  },
  {
    id: 'system-design-basics',
    title: 'System Design Basics',
    skill: 'System Design',
    goal: 'Learn scalable architecture fundamentals',
    keywords: ['system design', 'architecture', 'scalability'],
  },
  {
    id: 'dsa-mastery',
    title: 'DSA Mastery Path',
    skill: 'Data Structures',
    goal: 'Crack coding interviews with DSA',
    keywords: ['dsa', 'algorithms', 'interview', 'coding'],
  },
  {
    id: 'typescript-pro',
    title: 'TypeScript for Professionals',
    skill: 'TypeScript',
    goal: 'Write production-grade TypeScript',
    keywords: ['typescript', 'javascript', 'frontend'],
  },
];

export function problemUrlFromSlug(slug: string) {
  return `https://leetcode.com/problems/${slug}/`;
}

function navigationItems(): CommandItemData[] {
  const base: CommandItemData[] = [
    {
      id: 'nav-dashboard',
      title: 'Dashboard',
      subtitle: 'Overview of your learning activity',
      category: 'navigation',
      keywords: ['home', 'overview', 'main', 'open dashboard'],
      icon: LayoutDashboard,
      route: ROUTES.DASHBOARD,
      action: { type: 'navigate', href: ROUTES.DASHBOARD },
    },
    {
      id: 'nav-profile',
      title: 'Profile',
      subtitle: 'View and edit your profile',
      category: 'navigation',
      keywords: ['account', 'me', 'open profile'],
      icon: User,
      route: ROUTES.PROFILE,
      keyboardHint: 'P',
      action: { type: 'navigate', href: ROUTES.PROFILE },
    },
    {
      id: 'nav-settings',
      title: 'Settings',
      subtitle: 'Account security and preferences',
      category: 'navigation',
      keywords: ['account security', 'password', 'preferences'],
      icon: Settings,
      route: ROUTES.ACCOUNT_SECURITY,
      action: { type: 'navigate', href: ROUTES.ACCOUNT_SECURITY },
    },
    {
      id: 'nav-usage',
      title: 'Usage',
      subtitle: 'View your activity and learning stats',
      category: 'navigation',
      keywords: ['stats', 'tokens', 'activity', 'view usage'],
      icon: BarChart3,
      route: ROUTES.PROFILE,
      action: { type: 'navigate', href: ROUTES.PROFILE },
    },
    {
      id: 'nav-billing',
      title: 'Billing',
      subtitle: 'Account and subscription settings',
      category: 'navigation',
      keywords: ['payment', 'subscription', 'plan'],
      icon: CreditCard,
      route: ROUTES.ACCOUNT_SECURITY,
      action: { type: 'navigate', href: ROUTES.ACCOUNT_SECURITY },
    },
    {
      id: 'nav-history',
      title: 'History',
      subtitle: 'Browse previous AI conversations and courses',
      category: 'navigation',
      keywords: ['past', 'sessions', 'conversations', 'continue yesterday'],
      icon: History,
      route: ROUTES.COURSES_HISTORY,
      action: { type: 'navigate', href: ROUTES.COURSES_HISTORY },
    },
  ];

  const agents = AGENT_REGISTRY.map((agent): CommandItemData => ({
    id: `nav-agent-${agent.id}`,
    title: agent.name,
    subtitle: agent.description,
    category: 'navigation',
    keywords: agent.keywords,
    icon: agent.icon,
    route: agent.route,
    action: { type: 'navigate', href: agent.route },
  }));

  return [...base.slice(0, 1), ...agents, ...base.slice(1)];
}

function aiActionItems(): CommandItemData[] {
  const agentActions = AGENT_REGISTRY.filter((a) => a.startActionTitle).map(
    (agent): CommandItemData => ({
      id: `action-start-${agent.id}`,
      title: agent.startActionTitle!,
      subtitle: agent.startActionSubtitle,
      category: 'ai-action',
      keywords: [...agent.keywords, 'start', 'new', 'session', 'begin'],
      icon: Play,
      route: agent.id === 'courses' ? ROUTES.COURSES_NEW : agent.route,
      action:
        agent.id === 'courses'
          ? { type: 'generate-course', href: ROUTES.COURSES_NEW }
          : {
              type: 'start-session',
              href: agent.route,
              agentId: agent.id,
            },
    }),
  );

  return [
    ...agentActions,
    {
      id: 'action-continue-previous',
      title: 'Continue Previous Session',
      subtitle: 'Resume your most recent AI conversation',
      category: 'ai-action',
      keywords: ['continue', 'previous', 'yesterday', 'resume', 'last'],
      icon: MessageSquare,
      route: ROUTES.LEETCODE_AGENT,
      action: { type: 'resume-session', href: ROUTES.LEETCODE_AGENT },
    },
    {
      id: 'action-resume-last-chat',
      title: 'Resume Last Chat',
      subtitle: 'Jump back into your last agent chat',
      category: 'ai-action',
      keywords: ['resume', 'chat', 'continue', 'last'],
      icon: Sparkles,
      route: ROUTES.LEETCODE_AGENT,
      action: { type: 'resume-session', href: ROUTES.LEETCODE_AGENT },
    },
  ];
}

function leetcodeItems(): CommandItemData[] {
  return LEETCODE_PROBLEMS.map((problem) => ({
    id: `lc-${problem.id}`,
    title: problem.title,
    subtitle: `${problem.difficulty} · ${problem.tags.join(', ')}`,
    category: 'leetcode' as const,
    keywords: [
      ...problem.keywords,
      ...problem.tags.map((t) => t.toLowerCase()),
      problem.difficulty.toLowerCase(),
      'teach',
      'resume',
      'solve',
    ],
    icon: Code2,
    badge: problem.difficulty,
    route: ROUTES.LEETCODE_AGENT,
    action: {
      type: 'leetcode-problem' as const,
      href: ROUTES.LEETCODE_AGENT,
      problemUrl: problemUrlFromSlug(problem.slug),
      problemTitle: problem.title,
    },
  }));
}

function courseItems(): CommandItemData[] {
  return SAMPLE_COURSES.map((course) => ({
    id: `course-${course.id}`,
    title: course.title,
    subtitle: `${course.skill} → ${course.goal}`,
    category: 'course' as const,
    keywords: course.keywords,
    icon: BookOpen,
    badge: 'Course',
    route: ROUTES.COURSES_NEW,
    action: {
      type: 'generate-course' as const,
      href: ROUTES.COURSES_NEW,
      skill: course.skill,
      goal: course.goal,
    },
  }));
}

function historyItems(): CommandItemData[] {
  return [
    {
      id: 'hist-courses',
      title: 'Course History',
      subtitle: 'Previously generated learning paths',
      category: 'history',
      keywords: ['history', 'courses', 'past', 'conversations'],
      icon: History,
      route: ROUTES.COURSES_HISTORY,
      action: { type: 'navigate', href: ROUTES.COURSES_HISTORY },
    },
    {
      id: 'hist-dsa',
      title: 'DSA Coach History',
      subtitle: 'Previous pattern coaching sessions',
      category: 'history',
      keywords: ['history', 'dsa', 'patterns', 'sessions'],
      icon: History,
      route: `${ROUTES.DSA_PATTERN}/history`,
      action: { type: 'navigate', href: `${ROUTES.DSA_PATTERN}/history` },
    },
    {
      id: 'hist-leetcode-chats',
      title: 'LeetCode Conversations',
      subtitle: 'Open LeetCode Agent to browse past analyses',
      category: 'history',
      keywords: ['history', 'leetcode', 'chat', 'sessions'],
      icon: MessageSquare,
      route: ROUTES.LEETCODE_AGENT,
      action: { type: 'navigate', href: ROUTES.LEETCODE_AGENT },
    },
  ];
}

function bookmarkItems(): CommandItemData[] {
  return [
    {
      id: 'bm-leetcode',
      title: 'Saved LeetCode Sessions',
      subtitle: 'Bookmarked problem analyses',
      category: 'bookmark',
      keywords: ['bookmark', 'saved', 'favorite', 'leetcode'],
      icon: Bookmark,
      route: ROUTES.LEETCODE_AGENT,
      action: { type: 'navigate', href: ROUTES.LEETCODE_AGENT },
    },
    {
      id: 'bm-courses',
      title: 'Saved Courses',
      subtitle: 'Bookmarked learning paths',
      category: 'bookmark',
      keywords: ['bookmark', 'saved', 'favorite', 'courses'],
      icon: Bookmark,
      route: ROUTES.COURSES_HISTORY,
      action: { type: 'navigate', href: ROUTES.COURSES_HISTORY },
    },
  ];
}

export function getSuggestionItems(): CommandItemData[] {
  return [
    {
      id: 'sug-dashboard',
      title: 'Dashboard',
      subtitle: 'Go to your dashboard',
      category: 'suggestion',
      keywords: [],
      icon: LayoutDashboard,
      action: { type: 'navigate', href: ROUTES.DASHBOARD },
    },
    {
      id: 'sug-leetcode',
      title: 'LeetCode Agent',
      subtitle: 'Open LeetCode mentor',
      category: 'suggestion',
      keywords: [],
      icon: Code2,
      action: { type: 'navigate', href: ROUTES.LEETCODE_AGENT },
    },
    {
      id: 'sug-hackerrank',
      title: 'HackerRank Agent',
      subtitle: 'Open HackerRank mentor',
      category: 'suggestion',
      keywords: [],
      icon: Trophy,
      action: { type: 'navigate', href: ROUTES.HACKERRANK_AGENT },
    },
    {
      id: 'sug-courses',
      title: 'Course Generator',
      subtitle: 'Build a learning path',
      category: 'suggestion',
      keywords: [],
      icon: BookOpen,
      action: { type: 'navigate', href: ROUTES.COURSES },
    },
    {
      id: 'sug-profile',
      title: 'Profile',
      subtitle: 'View your profile',
      category: 'suggestion',
      keywords: [],
      icon: User,
      action: { type: 'navigate', href: ROUTES.PROFILE },
    },
    {
      id: 'sug-settings',
      title: 'Settings',
      subtitle: 'Account security',
      category: 'suggestion',
      keywords: [],
      icon: Settings,
      action: { type: 'navigate', href: ROUTES.ACCOUNT_SECURITY },
    },
    {
      id: 'sug-history',
      title: 'History',
      subtitle: 'Past AI conversations',
      category: 'suggestion',
      keywords: [],
      icon: History,
      action: { type: 'navigate', href: ROUTES.COURSES_HISTORY },
    },
  ];
}

export function getQuickActionItems(): CommandItemData[] {
  return [
    {
      id: 'qa-leetcode',
      title: 'Start LeetCode Session',
      subtitle: 'Begin a new problem analysis',
      category: 'quick-action',
      keywords: [],
      icon: Play,
      keyboardHint: '↵',
      action: { type: 'start-session', href: ROUTES.LEETCODE_AGENT, agentId: 'leetcode' },
    },
    {
      id: 'qa-course',
      title: 'Generate Course',
      subtitle: 'Create a personalized learning path',
      category: 'quick-action',
      keywords: [],
      icon: BookOpen,
      action: { type: 'generate-course', href: ROUTES.COURSES_NEW },
    },
    {
      id: 'qa-profile',
      title: 'Open Profile',
      subtitle: 'View your profile page',
      category: 'quick-action',
      keywords: [],
      icon: User,
      action: { type: 'navigate', href: ROUTES.PROFILE },
    },
    {
      id: 'qa-usage',
      title: 'View Usage',
      subtitle: 'See your learning activity',
      category: 'quick-action',
      keywords: [],
      icon: BarChart3,
      action: { type: 'navigate', href: ROUTES.PROFILE },
    },
    {
      id: 'qa-logout',
      title: 'Logout',
      subtitle: 'Sign out of RecentThink',
      category: 'quick-action',
      keywords: ['sign out', 'log out', 'exit'],
      icon: LogOut,
      action: { type: 'logout' },
    },
  ];
}

/** Flat catalog of all searchable commands (extensible via AGENT_REGISTRY) */
export function buildCommandCatalog(): CommandItemData[] {
  return [
    ...navigationItems(),
    ...aiActionItems(),
    ...leetcodeItems(),
    ...courseItems(),
    ...historyItems(),
    ...bookmarkItems(),
    ...getQuickActionItems().filter((i) => i.id === 'qa-logout'),
  ];
}
