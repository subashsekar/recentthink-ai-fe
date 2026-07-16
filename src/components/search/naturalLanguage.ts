import { BookOpen, Code2, LayoutDashboard, User } from 'lucide-react';
import { ROUTES } from '@/constants';
import { LEETCODE_PROBLEMS, problemUrlFromSlug } from './registry';
import type { CommandAction, CommandItemData } from './types';

function normalize(value: string) {
  return value.toLowerCase().trim().replace(/\s+/g, ' ');
}

interface NLMatch {
  confidence: number;
  action: CommandAction;
  title: string;
  subtitle: string;
  category: CommandItemData['category'];
}

/**
 * Interpret natural-language queries into concrete actions.
 * Returns a synthetic command item when confidence is high enough.
 */
export function resolveNaturalLanguage(rawQuery: string): CommandItemData | null {
  const query = normalize(rawQuery);
  if (!query || query.length < 3) return null;

  const match = matchNaturalLanguage(query);
  if (!match || match.confidence < 0.7) return null;

  const icon =
    match.category === 'leetcode'
      ? Code2
      : match.category === 'course'
        ? BookOpen
        : match.action.href === ROUTES.PROFILE
          ? User
          : LayoutDashboard;

  return {
    id: `nl-${match.title.toLowerCase().replace(/\s+/g, '-')}`,
    title: match.title,
    subtitle: match.subtitle,
    category: match.category,
    keywords: [],
    icon,
    badge: 'Smart',
    action: match.action,
  };
}

function matchNaturalLanguage(query: string): NLMatch | null {
  // Open / go to profile
  if (/^(open|go to|show|view)\s+profile$/.test(query) || query === 'open profile') {
    return {
      confidence: 1,
      title: 'Open Profile',
      subtitle: 'Navigate to your profile',
      category: 'navigation',
      action: { type: 'navigate', href: ROUTES.PROFILE },
    };
  }

  if (/^(open|go to|show)\s+(dashboard|home)$/.test(query)) {
    return {
      confidence: 1,
      title: 'Open Dashboard',
      subtitle: 'Navigate to dashboard',
      category: 'navigation',
      action: { type: 'navigate', href: ROUTES.DASHBOARD },
    };
  }

  if (/^(open|go to|show)\s+settings$/.test(query)) {
    return {
      confidence: 1,
      title: 'Open Settings',
      subtitle: 'Navigate to account security',
      category: 'navigation',
      action: { type: 'navigate', href: ROUTES.ACCOUNT_SECURITY },
    };
  }

  // Continue / resume sessions
  if (
    /continue\s+(yesterday|previous|last)\s+(session|chat)/.test(query) ||
    /resume\s+(last|previous)\s+(session|chat)/.test(query) ||
    query === 'continue yesterday session'
  ) {
    return {
      confidence: 0.95,
      title: 'Continue Previous Session',
      subtitle: 'Resume your recent AI conversation',
      category: 'ai-action',
      action: { type: 'resume-session', href: ROUTES.LEETCODE_AGENT },
    };
  }

  // Teach / resume a problem by name
  const teachMatch = query.match(/^(teach|explain|solve|resume|open)\s+(.+)$/);
  if (teachMatch) {
    const problemQuery = teachMatch[2];
    const problem = findProblem(problemQuery);
    if (problem) {
      return {
        confidence: 0.95,
        title: `${capitalize(teachMatch[1])} ${problem.title}`,
        subtitle: `Open LeetCode Agent with ${problem.title}`,
        category: 'leetcode',
        action: {
          type: 'leetcode-problem',
          href: ROUTES.LEETCODE_AGENT,
          problemUrl: problemUrlFromSlug(problem.slug),
          problemTitle: problem.title,
        },
      };
    }
  }

  // Generate X Course
  const courseMatch = query.match(/^(generate|create|build|make)\s+(?:a\s+)?(.+?)\s+course$/);
  if (courseMatch) {
    const skill = capitalizeWords(courseMatch[2]);
    return {
      confidence: 0.95,
      title: `Generate ${skill} Course`,
      subtitle: `Start Course Generator prefilled for ${skill}`,
      category: 'course',
      action: {
        type: 'generate-course',
        href: ROUTES.COURSES,
        skill,
        goal: `Master ${skill}`,
      },
    };
  }

  // Difficulty + topic filters: "Easy Array Problems", "Medium Graph"
  const filterMatch = query.match(/^(easy|medium|hard)\s+(.+?)(?:\s+problems?)?$/);
  if (filterMatch) {
    const difficulty = capitalize(filterMatch[1]) as 'Easy' | 'Medium' | 'Hard';
    const topic = filterMatch[2];
    const problem = LEETCODE_PROBLEMS.find(
      (p) =>
        p.difficulty === difficulty &&
        (p.tags.some((t) => normalize(t).includes(topic)) ||
          p.keywords.some((k) => k.includes(topic) || topic.includes(k))),
    );
    if (problem) {
      return {
        confidence: 0.9,
        title: `${difficulty} ${capitalizeWords(topic)} — ${problem.title}`,
        subtitle: `Open ${problem.title} in LeetCode Agent`,
        category: 'leetcode',
        action: {
          type: 'leetcode-problem',
          href: ROUTES.LEETCODE_AGENT,
          problemUrl: problemUrlFromSlug(problem.slug),
          problemTitle: problem.title,
        },
      };
    }
  }

  // Direct problem name
  const direct = findProblem(query);
  if (direct && normalize(direct.title) === query) {
    return {
      confidence: 1,
      title: direct.title,
      subtitle: `Open in LeetCode Agent`,
      category: 'leetcode',
      action: {
        type: 'leetcode-problem',
        href: ROUTES.LEETCODE_AGENT,
        problemUrl: problemUrlFromSlug(direct.slug),
        problemTitle: direct.title,
      },
    };
  }

  return null;
}

function findProblem(query: string) {
  const q = normalize(query);
  return (
    LEETCODE_PROBLEMS.find((p) => normalize(p.title) === q) ??
    LEETCODE_PROBLEMS.find(
      (p) => normalize(p.title).includes(q) || q.includes(normalize(p.title)),
    ) ??
    LEETCODE_PROBLEMS.find((p) => p.keywords.some((k) => k === q || q.includes(k)))
  );
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

function capitalizeWords(value: string) {
  return value
    .split(/\s+/)
    .map((w) => capitalize(w))
    .join(' ');
}
