'use client';

import { useQuery } from '@tanstack/react-query';
import { getAiModels } from '@/services/api/models';
import { useAuthStore } from '@/store/authStore';
import { config } from '@/config';
import { storage } from '@/utils/storage';
import { resolveDefaultModelId, sortModels } from '@/utils/leetcodeModels';
import type { ModelsResponse } from '@/types/ai-models';

function normalizeModelsResponse(data: ModelsResponse): ModelsResponse {
  const models = sortModels(data.models.filter((m) => m.enabled));
  return {
    default_model: data.default_model,
    models,
  };
}

function resolveAccessToken(storeToken: string | null): string | null {
  if (storeToken) return storeToken;
  return storage.get<string>(config.auth.tokenKey) ?? null;
}

/** Shared GET /ai/models query used across learning products. */
export function useAiModels() {
  const storeToken = useAuthStore((s) => s.accessToken);
  const accessToken = resolveAccessToken(storeToken);

  return useQuery({
    queryKey: ['ai-models'],
    queryFn: () => getAiModels(accessToken!),
    enabled: Boolean(accessToken),
    staleTime: 5 * 60 * 1000,
    select: normalizeModelsResponse,
  });
}

/** Selected model, falling back to the platform default from /ai/models. */
export function useResolvedModelId(selectedModelId: string | null | undefined): string | null {
  const { data } = useAiModels();
  return selectedModelId ?? resolveDefaultModelId(data);
}
