'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { adminApi } from '@/services/api/admin';
import type { AnalyticsExportFormat, AnalyticsExportReport } from '@/types/admin';
import { getAxiosErrorMessage } from '@/utils/courseError';

const REPORTS: Array<{ id: AnalyticsExportReport; label: string }> = [
  { id: 'user_usage', label: 'User usage' },
  { id: 'feature_usage', label: 'Feature usage' },
  { id: 'model_usage', label: 'Model usage' },
  { id: 'provider_usage', label: 'Provider usage' },
  { id: 'token_usage', label: 'Token usage' },
  { id: 'cost_analysis', label: 'Cost analysis' },
];

const FORMATS: AnalyticsExportFormat[] = ['csv', 'excel', 'pdf'];

export default function AiUsageReportsPage() {
  const [pending, setPending] = useState<string | null>(null);

  const download = async (report: AnalyticsExportReport, format: AnalyticsExportFormat) => {
    const key = `${report}:${format}`;
    setPending(key);
    try {
      await adminApi.exportAnalyticsReport(report, format);
      toast.success(`Downloaded ${report} (${format})`);
    } catch (err) {
      toast.error(getAxiosErrorMessage(err, 'Export failed'));
    } finally {
      setPending(null);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        Export reports as CSV, Excel, or PDF via Gateway{' '}
        <code className="text-xs">/admin/analytics/export</code>.
      </p>

      <div className="grid gap-4 lg:grid-cols-2">
        {REPORTS.map((report) => (
          <div key={report.id} className="rounded-2xl border border-border bg-surface p-5">
            <h3 className="font-heading text-base font-semibold text-foreground">{report.label}</h3>
            <p className="mt-1 text-xs text-muted">report={report.id}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {FORMATS.map((format) => {
                const key = `${report.id}:${format}`;
                return (
                  <Button
                    key={format}
                    type="button"
                    size="sm"
                    variant="outline"
                    className="rounded-xl capitalize"
                    isLoading={pending === key}
                    disabled={pending !== null && pending !== key}
                    onClick={() => download(report.id, format)}
                  >
                    Export {format}
                  </Button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
