'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ROUTES } from '@/constants';
import { cn } from '@/utils/cn';

const TABS: Array<{ href: string; label: string; exact?: boolean }> = [
  { href: ROUTES.ADMIN_AI_USAGE, label: 'Overview', exact: true },
  { href: ROUTES.ADMIN_AI_USAGE_TOKENS, label: 'Tokens' },
  { href: ROUTES.ADMIN_AI_USAGE_FEATURES, label: 'Features' },
  { href: ROUTES.ADMIN_AI_USAGE_MODELS, label: 'Models' },
  { href: ROUTES.ADMIN_AI_USAGE_PROVIDERS, label: 'Providers' },
  { href: ROUTES.ADMIN_AI_USAGE_USERS, label: 'Users' },
  { href: ROUTES.ADMIN_AI_USAGE_CHARTS, label: 'Charts' },
  { href: ROUTES.ADMIN_AI_USAGE_COSTS, label: 'Costs' },
  { href: ROUTES.ADMIN_AI_USAGE_REPORTS, label: 'Reports' },
];

export function AiUsageTabs() {
  const pathname = usePathname();

  return (
    <div className="flex flex-wrap gap-1 border-b border-border pb-px">
      {TABS.map((tab) => {
        const active = tab.exact
          ? pathname === tab.href
          : pathname === tab.href || pathname.startsWith(`${tab.href}/`);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              'rounded-t-xl px-3 py-2.5 text-sm font-medium transition-colors sm:px-4',
              active
                ? 'border border-b-0 border-border bg-surface text-foreground'
                : 'text-muted hover:text-foreground',
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
