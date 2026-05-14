/**
 * @module vector-store
 * @description 向量存储抽象层（参考 LangChain VectorStore）
 *
 * 提供向量存储的核心抽象和内存实现，支持：
 * - 向量的增删改查
 * - 多种相似度度量（余弦、欧几里得、点积）
 * - 元数据过滤
 * - 批量操作
 */

// ============================================================================
// 接口定义
// ============================================================================

/**
 * 嵌入向量接口
 * @interface Embedding
 */
export interface Embedding {
  /** 向量唯一标识 */
  id: string;
  /** 向量值（浮点数数组） */
  values: number[];
  /** 可选的元数据 */
  metadata?: Record<string, any>;
}

/**
 * 向量搜索结果接口
 * @interface VectorSearchResult
 */
export interface VectorSearchResult {
  /** 匹配的嵌入向量 */
  embedding: Embedding;
  /** 相似度分数（0-1，越高越相似） */
  score: number;
}

/**
 * 向量存储配置接口
 * @interface VectorStoreConfig
 */
export interface VectorStoreConfig {
  /** 向量维度 */
  dimension?: number;
  /** 相似度度量方式 */
  similarityMetric?: 'cosine' | 'euclidean' | 'dot';
}

/**
 * 元数据过滤条件接口
 * @interface MetadataFilter
 */
export interface MetadataFilter {
  /** 精确匹配的字段 */
  equals?: Record<string, any>;
  /** 包含匹配的字段（值在数组中） */
  in?: Record<string, any[]>;
  /** 数值范围匹配 */
  range?: Record<string, { gte?: number; lte?: number; gt?: number; lt?: number }>;
  /** 存在性检查 */
  exists?: string[];
  /** 不存在性检查 */
  notExists?: string[];
}

// ============================================================================
// 抽象基类
// ============================================================================

/**
 * 向量存储抽象基类
 * @abstract
 * @class BaseVectorStore
 * @description 定义向量存储的核心接口，所有具体实现必须继承此类
 */
export abstract class BaseVectorStore {
  /** 存储配置 */
  protected config: VectorStoreConfig;

  constructor(config: VectorStoreConfig = {}) {
    this.config = {
      dimension: config.dimension,
      similarityMetric: config.similarityMetric || 'cosine',
    };
  }

  /**
   * 添加单个向量
   * @param {Embedding} embedding - 要添加的嵌入向量
   * @returns {Promise<string>} 添加的向量 ID
   */
  abstract addVector(embedding: Embedding): Promise<string>;

  /**
   * 添加多个向量
   * @param {Embedding[]} embeddings - 要添加的嵌入向量数组
   * @returns {Promise<string[]>} 添加的向量 ID 数组
   */
  abstract addVectors(embeddings: Embedding[]): Promise<string[]>;

  /**
   * 相似度搜索
   * @param {number[]} queryVector - 查询向量
   * @param {number} topK - 返回的最相似结果数量
   * @param {MetadataFilter} [filter] - 可选的元数据过滤条件
   * @returns {Promise<VectorSearchResult[]>} 搜索结果数组，按相似度降序排列
   */
  abstract search(
    queryVector: number[],
    topK: number,
    filter?: MetadataFilter
  ): Promise<VectorSearchResult[]>;

  /**
   * 根据 ID 获取向量
   * @param {string} id - 向量 ID
   * @returns {Promise<Embedding | null>} 找到的向量或 null
   */
  abstract get(id: string): Promise<Embedding | null>;

  /**
   * 删除单个向量
   * @param {string} id - 要删除的向量 ID
   * @returns {Promise<boolean>} 是否成功删除
   */
  abstract delete(id: string): Promise<boolean>;

  /**
   * 删除多个向量
   * @param {string[]} ids - 要删除的向量 ID 数组
   * @returns {Promise<number>} 成功删除的数量
   */
  abstract deleteBatch(ids: string[]): Promise<number>;

  /**
   * 更新向量
   * @param {string} id - 要更新的向量 ID
   * @param {Partial<Embedding>} update - 更新内容
   * @returns {Promise<boolean>} 是否成功更新
   */
  abstract update(id: string, update: Partial<Embedding>): Promise<boolean>;

  /**
   * 获取存储中的向量数量
   * @returns {Promise<number>} 向量数量
   */
  abstract count(): Promise<number>;

  /**
   * 清空所有向量
   * @returns {Promise<void>}
   */
  abstract clear(): Promise<void>;

