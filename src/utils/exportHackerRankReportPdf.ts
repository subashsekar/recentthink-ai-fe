import { jsPDF } from 'jspdf';
import type { HackerRankAgentRole } from '@/types/hackerrank';
import { plainTextToLeetCodeMarkdown } from '@/utils/formatProblemStatement';
import { REPORT_PAGE_LABELS, REPORT_PAGES, type ReportPage } from '@/utils/hackerrankSession';
import { contentToPdfLines, type PdfTextLine, type PdfTextStyle } from '@/utils/markdownForPdf';

const MARGIN_X = 20;
const MARGIN_TOP = 22;
const FOOTER_Y_OFFSET = 12;
const BRAND: [number, number, number] = [255, 90, 54];
const INK: [number, number, number] = [23, 23, 23];
const MUTED: [number, number, number] = [115, 115, 115];

export interface SessionReportPdfSection {
  page: ReportPage;
  label: string;
  contentLines: PdfTextLine[];
}

export interface SessionReportPdfData {
  title: string;
  url?: string;
  sections: SessionReportPdfSection[];
}

interface StyleSpec {
  fontSize: number;
  fontStyle: 'normal' | 'bold';
  font: 'helvetica' | 'courier';
  color: [number, number, number];
  lineHeight: number;
  gapAfter: number;
}

const STYLES: Record<PdfTextStyle, StyleSpec> = {
  cover: {
    fontSize: 10,
    fontStyle: 'normal',
    font: 'helvetica',
    color: MUTED,
    lineHeight: 1.45,
    gapAfter: 2,
  },
  section: {
    fontSize: 20,
    fontStyle: 'bold',
    font: 'helvetica',
    color: INK,
    lineHeight: 1.15,
    gapAfter: 3,
  },
  subtitle: {
    fontSize: 13,
    fontStyle: 'bold',
    font: 'helvetica',
    color: INK,
    lineHeight: 1.25,
    gapAfter: 2,
  },
  meta: {
    fontSize: 10,
    fontStyle: 'normal',
    font: 'helvetica',
    color: MUTED,
    lineHeight: 1.35,
    gapAfter: 2.5,
  },
  heading: {
    fontSize: 12.5,
    fontStyle: 'bold',
    font: 'helvetica',
    color: INK,
    lineHeight: 1.3,
    gapAfter: 2,
  },
  subheading: {
    fontSize: 11.5,
    fontStyle: 'bold',
    font: 'helvetica',
    color: INK,
    lineHeight: 1.3,
    gapAfter: 1.8,
  },
  body: {
    fontSize: 11,
    fontStyle: 'normal',
    font: 'helvetica',
    color: INK,
    lineHeight: 1.55,
    gapAfter: 1.6,
  },
  bullet: {
    fontSize: 11,
    fontStyle: 'normal',
    font: 'helvetica',
    color: INK,
    lineHeight: 1.45,
    gapAfter: 1.2,
  },
  code: {
    fontSize: 9.5,
    fontStyle: 'normal',
    font: 'courier',
    color: INK,
    lineHeight: 1.35,
    gapAfter: 2.5,
  },
};

class PdfDocumentBuilder {
  private readonly pdf: jsPDF;
  private readonly pageWidth: number;
  private readonly pageHeight: number;
  private readonly contentWidth: number;
  private currentData: SessionReportPdfData | null = null;
  private currentSection: SessionReportPdfSection | null = null;
  private hasWrittenContent = false;

  constructor() {
    this.pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    this.pageWidth = this.pdf.internal.pageSize.getWidth();
    this.pageHeight = this.pdf.internal.pageSize.getHeight();
    this.contentWidth = this.pageWidth - MARGIN_X * 2;
  }

  private bottomLimit(): number {
    return this.pageHeight - FOOTER_Y_OFFSET - 6;
  }

  private lineHeightMm(spec: StyleSpec): number {
    return (spec.fontSize * spec.lineHeight * 25.4) / 72;
  }

  private apply(spec: StyleSpec): void {
    this.pdf.setFont(spec.font, spec.fontStyle);
    this.pdf.setFontSize(spec.fontSize);
    this.pdf.setTextColor(spec.color[0], spec.color[1], spec.color[2]);
  }

  private drawBrandRule(y: number): void {
    this.pdf.setDrawColor(BRAND[0], BRAND[1], BRAND[2]);
    this.pdf.setLineWidth(0.8);
    this.pdf.line(MARGIN_X, y, this.pageWidth - MARGIN_X, y);
  }

  private drawFooters(): void {
    const total = this.pdf.getNumberOfPages();
    for (let page = 1; page <= total; page += 1) {
      this.pdf.setPage(page);
      const y = this.pageHeight - FOOTER_Y_OFFSET;
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.setFontSize(9);
      this.pdf.setTextColor(MUTED[0], MUTED[1], MUTED[2]);
      this.pdf.text('HackerRank Mentor Report', MARGIN_X, y);
      this.pdf.text(`Page ${page} of ${total}`, this.pageWidth - MARGIN_X, y, { align: 'right' });
    }
  }

