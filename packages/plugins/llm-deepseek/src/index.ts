/**
 * Forever Plugin - DeepSeek LLM
 * DeepSeek LLM插件实现
 */

import {
  LLMPlugin,
  LLMMessage,
  LLMConfig,
  LLMResponse,
  PluginConfig,
  PluginStatus,
} from '@forever/core/plugin';

export interface DeepSeekConfig extends PluginConfig {
  /** API密钥 */
  apiKey: string;
  /** 模型名称 */
  model?: string;
  /** API基础URL */
  baseUrl?: string;
  /** 默认温度 */
  defaultTemperature?: number;
  /** 默认最大token数 */
  defaultMaxTokens?: number;
}

export class DeepSeekLLMPlugin implements LLMPlugin {
  id = 'llm-deepseek';
  name = 'DeepSeek LLM';
  version = '1.0.0';
  type = 'llm' as const;

  private config: DeepSeekConfig = { apiKey: '' };
  private initialized = false;
  private lastError?: string;

  async initialize(config: DeepSeekConfig): Promise<void> {
    try {
      console.log(`[${this.name}] Initializing...`);
      
      if (!config.apiKey) {
        throw new Error('API key is required');
      }

      this.config = {
        model: 'deepseek-chat',
        baseUrl: 'https://api.deepseek.com/v1',
        defaultTemperature: 0.8,
        defaultMaxTokens: 2000,
        ...config,
      };

      this.initialized = true;
      console.log(`[${this.name}] Initialized successfully`);
    } catch (error) {
      this.lastError = `Initialization failed: ${error}`;
      console.error(`[${this.name}] ${this.lastError}`);
      throw error;
    }
  }

  async shutdown(): Promise<void> {
    this.initialized = false;
    console.log(`[${this.name}] Shutdown`);
  }

  getStatus(): PluginStatus {
    return {
      initialized: this.initialized,
      ready: this.initialized,
      lastError: this.lastError,
    };
  }

  async chat(
    messages: LLMMessage[],
    config?: LLMConfig
  ): Promise<LLMResponse> {
    if (!this.initialized) {
      throw new Error('Plugin not initialized');
    }

    try {
      const temperature = config?.temperature ?? this.config.defaultTemperature ?? 0.8;
      const maxTokens = config?.maxTokens ?? this.config.defaultMaxTokens ?? 2000;
      const model = config?.model ?? this.config.model ?? 'deepseek-chat';

      console.log(`[${this.name}] Chat request: ${messages.length} messages`);

      // 使用fetch调用DeepSeek API
      const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          temperature,
          max_tokens: maxTokens,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`API error: ${error}`);
      }

      const data = await response.json();

      return {
        content: data.choices[0].message.content,
        usage: {
          promptTokens: data.usage?.prompt_tokens || 0,
          completionTokens: data.usage?.completion_tokens || 0,
          totalTokens: data.usage?.total_tokens || 0,
        },
        model: data.model || model,
      };
    } catch (error) {
      this.lastError = `Chat failed: ${error}`;
      console.error(`[${this.name}] ${this.lastError}`);
      throw error;
    }
  }

  async chatStream(
    messages: LLMMessage[],
    config: LLMConfig,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    if (!this.initialized) {
      throw new Error('Plugin not initialized');
    }

    try {
      const temperature = config?.temperature ?? this.config.defaultTemperature ?? 0.8;
      const maxTokens = config?.maxTokens ?? this.config.defaultMaxTokens ?? 2000;
      const model = config?.model ?? this.config.model ?? 'deepseek-chat';

      const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          temperature,
          max_tokens: maxTokens,
          stream: true,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`API error: ${error}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

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
              if (chunk) {
                onChunk(chunk);
              }
            } catch {
              // 忽略解析错误
            }
          }
        }
      }
    } catch (error) {
      this.lastError = `Stream chat failed: ${error}`;
      console.error(`[${this.name}] ${this.lastError}`);
      throw error;
    }
  }
}

// 导出插件实例创建函数
export function createDeepSeekPlugin(config: DeepSeekConfig): DeepSeekLLMPlugin {
  const plugin = new DeepSeekLLMPlugin();
  return plugin;
}
