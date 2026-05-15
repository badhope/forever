/**
 * Forever - 多平台LLM统一适配器 - 类型定义
 */

// ============================================================================
// 基础类型
// ============================================================================

export interface LLMProvider {
  id: string;
  name: string;
  baseUrl: string;
  defaultModel: string;
  models: string[];
  /** 是否兼容OpenAI API格式 */
  openaiCompatible: boolean;
  /** 是否支持函数调用 */
  supportsFunctionCalling?: boolean;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  /** 函数调用信息（用于 assistant 角色的消息） */
  toolCalls?: ToolCall[];
  /** 工具调用ID（用于 tool 角色的消息） */
  toolCallId?: string;
  /** 工具名称（用于 tool 角色的消息） */
  name?: string;
}

export interface LLMConfig {
  provider: string;
  apiKey: string;
  model?: string;
  baseUrl?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  /** 是否启用函数调用 */
  enableFunctionCalling?: boolean;
}

export interface LLMResponse {
  content: string;
  model: string;
  provider: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  /** 函数调用请求（LLM 决定调用工具时返回） */
  toolCalls?: ToolCall[];
  /** 是否包含函数调用 */
  hasToolCalls: boolean;
  /** 完成原因 */
  finishReason: 'stop' | 'length' | 'tool_calls' | 'content_filter' | null;
}

export interface EnvLLMConfig {
  provider: string;
  apiKey: string;
  model?: string;
  baseUrl?: string;
}

// ============================================================================
// 函数调用相关类型
// ============================================================================

/**
 * 工具调用（Function Calling）
 * 遵循 OpenAI function calling 格式
 */
export interface ToolCall {
  /** 工具调用唯一ID */
  id: string;
  /** 调用类型 */
  type: 'function';
  /** 函数调用详情 */
  function: {
    /** 函数名称 */
    name: string;
    /** 函数参数（JSON字符串） */
    arguments: string;
  };
}

/**
 * 工具定义（用于传递给 LLM）
 * 遵循 OpenAI function calling schema
 */
export interface ToolDefinition {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: {
      type: 'object';
      properties: Record<string, any>;
      required?: string[];
      additionalProperties?: boolean;
    };
  };
}

/**
 * 工具调用结果
 */
export interface ToolCallResult {
  /** 工具调用ID */
  toolCallId: string;
  /** 工具名称 */
  name: string;
  /** 执行结果 */
  result: any;
  /** 是否成功 */
  success: boolean;
  /** 错误信息 */
  error?: string;
}

/**
 * 带工具调用的 LLM 请求选项
 */
export interface ChatWithToolsOptions {
  /** 可用工具列表 */
  tools?: ToolDefinition[];
  /** 强制使用特定工具（可选） */
  toolChoice?: 'auto' | 'none' | { type: 'function'; function: { name: string } };
  /** 是否并行执行多个工具调用 */
  parallelToolCalls?: boolean;
}

// ============================================================================
// 流式输出相关类型
// ============================================================================

/**
 * 流式响应块
 */
export interface StreamChunk {
  /** 内容增量 */
  content?: string;
  /** 工具调用增量 */
  toolCalls?: Partial<ToolCall>[];
  /** 是否完成 */
  done: boolean;
  /** 完成原因 */
  finishReason?: 'stop' | 'length' | 'tool_calls' | 'content_filter' | null;
}

/**
 * 流式响应回调
 */
export type StreamCallback = (chunk: StreamChunk) => void;

/**
 * 带工具调用的流式响应
 */
export interface StreamWithToolsResult {
  /** 最终完整内容 */
  content: string;
  /** 工具调用列表 */
  toolCalls?: ToolCall[];
  /** 是否包含工具调用 */
  hasToolCalls: boolean;
  /** 完成原因 */
  finishReason: 'stop' | 'length' | 'tool_calls' | 'content_filter' | null;
  /** 使用量统计 */
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}
