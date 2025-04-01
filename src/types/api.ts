import type { ChatCompletionMessageParam } from 'openai/resources';

export interface ImageGenerationParams {
  prompt: string;
  model: string;
  n: number;
}

export interface ImageGenerationResponse {
  data: {
    url: string;
  }[];
}

export interface ProviderAPI {
  makeImageGeneration?(params: ImageGenerationParams): Promise<ImageGenerationResponse>;
  makeStreamCompletion(params: {
    messages: ChatCompletionMessageParam[];
    model: string;
    onUpdate: (content: string) => void;
  }): Promise<void>;
}
