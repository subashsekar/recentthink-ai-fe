'use client';

import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface CommandGroupProps {
  label: string;
  children: ReactNode;
  className?: string;
}

export function CommandGroup({ label, children, className }: CommandGroupProps) {
  return (
    <section className={cn('px-2 py-2', className)} role="group" aria-label={label}>
      <h3 className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
        {label}
      </h3>
      <div className="space-y-0.5">{children}</div>
    </section>
  );
}
