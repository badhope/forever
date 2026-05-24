import type { ChatMessage, LLMConfig, LLMResponse } from './types';
import { PROVIDERS } from './providers';
import { chatOpenAICompatible } from './openai-client';
import { chatAnthropic } from './anthropic-client';

export type {
  LLMProvider,
  ChatMessage,
  LLMConfig,
  LLMResponse,
  EnvLLMConfig,
  ToolCall,
  ToolDefinition,
  ToolCallResult,
  ChatWithToolsOptions,
  StreamChunk,
  StreamCallback,
  StreamWithToolsResult,
} from './types';

export { detectLLMConfig } from './config';

export {
  PROVIDERS,
  getProvider,
  listProviders,
  listProviderNames,
} from './providers';

export {
  chatOpenAICompatible,
  chatWithTools,
  chatStream,
  chatStreamWithTools,
  parseToolCallArguments,
  createToolResponseMessage,
  createAssistantToolCallMessage,
} from './openai-client';

export { chatAnthropic } from './anthropic-client';

export async function chat(
  messages: Array<{ role: string; content: string }>,
  config: LLMConfig,
): Promise<LLMResponse> {
  const provider = PROVIDERS[config.provider];
  if (!provider) {
    throw new Error(`未知平台: ${config.provider}`);
  }

  const baseUrl = config.baseUrl || provider.baseUrl;
  const model = config.model || provider.defaultModel;
  const temperature = config.temperature ?? 0.8;
  const maxTokens = config.maxTokens ?? 2000;

  if (provider.openaiCompatible) {
    return chatOpenAICompatible(
      messages as ChatMessage[],
      config,
      baseUrl,
      model,
      temperature,
      maxTokens,
    );
  }

  if (config.provider === 'anthropic') {
    return chatAnthropic(
      messages as ChatMessage[],
      config,
      model,
      temperature,
      maxTokens,
    );
  }

  throw new Error(`不支持的平台: ${config.provider}`);
}