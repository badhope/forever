/**
 * @module embedding
 * @description 统一 Embedding 模型调用层
 *
 * 支持 OpenAI / 阿里百炼 / 智谱 / 硅基流动等所有提供 Embedding API 的平台。
 * 统一接口，自动适配不同平台的请求/响应格式。
 */

import { logger } from '../logger';

// ============================================================================
// 类型定义
// ============================================================================

export interface EmbeddingConfig {
  /** 平台名称（与 LLM 适配器一致） */
  provider: string;
  /** API Key */
  apiKey: string;
  /** Embedding 模型名称 */
  model?: string;
  /** 自定义 API Base URL */
  baseUrl?: string;
  /** 向量维度（部分平台需要） */
  dimensions?: number;
}

export interface EmbeddingResponse {
  /** 嵌入向量列表 */
  embeddings: number[][];
  /** 使用的模型 */
  model: string;
  /** Token 使用量 */
  usage: {
    promptTokens: number;
    totalTokens: number;
  };
}

export interface EmbeddingProvider {
  id: string;
  name: string;
  defaultModel: string;
  models: string[];
  baseUrl: string;
  /** 最大批量大小 */
  maxBatchSize: number;
  /** 默认向量维度 */
  defaultDimensions: number;
}

// ============================================================================
// 平台注册表
// ============================================================================

export const EMBEDDING_PROVIDERS: Record<string, EmbeddingProvider> = {
  openai: {
    id: 'openai',
    name: 'OpenAI',
    defaultModel: 'text-embedding-3-small',
    models: ['text-embedding-3-small', 'text-embedding-3-large', 'text-embedding-ada-002'],
    baseUrl: 'https://api.openai.com/v1',
    maxBatchSize: 2048,
    defaultDimensions: 1536,
  },
  dashscope: {
    id: 'dashscope',
    name: '阿里百炼',
    defaultModel: 'text-embedding-v3',
    models: ['text-embedding-v3', 'text-embedding-v2', 'text-embedding-v1'],
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    maxBatchSize: 25,
    defaultDimensions: 1024,
  },
  zhipu: {
    id: 'zhipu',
    name: '智谱',
    defaultModel: 'embedding-3',
    models: ['embedding-3', 'embedding-2'],
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    maxBatchSize: 512,
    defaultDimensions: 1024,
  },
  siliconflow: {
    id: 'siliconflow',
    name: '硅基流动',
    defaultModel: 'BAAI/bge-m3',
    models: ['BAAI/bge-m3', 'BAAI/bge-large-zh-v1.5', 'BAAI/bge-small-zh-v1.5'],
    baseUrl: 'https://api.siliconflow.cn/v1',
    maxBatchSize: 512,
    defaultDimensions: 1024,
  },
  deepseek: {
    id: 'deepseek',
    name: 'DeepSeek',
    defaultModel: 'deepseek-chat',
    models: [],
    baseUrl: 'https://api.deepseek.com/v1',
    maxBatchSize: 512,
    defaultDimensions: 1536,
  },
  moonshot: {
    id: 'moonshot',
    name: '月之暗面',
    defaultModel: 'moonshot-v1-8k',
    models: [],
    baseUrl: 'https://api.moonshot.cn/v1',
    maxBatchSize: 512,
    defaultDimensions: 1536,
  },
  ollama: {
    id: 'ollama',
    name: 'Ollama (本地)',
    defaultModel: 'nomic-embed-text',
    models: ['nomic-embed-text', 'mxbai-embed-large', 'all-minilm'],
    baseUrl: 'http://localhost:11434',
    maxBatchSize: 512,
    defaultDimensions: 768,
  },
};

// ============================================================================
// 核心函数
// ============================================================================

const log = logger.createModule('embedding');

/**
 * 生成文本嵌入向量
 *
 * 统一接口，支持所有 OpenAI 兼容的 Embedding API。
 *
 * @param texts - 待嵌入的文本列表（支持批量）
 * @param config - Embedding 配置
 * @returns 嵌入向量列表
 *
 * @example
 * ```typescript
 * const response = await embedTexts(['你好世界', 'Hello World'], {
 *   provider: 'openai',
 *   apiKey: 'sk-xxx',
 * });
 * console.log(response.embeddings); // [[0.1, 0.2, ...], [0.3, 0.4, ...]]
 * ```
 */
