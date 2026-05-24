export interface LLMProvider {
  id: string;
  name: string;
  baseUrl: string;
  defaultModel: string;
  models: string[];
  openaiCompatible: boolean;
  supportsFunctionCalling?: boolean;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  toolCalls?: ToolCall[];
  toolCallId?: string;
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
  toolCalls?: ToolCall[];
  hasToolCalls: boolean;
  finishReason: 'stop' | 'length' | 'tool_calls' | 'content_filter' | null;
}

export interface EnvLLMConfig {
  provider: string;
  apiKey: string;
  model?: string;
  baseUrl?: string;
}

export interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

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

export interface ToolCallResult {
  toolCallId: string;
  name: string;
  result: any;
  success: boolean;
  error?: string;
}

export interface ChatWithToolsOptions {
  tools?: ToolDefinition[];
  toolChoice?: 'auto' | 'none' | { type: 'function'; function: { name: string } };
  parallelToolCalls?: boolean;
}

export interface StreamChunk {
  content?: string;
  toolCalls?: Partial<ToolCall>[];
  done: boolean;
  finishReason?: 'stop' | 'length' | 'tool_calls' | 'content_filter' | null;
}

export type StreamCallback = (chunk: StreamChunk) => void;

export interface StreamWithToolsResult {
  content: string;
  toolCalls?: ToolCall[];
  hasToolCalls: boolean;
  finishReason: 'stop' | 'length' | 'tool_calls' | 'content_filter' | null;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}