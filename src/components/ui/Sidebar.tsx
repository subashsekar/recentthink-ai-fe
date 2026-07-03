'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, User, Settings, LogOut, X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useAuthStore } from '@/store/authStore';
import { ROUTES } from '@/constants';
import { Logo } from './Logo';
import { Button } from './Button';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { href: ROUTES.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
  { href: ROUTES.PROFILE, label: 'Profile', icon: User },
  { href: '#', label: 'Settings', icon: Settings },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 animate-fade-in bg-black/30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-zinc-200 bg-white transition-all duration-300 ease-out lg:static lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-zinc-200 px-6">
          <Link href={ROUTES.DASHBOARD}>
            <Logo showText textClassName="text-zinc-900" />
          </Link>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-zinc-400 transition-all duration-200 hover:bg-zinc-100 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item, i) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-zinc-100 text-zinc-900'
                    : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900',
                )}
                style={{
                  animation: isOpen ? `slideRight 0.3s ease-out ${0.1 + i * 0.05}s both` : 'none',
                }}
              >
                <item.icon
                  size={18}
                  className="transition-transform duration-200 group-hover:scale-110"
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-zinc-200 p-4">
          <div className="mb-2 flex items-center gap-3 px-3 py-2">
            <div className="h-2 w-2 rounded-full bg-success animate-pulse-soft" />
            <span className="text-sm text-zinc-500">{user?.email}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            fullWidth
            onClick={() => {
              logout();
              onClose();
            }}
          >
            <LogOut size={16} />
            Logout
          </Button>
        </div>
      </aside>
    </>
  );
}
