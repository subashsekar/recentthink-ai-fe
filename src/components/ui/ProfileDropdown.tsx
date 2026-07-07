'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, LogOut, User } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { Avatar } from './Avatar';
import { Badge } from './Badge';
import { ROUTES } from '@/constants';
import { cn } from '@/utils/cn';

export function ProfileDropdown() {
  const { user, logout } = useAuthStore();
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

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2.5 rounded-2xl px-2 py-1.5 transition-all duration-200 hover:bg-secondary-bg"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <Avatar name={fullName} size="sm" />
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
            className="absolute right-0 top-full z-50 mt-2 w-56 origin-top-right overflow-hidden rounded-2xl border border-border bg-surface shadow-xl"
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
                className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-secondary-bg"
                role="menuitem"
              >
                <User size={16} className="text-muted" />
                Profile
              </Link>
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
