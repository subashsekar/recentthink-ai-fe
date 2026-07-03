'use client';

import { useAuthStore } from '@/store/authStore';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';

export default function DashboardPage() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Welcome back, {user?.first_name}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card variant="interactive">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <span className="text-xl text-blue-600 dark:text-blue-400">📊</span>
            </div>
            <div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Total Projects</p>
              <p className="text-2xl font-bold text-zinc-900 dark:text-white">0</p>
            </div>
          </div>
        </Card>

        <Card variant="interactive">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
              <span className="text-xl text-green-600 dark:text-green-400">✅</span>
            </div>
            <div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Completed</p>
              <p className="text-2xl font-bold text-zinc-900 dark:text-white">0</p>
            </div>
          </div>
        </Card>

        <Card variant="interactive">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <span className="text-xl text-purple-600 dark:text-purple-400">⚡</span>
            </div>
            <div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">AI Credits</p>
              <p className="text-2xl font-bold text-zinc-900 dark:text-white">0</p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex items-center gap-4">
          <Avatar name={`${user?.first_name || ''} ${user?.last_name || ''}`} size="lg" />
          <div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
              {user?.first_name} {user?.last_name}
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{user?.email}</p>
            <div className="mt-1 flex items-center gap-2">
              <Badge variant={user?.is_verified ? 'success' : 'warning'}>
                {user?.is_verified ? 'Verified' : 'Unverified'}
              </Badge>
              <Badge>{user?.role}</Badge>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
