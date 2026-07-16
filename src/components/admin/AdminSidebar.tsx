'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Activity,
  BarChart3,
  LayoutDashboard,
  Megaphone,
  ScrollText,
  Users,
  X,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { ROUTES } from '@/constants';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { href: ROUTES.ADMIN_DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
  { href: ROUTES.ADMIN_USERS, label: 'Users', icon: Users },
  { href: ROUTES.ADMIN_AI_USAGE, label: 'AI Usage Analytics', icon: BarChart3 },
  { href: ROUTES.ADMIN_AUDIT, label: 'Audit Logs', icon: ScrollText },
  { href: ROUTES.ADMIN_HEALTH, label: 'System Health', icon: Activity },
  { href: ROUTES.ADMIN_BROADCAST, label: 'Broadcast', icon: Megaphone },
] as const;

function isActive(pathname: string, href: string) {
  if (href === ROUTES.ADMIN_USERS) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }
  if (href === ROUTES.ADMIN_AI_USAGE) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }
  return pathname === href;
}

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-[270px] flex-col border-r border-border bg-surface p-5 shadow-lg transition-transform duration-200 lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
              RecentThink
            </p>
            <h1 className="font-heading text-lg font-semibold text-foreground">Admin</h1>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-muted hover:bg-secondary-bg hover:text-foreground lg:hidden"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'text-secondary-text hover:bg-secondary-bg hover:text-foreground',
                )}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
