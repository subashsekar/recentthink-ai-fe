'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Download, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/utils/cn';
import { useHackerRankChatStore } from '@/store/hackerrankChatStore';
import { REPORT_PAGE_LABELS, REPORT_PAGES, type ReportPage } from '@/utils/hackerrankSession';
import type { HackerRankAgentRole } from '@/types/hackerrank';
import {
  buildSessionReportPdfData,
  exportSessionReportPdf,
} from '@/utils/exportHackerRankReportPdf';
import { ReportContent } from '@/components/leetcode-agent/ReportContent';

export function SessionReport() {
  const currentPage = useHackerRankChatStore((s) => s.currentPage);
  const setCurrentPage = useHackerRankChatStore((s) => s.setCurrentPage);
  const problemStatement = useHackerRankChatStore((s) => s.problemStatement);
  const problemStatementMarkdown = useHackerRankChatStore((s) => s.problemStatementMarkdown);
  const problemStatementHtml = useHackerRankChatStore((s) => s.problemStatementHtml);
  const roleContent = useHackerRankChatStore((s) => s.roleContent);
  const session = useHackerRankChatStore((s) => s.session);
  const isStreaming = useHackerRankChatStore((s) => s.isStreaming);
  const isAnalyzing = useHackerRankChatStore((s) => s.isAnalyzing);
  const [isExporting, setIsExporting] = useState(false);

  const pageIndex = REPORT_PAGES.indexOf(currentPage);
  const canPrev = pageIndex > 0;
  const canNext = pageIndex < REPORT_PAGES.length - 1;

  const hasProblemContent = Boolean(
    problemStatementMarkdown.trim() ||
    problemStatementHtml.trim() ||
    problemStatement.trim() ||
    session?.problem_statement_markdown?.trim() ||
    session?.problem_statement_html?.trim() ||
    session?.problem_statement?.trim(),
  );

  const goPrev = () => {
    if (canPrev) setCurrentPage(REPORT_PAGES[pageIndex - 1]);
  };

  const goNext = () => {
    if (canNext) setCurrentPage(REPORT_PAGES[pageIndex + 1]);
  };

  const getProblemContent = () => ({
    markdown: problemStatementMarkdown || session?.problem_statement_markdown || '',
    html: problemStatementHtml || session?.problem_statement_html || '',
    plain: problemStatement || session?.problem_statement || '',
  });

  const getAgentContent = (role: HackerRankAgentRole) => ({
    markdown: roleContent[role],
    plain: roleContent[role],
  });

  const handleExportPdf = async () => {
    if (
      !hasProblemContent &&
      !REPORT_PAGES.some((page) => page !== 'problem' && roleContent[page]?.trim())
    ) {
      toast.error('No report content available to export.');
      return;
    }

    setIsExporting(true);
    try {
      const problem = getProblemContent();
      const pdfData = buildSessionReportPdfData({
        title: session?.title ?? 'HackerRank Analysis',
        url: session?.url,
        problem,
        roleContent,
        includeEmptySections: true,
      });
      await exportSessionReportPdf(pdfData);
      toast.success('PDF downloaded.');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to generate PDF. Please try again.';
      toast.error(message);
    } finally {
      setIsExporting(false);
    }
  };

  const canExport = Boolean(
    hasProblemContent ||
    REPORT_PAGES.some((page) => page !== 'problem' && roleContent[page]?.trim()),
  );

  const renderPage = (page: ReportPage) => {
    if (page === 'problem') {
      const content = getProblemContent();
      return (
        <ReportContent
          markdown={content.markdown}
          html={content.html}
          plain={content.plain}
          variant="leetcode-problem"
          isLoading={isAnalyzing && !hasProblemContent}
        />
      );
    }

    const role = page as HackerRankAgentRole;
    const content = getAgentContent(role);
    return (
      <ReportContent
        markdown={content.markdown}
        plain={content.plain}
        isLoading={(isAnalyzing || isStreaming) && !content.plain}
      />
    );
  };

  return (
    <section className="flex min-h-0 flex-1 flex-col px-5 py-5 lg:px-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted">Session Report</p>
          <h2 className="font-heading text-xl font-semibold text-foreground">
            {session?.title ?? 'HackerRank Analysis'}
          </h2>
        </div>
        <button
          type="button"
          onClick={() => void handleExportPdf()}
          disabled={isExporting || !canExport}
          className="flex items-center gap-2 rounded-xl glass-panel px-3 py-2 text-xs font-medium text-foreground shadow-sm transition-colors hover-surface disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isExporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
          {isExporting ? 'Generating PDF...' : 'Download PDF'}
        </button>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {REPORT_PAGES.map((page) => {
          const isActive = page === currentPage;
          const hasContent =
            page === 'problem'
              ? hasProblemContent
              : Boolean(roleContent[page as HackerRankAgentRole]);
          return (
            <button
              key={page}
              type="button"
              onClick={() => setCurrentPage(page)}
              className={cn(
                'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                isActive
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'glass-panel text-muted hover:text-foreground',
                hasContent && !isActive && 'border-primary/20',
              )}
            >
              {REPORT_PAGE_LABELS[page]}
            </button>
          );
        })}
      </div>

      <div className="glass-report min-h-[320px] flex-1 overflow-hidden p-5">
        <div className="glass-report-header -mx-5 -mt-5 mb-3 px-5 py-3">
          <h3 className="font-heading text-lg font-semibold text-foreground">
            {REPORT_PAGE_LABELS[currentPage]}
          </h3>
          {session?.url && currentPage === 'problem' && (
            <p className="mt-1 text-xs text-muted">{session.url}</p>
          )}
        </div>
        {currentPage !== 'problem' ? (
          <div className="chat-bubble-assistant">{renderPage(currentPage)}</div>
        ) : (
          renderPage(currentPage)
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <button
          type="button"
          onClick={goPrev}
          disabled={!canPrev}
          className="flex items-center gap-1 rounded-xl border border-border px-3 py-2 text-sm text-foreground transition-colors hover-surface disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ChevronLeft size={16} />
          Previous
        </button>
        <span className="text-xs text-muted">
          Page {pageIndex + 1} of {REPORT_PAGES.length}
        </span>
        <button
          type="button"
          onClick={goNext}
          disabled={!canNext}
          className="flex items-center gap-1 rounded-xl border border-border px-3 py-2 text-sm text-foreground transition-colors hover-surface disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
          <ChevronRight size={16} />
        </button>
      </div>
    </section>
  );
}
