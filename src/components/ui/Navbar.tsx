'use client';

import Link from 'next/link';
import Image from 'next/image';
import { LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { ThemeToggle } from './ThemeToggle';
import { Avatar } from './Avatar';
import { Button } from './Button';
import { ROUTES } from '@/constants';

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/80 backdrop-blur-lg dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href={isAuthenticated ? ROUTES.DASHBOARD : ROUTES.HOME}
          className="flex items-center gap-2"
          aria-label="RecentThink Home"
        >
          <Image
            src="/recentthink-logo.png"
            alt="RecentThink"
            width={32}
            height={32}
            className="dark:invert"
          />
          <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
            RecentThink
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <ThemeToggle />

          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <Link
                href={ROUTES.PROFILE}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                <Avatar name={user.name} size="sm" />
                <span className="hidden sm:inline">{user.name}</span>
              </Link>
              <Button variant="ghost" size="sm" onClick={logout}>
                <LogOut size={16} />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href={ROUTES.LOGIN}>
                <Button variant="ghost" size="sm">
                  Sign in
                </Button>
              </Link>
              <Link href={ROUTES.REGISTER}>
                <Button variant="primary" size="sm">
                  Get started
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
