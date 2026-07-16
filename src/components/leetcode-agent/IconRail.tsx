'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Code2, GraduationCap, LayoutDashboard, Shapes, Trophy } from 'lucide-react';
import { ROUTES } from '@/constants';
import { cn } from '@/utils/cn';

const navItems = [
  { href: ROUTES.DASHBOARD, icon: LayoutDashboard, label: 'Dashboard' },
  { href: ROUTES.LEETCODE_AGENT, icon: Code2, label: 'LeetCode' },
  { href: ROUTES.HACKERRANK_AGENT, icon: Trophy, label: 'HackerRank' },
  { href: ROUTES.COURSES, icon: GraduationCap, label: 'Course Generator' },
  { href: ROUTES.DSA_PATTERN, icon: Shapes, label: 'DSA Coach' },
];

export function IconRail() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-[72px] min-w-0 shrink-0 flex-col items-center rounded-[24px] glass-panel py-4 shadow-lg lg:flex">
      <nav className="flex flex-1 flex-col items-center gap-1">
        {navItems.map((item) => {
          const isActive =
            item.href === ROUTES.COURSES
              ? pathname === ROUTES.COURSES || pathname.startsWith(`${ROUTES.COURSES}/`)
              : item.href === ROUTES.DSA_PATTERN
                ? pathname === ROUTES.DSA_PATTERN || pathname.startsWith(`${ROUTES.DSA_PATTERN}/`)
                : pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              title={item.label}
              aria-label={item.label}
              className={cn(
                'flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-200',
                isActive
                  ? 'nav-item-active text-primary shadow-[0_0_16px_rgba(79,157,255,0.2)]'
                  : 'text-muted nav-item-hover hover:text-foreground',
              )}
            >
              <item.icon size={20} strokeWidth={isActive ? 2.25 : 2} />
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
