import { config } from '@/config';
import type { ModelsResponse } from '@/types/ai-models';
import { createApiRequestError } from '@/utils/apiError';

const gatewayBase = config.api.baseUrl.replace(/\/+$/, '');

export async function getAiModels(accessToken: string): Promise<ModelsResponse> {
  const res = await fetch(`${gatewayBase}/ai/models`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    const detail = await res.text();
    throw createApiRequestError(res.status, detail);
  }

  return res.json() as Promise<ModelsResponse>;
}
