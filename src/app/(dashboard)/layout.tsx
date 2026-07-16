'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AnimatedBackground } from '@/components/layout/AnimatedBackground';
import { Navbar } from '@/components/ui/Navbar';
import { Sidebar } from '@/components/ui/Sidebar';
import { SearchBar } from '@/components/ui/SearchBar';
import { CommandPaletteHotkeys } from '@/components/search/CommandPaletteHotkeys';
import { useCommandPaletteStore } from '@/components/search/commandPaletteStore';
import { SessionStatsTrigger } from '@/components/leetcode-agent/SessionStatsTrigger';
import { SessionStatsTrigger as HackerRankSessionStatsTrigger } from '@/components/hackerrank-agent/SessionStatsTrigger';
import { ROUTES } from '@/constants';
import { hasAnimatedBackground } from '@/utils/animatedBackground';
import { cn } from '@/utils/cn';

function isCoursesAgentPath(pathname: string) {
  return pathname === ROUTES.COURSES || pathname.startsWith(`${ROUTES.COURSES}/`);
}

function isDsaPatternAgentPath(pathname: string) {
  if (pathname === ROUTES.DSA_PATTERN_DASHBOARD) return false;
  return pathname === ROUTES.DSA_PATTERN || pathname.startsWith(`${ROUTES.DSA_PATTERN}/`);
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const paletteOpen = useCommandPaletteStore((s) => s.open);
  const isLeetCodeAgent = pathname === ROUTES.LEETCODE_AGENT;
  const isHackerRankAgent = pathname === ROUTES.HACKERRANK_AGENT;
  const isCoursesAgent = isCoursesAgentPath(pathname);
  const isDsaPatternAgent = isDsaPatternAgentPath(pathname);
  const isAgentWorkspace =
    isLeetCodeAgent || isHackerRankAgent || isCoursesAgent || isDsaPatternAgent;
  const useAnimatedBackground = hasAnimatedBackground(pathname);

  const layoutContent = (
    <div
      className={cn(
        'mx-auto flex min-h-screen w-full max-w-full gap-0 p-0',
        !isAgentWorkspace && 'max-w-[1680px] gap-5 p-4 lg:gap-7 lg:p-6',
      )}
    >
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        glass={useAnimatedBackground}
        className={isAgentWorkspace ? 'lg:hidden' : undefined}
      />

      <div className={cn('flex min-w-0 flex-1 flex-col', !isAgentWorkspace && 'gap-4 lg:gap-6')}>
        <Navbar
          onMenuClick={() => setSidebarOpen(true)}
          glass={useAnimatedBackground}
          endActions={
            isLeetCodeAgent ? (
              <SessionStatsTrigger />
            ) : isHackerRankAgent ? (
              <HackerRankSessionStatsTrigger />
            ) : undefined
          }
          className={
            isAgentWorkspace
              ? 'mb-0 w-full max-w-full rounded-none border-x-0 border-t-0'
              : undefined
          }
        />

        <div className={cn('md:hidden', paletteOpen && 'relative z-[70]')}>
          <SearchBar glass={useAnimatedBackground} />
        </div>

        {isAgentWorkspace ? (
          <div className="min-h-0 flex-1 p-4 lg:p-5">
            <main className="min-w-0 w-full max-w-full overflow-x-hidden">{children}</main>
          </div>
        ) : (
          <main className="flex-1 pb-6">{children}</main>
        )}
      </div>
    </div>
  );

  return (
    <ProtectedRoute>
      <CommandPaletteHotkeys />
      {useAnimatedBackground ? (
        <AnimatedBackground>{layoutContent}</AnimatedBackground>
      ) : (
        <div className="min-h-screen overflow-x-hidden bg-background">{layoutContent}</div>
      )}
    </ProtectedRoute>
  );
}
