
/**
 * Forever AI - Embedding 服务
 * 支持多种 embedding 提供商
 * 
 * 提供商说明:
 * - local (默认): 使用本地算法生成 embedding，不需要 API key，适合开发和演示
 * - openai: 使用 OpenAI Embedding API，需要 API key
 * - anthropic: 使用 Anthropic Claude API (占位实现)
 * 
 * 配置选项:
 * - provider: 提供商类型
 * - model: 模型名称
 * - dimensions: embedding 维度
 * - apiKey: API key (local 模式不需要)
 */

import { EmbeddingConfig } from './types';
import { logger } from '../logger';

export class EmbeddingService {
  private config: EmbeddingConfig;
  private cache: Map<string, number[]> = new Map();
  private cacheEnabled = true;

  constructor(config: EmbeddingConfig) {
    this.config = config;
  }

  async embed(text: string): Promise<number[]> {
    const cacheKey = this.getCacheKey(text);
    
    if (this.cacheEnabled && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    let embedding: number[];

    switch (this.config.provider) {
      case 'openai':
        embedding = await this.embedWithOpenAI(text);
        break;
      case 'anthropic':
        embedding = await this.embedWithAnthropic(text);
        break;
      case 'local':
        embedding = await this.embedLocally(text);
        break;
      default:
        throw new Error(`Unsupported embedding provider: ${this.config.provider}`);
    }

    if (this.cacheEnabled) {
      this.cache.set(cacheKey, embedding);
    }

    return embedding;
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    return Promise.all(texts.map(text => this.embed(text)));
  }

  async embedText(text: string): Promise<number[]> {
    return this.embed(text);
  }

  private async embedWithOpenAI(text: string): Promise<number[]> {
    if (!this.config.apiKey) {
      throw new Error('OpenAI API key is required');
    }

    logger.info('knowledge:embedding', 'Generating embedding with OpenAI', { 
      provider: 'openai',
      model: this.config.model,
      textLength: text.length 
    });

    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        input: text,
        model: this.config.model,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.data[0].embedding;
  }

  private async embedWithAnthropic(text: string): Promise<number[]> {
    logger.info('knowledge:embedding', 'Generating embedding with Anthropic', { 
      provider: 'anthropic',
      textLength: text.length 
    });

    const placeholderEmbedding = this.generatePlaceholderEmbedding(text);
    return placeholderEmbedding;
  }

  private async embedLocally(text: string): Promise<number[]> {
    logger.info('knowledge:embedding', 'Generating local embedding', { 
      textLength: text.length 
    });

    const placeholderEmbedding = this.generatePlaceholderEmbedding(text);
    return placeholderEmbedding;
  }

  private generatePlaceholderEmbedding(text: string): number[] {
    const dimensions = this.config.dimensions;
    const embedding = new Array(dimensions).fill(0);
    
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i);
      const index = i % dimensions;
      embedding[index] += (charCode % 100) / 100;
    }

    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return embedding.map(val => val / magnitude);
  }

  private getCacheKey(text: string): string {
    return text.slice(0, 100);
  }

  clearCache(): void {
    this.cache.clear();
    logger.info('knowledge:embedding', 'Embedding cache cleared');
  }

  getCacheSize(): number {
    return this.cache.size;
  }

  enableCache(): void {
    this.cacheEnabled = true;
  }

  disableCache(): void {
    this.cacheEnabled = false;
    this.cache.clear();
  }
}

export const embeddingService = new EmbeddingService({
  provider: 'local',
  model: 'local-embedding',
  dimensions: 1536,
  apiKey: '',
});
