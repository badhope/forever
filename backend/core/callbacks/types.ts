/**
 * @module callbacks/types
 * @description 回调系统类型定义
 *
 * 定义回调事件、回调数据等核心类型接口。
 */

// ============================================================================
// 事件类型
// ============================================================================

/**
 * 回调事件类型枚举
 * @typedef {string} CallbackEventType
 */
export type CallbackEventType =
  | 'llm_start'
  | 'llm_end'
  | 'llm_error'
  | 'llm_new_token'
  | 'tool_start'
  | 'tool_end'
  | 'tool_error'
  | 'chain_start'
  | 'chain_end'
  | 'chain_error'
  | 'memory_store'
  | 'memory_retrieve'
  | 'agent_action'
  | 'agent_finish'
  | 'custom';

// ============================================================================
// 事件接口
// ============================================================================

/**
 * 回调事件接口
 * @interface CallbackEvent
 */
export interface CallbackEvent {
  /** 事件类型 */
  type: CallbackEventType;
  /** 事件名称 */
  name: string;
  /** 事件数据 */
  data: Record<string, any>;
  /** 事件时间戳 */
  timestamp: number;
  /** 事件元数据 */
  metadata?: Record<string, any>;
  /** 父事件 ID（用于构建事件树） */
  parentId?: string;
  /** 事件唯一 ID */
  id?: string;
  /** 追踪 ID */
  traceId?: string;
  /** 跨度 ID */
  spanId?: string;
}

// ============================================================================
// 回调数据接口
// ============================================================================

/**
 * LLM 回调数据接口
 * @interface LLMCallbackData
 */
export interface LLMCallbackData {
  /** 提示词 */
  prompts?: string[];
  /** 生成的文本 */
  generation?: string;
  /** 使用的模型名称 */
  model?: string;
  /** Token 使用量 */
  tokenUsage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  /** 调用耗时（毫秒） */
  duration?: number;
  /** 错误信息 */
  error?: Error;
  /** 流式 token */
  token?: string;
}

/**
 * 工具回调数据接口
 * @interface ToolCallbackData
 */
export interface ToolCallbackData {
  /** 工具名称 */
  toolName?: string;
  /** 工具输入 */
  input?: Record<string, any>;
  /** 工具输出 */
  output?: any;
  /** 调用耗时（毫秒） */
  duration?: number;
  /** 错误信息 */
  error?: Error;
}

/**
 * 链回调数据接口
 * @interface ChainCallbackData
 */
export interface ChainCallbackData {
  /** 链名称 */
  chainName?: string;
  /** 链输入 */
  input?: Record<string, any>;
  /** 链输出 */
  output?: any;
  /** 调用耗时（毫秒） */
  duration?: number;
  /** 错误信息 */
  error?: Error;
}

/**
 * Agent 回调数据接口
 * @interface AgentCallbackData
 */
export interface AgentCallbackData {
  /** Agent 执行的操作 */
  action?: {
    tool: string;
    toolInput: Record<string, any>;
    log: string;
  };
  /** Agent 最终输出 */
  output?: string;
  /** 返回值 */
  returnValues?: Record<string, any>;
}

/**
 * 内存回调数据接口
 * @interface MemoryCallbackData
 */
export interface MemoryCallbackData {
  /** 存储的键 */
  key?: string;
  /** 存储的值 */
  value?: any;
  /** 检索的键 */
  keys?: string[];
  /** 检索结果 */
  results?: Array<{ key: string; value: any }>;
}
