
/**
 * Forever AI - 向量存储实现
 * 支持内存存储和外部向量数据库
 */

import { KnowledgeItem, VectorStoreConfig } from './types';
import { logger } from '../logger';

export interface VectorSearchResult {
  item: KnowledgeItem;
  score: number;
  vector?: number[];
}

export class VectorStore {
  private config: VectorStoreConfig;
  private items: Map<string, KnowledgeItem> = new Map();

  constructor(config: VectorStoreConfig) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    logger.info('knowledge:vector', 'Initializing vector store', {
      provider: this.config.provider,
      collectionName: this.config.collectionName,
    });

    if (this.config.provider === 'memory') {
      logger.info('knowledge:vector', 'Using in-memory vector store');
    }
  }

  async add(item: KnowledgeItem): Promise<void> {
    if (!item.embedding || item.embedding.length === 0) {
      throw new Error('Embedding is required to add item to vector store');
    }

    this.items.set(item.id, item);
    
    logger.info('knowledge:vector', 'Item added to vector store', { 
      id: item.id,
      provider: this.config.provider 
    });
  }

  async addBatch(items: KnowledgeItem[]): Promise<void> {
    for (const item of items) {
      await this.add(item);
    }
    
    logger.info('knowledge:vector', 'Batch items added to vector store', { 
      count: items.length 
    });
  }

  async search(
    queryEmbedding: number[],
    limit: number = 10,
    threshold?: number
  ): Promise<VectorSearchResult[]> {
    const results: VectorSearchResult[] = [];

    for (const item of this.items.values()) {
      if (!item.embedding) {
        continue;
      }

      const score = this.calculateSimilarity(queryEmbedding, item.embedding);

      if (threshold !== undefined && score < threshold) {
        continue;
      }

      results.push({
        item,
        score,
        vector: item.embedding,
      });
    }

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, limit);
  }

  async findById(id: string): Promise<KnowledgeItem | null> {
    return this.items.get(id) || null;
  }

  async findByCategory(category: string): Promise<KnowledgeItem[]> {
    return Array.from(this.items.values()).filter(item => item.category === category);
  }

  async findByTags(tags: string[]): Promise<KnowledgeItem[]> {
    return Array.from(this.items.values()).filter(item =>
      tags.some(tag => item.tags?.includes(tag))
    );
  }

  async update(id: string, item: Partial<KnowledgeItem>): Promise<KnowledgeItem | null> {
    const existing = this.items.get(id);
    if (!existing) {
      return null;
    }

    const updated: KnowledgeItem = {
      ...existing,
      ...item,
      id: existing.id,
      updatedAt: new Date(),
    };

    this.items.set(id, updated);
    
    logger.info('knowledge:vector', 'Item updated in vector store', { id });
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const deleted = this.items.delete(id);
    if (deleted) {
      logger.info('knowledge:vector', 'Item deleted from vector store', { id });
    }
    return deleted;
  }

  async clear(): Promise<void> {
    this.items.clear();
    logger.info('knowledge:vector', 'Vector store cleared');
  }

  async count(): Promise<number> {
    return this.items.size;
  }

  private calculateSimilarity(vec1: number[], vec2: number[]): number {
    if (vec1.length !== vec2.length) {
      throw new Error('Vectors must have the same dimensions');
    }

    switch (this.config.distanceFunction) {
      case 'cosine':
        return this.cosineSimilarity(vec1, vec2);
      case 'euclidean':
        return this.euclideanDistance(vec1, vec2);
      case 'dotproduct':
        return this.dotProduct(vec1, vec2);
      default:
        return this.cosineSimilarity(vec1, vec2);
    }
  }

  private cosineSimilarity(vec1: number[], vec2: number[]): number {
    const dotProduct = this.dotProduct(vec1, vec2);
    const magnitude1 = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0));
    const magnitude2 = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0));

    if (magnitude1 === 0 || magnitude2 === 0) {
      return 0;
    }

    return dotProduct / (magnitude1 * magnitude2);
  }

  private euclideanDistance(vec1: number[], vec2: number[]): number {
    const sumSquaredDiff = vec1.reduce((sum, val, i) => {
      return sum + Math.pow(val - vec2[i], 2);
    }, 0);

    return Math.sqrt(sumSquaredDiff);
  }

  private dotProduct(vec1: number[], vec2: number[]): number {
    return vec1.reduce((sum, val, i) => sum + val * vec2[i], 0);
  }

  async getAll(): Promise<KnowledgeItem[]> {
    return Array.from(this.items.values());
  }
}

export const vectorStore = new VectorStore({
  provider: 'memory',
  collectionName: 'forever_knowledge',
  distanceFunction: 'cosine',
});
