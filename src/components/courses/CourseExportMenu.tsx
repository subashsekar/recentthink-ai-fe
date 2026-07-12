'use client';

import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { ChevronDown, Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { CourseExportFormat } from '@/types/course';
import { exportCourse, getLastExportFormat, setLastExportFormat } from '@/utils/courseExport';
import { cn } from '@/utils/cn';

interface CourseExportMenuProps {
  courseId: string;
  className?: string;
}

export function CourseExportMenu({ courseId, className }: CourseExportMenuProps) {
  const [open, setOpen] = useState(false);
  const [lastFormat, setLastFormat] = useState<CourseExportFormat>(() => getLastExportFormat());
  const [isExporting, setIsExporting] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const runExport = async (format: CourseExportFormat) => {
    if (!courseId || isExporting) return;
    setIsExporting(true);
    try {
      const result = await exportCourse(format, courseId);
      setLastExportFormat(format);
      setLastFormat(format);
      toast.success(`Downloaded ${result.filename}`);
      setOpen(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Export failed.';
      toast.error(message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <div className="flex overflow-hidden rounded-xl border border-border">
        <Button
          size="sm"
          variant="outline"
          className="rounded-none border-0 border-r border-border"
          isLoading={isExporting}
          disabled={!courseId}
          onClick={() => void runExport(lastFormat)}
          title={lastFormat === 'pdf' ? 'Download PDF' : 'Download Markdown'}
        >
          <Download size={16} />
          Export
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="rounded-none border-0 px-2"
          disabled={!courseId || isExporting}
          aria-expanded={open}
          aria-label="Export options"
          onClick={() => setOpen((v) => !v)}
        >
          <ChevronDown size={16} className={cn('transition-transform', open && 'rotate-180')} />
        </Button>
      </div>

      {open && (
        <div className="absolute right-0 top-11 z-30 w-56 overflow-hidden rounded-xl border border-border bg-surface shadow-lg">
          <button
            type="button"
            disabled={isExporting}
            className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm hover:bg-secondary-bg disabled:opacity-50"
            onClick={() => void runExport('markdown')}
          >
            <FileText size={14} /> Download Markdown
          </button>
          <button
            type="button"
            disabled={isExporting}
            className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm hover:bg-secondary-bg disabled:opacity-50"
            onClick={() => void runExport('pdf')}
          >
            <FileText size={14} /> Download PDF
          </button>
        </div>
      )}
    </div>
  );
}
