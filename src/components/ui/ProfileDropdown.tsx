'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ExternalLink, LogOut, User } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { Avatar } from './Avatar';
import { Badge } from './Badge';
import { ROUTES } from '@/constants';
import { cn } from '@/utils/cn';
import { useMyProfile } from '@/hooks/profile/useProfileQueries';

export function ProfileDropdown({ glass = false }: { glass?: boolean }) {
  const { user, logout } = useAuthStore();
  const { data: profile } = useMyProfile(Boolean(user));
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const fullName = `${user.first_name} ${user.last_name}`;
  const publicUsername = profile?.username;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          'flex items-center gap-2.5 rounded-2xl px-2 py-1.5 transition-all duration-200',
          glass ? 'nav-item-hover hover:text-foreground' : 'hover:bg-secondary-bg',
        )}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <Avatar name={fullName} src={profile?.profile_picture_url ?? undefined} size="sm" />
        <span className="hidden text-sm font-medium text-foreground md:inline">{fullName}</span>
        {user.is_verified && (
          <Badge
            variant="success"
            className="hidden border border-success/20 bg-success/10 text-success lg:inline-flex"
          >
            Verified
          </Badge>
        )}
        <ChevronDown
          size={16}
          className={cn(
            'hidden text-muted transition-transform duration-200 md:block',
            open && 'rotate-180',
          )}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              'absolute right-0 top-full z-50 mt-2 w-56 origin-top-right overflow-hidden rounded-2xl shadow-xl',
              glass ? 'glass-dropdown' : 'border border-border bg-surface',
            )}
            role="menu"
          >
            <div className="border-b border-border px-4 py-3">
              <p className="text-sm font-medium text-foreground">{fullName}</p>
              <p className="truncate text-xs text-muted">{user.email}</p>
            </div>
            <div className="p-1.5">
              <Link
                href={ROUTES.PROFILE}
                onClick={() => setOpen(false)}
                className={cn(
                  'flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-foreground transition-colors',
                  glass ? 'nav-item-hover hover:text-foreground' : 'hover:bg-secondary-bg',
                )}
                role="menuitem"
              >
                <User size={16} className="text-muted" />
                Profile
              </Link>
              {publicUsername && (
                <Link
                  href={ROUTES.PUBLIC_PROFILE(publicUsername)}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-foreground transition-colors',
                    glass ? 'nav-item-hover hover:text-foreground' : 'hover:bg-secondary-bg',
                  )}
                  role="menuitem"
                >
                  <ExternalLink size={16} className="text-muted" />
                  View public profile
                </Link>
              )}
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  logout();
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-error transition-colors hover:bg-red-50"
                role="menuitem"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
