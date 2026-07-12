import { ROUTES } from '@/constants';

const ANIMATED_BACKGROUND_ROUTES = [
  ROUTES.DASHBOARD,
  ROUTES.LEETCODE_AGENT,
  ROUTES.HACKERRANK_AGENT,
  ROUTES.PROFILE,
  ROUTES.ACCOUNT_SECURITY,
] as const;

export function hasAnimatedBackground(pathname: string): boolean {
  if (pathname === ROUTES.COURSES || pathname.startsWith(`${ROUTES.COURSES}/`)) {
    return true;
  }
  if (pathname === ROUTES.DSA_PATTERN || pathname.startsWith(`${ROUTES.DSA_PATTERN}/`)) {
    return true;
  }
  // Public profiles: /u/{username} and /profile/{username}
  if (pathname.startsWith('/u/') || /^\/profile\/[^/]+$/.test(pathname)) {
    return true;
  }
  return (ANIMATED_BACKGROUND_ROUTES as readonly string[]).includes(pathname);
}
