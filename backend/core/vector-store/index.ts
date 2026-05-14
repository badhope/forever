/**
 * @module vector-store
 * @description 向量存储抽象层（Barrel Export）
 *
 * 提供向量存储的核心抽象和内存实现，支持：
 * - 向量的增删改查
 * - 多种相似度度量（余弦、欧几里得、点积）
 * - 元数据过滤
 * - 批量操作
 */

// 类型导出
export type {
  Embedding,
  VectorSearchResult,
  VectorStoreConfig,
  MetadataFilter,
} from './types';

export { BaseVectorStore } from './types';

// 相似度计算与过滤
export {
  cosineSimilarity,
  euclideanDistance,
  dotProduct,
  computeSimilarity,
  matchesFilter,
} from './similarity';

// 内存实现
export { InMemoryVectorStore } from './memory';
