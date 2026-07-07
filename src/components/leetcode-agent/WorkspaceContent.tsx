'use client';

import { WorkspaceHeader } from './WorkspaceHeader';
import { LeetCodeHero } from './LeetCodeHero';
import { ExampleCards } from './ExampleCards';
import { SupportedModels } from './SupportedModels';
import { FollowUpInput } from './FollowUpInput';
import { SessionReport } from './SessionReport';
import { useChatStore } from '@/store/chatStore';
import { hasReportContent } from '@/utils/leetcodeSession';

export function WorkspaceContent() {
  const hasSession = useChatStore((s) =>
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
    <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-[24px] border border-border bg-surface shadow-lg">
      <WorkspaceHeader />
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        {hasSession ? (
          <>
            <SessionReport />
            <FollowUpInput />
          </>
        ) : (
          <>
            <LeetCodeHero />
            <ExampleCards />
            <SupportedModels />
            <FollowUpInput />
          </>
        )}
      </div>
    </div>
  );
}
