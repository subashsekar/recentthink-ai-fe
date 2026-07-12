'use client';

import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { useAuthStore } from '@/store/authStore';
import { ROUTES } from '@/constants';
import { Spinner } from '@/components/ui/Spinner';

function isAdminRole(role: string | undefined) {
  return role === 'ADMIN' || role === 'SUPER_ADMIN';
}

export function AdminRoute({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace(ROUTES.ADMIN_LOGIN);
      return;
    }
    if (!isAdminRole(user?.role)) {
      router.replace(ROUTES.DASHBOARD);
    }
  }, [isAuthenticated, isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner size="lg" />
      </div>
    );
  }
  if (!isAuthenticated) return null;
  if (!isAdminRole(user?.role)) return null;

  return <>{children}</>;
}
