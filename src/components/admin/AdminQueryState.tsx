'use client';

import type { ReactNode } from 'react';
import { Spinner } from '@/components/ui/Spinner';
import { Alert } from '@/components/ui/Alert';
import { getAxiosErrorMessage } from '@/utils/courseError';

interface QueryStateProps {
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  onRetry?: () => void;
  isEmpty?: boolean;
  emptyMessage?: string;
  children: ReactNode;
}

export function AdminQueryState({
  isLoading,
  isError,
  error,
  onRetry,
  isEmpty,
  emptyMessage = 'No data available',
  children,
}: QueryStateProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="error">
        <span className="flex flex-wrap items-center gap-2">
          {getAxiosErrorMessage(error, 'Failed to load data')}
          {onRetry ? (
            <button type="button" className="underline underline-offset-2" onClick={onRetry}>
              Retry
            </button>
          ) : null}
        </span>
      </Alert>
    );
  }

  if (isEmpty) {
    return (
      <div className="rounded-2xl border border-border bg-surface px-4 py-12 text-center text-sm text-muted">
        {emptyMessage}
      </div>
    );
  }

  return <>{children}</>;
}
