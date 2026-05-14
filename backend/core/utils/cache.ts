/**
 * @module utils/cache
 * @description 多级缓存系统
 *
 * 提供：
 * - LRUCache: LRU（最近最少使用）缓存
 * - TTLCache: 带过期时间的缓存
 * - MultiLevelCache: 多级缓存（L1 内存 + L2 持久化）
 */

// ==================== LRU 缓存 ====================

/**
 * LRU 缓存 (Least Recently Used)
 * @class LRUCache
 * @description 基于插入顺序的 Map 实现，当容量满时淘汰最久未访问的条目
 *
 * @template K - 键类型
 * @template V - 值类型
 *
 * @example
 * ```typescript
 * const cache = new LRUCache<string, number>(100);
 * cache.set('key', 42);
 * cache.get('key'); // 42
 * ```
 */
export class LRUCache<K, V> {
  private cache: Map<K, V>;
  private maxSize: number;

  /**
   * 创建 LRU 缓存实例
   * @param {number} maxSize - 最大缓存条目数，默认 100
   */
  constructor(maxSize: number = 100) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  /**
   * 获取缓存值，命中时将条目移至最新位置
   * @param {K} key - 缓存键
   * @returns {V | undefined} 缓存值，未命中返回 undefined
   */
  get(key: K): V | undefined {
    const value = this.cache.get(key);
    if (value !== undefined) {
      // 移动到最新位置（LRU 核心：命中即刷新）
      this.cache.delete(key);
      this.cache.set(key, value);
    }
    return value;
  }

  /**
   * 设置缓存值，容量满时淘汰最久未访问的条目
   * @param {K} key - 缓存键
   * @param {V} value - 缓存值
   */
  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // 删除最旧的条目（Map 迭代顺序中第一个即为最久未访问）
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  /**
   * 检查键是否存在（不更新访问顺序）
   * @param {K} key - 缓存键
   * @returns {boolean} 是否存在
   */
  has(key: K): boolean {
    return this.cache.has(key);
  }

  /**
   * 删除缓存条目
   * @param {K} key - 缓存键
   * @returns {boolean} 是否成功删除
   */
  delete(key: K): boolean {
    return this.cache.delete(key);
  }

  /**
   * 清空所有缓存
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * 获取当前缓存条目数
   * @returns {number} 条目数
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * 获取所有键的迭代器
   * @returns {IterableIterator<K>} 键迭代器
   */
  keys(): IterableIterator<K> {
    return this.cache.keys();
  }

  /**
   * 获取所有值的迭代器
   * @returns {IterableIterator<V>} 值迭代器
   */
  values(): IterableIterator<V> {
    return this.cache.values();
  }
}

// ==================== TTL 缓存 ====================

/**
 * TTL 缓存 (带过期时间)
 * @class TTLCache
 * @description 每个条目在指定时间后自动过期，支持自定义过期时间
 *
 * @template K - 键类型
 * @template V - 值类型
 *
 * @example
 * ```typescript
 * const cache = new TTLCache<string, number>(60000); // 默认 60 秒过期
 * cache.set('key', 42);
 * cache.set('short', 1, 5000); // 自定义 5 秒过期
 * ```
 */
export class TTLCache<K, V> {
  private cache: Map<K, { value: V; expires: number }>;
  private defaultTTL: number;

  /**
   * 创建 TTL 缓存实例
   * @param {number} defaultTTL - 默认过期时间（毫秒），默认 60000ms（60秒）
   */
  constructor(defaultTTL: number = 60000) {
    this.cache = new Map();
    this.defaultTTL = defaultTTL;
  }

  /**
   * 获取缓存值，过期条目自动删除
   * @param {K} key - 缓存键
   * @returns {V | undefined} 缓存值，未命中或已过期返回 undefined
   */
  get(key: K): V | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    if (entry.expires < Date.now()) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.value;
  }

  /**
   * 设置缓存值
   * @param {K} key - 缓存键
   * @param {V} value - 缓存值
   * @param {number} [ttl] - 可选的过期时间（毫秒），默认使用构造时的 defaultTTL
   */
  set(key: K, value: V, ttl?: number): void {
    const expires = Date.now() + (ttl ?? this.defaultTTL);
    this.cache.set(key, { value, expires });
  }

  /**
   * 检查键是否存在且未过期
   * @param {K} key - 缓存键
   * @returns {boolean} 是否存在且未过期
   */
  has(key: K): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    if (entry.expires < Date.now()) {
      this.cache.delete(key);
      return false;
    }
    return true;
  }

  /**
   * 删除缓存条目
   * @param {K} key - 缓存键
   * @returns {boolean} 是否成功删除
   */
  delete(key: K): boolean {
    return this.cache.delete(key);
  }

  /**
   * 清空所有缓存
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * 清理所有过期条目
   * @returns {number} 清理的条目数
   */
  cleanup(): number {
    const now = Date.now();
    let count = 0;
    for (const [key, entry] of this.cache) {
      if (entry.expires < now) {
        this.cache.delete(key);
        count++;
      }
    }
    return count;
  }
}

// ==================== 多级缓存 ====================

/**
 * 多级缓存 (L1: 内存 LRU, L2: 持久化 Map)
 * @class MultiLevelCache
 * @description 两级缓存架构，L1 命中时直接返回，L2 命中时提升至 L1
 *
 * @template K - 键类型
 * @template V - 值类型
 *
 * @example
 * ```typescript
 * const cache = new MultiLevelCache<string, number>(100); // L1 容量 100
 * cache.set('key', 42);
 * cache.get('key'); // 42，从 L1 命中
 * ```
 */
export class MultiLevelCache<K, V> {
  private l1: LRUCache<K, V>;
  private l2: Map<K, V>;
  private l1Size: number;

  /**
   * 创建多级缓存实例
   * @param {number} l1Size - L1 缓存容量，默认 100
   */
  constructor(l1Size: number = 100) {
    this.l1 = new LRUCache(l1Size);
    this.l2 = new Map();
    this.l1Size = l1Size;
  }

  /**
   * 获取缓存值，依次查询 L1 -> L2，L2 命中时提升至 L1
   * @param {K} key - 缓存键
   * @returns {V | undefined} 缓存值，未命中返回 undefined
   */
  get(key: K): V | undefined {
    // 先查 L1
    const l1Value = this.l1.get(key);
    if (l1Value !== undefined) return l1Value;

    // 再查 L2
    const l2Value = this.l2.get(key);
    if (l2Value !== undefined) {
      // 提升到 L1
      this.promoteToL1(key, l2Value);
      return l2Value;
    }

    return undefined;
  }

  /**
   * 设置缓存值，同时写入 L1 和 L2
   * @param {K} key - 缓存键
   * @param {V} value - 缓存值
   */
  set(key: K, value: V): void {
    this.l1.set(key, value);
    this.l2.set(key, value);
  }

  /**
   * 将值提升至 L1 缓存
   * @param {K} key - 缓存键
   * @param {V} value - 缓存值
   */
  private promoteToL1(key: K, value: V): void {
    this.l1.set(key, value);
  }

  /**
   * 删除缓存条目，同时从 L1 和 L2 中移除
   * @param {K} key - 缓存键
   * @returns {boolean} 是否成功删除（任一级删除成功即返回 true）
   */
  delete(key: K): boolean {
    const l1Deleted = this.l1.delete(key);
    const l2Deleted = this.l2.delete(key);
    return l1Deleted || l2Deleted;
  }
}