export async function embedTexts(
  texts: string[],
  config: EmbeddingConfig,
): Promise<EmbeddingResponse> {
  if (!texts || texts.length === 0) {
    throw new Error('texts 不能为空');
  }

  const provider = EMBEDDING_PROVIDERS[config.provider];
  if (!provider) {
    const available = Object.keys(EMBEDDING_PROVIDERS).join(', ');
    throw new Error(`未知 Embedding 平台: ${config.provider}，可用: ${available}`);
  }

  const baseUrl = config.baseUrl || provider.baseUrl;
  const model = config.model || provider.defaultModel;

  // 分批处理（部分平台有批量大小限制）
  const batchSize = provider.maxBatchSize;
  const allEmbeddings: number[][] = [];
  let totalPromptTokens = 0;

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const result = await callEmbeddingAPI(batch, baseUrl, model, config.apiKey, config.dimensions);
    allEmbeddings.push(...result.embeddings);
    totalPromptTokens += result.usage.promptTokens;
  }

  return {
    embeddings: allEmbeddings,
    model,
    usage: {
      promptTokens: totalPromptTokens,
      totalTokens: totalPromptTokens,
    },
  };
}

/**
 * 生成单条文本嵌入向量
 *
 * @param text - 待嵌入的文本
 * @param config - Embedding 配置
 * @returns 嵌入向量
 */
export async function embedText(
  text: string,
  config: EmbeddingConfig,
): Promise<number[]> {
  const response = await embedTexts([text], config);
  return response.embeddings[0];
}

/**
 * 检测 Embedding 配置
 *
 * 从环境变量自动检测可用的 Embedding 配置。
 * 优先级：FOREVER_EMBEDDING_PROVIDER > FOREVER_LLM_PROVIDER
 */
export function detectEmbeddingConfig(): EmbeddingConfig | null {
  const provider = process.env.FOREVER_EMBEDDING_PROVIDER
    || process.env.FOREVER_LLM_PROVIDER;

  const apiKey = process.env.FOREVER_EMBEDDING_API_KEY
    || process.env.FOREVER_LLM_API_KEY;

  if (!provider || !apiKey) {
    return null;
  }

  const knownProvider = EMBEDDING_PROVIDERS[provider];
  if (!knownProvider) {
    log.warn(`未知的 Embedding 平台: ${provider}，将尝试作为 OpenAI 兼容平台使用`);
  }

  return {
    provider,
    apiKey,
    model: process.env.FOREVER_EMBEDDING_MODEL,
    baseUrl: process.env.FOREVER_EMBEDDING_BASE_URL,
    dimensions: process.env.FOREVER_EMBEDDING_DIMENSIONS
      ? parseInt(process.env.FOREVER_EMBEDDING_DIMENSIONS, 10)
      : undefined,
  };
}

/**
 * 列出所有支持的 Embedding 平台
 */
export function listEmbeddingProviders(): EmbeddingProvider[] {
  return Object.values(EMBEDDING_PROVIDERS);
}

// ============================================================================
// 内部实现
// ============================================================================

/**
 * 调用 Embedding API
 */
async function callEmbeddingAPI(
  texts: string[],
  baseUrl: string,
  model: string,
  apiKey: string,
  dimensions?: number,
): Promise<{ embeddings: number[][]; usage: { promptTokens: number } }> {
  const body: Record<string, any> = {
    model,
    input: texts,
  };

  // OpenAI text-embedding-3 系列支持 dimensions 参数
  if (dimensions) {
    body.dimensions = dimensions;
  }

  const response = await fetch(`${baseUrl}/embeddings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Embedding API 错误: ${response.status} - ${error}`);
  }

  const data = await response.json() as any;

  // 解析响应（OpenAI 兼容格式）
  const embeddings: number[][] = data.data
    .sort((a: any, b: any) => a.index - b.index)
    .map((item: any) => item.embedding);

  return {
    embeddings,
    usage: {
      promptTokens: data.usage?.prompt_tokens || 0,
    },
  };
}
