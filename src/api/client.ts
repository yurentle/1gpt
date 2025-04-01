import { ProviderFactory } from './providerFactory';
import { useSettingsStore } from '../store/settingsStore';
import { ImageGenerationParams, ImageGenerationResponse } from '../types/api';
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

  static async makeImageGeneration(
    providerId: string,
    params: ImageGenerationParams
  ): Promise<ImageGenerationResponse> {
    const api = this.getProvider(providerId);

    if (!api.makeImageGeneration) {
      throw new Error(`供应商 ${providerId} 不支持图片生成`);
    }

    return api.makeImageGeneration(params);
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
