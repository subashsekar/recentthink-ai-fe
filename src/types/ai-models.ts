export type ModelInfo = {
  id: string;
  name: string;
  provider: string;
  description: string | null;
  recommended: boolean;
  default: boolean;
  enabled: boolean;
  tier?: string;
  context_window?: number;
  supports_vision?: boolean;
  supports_streaming?: boolean;
};

export type ModelsResponse = {
  default_model: string;
  models: ModelInfo[];
};
