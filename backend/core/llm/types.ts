/**
 * Forever - 多平台LLM统一适配器 - 类型定义
 */

export interface LLMProvider {
  id: string;
  name: string;
  baseUrl: string;
  defaultModel: string;
  models: string[];
  /** 是否兼容OpenAI API格式 */
  openaiCompatible: boolean;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMConfig {
  provider: string;
  apiKey: string;
  model?: string;
  baseUrl?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
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
}

export interface EnvLLMConfig {
  provider: string;
  apiKey: string;
  model?: string;
  baseUrl?: string;
}
