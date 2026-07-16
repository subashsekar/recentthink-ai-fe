export function formatInt(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return '—';
  return Math.round(value).toLocaleString();
}

export function formatCost(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return '—';
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(value);
}

export function formatRate(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return '—';
  const pct = value <= 1 ? value * 100 : value;
  return `${pct.toFixed(1)}%`;
}

export function formatMs(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return '—';
  return `${Math.round(value).toLocaleString()} ms`;
}

export function formatNullable(value: string | null | undefined): string {
  if (value == null || value === '') return '—';
  return value;
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

export function topItemLabel(item: {
  label?: string;
  name?: string;
  user_name?: string;
  feature?: string;
  model?: string;
  provider?: string;
  email?: string;
}): string {
  return (
    item.label ||
    item.name ||
    item.user_name ||
    item.feature ||
    item.model ||
    item.provider ||
    item.email ||
    '—'
  );
}

export function topItemValue(item: {
  value?: number;
  tokens?: number;
  total_tokens?: number;
  requests?: number;
  cost?: number;
  estimated_cost?: number;
}): number {
  return (
    item.value ??
    item.total_tokens ??
    item.tokens ??
    item.requests ??
    item.estimated_cost ??
    item.cost ??
    0
  );
}
