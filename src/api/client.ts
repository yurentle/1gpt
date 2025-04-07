import { ProviderFactory } from './providerFactory';
import { useSettingsStore } from '../store/settingsStore';
import { ProviderAPI } from '../types/api';

export class APIClient {
  private static getProvider(providerId: string): ProviderAPI {
    const settings = useSettingsStore.getState();
    const provider = settings.providers.find(p => p.id === providerId);

    if (!provider) {
      throw new Error(`未找到供应商: ${providerId}`);
    }

    return ProviderFactory.createProvider(provider, provider.apiKey, provider.apiBase);
  }

  static async makeStreamCompletion(
    providerId: string,
    params: {
      messages: { role: string; content: string }[];
      model: string;
      onUpdate: (content: string) => void;
    }
  ) {
    const api = this.getProvider(providerId);
    return api.makeStreamCompletion(params);
  }
}
