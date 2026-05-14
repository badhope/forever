/**
 * @module vector-store/memory
 * @description 基于内存的向量存储实现
 *
 * 使用 JavaScript Map 存储向量，适合开发测试和小规模数据场景。
 * 支持向量增删改查、相似度搜索和元数据过滤。
 *
 * @example
 * ```typescript
 * const store = new InMemoryVectorStore({ dimension: 1536 });
 * await store.addVectors([
 *   { id: '1', values: [0.1, 0.2, 0.3], metadata: { source: 'doc1' } },
 *   { id: '2', values: [0.4, 0.5, 0.6], metadata: { source: 'doc2' } },
 * ]);
 * const results = await store.search([0.1, 0.2, 0.3], 2);
 * ```
 */

import type { Embedding, MetadataFilter, VectorSearchResult, VectorStoreConfig } from './types';
import { BaseVectorStore } from './types';
import { computeSimilarity, matchesFilter } from './similarity';

/**
 * 基于数组的内存向量存储实现
 * @class InMemoryVectorStore
 * @extends BaseVectorStore
 * @description 使用 JavaScript Map 存储向量，适合开发测试和小规模数据
 */
export class InMemoryVectorStore extends BaseVectorStore {
  /** 内部存储映射：ID -> Embedding */
  private store: Map<string, Embedding>;

  constructor(config: VectorStoreConfig = {}) {
    super(config);
    this.store = new Map();
  }

  /**
   * 添加单个向量
   * @param {Embedding} embedding - 要添加的嵌入向量
   * @returns {Promise<string>} 向量 ID
   * @throws {Error} 当向量维度与配置不匹配时抛出错误
   */
  async addVector(embedding: Embedding): Promise<string> {
    // 验证向量维度
    if (this.config.dimension && embedding.values.length !== this.config.dimension) {
      throw new Error(
        `Vector dimension mismatch: expected ${this.config.dimension}, got ${embedding.values.length}`
      );
    }

    this.store.set(embedding.id, { ...embedding });
    return embedding.id;
  }

  /**
   * 添加多个向量
   * @param {Embedding[]} embeddings - 嵌入向量数组
   * @returns {Promise<string[]>} 向量 ID 数组
   */
  async addVectors(embeddings: Embedding[]): Promise<string[]> {
    const ids: string[] = [];
    for (const embedding of embeddings) {
      const id = await this.addVector(embedding);
      ids.push(id);
    }
    return ids;
  }

  /**
   * 相似度搜索
   * @param {number[]} queryVector - 查询向量
   * @param {number} topK - 返回结果数量
   * @param {MetadataFilter} [filter] - 元数据过滤条件
   * @returns {Promise<VectorSearchResult[]>} 搜索结果，按相似度降序排列
   */
  async search(
    queryVector: number[],
    topK: number,
    filter?: MetadataFilter
  ): Promise<VectorSearchResult[]> {
    const metric = this.config.similarityMetric || 'cosine';
    const results: VectorSearchResult[] = [];

    for (const embedding of this.store.values()) {
      // 应用元数据过滤
      if (filter && !matchesFilter(embedding, filter)) {
        continue;
      }

      const score = computeSimilarity(queryVector, embedding.values, metric);
      results.push({ embedding: { ...embedding }, score });
    }

    // 按相似度降序排列
    results.sort((a, b) => b.score - a.score);

    // 返回 topK 个结果
    return results.slice(0, topK);
  }

  /**
   * 根据 ID 获取向量
   * @param {string} id - 向量 ID
   * @returns {Promise<Embedding | null>} 向量副本或 null
   */
  async get(id: string): Promise<Embedding | null> {
    const embedding = this.store.get(id);
    return embedding ? { ...embedding } : null;
  }

  /**
   * 删除单个向量
   * @param {string} id - 向量 ID
   * @returns {Promise<boolean>} 是否成功删除
   */
  async delete(id: string): Promise<boolean> {
    return this.store.delete(id);
  }

  /**
   * 批量删除向量
   * @param {string[]} ids - 向量 ID 数组
   * @returns {Promise<number>} 成功删除的数量
   */
  async deleteBatch(ids: string[]): Promise<number> {
    let count = 0;
    for (const id of ids) {
      if (await this.delete(id)) {
        count++;
      }
    }
    return count;
  }

  /**
   * 更新向量
   * @param {string} id - 向量 ID
   * @param {Partial<Embedding>} update - 更新内容
   * @returns {Promise<boolean>} 是否成功更新
   * @throws {Error} 当更新后的向量维度与配置不匹配时抛出错误
   */
  async update(id: string, update: Partial<Embedding>): Promise<boolean> {
    const existing = this.store.get(id);
    if (!existing) return false;

    // 如果更新了 values，验证维度
    if (update.values && this.config.dimension && update.values.length !== this.config.dimension) {
      throw new Error(
        `Vector dimension mismatch: expected ${this.config.dimension}, got ${update.values.length}`
      );
    }

    const updated: Embedding = {
      ...existing,
      ...update,
      id: existing.id, // 确保 ID 不被修改
    };

    // 合并元数据
    if (update.metadata && existing.metadata) {
      updated.metadata = { ...existing.metadata, ...update.metadata };
    }

    this.store.set(id, updated);
    return true;
  }

  /**
   * 获取向量数量
   * @returns {Promise<number>} 向量数量
   */
  async count(): Promise<number> {
    return this.store.size;
  }

  /**
   * 清空所有向量
   * @returns {Promise<void>}
   */
  async clear(): Promise<void> {
    this.store.clear();
  }

  /**
   * 获取所有存储的向量（副本）
   * @returns {Embedding[]} 所有向量的副本数组
   */
  getAll(): Embedding[] {
    return Array.from(this.store.values()).map((e) => ({ ...e }));
  }
}
