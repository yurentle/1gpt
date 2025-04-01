import { OpenAIProvider } from './providers/openai';
import { AnthropicProvider } from './providers/anthropic';
import { ProviderAPI } from '../types/api';
import { Provider } from '../types/provider';

export class ProviderFactory {
  static createProvider(provider: Provider, apiKey: string, apiBase?: string): ProviderAPI {
    switch (provider.id) {
      case 'openai':
        return new OpenAIProvider(apiKey, apiBase);
      case 'anthropic':
        return new AnthropicProvider(apiKey, apiBase);
      default:
        throw new Error(`未知的供应商: ${provider.id}`);
    }
  }
}
