'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Bell, Menu } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { ThemeToggle } from './ThemeToggle';
import { Logo } from './Logo';
import { SearchBar } from './SearchBar';
import { ProfileDropdown } from './ProfileDropdown';
import { Button } from './Button';
import { ROUTES } from '@/constants';
import { cn } from '@/utils/cn';

interface NavbarProps {
  onMenuClick?: () => void;
  className?: string;
  endActions?: ReactNode;
}

export function Navbar({ onMenuClick, className, endActions }: NavbarProps) {
  const { isAuthenticated } = useAuthStore();

  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={cn(
        'sticky top-0 z-30 flex h-[72px] shrink-0 items-center rounded-[24px] border border-border bg-surface px-6 shadow-lg',
        className,
      )}
    >
      <div className="flex h-full w-full items-center gap-8">
        <div className="flex shrink-0 items-center gap-3">
          {onMenuClick && (
            <button
              type="button"
              onClick={onMenuClick}
              className="rounded-xl p-2 text-muted transition-colors hover:bg-secondary-bg hover:text-foreground lg:hidden"
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
          )}
          <Link
            href={isAuthenticated ? ROUTES.DASHBOARD : ROUTES.HOME}
            aria-label="RecentThink Home"
            className="flex h-12 shrink-0 items-center transition-opacity duration-200 hover:opacity-90"
          >
            <Logo variant="navbar" />
          </Link>
        </div>

        {isAuthenticated && (
          <div className="hidden min-w-0 flex-1 items-center justify-center md:flex">
            <SearchBar />
          </div>
        )}

        <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
          {endActions}
          <ThemeToggle className="rounded-2xl text-muted hover:bg-secondary-bg hover:text-foreground" />

          {isAuthenticated ? (
            <>
              <button
                type="button"
                className="rounded-2xl p-2.5 text-muted transition-all duration-200 hover:bg-secondary-bg hover:text-foreground"
                aria-label="Notifications"
              >
                <Bell size={20} />
              </button>
              <ProfileDropdown />
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href={ROUTES.LOGIN}>
                <Button variant="ghost" size="sm" className="rounded-2xl">
                  Sign in
                </Button>
              </Link>
              <Link href={ROUTES.REGISTER}>
                <Button variant="primary" size="sm" className="rounded-2xl">
                  Get started
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </motion.header>
  );
}
