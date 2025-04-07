import type { ChatCompletionMessageParam } from 'openai/resources';

export interface ProviderAPI {
  makeStreamCompletion(params: {
    messages: ChatCompletionMessageParam[];
    model: string;
    onUpdate: (content: string) => void;
  }): Promise<void>;
}
