/**
 * Forever - OpenAI兼容客户端
 * 覆盖95%的平台（所有兼容OpenAI API格式的平台）
 * 支持函数调用（Function Calling）和流式输出
 */

import type {
  ChatMessage,
  LLMConfig,
  LLMResponse,
  ToolDefinition,
  ToolCall,
  ChatWithToolsOptions,
  StreamChunk,
  StreamWithToolsResult,
} from './types';
import { PROVIDERS } from './providers';

// ============================================================================
// 基础聊天调用
// ============================================================================

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
      messages: formatMessages(messages),
      temperature,
      max_tokens: maxTokens,
      top_p: config.topP,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`[${config.provider}] API错误: ${response.status} - ${error}`);
  }

  const data = await response.json() as OpenAIResponse;
  return parseResponse(data, config.provider);
}

// ============================================================================
// 带函数调用的聊天
// ============================================================================

/**
 * OpenAI兼容格式调用（支持函数调用）
 */
export async function chatWithTools(
  messages: ChatMessage[],
  config: LLMConfig,
  baseUrl: string,
  model: string,
  temperature: number,
  maxTokens: number,
  options: ChatWithToolsOptions = {},
): Promise<LLMResponse> {
  const body: Record<string, any> = {
    model,
    messages: formatMessages(messages),
    temperature,
    max_tokens: maxTokens,
    top_p: config.topP,
  };

  // 添加工具定义
  if (options.tools && options.tools.length > 0) {
    body.tools = options.tools;
    body.tool_choice = options.toolChoice || 'auto';
    if (options.parallelToolCalls !== undefined) {
      body.parallel_tool_calls = options.parallelToolCalls;
    }
  }

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`[${config.provider}] API错误: ${response.status} - ${error}`);
  }

  const data = await response.json() as OpenAIResponse;
  return parseResponse(data, config.provider);
}

// ============================================================================
// 流式输出
// ============================================================================

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
      messages: formatMessages(messages),
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

/**
 * 流式调用（支持函数调用）
 */
export async function chatStreamWithTools(
  messages: ChatMessage[],
  config: LLMConfig,
  onChunk: (chunk: StreamChunk) => void,
  options: ChatWithToolsOptions = {},
): Promise<StreamWithToolsResult> {
  const provider = PROVIDERS[config.provider];
  if (!provider) throw new Error(`未知平台: ${config.provider}`);
  if (config.provider === 'anthropic') {
    throw new Error('Anthropic流式调用暂不支持，请使用chatWithTools()');
  }

  const baseUrl = config.baseUrl || provider.baseUrl;
  const model = config.model || provider.defaultModel;

  const body: Record<string, any> = {
    model,
    messages: formatMessages(messages),
    temperature: config.temperature ?? 0.8,
    max_tokens: config.maxTokens ?? 2000,
    stream: true,
  };

  // 添加工具定义
  if (options.tools && options.tools.length > 0) {
    body.tools = options.tools;
    body.tool_choice = options.toolChoice || 'auto';
    if (options.parallelToolCalls !== undefined) {
      body.parallel_tool_calls = options.parallelToolCalls;
    }
  }

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`[${config.provider}] API错误: ${response.status} - ${error}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('无响应体');

  const decoder = new TextDecoder();
  let buffer = '';
  let fullContent = '';
  const toolCallsMap = new Map<number, Partial<ToolCall>>();
  let finishReason: 'stop' | 'length' | 'tool_calls' | 'content_filter' | null = null;

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
          const delta = parsed.choices?.[0]?.delta;
          const choice = parsed.choices?.[0];

          // 更新完成原因
          if (choice?.finish_reason) {
            finishReason = choice.finish_reason;
          }

          // 处理内容增量
          if (delta?.content) {
            fullContent += delta.content;
            onChunk({
              content: delta.content,
              done: false,
            });
          }

          // 处理工具调用增量
          if (delta?.tool_calls) {
            for (const toolCallDelta of delta.tool_calls) {
              const index = toolCallDelta.index;
              const existing = toolCallsMap.get(index) || {
                id: '',
                type: 'function' as const,
                function: { name: '', arguments: '' },
              };

              if (toolCallDelta.id) existing.id = toolCallDelta.id;
              if (toolCallDelta.function?.name) {
                existing.function!.name = toolCallDelta.function.name;
              }
              if (toolCallDelta.function?.arguments) {
                existing.function!.arguments += toolCallDelta.function.arguments;
              }

              toolCallsMap.set(index, existing);
            }

            onChunk({
              toolCalls: delta.tool_calls,
              done: false,
            });
          }
        } catch { /* 忽略解析错误 */ }
      }
    }
  }

  // 组装最终工具调用
  const toolCalls: ToolCall[] = [];
  for (let i = 0; i < toolCallsMap.size; i++) {
    const tc = toolCallsMap.get(i);
    if (tc && tc.id && tc.function?.name) {
      toolCalls.push(tc as ToolCall);
    }
  }

  // 发送完成信号
  onChunk({
    content: '',
    done: true,
    finishReason,
  });

  return {
    content: fullContent,
    toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
    hasToolCalls: toolCalls.length > 0,
    finishReason,
  };
}

// ============================================================================
// 辅助函数
// ============================================================================

/**
 * OpenAI API 响应格式
 */
interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string | null;
      tool_calls?: ToolCall[];
      role?: string;
    };
    finish_reason: 'stop' | 'length' | 'tool_calls' | 'content_filter' | null;
  }>;
  model?: string;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
}

/**
 * 格式化消息为 OpenAI API 格式
 */
function formatMessages(messages: ChatMessage[]): any[] {
  return messages.map(msg => {
    const formatted: Record<string, any> = {
      role: msg.role,
      content: msg.content,
    };

    // 添加工具调用信息
    if (msg.toolCalls && msg.toolCalls.length > 0) {
      formatted.tool_calls = msg.toolCalls;
    }

    // 添加工具响应信息
    if (msg.toolCallId) {
      formatted.tool_call_id = msg.toolCallId;
    }
    if (msg.name) {
      formatted.name = msg.name;
    }

    return formatted;
  });
}

/**
 * 解析 API 响应
 */
function parseResponse(data: OpenAIResponse, provider: string): LLMResponse {
  const choice = data.choices[0];
  const message = choice.message;
  const toolCalls = message.tool_calls;

  return {
    content: message.content || '',
    model: data.model || 'unknown',
    provider,
    usage: {
      promptTokens: data.usage?.prompt_tokens || 0,
      completionTokens: data.usage?.completion_tokens || 0,
      totalTokens: data.usage?.total_tokens || 0,
    },
    toolCalls: toolCalls && toolCalls.length > 0 ? toolCalls : undefined,
    hasToolCalls: !!(toolCalls && toolCalls.length > 0),
    finishReason: choice.finish_reason,
  };
}

/**
 * 解析工具调用参数
 */
export function parseToolCallArguments(toolCall: ToolCall): Record<string, any> {
  try {
    return JSON.parse(toolCall.function.arguments);
  } catch (error) {
    console.error('解析工具调用参数失败:', error);
    return {};
  }
}

/**
 * 创建工具响应消息
 */
export function createToolResponseMessage(
  toolCallId: string,
  name: string,
  result: any,
): ChatMessage {
  return {
    role: 'tool',
    content: typeof result === 'string' ? result : JSON.stringify(result),
    toolCallId,
    name,
  };
}

/**
 * 创建助手工具调用消息
 */
export function createAssistantToolCallMessage(
  content: string,
  toolCalls: ToolCall[],
): ChatMessage {
  return {
    role: 'assistant',
    content,
    toolCalls,
  };
}
