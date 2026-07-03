'use client';

import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { useAuthStore } from '@/store/authStore';
import { ROUTES } from '@/constants';

export function AdminRoute({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(ROUTES.ADMIN_LOGIN);
      return;
    }
    if (!isLoading && user && user.role === 'USER') {
      router.replace(ROUTES.DASHBOARD);
    }
  }, [isAuthenticated, isLoading, user, router]);

  if (isLoading) return null;
  if (!isAuthenticated) return null;
  if (user && user.role === 'USER') return null;

  return <>{children}</>;
}