  startSection(
    data: SessionReportPdfData,
    section: SessionReportPdfSection,
    continued = false,
  ): number {
    if (this.hasWrittenContent) {
      this.pdf.addPage();
    } else {
      this.hasWrittenContent = true;
    }

    this.currentData = data;
    this.currentSection = section;
    let y = MARGIN_TOP;

    this.drawBrandRule(y);
    y += 8;

    this.apply(STYLES.cover);
    this.pdf.text(
      continued ? `${section.label.toUpperCase()} (CONTINUED)` : section.label.toUpperCase(),
      MARGIN_X,
      y,
      {
        baseline: 'top',
      },
    );
    y += 6;

    if (!continued && section.page === 'problem') {
      this.apply(STYLES.subtitle);
      this.pdf.text(data.title, MARGIN_X, y, { baseline: 'top' });
      y += 7;

      if (data.url) {
        this.apply(STYLES.meta);
        const urlLines = this.pdf.splitTextToSize(data.url, this.contentWidth);
        for (const line of urlLines) {
          this.pdf.text(line, MARGIN_X, y, { baseline: 'top' });
          y += this.lineHeightMm(STYLES.meta);
        }
      }
      y += 4;
    }

    this.pdf.setDrawColor(230, 230, 230);
    this.pdf.setLineWidth(0.2);
    this.pdf.line(MARGIN_X, y, this.pageWidth - MARGIN_X, y);
    return y + 8;
  }

  private ensureSpace(y: number, needed: number): number {
    if (y + needed <= this.bottomLimit()) return y;
    if (!this.currentData || !this.currentSection) return y;
    return this.startSection(this.currentData, this.currentSection, true);
  }

  private writeWrappedLines(lines: string[], x: number, y: number, spec: StyleSpec): number {
    const lineHeight = this.lineHeightMm(spec);
    let cursorY = y;

    for (const line of lines) {
      cursorY = this.ensureSpace(cursorY, lineHeight);
      this.apply(spec);
      this.pdf.text(line, x, cursorY, { baseline: 'top' });
      cursorY += lineHeight;
    }

    return cursorY;
  }

  writeContentBlock(line: PdfTextLine, y: number): number {
    if (!line.text) return y + 2;

    const spec = STYLES[line.style];
    this.apply(spec);

    if (line.style === 'code') {
      const wrapped = this.pdf.splitTextToSize(line.text, this.contentWidth - 8);
      const lineHeight = this.lineHeightMm(spec);
      const boxHeight = wrapped.length * lineHeight + 6;
      const cursorY = this.ensureSpace(y, boxHeight);

      this.pdf.setFillColor(247, 248, 250);
      this.pdf.setDrawColor(235, 236, 240);
      this.pdf.roundedRect(MARGIN_X, cursorY, this.contentWidth, boxHeight, 2, 2, 'FD');

      this.apply(spec);
      let textY = cursorY + 4;
      for (const codeLine of wrapped) {
        this.pdf.text(codeLine, MARGIN_X + 4, textY, { baseline: 'top' });
        textY += lineHeight;
      }

      return cursorY + boxHeight + spec.gapAfter;
    }

    const wrapped = this.pdf.splitTextToSize(line.text, this.contentWidth);
    const x = line.style === 'bullet' ? MARGIN_X + 2 : MARGIN_X;
    const cursorY = this.writeWrappedLines(wrapped, x, y, spec);
    return cursorY + spec.gapAfter;
  }

  writeSection(data: SessionReportPdfData, section: SessionReportPdfSection): void {
    let y = this.startSection(data, section);

    for (const line of section.contentLines) {
      y = this.writeContentBlock(line, y);
    }
  }

  save(filename: string): void {
    this.drawFooters();
    this.pdf.save(filename);
  }
}

function slugifyFilename(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function resolveProblemLines(problem: {
  markdown?: string;
  html?: string;
  plain?: string;
}): PdfTextLine[] {
  const markdown =
    problem.markdown?.trim() ||
    (problem.plain?.trim() ? plainTextToLeetCodeMarkdown(problem.plain) : '');

  if (markdown) return contentToPdfLines({ markdown });
  if (problem.html?.trim()) return contentToPdfLines({ html: problem.html });
  return [];
}

export function buildSessionReportPdfData(input: {
  title: string;
  url?: string;
  problem: { markdown?: string; html?: string; plain?: string };
  roleContent: Record<HackerRankAgentRole, string>;
  includeEmptySections?: boolean;
}): SessionReportPdfData {
  const sections: SessionReportPdfSection[] = [];

  for (const page of REPORT_PAGES) {
    const content =
      page === 'problem'
        ? resolveProblemLines(input.problem)
        : contentToPdfLines({ markdown: input.roleContent[page], plain: input.roleContent[page] });

    if (!content.length && !input.includeEmptySections) continue;

    sections.push({
      page,
      label: REPORT_PAGE_LABELS[page],
      contentLines:
        content.length > 0
          ? content
          : [{ text: 'No content available for this section yet.', style: 'meta' }],
    });
  }

  return {
    title: input.title,
    url: input.url,
    sections,
  };
}

export async function exportSessionReportPdf(data: SessionReportPdfData): Promise<void> {
  if (data.sections.length === 0) {
    throw new Error('No report content available to export.');
  }

  const builder = new PdfDocumentBuilder();

  for (const section of data.sections) {
    builder.writeSection(data, section);
  }

  const safeName = slugifyFilename(data.title) || 'hackerrank-report';
  builder.save(`${safeName}.pdf`);
}
