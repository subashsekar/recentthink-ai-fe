'use client';

import { AiUsageTabs } from '@/components/admin/AiUsageTabs';

export default function AiUsageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Insights</p>
        <h1 className="mt-1 font-heading text-2xl font-semibold text-foreground sm:text-3xl">
          AI Usage Analytics
        </h1>
        <p className="mt-1 text-sm text-muted">
          Tokens, features, models, providers, users, costs, and exports via Gateway
        </p>
      </div>
      <AiUsageTabs />
      {children}
    </div>
  );
}
