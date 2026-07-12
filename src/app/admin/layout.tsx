'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut, Menu } from 'lucide-react';
import toast from 'react-hot-toast';
import { AdminRoute } from '@/components/auth/AdminRoute';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { authService } from '@/services/authService';
import { useAuthStore } from '@/store/authStore';
import { ROUTES } from '@/constants';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const logout = useAuthStore((s) => s.logout);

  const isLoginPage = pathname === ROUTES.ADMIN_LOGIN;

  const handleLogout = async () => {
    try {
      if (refreshToken) {
        await authService.adminLogout(refreshToken);
      }
    } catch {
      // Best-effort logout; clear local session regardless.
    } finally {
      logout();
      toast.success('Signed out');
      router.replace(ROUTES.ADMIN_LOGIN);
    }
  };

  if (isLoginPage) {
    return <div className="min-h-screen bg-background">{children}</div>;
  }

  return (
    <AdminRoute>
      <div className="min-h-screen bg-background">
        <div className="mx-auto flex min-h-screen w-full max-w-[1680px]">
          <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

          <div className="flex min-w-0 flex-1 flex-col">
            <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-border bg-surface/90 px-4 backdrop-blur sm:px-6">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSidebarOpen(true)}
                  className="rounded-xl p-2 text-muted hover:bg-secondary-bg hover:text-foreground lg:hidden"
                  aria-label="Open menu"
                >
                  <Menu size={20} />
                </button>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {user?.email ?? 'Admin'}
                  </p>
                  <p className="text-xs text-muted">{user?.role}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <ThemeToggle />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="rounded-xl"
                  onClick={handleLogout}
                >
                  <LogOut size={16} className="mr-1.5" />
                  Logout
                </Button>
              </div>
            </header>

            <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
          </div>
        </div>
      </div>
    </AdminRoute>
  );
}
