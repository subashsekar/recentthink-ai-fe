import type { ModelInfo, ModelsResponse } from '@/types/ai-models';

export function sortModels(models: ModelInfo[]): ModelInfo[] {
  return [...models].sort((a, b) => {
    if (a.recommended !== b.recommended) return a.recommended ? -1 : 1;
    if (a.default !== b.default) return a.default ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
}

export function resolveDefaultModelId(data: ModelsResponse | undefined): string | null {
  if (!data) return null;
  if (data.default_model) return data.default_model;
  const flagged = data.models.find((m) => m.default);
  if (flagged) return flagged.id;
  return data.models[0]?.id ?? null;
}

export function getModelById(
  modelId: string | undefined | null,
  models: ModelInfo[],
): ModelInfo | undefined {
  if (!modelId) return undefined;
  return models.find((m) => m.id === modelId);
}

export function getModelLabel(modelId: string | undefined | null, models: ModelInfo[]): string {
  if (!modelId) return 'Select model';
  return getModelById(modelId, models)?.name ?? modelId;
}
