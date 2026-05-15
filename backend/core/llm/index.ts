/**
 * Forever - 多平台LLM统一适配器
 * 统一导出入口
 *
 * 支持阿里百炼/通义、DeepSeek、OpenAI、智谱、月之暗面、硅基流动等
 * 所有兼容OpenAI API格式的平台均可直接使用
 * 
 * 新增功能：
 * - 函数调用（Function Calling）支持
 * - 流式输出支持
 * - 工具调用结果解析
 */

// ============================================================================
// 类型导出
// ============================================================================

export type {
  LLMProvider,
  ChatMessage,
  LLMConfig,
  LLMResponse,
  EnvLLMConfig,
  // 函数调用相关类型
  ToolCall,
  ToolDefinition,
  ToolCallResult,
  ChatWithToolsOptions,
  // 流式输出相关类型
  StreamChunk,
  StreamCallback,
  StreamWithToolsResult,
} from './types';

// ============================================================================
// 平台注册表导出
// ============================================================================

export { getProvider, listProviders, listProviderNames, PROVIDERS } from './providers';

// ============================================================================
// 客户端函数导出
// ============================================================================

export {
  // 基础调用
  chatOpenAICompatible,
  // 函数调用
  chatWithTools,
  // 流式输出
  chatStream,
  chatStreamWithTools,
  // 辅助函数
  parseToolCallArguments,
  createToolResponseMessage,
  createAssistantToolCallMessage,
} from './openai-client';

export { chatAnthropic } from './anthropic-client';

// ============================================================================
// 配置导出
// ============================================================================

export { detectLLMConfig } from './config';

// ============================================================================
// 主函数
// ============================================================================

import type {
  ChatMessage,
  LLMConfig,
  LLMResponse,
  ToolDefinition,
  ChatWithToolsOptions,
  StreamCallback,
  StreamWithToolsResult,
} from './types';
import { PROVIDERS } from './providers';
import {
  chatOpenAICompatible,
  chatWithTools,
  chatStream,
  chatStreamWithTools,
} from './openai-client';
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

/**
 * 带函数调用的统一LLM调用
 * 
 * 支持所有OpenAI兼容平台（需要平台本身支持 function calling）
 * 
 * @example
 * ```typescript
 * const response = await chatWithTools(
 *   messages,
 *   config,
 *   {
 *     tools: [
 *       {
 *         type: 'function',
 *         function: {
 *           name: 'get_weather',
 *           description: '获取指定城市的天气',
 *           parameters: {
 *             type: 'object',
 *             properties: {
 *               city: { type: 'string', description: '城市名称' }
 *             },
 *             required: ['city']
 *           }
 *         }
 *       }
 *     ],
 *     toolChoice: 'auto'
 *   }
 * );
 * 
 * if (response.hasToolCalls) {
 *   for (const toolCall of response.toolCalls!) {
 *     console.log(`调用工具: ${toolCall.function.name}`);
 *     console.log(`参数: ${toolCall.function.arguments}`);
 *   }
 * }
 * ```
 */
export async function chatWithToolsUnified(
  messages: ChatMessage[],
  config: LLMConfig,
  options: ChatWithToolsOptions = {},
): Promise<LLMResponse> {
  const provider = PROVIDERS[config.provider];
  if (!provider) {
    throw new Error(`未知平台: ${config.provider}，可用平台: ${Object.keys(PROVIDERS).join(', ')}`);
  }

  // Anthropic 暂不支持函数调用
  if (config.provider === 'anthropic') {
    throw new Error('Anthropic 暂不支持函数调用，请使用 chat()');
  }

  const baseUrl = config.baseUrl || provider.baseUrl;
  const model = config.model || provider.defaultModel;
  const temperature = config.temperature ?? 0.8;
  const maxTokens = config.maxTokens ?? 2000;

  return chatWithTools(messages, config, baseUrl, model, temperature, maxTokens, options);
}

/**
 * 流式输出统一调用
 * 
 * @example
 * ```typescript
 * await chatStreamUnified(
 *   messages,
 *   config,
 *   (chunk) => {
 *     process.stdout.write(chunk);
 *   }
 * );
 * ```
 */
export async function chatStreamUnified(
  messages: ChatMessage[],
  config: LLMConfig,
  onChunk: (chunk: string) => void,
): Promise<void> {
  const provider = PROVIDERS[config.provider];
  if (!provider) {
    throw new Error(`未知平台: ${config.provider}`);
  }

  if (config.provider === 'anthropic') {
    throw new Error('Anthropic 流式调用暂不支持，请使用 chat()');
  }

  return chatStream(messages, config, onChunk);
}

/**
 * 带函数调用的流式输出
 * 
 * @example
 * ```typescript
 * const result = await chatStreamWithToolsUnified(
 *   messages,
 *   config,
 *   (chunk) => {
 *     if (chunk.content) {
 *       process.stdout.write(chunk.content);
 *     }
 *     if (chunk.toolCalls) {
 *       console.log('检测到工具调用');
 *     }
 *   },
 *   { tools }
 * );
 * 
 * if (result.hasToolCalls) {
 *   // 处理工具调用
 * }
 * ```
 */
export async function chatStreamWithToolsUnified(
  messages: ChatMessage[],
  config: LLMConfig,
  onChunk: (chunk: StreamChunk) => void,
  options: ChatWithToolsOptions = {},
): Promise<StreamWithToolsResult> {
  const provider = PROVIDERS[config.provider];
  if (!provider) {
    throw new Error(`未知平台: ${config.provider}`);
  }

  if (config.provider === 'anthropic') {
    throw new Error('Anthropic 流式调用暂不支持，请使用 chatWithToolsUnified()');
  }

  return chatStreamWithTools(messages, config, onChunk, options);
}

// ============================================================================
// 工具转换辅助函数
// ============================================================================

import type { OpenAIFunctionSchema } from '../tools/types';

/**
 * 将内部工具 Schema 转换为 OpenAI function calling 格式
 * 
 * @param schema 内部工具 Schema（来自 ToolRegistry）
 * @returns OpenAI 格式的工具定义
 */
export function convertToOpenAITool(schema: OpenAIFunctionSchema): ToolDefinition {
  return {
    type: 'function',
    function: {
      name: schema.function.name,
      description: schema.function.description,
      parameters: schema.function.parameters,
    },
  };
}

/**
 * 批量转换工具 Schema
 */
export function convertToOpenAITools(schemas: OpenAIFunctionSchema[]): ToolDefinition[] {
  return schemas.map(convertToOpenAITool);
}
