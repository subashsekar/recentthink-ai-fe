'use client';

import { useRef } from 'react';
import { WorkspaceHeader } from './WorkspaceHeader';
import { HackerRankHero, type HackerRankHeroHandle } from './HackerRankHero';
import { ExampleCards } from './ExampleCards';
import { FollowUpInput } from './FollowUpInput';
import { SessionReport } from './SessionReport';
import { WorkspaceOverview } from './WorkspaceOverview';
import { useHackerRankChatStore } from '@/store/hackerrankChatStore';
import { hasReportContent } from '@/utils/hackerrankSession';

export function WorkspaceContent() {
  const heroRef = useRef<HackerRankHeroHandle>(null);

  const hasSession = useHackerRankChatStore((s) =>
    hasReportContent({
      activeSessionId: s.activeSessionId,
      session: s.session,
      problemStatement: s.problemStatement,
      problemStatementMarkdown: s.problemStatementMarkdown,
      problemStatementHtml: s.problemStatementHtml,
      roleContent: s.roleContent,
    }),
  );

  return (
    <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-[24px] glass-panel shadow-lg">
      <WorkspaceHeader />
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        {hasSession ? (
          <>
            <SessionReport />
            <FollowUpInput />
          </>
        ) : (
          <>
            <HackerRankHero ref={heroRef} />
            <ExampleCards
              onSelectExample={(url) => {
                void heroRef.current?.analyzeUrl(url);
              }}
            />
            <WorkspaceOverview
              onQuickAction={(url) => {
                void heroRef.current?.analyzeUrl(url);
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}
