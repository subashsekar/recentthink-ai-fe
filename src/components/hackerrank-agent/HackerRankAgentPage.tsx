'use client';

import { ConversationsSidebar } from './ConversationsSidebar';
import { WorkspaceContent } from './WorkspaceContent';
import { SessionStatsDrawer } from './SessionStatsDrawer';
import { IconRail } from '@/components/leetcode-agent/IconRail';

export function HackerRankAgentPage() {
  return (
    <>
      <div className="min-h-0 w-full max-w-full overflow-x-hidden">
        <div className="grid min-h-0 w-full max-w-full grid-cols-1 gap-4 overflow-x-hidden lg:grid-cols-[72px_300px_minmax(0,1fr)] lg:gap-5">
          <IconRail />
          <ConversationsSidebar />
          <WorkspaceContent />
        </div>
      </div>
      <SessionStatsDrawer />
    </>
  );
}
