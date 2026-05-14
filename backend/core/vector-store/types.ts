/**
 * @module vector-store/types
 * @description 向量存储核心类型定义
 *
 * 定义向量存储相关的接口、类型和抽象基类，包括：
 * - Embedding 嵌入向量接口
 * - VectorSearchResult 搜索结果接口
 * - VectorStoreConfig 存储配置接口
 * - MetadataFilter 元数据过滤接口
 * - BaseVectorStore 抽象基类
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
