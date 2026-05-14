/**
 * @module vector-store/similarity
 * @description 向量相似度计算与元数据过滤工具函数
 *
 * 提供：
 * - cosineSimilarity 余弦相似度
 * - euclideanDistance 欧几里得距离
 * - dotProduct 点积
 * - computeSimilarity 通用相似度计算
 * - matchesFilter 元数据过滤匹配
 */

import type { Embedding, MetadataFilter } from './types';

// ============================================================================
// 相似度计算工具函数
// ============================================================================

/**
 * 计算两个向量的余弦相似度
 * @param {number[]} a - 向量 A
 * @param {number[]} b - 向量 B
 * @returns {number} 余弦相似度（-1 到 1）
 * @throws {Error} 当向量维度不匹配时抛出错误
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
 * @throws {Error} 当向量维度不匹配时抛出错误
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
 * @throws {Error} 当向量维度不匹配时抛出错误
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
 * @throws {Error} 当度量方式未知时抛出错误
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
