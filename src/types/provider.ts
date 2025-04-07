export interface Model {
  id: string;
  name: string;
  provider: string;
  capabilities: {
    chat: boolean;
    imageGeneration: boolean;
  };
  maxTokens?: number;
  temperature?: number;
  contextLength?: number;
  defaultTemperature?: number;
}

export interface Provider {
  id: string;
  name: string;
  defaultApiBase?: string;
  supportedModels: Model[];
  defaultModel?: string;
}

export interface ProviderConfig extends Provider {
  apiKey: string;
  apiBase?: string;
}
