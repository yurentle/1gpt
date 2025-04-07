import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources';
import { ProviderAPI } from '../../types/api';

export class OpenAIProvider implements ProviderAPI {
  private client: OpenAI;

  constructor(apiKey: string, apiBase?: string) {
    this.client = new OpenAI({
      apiKey,
      baseURL: apiBase,
      dangerouslyAllowBrowser: true,
    });
  }

  async makeStreamCompletion(params: {
    messages: ChatCompletionMessageParam[];
    model: string;
    onUpdate: (content: string) => void;
  }) {
    try {
      const stream = await this.client.chat.completions.create({
        model: params.model,
        messages: params.messages,
        stream: true,
      });

      let currentContent = '';
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          currentContent += content;
          params.onUpdate(currentContent);
        }
      }
    } catch (error) {
      throw new Error(`OpenAI API 错误: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }
}
