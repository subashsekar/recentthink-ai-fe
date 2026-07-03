'use client';

import { AdminRoute } from '@/components/auth/AdminRoute';
import { useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { useAuthStore } from '@/store/authStore';

export default function AdminDashboardPage() {
  const { user } = useAuthStore();

  return (
    <AdminRoute>
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Manage your application</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card variant="interactive">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Users</p>
            <p className="mt-1 text-3xl font-bold text-zinc-900 dark:text-white">—</p>
          </Card>
          <Card variant="interactive">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Active Sessions</p>
            <p className="mt-1 text-3xl font-bold text-zinc-900 dark:text-white">—</p>
          </Card>
          <Card variant="interactive">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Revenue</p>
            <p className="mt-1 text-3xl font-bold text-zinc-900 dark:text-white">—</p>
          </Card>
        </div>

        <Card>
          <h2 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-white">Admin Info</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Logged in as <strong>{user?.email}</strong> with <strong>{user?.role}</strong> role.
          </p>
        </Card>
      </div>
    </AdminRoute>
  );
}
