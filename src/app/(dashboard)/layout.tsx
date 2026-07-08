'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Navbar } from '@/components/ui/Navbar';
import { Sidebar } from '@/components/ui/Sidebar';
import { SearchBar } from '@/components/ui/SearchBar';
import { SessionStatsTrigger } from '@/components/leetcode-agent/SessionStatsTrigger';
import { ROUTES } from '@/constants';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const isLeetCodeAgent = pathname === ROUTES.LEETCODE_AGENT;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background overflow-x-hidden">
        <div
          className={
            isLeetCodeAgent
              ? 'mx-auto flex min-h-screen w-full max-w-full gap-0 p-0'
              : 'mx-auto flex min-h-screen max-w-[1600px] gap-4 p-4 lg:gap-6 lg:p-6'
          }
        >
          <Sidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            className={isLeetCodeAgent ? 'lg:hidden' : undefined}
          />

          <div
            className={
              isLeetCodeAgent
                ? 'flex min-w-0 flex-1 flex-col'
                : 'flex min-w-0 flex-1 flex-col gap-4 lg:gap-6'
            }
          >
            <Navbar
              onMenuClick={() => setSidebarOpen(true)}
              endActions={isLeetCodeAgent ? <SessionStatsTrigger /> : undefined}
              className={
                isLeetCodeAgent
                  ? 'mb-0 w-full max-w-full rounded-none border-x-0 border-t-0'
                  : undefined
              }
            />

            <div className="md:hidden">
              <SearchBar />
            </div>

            {isLeetCodeAgent ? (
              <div className="min-h-0 flex-1">
                <main className="min-w-0 w-full max-w-full overflow-x-hidden">{children}</main>
              </div>
            ) : (
              <main className="flex-1 pb-6">{children}</main>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
