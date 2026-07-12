'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Menu } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { ThemeToggle } from './ThemeToggle';
import { Logo } from './Logo';
import { SearchBar } from './SearchBar';
import { ProfileDropdown } from './ProfileDropdown';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { Button } from './Button';
import { ROUTES } from '@/constants';
import { cn } from '@/utils/cn';

interface NavbarProps {
  onMenuClick?: () => void;
  className?: string;
  endActions?: ReactNode;
  glass?: boolean;
}

export function Navbar({ onMenuClick, className, endActions, glass = false }: NavbarProps) {
  const { isAuthenticated } = useAuthStore();

  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={cn(
        'sticky top-0 z-30 flex h-[118px] shrink-0 items-center overflow-visible rounded-[24px] px-6 shadow-lg',
        glass ? 'glass-navbar' : 'border border-border bg-surface',
        className,
      )}
    >
      <div className="flex h-full w-full items-center gap-8">
        <div className="flex shrink-0 items-center gap-3">
          {onMenuClick && (
            <button
              type="button"
              onClick={onMenuClick}
              className={cn(
                'rounded-xl p-2 text-muted transition-colors lg:hidden',
                glass
                  ? 'nav-item-hover hover:text-foreground'
                  : 'hover:bg-secondary-bg hover:text-foreground',
              )}
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
          )}
          <Link
            href={isAuthenticated ? ROUTES.DASHBOARD : ROUTES.HOME}
            aria-label="RecentThink Home"
            className="flex h-[120px] shrink-0 items-center overflow-visible transition-opacity duration-200 hover:opacity-90"
          >
            <Logo variant="navbar" />
          </Link>
        </div>

        {isAuthenticated && (
          <div className="hidden min-w-0 flex-1 items-center justify-center md:flex">
            <SearchBar glass={glass} />
          </div>
        )}

        <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
          {endActions}
          <ThemeToggle
            className={cn(
              'rounded-2xl text-muted',
              glass
                ? 'nav-item-hover hover:text-foreground'
                : 'hover-surface hover:text-foreground',
            )}
          />

          {isAuthenticated ? (
            <>
              <NotificationBell glass={glass} />
              <ProfileDropdown glass={glass} />
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
