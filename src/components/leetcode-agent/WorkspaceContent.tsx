'use client';

import { useRef } from 'react';
import { WorkspaceHeader } from './WorkspaceHeader';
import { LeetCodeHero, type LeetCodeHeroHandle } from './LeetCodeHero';
import { ExampleCards } from './ExampleCards';
import { SessionReport } from './SessionReport';
import { PersistentMentorChat } from './PersistentMentorChat';
import { useChatStore } from '@/store/chatStore';
import { hasReportContent } from '@/utils/leetcodeSession';

export function WorkspaceContent() {
  const heroRef = useRef<LeetCodeHeroHandle>(null);

  const activeSessionId = useChatStore((s) => s.activeSessionId);
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
    <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-[24px] glass-panel shadow-lg">
      <WorkspaceHeader />
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        <LeetCodeHero ref={heroRef} />
        <ExampleCards
          onSelectExample={(url) => {
            void heroRef.current?.analyzeUrl(url);
          }}
        />
        {hasSession ? <SessionReport /> : null}
        <PersistentMentorChat key={activeSessionId ?? 'no-session'} />
      </div>
    </div>
  );
}
