'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChevronsLeft,
  Code2,
  GraduationCap,
  LayoutDashboard,
  PanelLeft,
  Trophy,
  User,
} from 'lucide-react';
import { ROUTES } from '@/constants';
import { cn } from '@/utils/cn';

const navItems = [
  { href: ROUTES.DASHBOARD, icon: LayoutDashboard, label: 'Dashboard' },
  { href: ROUTES.LEETCODE_AGENT, icon: Code2, label: 'LeetCode Agent' },
  { href: '#', icon: Trophy, label: 'HackerRank Agent' },
  { href: '#', icon: GraduationCap, label: 'Course Generator' },
  { href: ROUTES.PROFILE, icon: User, label: 'Profile' },
];

export function IconRail() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-[72px] min-w-0 shrink-0 flex-col items-center rounded-[24px] border border-border bg-surface py-4 shadow-lg lg:flex">
      <nav className="flex flex-1 flex-col items-center gap-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              title={item.label}
              className={cn(
                'flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-200',
                isActive
                  ? 'bg-primary/10 text-primary shadow-[0_0_16px_rgba(255,90,54,0.2)]'
                  : 'text-muted hover:bg-secondary-bg hover:text-foreground',
              )}
            >
              <item.icon size={20} strokeWidth={isActive ? 2.25 : 2} />
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col items-center gap-1 border-t border-border pt-3">
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-xl text-muted transition-colors hover:bg-secondary-bg hover:text-foreground"
          aria-label="Toggle panel"
        >
          <PanelLeft size={18} />
        </button>
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-xl text-muted transition-colors hover:bg-secondary-bg hover:text-foreground"
          aria-label="Collapse sidebar"
        >
          <ChevronsLeft size={18} />
        </button>
      </div>
    </aside>
  );
}
