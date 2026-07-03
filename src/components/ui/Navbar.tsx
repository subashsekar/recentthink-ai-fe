'use client';

import Link from 'next/link';
import { LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { ThemeToggle } from './ThemeToggle';
import { Avatar } from './Avatar';
import { Button } from './Button';
import { Logo } from './Logo';
import { ROUTES } from '@/constants';

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();

  return (
    <header className="sticky top-0 z-30 animate-slide-down border-b border-zinc-200 bg-white/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between pl-3 pr-0">
        <Link
          href={isAuthenticated ? ROUTES.DASHBOARD : ROUTES.HOME}
          aria-label="RecentThink Home"
          className="group flex items-center transition-all duration-200 hover:scale-[1.02]"
        >
          <span className="transition-all duration-200 group-hover:brightness-110">
            <Logo width={48} height={48} showText textClassName="text-zinc-900" />
          </span>
        </Link>

        <div className="flex items-center gap-2 pr-0 sm:gap-3">
          <ThemeToggle />

          {isAuthenticated && user ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href={ROUTES.PROFILE}
                className="relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-600 transition-all duration-200 hover:bg-zinc-100"
              >
                <Avatar name={`${user.first_name} ${user.last_name}`} size="sm" />
                <span className="hidden sm:inline">
                  {user.first_name} {user.last_name}
                </span>
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
