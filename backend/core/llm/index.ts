/**
 * Forever - 多平台LLM统一适配器
 * 统一导出入口
 *
 * 支持阿里百炼/通义、DeepSeek、OpenAI、智谱、月之暗面、硅基流动等
 * 所有兼容OpenAI API格式的平台均可直接使用
 */

// 类型导出
export type {
  LLMProvider,
  ChatMessage,
  LLMConfig,
  LLMResponse,
  EnvLLMConfig,
} from './types';

// 平台注册表导出
export { getProvider, listProviders, listProviderNames, PROVIDERS } from './providers';

// 客户端函数导出
export { chatOpenAICompatible, chatStream } from './openai-client';
export { chatAnthropic } from './anthropic-client';

// 配置导出
export { detectLLMConfig } from './config';

// 主函数
import type { ChatMessage, LLMConfig, LLMResponse } from './types';
import { PROVIDERS } from './providers';
import { chatOpenAICompatible } from './openai-client';
import { chatAnthropic } from './anthropic-client';

/**
 * 统一LLM调用
 * 支持所有OpenAI兼容平台 + Anthropic
 */
export async function chat(messages: ChatMessage[], config: LLMConfig): Promise<LLMResponse> {
  const provider = PROVIDERS[config.provider];
  if (!provider) {
    throw new Error(`未知平台: ${config.provider}，可用平台: ${Object.keys(PROVIDERS).join(', ')}`);
  }

  const baseUrl = config.baseUrl || provider.baseUrl;
  const model = config.model || provider.defaultModel;
  const temperature = config.temperature ?? 0.8;
  const maxTokens = config.maxTokens ?? 2000;

  // Anthropic 使用不同的API格式
  if (config.provider === 'anthropic') {
    return chatAnthropic(messages, config, model, temperature, maxTokens);
  }

  // 所有OpenAI兼容平台统一处理
  return chatOpenAICompatible(messages, config, baseUrl, model, temperature, maxTokens);
}
