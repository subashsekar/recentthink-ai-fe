'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { BookOpen, Code2, LayoutDashboard, Trophy, User, X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { ROUTES } from '@/constants';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

const navItems = [
  { href: ROUTES.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
  { href: ROUTES.LEETCODE_AGENT, label: 'LeetCode Agent', icon: Code2 },
  { href: '#', label: 'HackerRank Agent', icon: Trophy },
  { href: '#', label: 'Course Generator', icon: BookOpen },
  { href: ROUTES.PROFILE, label: 'Profile', icon: User },
];

export function Sidebar({ isOpen, onClose, className }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <motion.aside
        initial={{ opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col rounded-[28px] border border-border bg-surface p-5 shadow-lg transition-transform duration-300 ease-out lg:sticky lg:top-6 lg:z-auto lg:h-[calc(100vh-3rem)] lg:translate-x-0',
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
            className="rounded-xl p-1.5 text-muted transition-colors hover:bg-secondary-bg hover:text-foreground"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1.5">
          {navItems.map((item, i) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-primary/10 text-primary shadow-[0_0_20px_rgba(255,90,54,0.15)]'
                    : 'text-muted hover:bg-secondary-bg hover:text-foreground',
                )}
                style={{
                  animation: isOpen ? `slideRight 0.3s ease-out ${0.1 + i * 0.05}s both` : 'none',
                }}
              >
                <item.icon
                  size={20}
                  className={cn(
                    'transition-transform duration-200 group-hover:rotate-3',
                    isActive ? 'text-primary' : 'text-muted group-hover:text-foreground',
                  )}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </motion.aside>
    </>
  );
}
