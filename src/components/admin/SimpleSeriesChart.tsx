'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { ChartSeriesItem } from '@/types/admin';

interface SimpleChartProps {
  title: string;
  data?: ChartSeriesItem[] | null;
  variant?: 'bar' | 'line';
  valueFormatter?: (value: number) => string;
}

export function SimpleSeriesChart({
  title,
  data,
  variant = 'bar',
  valueFormatter = (v) => v.toLocaleString(),
}: SimpleChartProps) {
  const series = (data ?? []).map((item) => ({
    label: item.label,
    value: Number(item.value) || 0,
  }));

  return (
    <div className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
      <h3 className="mb-4 text-sm font-semibold text-foreground">{title}</h3>
      {series.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted">No chart data</p>
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {variant === 'line' ? (
              <LineChart data={series}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(82,146,255,0.15)" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value) => valueFormatter(Number(value))} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#4f9dff"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            ) : (
              <BarChart data={series}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(82,146,255,0.15)" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value) => valueFormatter(Number(value))} />
                <Bar dataKey="value" fill="#4f9dff" radius={[6, 6, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
