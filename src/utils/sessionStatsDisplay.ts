type SessionStats = {
  current_model?: unknown;
  execution_time_ms?: unknown;
  session_duration_ms?: unknown;
  token_usage?: unknown;
  prompt_tokens?: unknown;
  completion_tokens?: unknown;
  estimated_cost_usd?: unknown;
  difficulty?: unknown;
  pattern?: unknown;
  tags?: unknown;
  problem_tags?: unknown;
  problem_status?: unknown;
} & Record<string, unknown>;

type SessionLike = {
  title?: string;
  updated_at?: string;
  stats?: unknown;
  memory?: Record<string, unknown>;
} | null;

const UNAVAILABLE = '—';

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function pickString(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return undefined;
}

function pickNumber(...values: unknown[]): number | undefined {
  for (const value of values) {
    if (typeof value === 'number' && !Number.isNaN(value)) return value;
    if (typeof value === 'string' && value.trim() && !Number.isNaN(Number(value))) {
      return Number(value);
    }
  }
  return undefined;
}

function pickStringArray(...values: unknown[]): string[] | undefined {
  for (const value of values) {
    if (Array.isArray(value)) {
      const items = value
        .map((item) => (typeof item === 'string' ? item.trim() : String(item)))
        .filter(Boolean);
      if (items.length > 0) return items;
    }
    if (typeof value === 'string' && value.trim()) {
      return value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }
  return undefined;
}

export function formatMsDuration(ms?: number): string {
  if (ms == null || Number.isNaN(ms)) return UNAVAILABLE;
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes === 0) return `${seconds} sec`;
  return `${minutes} min ${seconds} sec`;
}

export function formatTokenCount(value?: number): string {
  if (value == null || Number.isNaN(value)) return UNAVAILABLE;
  return value.toLocaleString();
}

export function formatCostUsd(value?: number): string {
  if (value == null || Number.isNaN(value)) return UNAVAILABLE;
  return `$${value.toFixed(4)}`;
}

export function formatDateTime(value?: string): string {
  if (!value) return UNAVAILABLE;
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export interface SessionStatsDisplay {
  currentModel: string;
  sessionDuration: string;
  tokensUsed: string;
  promptTokens: string;
  completionTokens: string;
  estimatedCost: string;
  problemDifficulty: string;
  problemTags: string;
  executionTime: string;
  currentConversation: string;
  selectedLearningMode: string;
  problemStatus: string;
  lastUpdated: string;
}

export function mergeSessionStats(
  liveStats: unknown,
  sessionStats: unknown,
  memory: Record<string, unknown> | undefined,
): SessionStats & Record<string, unknown> {
  const memoryStats = asRecord(memory?.stats);
  return {
    ...memoryStats,
    ...asRecord(sessionStats),
    ...asRecord(liveStats),
    ...asRecord(memory),
  };
}

export function buildSessionStatsDisplay(input: {
  session: SessionLike;
  liveStats: unknown;
  modelLabel: string;
  modeLabel: string;
}): SessionStatsDisplay {
  const memory = asRecord(input.session?.memory);
  const merged = mergeSessionStats(input.liveStats, input.session?.stats, memory);

  const currentModel =
    pickString(
      merged.current_model,
      input.modelLabel !== 'Select model' ? input.modelLabel : undefined,
    ) ?? UNAVAILABLE;

  const sessionDurationMs = pickNumber(
    merged.session_duration_ms,
    memory.session_duration_ms,
    memory.session_duration,
  );

  const executionTimeMs = pickNumber(merged.execution_time_ms, memory.execution_time_ms);

  const tokensUsed = pickNumber(merged.token_usage, memory.token_usage, memory.tokens_used);

  const promptTokens = pickNumber(merged.prompt_tokens, memory.prompt_tokens);
  const completionTokens = pickNumber(merged.completion_tokens, memory.completion_tokens);

  const estimatedCost = pickNumber(merged.estimated_cost_usd, memory.estimated_cost_usd);

  const difficulty = pickString(merged.difficulty, memory.difficulty, memory.problem_difficulty);

  const tags = pickStringArray(merged.tags, merged.problem_tags, memory.tags, memory.problem_tags);

  const problemStatus = pickString(merged.problem_status, memory.problem_status, memory.status);

  return {
    currentModel,
    sessionDuration: formatMsDuration(sessionDurationMs),
    tokensUsed: formatTokenCount(tokensUsed),
    promptTokens: formatTokenCount(promptTokens),
    completionTokens: formatTokenCount(completionTokens),
    estimatedCost: formatCostUsd(estimatedCost),
    problemDifficulty: difficulty ?? UNAVAILABLE,
    problemTags: tags?.length ? tags.join(', ') : UNAVAILABLE,
    executionTime: formatMsDuration(executionTimeMs),
    currentConversation: input.session?.title ?? UNAVAILABLE,
    selectedLearningMode: input.modeLabel || UNAVAILABLE,
    problemStatus: problemStatus ?? UNAVAILABLE,
    lastUpdated: formatDateTime(input.session?.updated_at),
  };
}

export const SESSION_STATS_FIELDS: Array<{ key: keyof SessionStatsDisplay; label: string }> = [
  { key: 'currentModel', label: 'Current Model' },
  { key: 'sessionDuration', label: 'Session Duration' },
  { key: 'tokensUsed', label: 'Tokens Used' },
  { key: 'promptTokens', label: 'Prompt Tokens' },
  { key: 'completionTokens', label: 'Completion Tokens' },
  { key: 'estimatedCost', label: 'Estimated Cost' },
  { key: 'problemDifficulty', label: 'Problem Difficulty' },
  { key: 'problemTags', label: 'Problem Tags' },
  { key: 'executionTime', label: 'Execution Time' },
  { key: 'currentConversation', label: 'Current Conversation' },
  { key: 'selectedLearningMode', label: 'Selected Learning Mode' },
  { key: 'problemStatus', label: 'Problem Status' },
  { key: 'lastUpdated', label: 'Last Updated' },
];
