export interface Conversation {
  id: string;
  title: string;
  isPinned?: boolean;
  isActive?: boolean;
  createdAt: string;
  lastUpdated: string;
  model: string;
  messages: number;
  tokens: number;
}

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: '1',
    title: 'Two Sum',
    isPinned: true,
    isActive: true,
    createdAt: 'July 5, 2024',
    lastUpdated: 'July 6, 2024',
    model: 'Claude Sonnet 4',
    messages: 24,
    tokens: 14521,
  },
  {
    id: '2',
    title: 'Longest Substring Without Repeating Characters',
    createdAt: 'July 4, 2024',
    lastUpdated: 'July 5, 2024',
    model: 'Claude Sonnet 4',
    messages: 18,
    tokens: 9823,
  },
  {
    id: '3',
    title: 'LRU Cache Implementation',
    createdAt: 'July 3, 2024',
    lastUpdated: 'July 4, 2024',
    model: 'GPT-4.1',
    messages: 32,
    tokens: 18402,
  },
  {
    id: '4',
    title: 'Valid Parentheses',
    createdAt: 'July 2, 2024',
    lastUpdated: 'July 3, 2024',
    model: 'Claude Sonnet 4',
    messages: 12,
    tokens: 6104,
  },
  {
    id: '5',
    title: 'Merge Intervals',
    createdAt: 'July 1, 2024',
    lastUpdated: 'July 2, 2024',
    model: 'Gemini 1.5 Pro',
    messages: 15,
    tokens: 7890,
  },
  {
    id: '6',
    title: 'Binary Tree Level Order Traversal',
    createdAt: 'June 30, 2024',
    lastUpdated: 'July 1, 2024',
    model: 'Claude Sonnet 4',
    messages: 20,
    tokens: 11234,
  },
];

export const EXAMPLE_PROBLEMS = [
  {
    id: 'two-sum',
    title: 'Two Sum',
    difficulty: 'Easy' as const,
    pattern: 'Hash Map',
    icon: 'hash',
    url: 'https://leetcode.com/problems/two-sum/',
  },
  {
    id: 'longest-substring',
    title: 'Longest Substring',
    difficulty: 'Medium' as const,
    pattern: 'Sliding Window',
    icon: 'window',
    url: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/',
  },
  {
    id: 'lru-cache',
    title: 'LRU Cache',
    difficulty: 'Hard' as const,
    pattern: 'Design',
    icon: 'cache',
    url: 'https://leetcode.com/problems/lru-cache/',
  },
  {
    id: 'valid-tree',
    title: 'Graph Valid Tree',
    difficulty: 'Medium' as const,
    pattern: 'Graph',
    icon: 'graph',
    url: 'https://leetcode.com/problems/graph-valid-tree/',
  },
  {
    id: 'merge-intervals',
    title: 'Merge Intervals',
    difficulty: 'Medium' as const,
    pattern: 'Intervals',
    icon: 'intervals',
    url: 'https://leetcode.com/problems/merge-intervals/',
  },
];

export const SUPPORTED_MODELS = [
  { id: 'claude-sonnet-4', name: 'Claude Sonnet 4', active: true },
  { id: 'gpt-4.1', name: 'GPT-4.1', active: false },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', active: false },
  { id: 'deepseek-v3', name: 'DeepSeek V3', active: false },
  { id: 'qwen-2.5', name: 'Qwen 2.5', active: false },
  { id: 'llama-3-70b', name: 'Llama 3 70B', active: false },
];

export const AGENT_MODES = [
  { id: 'learning', label: 'Learning Mode', icon: 'book' },
  { id: 'teacher', label: 'Teacher Mode', icon: 'graduation' },
  { id: 'interview', label: 'Interview Mode', icon: 'users' },
  { id: 'quick', label: 'Quick Solution', icon: 'zap' },
] as const;

export const FOLLOW_UP_SUGGESTIONS = [
  'Explain again',
  'Give another example',
  'Can we optimize this?',
  'Why HashMap?',
];
