'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Code2,
  LayoutDashboard,
  Settings,
  Shapes,
  Sparkles,
  Trophy,
  User,
  X,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { ROUTES } from '@/constants';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
  glass?: boolean;
}

const navGroups = [
  {
    label: 'General',
    items: [{ href: ROUTES.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard }],
  },
  {
    label: 'AI Agents',
    items: [
      { href: ROUTES.LEETCODE_AGENT, label: 'LeetCode', icon: Code2 },
      { href: ROUTES.HACKERRANK_AGENT, label: 'HackerRank', icon: Trophy },
      { href: ROUTES.COURSES, label: 'Course Generator', icon: BookOpen },
      { href: ROUTES.DSA_PATTERN, label: 'DSA Coach', icon: Shapes },
    ],
  },
  {
    label: 'Account',
    items: [
      { href: ROUTES.PROFILE, label: 'Profile', icon: User },
      { href: ROUTES.ACCOUNT_SECURITY, label: 'Account Security', icon: Settings },
    ],
  },
] as const;

function isNavActive(pathname: string, href: string) {
  if (href === ROUTES.COURSES) {
    return pathname === ROUTES.COURSES || pathname.startsWith(`${ROUTES.COURSES}/`);
  }
  if (href === ROUTES.DSA_PATTERN) {
    return pathname === ROUTES.DSA_PATTERN || pathname.startsWith(`${ROUTES.DSA_PATTERN}/`);
  }
  return pathname === href;
}

export function Sidebar({ isOpen, onClose, className, glass = false }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {isOpen && (
        <div
          className="glass-overlay fixed inset-0 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <motion.aside
        initial={{ opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-[290px] flex-col rounded-[28px] p-5 shadow-lg transition-all duration-[250ms] ease-out lg:sticky lg:top-6 lg:z-auto lg:h-[calc(100vh-3rem)] lg:translate-x-0',
          glass ? 'glass-sidebar' : 'border border-border bg-surface',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          'm-4 lg:m-0',
          className,
        )}
      >
        <div className="mb-6 flex items-center justify-between lg:hidden">
          <span className="font-heading text-lg font-semibold text-foreground">Menu</span>
          <button
            type="button"
            onClick={onClose}
            className={cn(
              'rounded-xl p-1.5 text-muted transition-all duration-[250ms] ease-out',
              glass
                ? 'nav-item-hover hover:text-foreground'
                : 'hover:bg-secondary-bg hover:text-foreground',
            )}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-6 hidden items-center gap-2.5 px-2 lg:flex">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Sparkles size={18} />
          </div>
          <div>
            <p className="font-heading text-sm font-semibold text-foreground">RecentThink</p>
            <p className="text-[11px] text-muted">AI Learning OS</p>
          </div>
        </div>

        <nav className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto pr-1">
          {navGroups.map((group) => (
            <div key={group.label} className="space-y-1.5">
              <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
                {group.label}
              </p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const active = isNavActive(pathname, item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        'group flex h-12 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-all duration-200',
                        active
                          ? 'nav-item-active'
                          : glass
                            ? 'text-secondary-text nav-item-hover hover:text-foreground'
                            : 'text-muted hover:bg-secondary-bg hover:text-foreground',
                      )}
                    >
                      <item.icon
                        size={18}
                        className={cn(
                          'shrink-0 transition-transform duration-200 group-hover:scale-105',
                          active ? 'text-primary' : 'text-muted group-hover:text-foreground',
                        )}
                      />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </motion.aside>
    </>
  );
}
