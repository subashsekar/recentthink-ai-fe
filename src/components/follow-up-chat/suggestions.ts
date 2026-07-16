import type { FollowUpFeature } from '@/types/followUpChat';
import { ROUTES } from '@/constants';

export const FOLLOW_UP_SUGGESTIONS: Record<FollowUpFeature, string[]> = {
  leetcode: ['Explain again', 'Show Python solution', 'Explain complexity', 'Another example'],
  hackerrank: ['Explain the query', 'Optimize this', 'Edge cases', 'Show Python solution'],
  dsa_pattern: ['Explain again', 'Another practice', 'Compare patterns', 'Show template'],
  course_generator: [
    'Expand lesson',
    'Another assignment',
    'Another project',
    'Explain this lesson',
  ],
};

export const FOLLOW_UP_PLACEHOLDERS: Record<FollowUpFeature, string> = {
  leetcode: 'Ask about this problem…',
  hackerrank: 'Ask about this challenge…',
  dsa_pattern: 'Ask about this pattern…',
  course_generator: 'Ask about this course…',
};

export const FOLLOW_UP_TITLES: Record<FollowUpFeature, string> = {
  leetcode: 'Ask about this problem',
  hackerrank: 'Ask about this challenge',
  dsa_pattern: 'Ask about this pattern',
  course_generator: 'Ask about this course',
};

export const OTHER_AI_PRODUCTS: Array<{ feature: FollowUpFeature; label: string; href: string }> = [
  { feature: 'leetcode', label: 'LeetCode Mentor', href: ROUTES.LEETCODE_AGENT },
  { feature: 'hackerrank', label: 'HackerRank Mentor', href: ROUTES.HACKERRANK_AGENT },
  { feature: 'dsa_pattern', label: 'DSA Pattern Coach', href: ROUTES.DSA_PATTERN },
  { feature: 'course_generator', label: 'Course Generator', href: ROUTES.COURSES },
];
