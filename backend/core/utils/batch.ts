/**
 * @module utils/batch
 * @description 批处理工具
 *
 * 提供：
 * - Batcher: 将多个请求合并为批量处理
 * - DeduplicatedBatcher: 相同 key 的请求只执行一次
 */

// ==================== 批处理器 ====================

/**
 * 批处理器
 * @class Batcher
 * @description 将多个独立请求合并为一次批量处理，减少调用次数
 *
 * @template T - 输入项类型
 * @template R - 返回结果类型
 *
 * @example
 * ```typescript
 * const batcher = new Batcher<string, number>(
 *   async (items) => items.map(item => item.length),
 *   10,  // 最大批量大小
 *   50   // 最大等待时间（ms）
 * );
 * const result = await batcher.add('hello'); // 5
 * ```
 */
export class Batcher<T, R> {
  private batch: Array<{ item: T; resolve: (result: R) => void; reject: (error: Error) => void }>;
  private processFn: (items: T[]) => Promise<R[]>;
  private maxBatchSize: number;
  private maxWaitMs: number;
  private timeoutId: ReturnType<typeof setTimeout> | null = null;

  /**
   * 创建批处理器实例
   * @param {(items: T[]) => Promise<R[]>} processFn - 批量处理函数
   * @param {number} [maxBatchSize=10] - 最大批量大小
   * @param {number} [maxWaitMs=50] - 最大等待时间（毫秒）
   */
  constructor(
    processFn: (items: T[]) => Promise<R[]>,
    maxBatchSize: number = 10,
    maxWaitMs: number = 50
  ) {
    this.batch = [];
    this.processFn = processFn;
    this.maxBatchSize = maxBatchSize;
    this.maxWaitMs = maxWaitMs;
  }

  /**
   * 添加一个项目到批处理队列
   * @param {T} item - 待处理的项目
   * @returns {Promise<R>} 处理结果
   */
  async add(item: T): Promise<R> {
    return new Promise((resolve, reject) => {
      this.batch.push({ item, resolve, reject });

      if (this.batch.length >= this.maxBatchSize) {
        this.flush();
      } else if (!this.timeoutId) {
        this.timeoutId = setTimeout(() => this.flush(), this.maxWaitMs);
      }
    });
  }

  /**
   * 执行当前批次的所有项目
   */
  private async flush(): Promise<void> {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }

    if (this.batch.length === 0) return;

    const currentBatch = this.batch.splice(0, this.maxBatchSize);
    const items = currentBatch.map(b => b.item);

    try {
      const results = await this.processFn(items);
      currentBatch.forEach((b, i) => b.resolve(results[i]));
    } catch (error) {
      currentBatch.forEach(b => b.reject(error as Error));
    }
  }
}

// ==================== 去重批处理器 ====================

/**
 * 去重批处理器
 * @class DeduplicatedBatcher
 * @description 相同 key 的请求只执行一次，后续请求共享同一个 Promise
 *
 * @template K - 去重键类型
 * @template T - 输入项类型
 * @template R - 返回结果类型
 *
 * @example
 * ```typescript
 * const dedup = new DeduplicatedBatcher<string, string, Data>(
 *   async (key, item) => fetchData(key, item)
 * );
 * // 相同 key 的并发请求只会执行一次
 * const [r1, r2] = await Promise.all([
 *   dedup.execute('user:1', 'query'),
 *   dedup.execute('user:1', 'query'),
 * ]);
 * ```
 */
export class DeduplicatedBatcher<K, T, R> {
  private pending: Map<K, Array<{ resolve: (result: R) => void; reject: (error: Error) => void }>>;
  private processFn: (key: K, item: T) => Promise<R>;

  /**
   * 创建去重批处理器实例
   * @param {(key: K, item: T) => Promise<R>} processFn - 处理函数
   */
  constructor(processFn: (key: K, item: T) => Promise<R>) {
    this.pending = new Map();
    this.processFn = processFn;
  }

  /**
   * 执行请求，相同 key 的并发请求会合并
   * @param {K} key - 去重键
   * @param {T} item - 输入项
   * @returns {Promise<R>} 处理结果
   */
  async execute(key: K, item: T): Promise<R> {
    // 如果已有相同 key 的待处理请求，加入等待队列
    const existing = this.pending.get(key);
    if (existing) {
      return new Promise((resolve, reject) => {
        existing.push({ resolve, reject });
      });
    }

    // 创建新的待处理队列
    const waiters: Array<{ resolve: (result: R) => void; reject: (error: Error) => void }> = [];
    this.pending.set(key, waiters);

    try {
      const result = await this.processFn(key, item);
      // 通知所有等待者
      waiters.forEach(w => w.resolve(result));
      return result;
    } catch (error) {
      waiters.forEach(w => w.reject(error as Error));
      throw error;
    } finally {
      this.pending.delete(key);
    }
  }
}
