import Anthropic from '@anthropic-ai/sdk';
import type { ChatCompletionMessageParam } from 'openai/resources';
import { ProviderAPI, ImageGenerationParams, ImageGenerationResponse } from '../../types/api';
import { MessageParam } from '@anthropic-ai/sdk/resources';

export class AnthropicProvider implements ProviderAPI {
  private client: Anthropic;

  constructor(apiKey: string, apiBase?: string) {
    this.client = new Anthropic({
      apiKey,
      baseURL: apiBase,
    });
  }

  async makeImageGeneration(_params: ImageGenerationParams): Promise<ImageGenerationResponse> {
    throw new Error('Anthropic 暂不支持图片生成');
  }

  async makeStreamCompletion(params: {
    messages: ChatCompletionMessageParam[];
    model: string;
    onUpdate: (content: string) => void;
  }) {
    try {
      // 将 OpenAI 格式转换为 Anthropic 格式
      const anthropicMessages = params.messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content as string,
      }));

      const stream = await this.client.messages.create({
        model: params.model,
        messages: anthropicMessages as Array<MessageParam>,
        stream: true,
        max_tokens: 4096,
      });

      let currentContent = '';
      for await (const chunk of stream) {
        const content = chunk.delta?.text;
        if (content) {
          currentContent += content;
          params.onUpdate(currentContent);
        }
      }
    } catch (error) {
      throw new Error(`Anthropic API 错误: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }
}
