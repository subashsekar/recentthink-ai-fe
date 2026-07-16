'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AdminQueryState } from '@/components/admin/AdminQueryState';
import { adminApi } from '@/services/api/admin';
import { formatCost, formatInt, formatMs } from '@/utils/adminFormat';
import type { FeatureAnalyticsItem } from '@/types/admin';

const KNOWN_FEATURES = [
  { key: 'leetcode', label: 'LeetCode' },
  { key: 'hackerrank', label: 'HackerRank' },
  { key: 'course_generator', label: 'Course Generator' },
  { key: 'dsa_pattern', label: 'DSA Pattern', aliases: ['dsa', 'dsa_pattern'] },
  { key: 'interview', label: 'Interview' },
] as const;

function findFeature(
  items: FeatureAnalyticsItem[],
  keys: readonly string[],
): FeatureAnalyticsItem | undefined {
  return items.find((item) => keys.includes(String(item.feature).toLowerCase()));
}

export default function AiUsageFeaturesPage() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['admin', 'analytics', 'features'],
    queryFn: adminApi.getFeatureAnalytics,
  });

  const items = data?.items ?? [];

  const cards = useMemo(() => {
    return KNOWN_FEATURES.map((feature) => {
      const aliases =
        'aliases' in feature
          ? (feature.aliases as readonly string[])
          : ([feature.key] as readonly string[]);
      const row = findFeature(items, aliases);
      return { ...feature, row };
    });
  }, [items]);

  const extras = items.filter((item) => {
    const key = String(item.feature).toLowerCase();
    return !KNOWN_FEATURES.some((f) => {
      const aliases = 'aliases' in f ? (f.aliases as readonly string[]) : [f.key];
      return aliases.includes(key);
    });
  });

  return (
    <AdminQueryState
      isLoading={isLoading}
      isError={isError}
      error={error}
      onRetry={() => refetch()}
      isEmpty={!data}
      emptyMessage="No feature analytics"
    >
      <div className="space-y-4">
        <div className="grid gap-4 lg:grid-cols-2">
          {cards.map((card) => (
            <div key={card.key} className="rounded-2xl border border-border bg-surface p-5">
              <h3 className="font-heading text-lg font-semibold text-foreground">{card.label}</h3>
              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-muted">Requests</dt>
                  <dd className="mt-1 font-medium text-foreground">
                    {formatInt(card.row?.requests)}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted">Tokens</dt>
                  <dd className="mt-1 font-medium text-foreground">
                    {formatInt(card.row?.tokens)}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted">Cost</dt>
                  <dd className="mt-1 font-medium text-foreground">{formatCost(card.row?.cost)}</dd>
                </div>
                <div>
                  <dt className="text-muted">Average time</dt>
                  <dd className="mt-1 font-medium text-foreground">
                    {formatMs(card.row?.average_time_ms)}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted">Average tokens</dt>
                  <dd className="mt-1 font-medium text-foreground">
                    {formatInt(card.row?.average_tokens)}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted">Average cost</dt>
                  <dd className="mt-1 font-medium text-foreground">
                    {formatCost(card.row?.average_cost)}
                  </dd>
                </div>
              </dl>
            </div>
          ))}
        </div>

        {extras.length > 0 ? (
          <div className="rounded-2xl border border-border bg-surface p-5">
            <h3 className="mb-3 text-sm font-semibold text-foreground">Other features</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-border text-xs uppercase text-muted">
                  <tr>
                    <th className="px-2 py-2">Feature</th>
                    <th className="px-2 py-2">Requests</th>
                    <th className="px-2 py-2">Tokens</th>
                    <th className="px-2 py-2">Cost</th>
                    <th className="px-2 py-2">Avg time</th>
                  </tr>
                </thead>
                <tbody>
                  {extras.map((item) => (
                    <tr key={item.feature} className="border-b border-border/60">
                      <td className="px-2 py-2">{item.feature}</td>
                      <td className="px-2 py-2">{formatInt(item.requests)}</td>
                      <td className="px-2 py-2">{formatInt(item.tokens)}</td>
                      <td className="px-2 py-2">{formatCost(item.cost)}</td>
                      <td className="px-2 py-2">{formatMs(item.average_time_ms)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </div>
    </AdminQueryState>
  );
}
