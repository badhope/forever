import type { ChatMessage, LLMConfig, LLMResponse } from './types';
import { PROVIDERS } from './providers';

export async function chatAnthropic(
  messages: ChatMessage[],
  config: LLMConfig,
  model: string,
  temperature: number,
  maxTokens: number,
): Promise<LLMResponse> {
  const systemMsg = messages.find(m => m.role === 'system');
  const chatMessages = messages.filter(m => m.role !== 'system');

  const response = await fetch(`${config.baseUrl || PROVIDERS.anthropic.baseUrl}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      temperature,
      system: systemMsg?.content || '',
      messages: chatMessages.map(m => ({
        role: m.role,
        content: m.content,
      })),
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`[Anthropic] API错误: ${response.status} - ${error}`);
  }

  const data = await response.json() as {
    content: Array<{ text: string }>;
    model?: string;
    usage?: {
      input_tokens?: number;
      output_tokens?: number;
    };
    stop_reason?: string;
  };

  const rawStopReason = data.stop_reason;
  let finishReason: 'stop' | 'length' | 'tool_calls' | 'content_filter' | null = 'stop';
  if (rawStopReason === 'max_tokens') finishReason = 'length';
  else if (rawStopReason === 'stop_sequence') finishReason = 'stop';
  else if (rawStopReason === 'end_turn') finishReason = 'stop';
  else finishReason = null;

  return {
    content: data.content[0].text,
    model: data.model || model,
    provider: 'anthropic',
    usage: {
      promptTokens: data.usage?.input_tokens || 0,
      completionTokens: data.usage?.output_tokens || 0,
      totalTokens: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
    },
    hasToolCalls: false,
    finishReason,
  };
}