  /**
   * 批量添加向量（带分批处理）
   * @param {Embedding[]} embeddings - 要添加的嵌入向量数组
   * @param {number} [batchSize=100] - 每批处理的数量
   * @returns {Promise<string[]>} 所有添加的向量 ID 数组
   */
  async addVectorsBatch(embeddings: Embedding[], batchSize: number = 100): Promise<string[]> {
    const allIds: string[] = [];

    for (let i = 0; i < embeddings.length; i += batchSize) {
      const batch = embeddings.slice(i, i + batchSize);
      const ids = await this.addVectors(batch);
      allIds.push(...ids);
    }

    return allIds;
  }
}

// ============================================================================
// 相似度计算工具函数
// ============================================================================

/**
 * 计算两个向量的余弦相似度
 * @param {number[]} a - 向量 A
 * @param {number[]} b - 向量 B
 * @returns {number} 余弦相似度（-1 到 1）
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error(`Vector dimension mismatch: ${a.length} vs ${b.length}`);
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;

  return dotProduct / denominator;
}

/**
 * 计算两个向量的欧几里得距离
 * @param {number[]} a - 向量 A
 * @param {number[]} b - 向量 B
 * @returns {number} 欧几里得距离
 */
export function euclideanDistance(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error(`Vector dimension mismatch: ${a.length} vs ${b.length}`);
  }

  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const diff = a[i] - b[i];
    sum += diff * diff;
  }

  return Math.sqrt(sum);
}

/**
 * 计算两个向量的点积
 * @param {number[]} a - 向量 A
 * @param {number[]} b - 向量 B
 * @returns {number} 点积
 */
export function dotProduct(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error(`Vector dimension mismatch: ${a.length} vs ${b.length}`);
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result += a[i] * b[i];
  }

  return result;
}

/**
 * 根据度量方式计算相似度分数
 * @param {number[]} a - 向量 A
 * @param {number[]} b - 向量 B
 * @param {'cosine' | 'euclidean' | 'dot'} metric - 度量方式
 * @returns {number} 相似度分数
 */
export function computeSimilarity(
  a: number[],
  b: number[],
  metric: 'cosine' | 'euclidean' | 'dot'
): number {
  switch (metric) {
    case 'cosine':
      return cosineSimilarity(a, b);
    case 'euclidean': {
      const dist = euclideanDistance(a, b);
      // 将距离转换为相似度：使用高斯核函数
      return 1 / (1 + dist);
    }
    case 'dot':
      return dotProduct(a, b);
    default:
      throw new Error(`Unknown similarity metric: ${metric}`);
  }
}

// ============================================================================
// 元数据过滤工具函数
// ============================================================================

/**
 * 检查嵌入向量的元数据是否匹配过滤条件
 * @param {Embedding} embedding - 嵌入向量
 * @param {MetadataFilter} filter - 过滤条件
 * @returns {boolean} 是否匹配
 */
export function matchesFilter(embedding: Embedding, filter: MetadataFilter): boolean {
  const metadata = embedding.metadata || {};

  // 精确匹配
  if (filter.equals) {
    for (const [key, value] of Object.entries(filter.equals)) {
      if (metadata[key] !== value) return false;
    }
  }

  // 包含匹配
  if (filter.in) {
    for (const [key, values] of Object.entries(filter.in)) {
      if (!values.includes(metadata[key])) return false;
    }
  }

  // 范围匹配
  if (filter.range) {
    for (const [key, range] of Object.entries(filter.range)) {
      const val = metadata[key];
      if (typeof val !== 'number') return false;
      if (range.gte !== undefined && val < range.gte) return false;
      if (range.lte !== undefined && val > range.lte) return false;
      if (range.gt !== undefined && val <= range.gt) return false;
      if (range.lt !== undefined && val >= range.lt) return false;
    }
  }

  // 存在性检查
  if (filter.exists) {
    for (const key of filter.exists) {
      if (!(key in metadata)) return false;
    }
  }

  // 不存在性检查
  if (filter.notExists) {
    for (const key of filter.notExists) {
      if (key in metadata) return false;
    }
  }

  return true;
}

// ============================================================================
// 内存向量存储实现
// ============================================================================

/**
 * 基于数组的内存向量存储实现
 * @class InMemoryVectorStore
 * @extends BaseVectorStore
 * @description 使用 JavaScript 数组存储向量，适合开发测试和小规模数据
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
   * @returns {Promise<VectorSearchResult[]>} 搜索结果
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
   * @returns {Promise<Embedding | null>} 向量或 null
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
