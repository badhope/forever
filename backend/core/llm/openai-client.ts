/**
 * Forever - OpenAI兼容客户端
 * 覆盖95%的平台（所有兼容OpenAI API格式的平台）
 */

import type { ChatMessage, LLMConfig, LLMResponse } from './types';
import { PROVIDERS } from './providers';

/**
 * OpenAI兼容格式调用
 */
export async function chatOpenAICompatible(
  messages: ChatMessage[],
  config: LLMConfig,
  baseUrl: string,
  model: string,
  temperature: number,
  maxTokens: number,
): Promise<LLMResponse> {
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      top_p: config.topP,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`[${config.provider}] API错误: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return {
    content: data.choices[0].message.content,
    model: data.model || model,
    provider: config.provider,
    usage: {
      promptTokens: data.usage?.prompt_tokens || 0,
      completionTokens: data.usage?.completion_tokens || 0,
      totalTokens: data.usage?.total_tokens || 0,
    },
  };
}

/**
 * 流式调用（OpenAI兼容）
 */
export async function chatStream(
  messages: ChatMessage[],
  config: LLMConfig,
  onChunk: (chunk: string) => void,
): Promise<void> {
  const provider = PROVIDERS[config.provider];
  if (!provider) throw new Error(`未知平台: ${config.provider}`);
  if (config.provider === 'anthropic') {
    throw new Error('Anthropic流式调用暂不支持，请使用chat()');
  }

  const baseUrl = config.baseUrl || provider.baseUrl;
  const model = config.model || provider.defaultModel;

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: config.temperature ?? 0.8,
      max_tokens: config.maxTokens ?? 2000,
      stream: true,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`[${config.provider}] API错误: ${response.status} - ${error}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('无响应体');

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') continue;
        try {
          const parsed = JSON.parse(data);
          const chunk = parsed.choices?.[0]?.delta?.content;
          if (chunk) onChunk(chunk);
        } catch { /* 忽略解析错误 */ }
      }
    }
  }
}
