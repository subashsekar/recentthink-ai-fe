import type { AiModel } from '@/types/leetcode';

export interface LeetCodeModelOption {
  id: string;
  name: string;
}

/** UI allowlist — matched against GET /ai/models by id or name. */
export const LEETCODE_MODEL_ALLOWLIST: LeetCodeModelOption[] = [
  { id: 'chatgpt-free', name: 'ChatGPT Free' },
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
  { id: 'grok', name: 'Grok' },
  { id: 'qwen', name: 'Qwen' },
  { id: 'deepseek', name: 'DeepSeek' },
];

function normalizeKey(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '');
}

export function resolveLeetCodeModels(apiModels: AiModel[] | undefined): LeetCodeModelOption[] {
  if (!apiModels?.length) return LEETCODE_MODEL_ALLOWLIST;

  const byId = new Map(apiModels.map((m) => [normalizeKey(m.id), m]));
  const byName = new Map(apiModels.map((m) => [normalizeKey(m.name), m]));

  return LEETCODE_MODEL_ALLOWLIST.map((allowed) => {
    const match =
      byId.get(normalizeKey(allowed.id)) ??
      byName.get(normalizeKey(allowed.name)) ??
      apiModels.find(
        (m) =>
          normalizeKey(m.name).includes(normalizeKey(allowed.name)) ||
          normalizeKey(allowed.name).includes(normalizeKey(m.name)),
      );

    return match ? { id: match.id, name: match.name } : allowed;
  });
}

export function getModelLabel(
  modelId: string | undefined | null,
  models: LeetCodeModelOption[],
): string {
  if (!modelId) return 'Select model';
  const match = models.find((m) => m.id === modelId);
  return match?.name ?? modelId;
}
