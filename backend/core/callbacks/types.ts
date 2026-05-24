/**
 * @module callbacks/types
 * @description 回调系统类型定义
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

export interface CallbackEvent {
  type: CallbackEventType;
  name: string;
  data: Record<string, any>;
  timestamp: number;
  metadata?: Record<string, any>;
  parentId?: string;
  id?: string;
  traceId?: string;
  spanId?: string;
}

export interface LLMCallbackData {
  prompts?: string[];
  generation?: string;
  model?: string;
  tokenUsage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  duration?: number;
  error?: Error;
  token?: string;
}

export interface ToolCallbackData {
  toolName?: string;
  input?: Record<string, any>;
  output?: any;
  duration?: number;
  error?: Error;
}

export interface ChainCallbackData {
  chainName?: string;
  input?: Record<string, any>;
  output?: any;
  duration?: number;
  error?: Error;
}

export interface AgentCallbackData {
  action?: {
    tool: string;
    toolInput: Record<string, any>;
    log: string;
  };
  output?: string;
  returnValues?: Record<string, any>;
}

export interface MemoryCallbackData {
  key?: string;
  value?: any;
  keys?: string[];
  results?: Array<{ key: string; value: any }>;
}