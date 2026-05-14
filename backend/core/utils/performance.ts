/**
 * @module utils/performance
 * @description Forever 性能优化工具库（Barrel Export）
 *
 * 包含缓存、批处理、惰性计算、对象池、限流和性能监控等功能。
 * 所有子模块通过此文件统一导出，保持向后兼容。
 */

// 缓存系统
export { LRUCache, TTLCache, MultiLevelCache } from './cache';

// 批处理系统
export { Batcher, DeduplicatedBatcher } from './batch';

// 惰性计算
export { Lazy, LazyAsync } from './lazy';

// 对象池与限流
export { ObjectPool, TokenBucket, ConcurrencyController } from './pool';

// 性能监控
export { PerformanceTimer, withPerformance, withPerformanceAsync } from './timer';

// 聚合导出对象
import { LRUCache, TTLCache, MultiLevelCache } from './cache';
import { Batcher, DeduplicatedBatcher } from './batch';
import { Lazy, LazyAsync } from './lazy';
import { ObjectPool, TokenBucket, ConcurrencyController } from './pool';
import { PerformanceTimer, withPerformance, withPerformanceAsync } from './timer';

/**
 * 性能工具聚合对象
 * @description 提供所有性能工具的统一命名空间访问
 */
export const Performance = {
  // 缓存
  LRUCache,
  TTLCache,
  MultiLevelCache,

  // 批处理
  Batcher,
  DeduplicatedBatcher,

  // 惰性计算
  Lazy,
  LazyAsync,

  // 对象池
  ObjectPool,

  // 限流
  TokenBucket,
  ConcurrencyController,

  // 监控
  PerformanceTimer,
  withPerformance,
  withPerformanceAsync,
};

export default Performance;
