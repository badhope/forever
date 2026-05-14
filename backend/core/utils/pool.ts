/**
 * @module utils/pool
 * @description 对象池与限流工具
 *
 * 提供：
 * - ObjectPool: 通用对象池，复用对象减少 GC 压力
 * - TokenBucket: 令牌桶限流器
 * - ConcurrencyController: 并发控制器
 */

// ==================== 对象池 ====================

/**
 * 通用对象池
 * @class ObjectPool
 * @description 复用对象以减少创建/销毁开销，适合频繁创建销毁的场景
 *
 * @template T - 对象类型
 *
 * @example
 * ```typescript
 * const pool = new ObjectPool<Buffer>(
 *   () => Buffer.alloc(1024),        // 创建函数
 *   (buf) => buf.fill(0),            // 重置函数
 *   10                                // 最大池大小
 * );
 * const buf = pool.acquire();
 * // 使用 buf...
 * pool.release(buf); // 归还到池中
 * ```
 */
export class ObjectPool<T> {
  private pool: T[] = [];
  private createFn: () => T;
  private resetFn: (obj: T) => void;
  private maxSize: number;

  /**
   * 创建对象池实例
   * @param {() => T} createFn - 对象创建函数
   * @param {(obj: T) => void} resetFn - 对象重置函数（归还时调用）
   * @param {number} [maxSize=10] - 池的最大容量
   */
  constructor(
    createFn: () => T,
    resetFn: (obj: T) => void,
    maxSize: number = 10
  ) {
    this.createFn = createFn;
    this.resetFn = resetFn;
    this.maxSize = maxSize;
  }

  /**
   * 从池中获取一个对象，池为空时创建新对象
   * @returns {T} 可用对象
   */
  acquire(): T {
    if (this.pool.length > 0) {
      return this.pool.pop()!;
    }
    return this.createFn();
  }

  /**
   * 归还对象到池中，池满时丢弃
   * @param {T} obj - 要归还的对象
   */
  release(obj: T): void {
    if (this.pool.length < this.maxSize) {
      this.resetFn(obj);
      this.pool.push(obj);
    }
  }

  /**
   * 获取池中当前可用对象数量
   * @returns {number} 可用对象数
   */
  size(): number {
    return this.pool.length;
  }

  /**
   * 清空对象池
   */
  clear(): void {
    this.pool = [];
  }
}

// ==================== 令牌桶限流器 ====================

/**
 * 令牌桶限流器
 * @class TokenBucket
 * @description 基于令牌桶算法的限流器，支持匀速填充令牌
 *
 * @example
 * ```typescript
 * const bucket = new TokenBucket(10, 2); // 容量 10，每秒填充 2 个
 * if (bucket.tryConsume(1)) {
 *   // 获取到令牌，执行操作
 * }
 * // 或等待获取令牌
 * await bucket.consume(3);
 * ```
 */
export class TokenBucket {
  private tokens: number;
  private lastRefill: number;
  private capacity: number;
  private refillRate: number; // tokens per ms

  /**
   * 创建令牌桶实例
   * @param {number} capacity - 桶容量（最大令牌数）
   * @param {number} refillRatePerSecond - 每秒填充的令牌数
   */
  constructor(capacity: number, refillRatePerSecond: number) {
    this.capacity = capacity;
    this.tokens = capacity;
    this.lastRefill = Date.now();
    this.refillRate = refillRatePerSecond / 1000;
  }

  /**
   * 尝试消费令牌（非阻塞）
   * @param {number} [tokens=1] - 需要消费的令牌数
   * @returns {boolean} 是否成功消费
   */
  tryConsume(tokens: number = 1): boolean {
    this.refill();

    if (this.tokens >= tokens) {
      this.tokens -= tokens;
      return true;
    }
    return false;
  }

  /**
   * 消费令牌（阻塞，等待令牌充足）
   * @param {number} [tokens=1] - 需要消费的令牌数
   * @returns {Promise<void>}
   */
  async consume(tokens: number = 1): Promise<void> {
    while (!this.tryConsume(tokens)) {
      const waitMs = Math.ceil((tokens - this.tokens) / this.refillRate);
      await new Promise(resolve => setTimeout(resolve, waitMs));
    }
  }

  /**
   * 按时间流逝填充令牌
   */
  private refill(): void {
    const now = Date.now();
    const elapsed = now - this.lastRefill;
    const tokensToAdd = elapsed * this.refillRate;

    this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }
}

// ==================== 并发控制器 ====================

/**
 * 并发控制器
 * @class ConcurrencyController
 * @description 限制同时执行的异步操作数量，超出时排队等待
 *
 * @example
 * ```typescript
 * const controller = new ConcurrencyController(3); // 最多 3 个并发
 * const results = await Promise.all([
 *   controller.execute(() => fetch(url1)),
 *   controller.execute(() => fetch(url2)),
 *   controller.execute(() => fetch(url3)),
 *   controller.execute(() => fetch(url4)), // 排队等待
 * ]);
 * ```
 */
export class ConcurrencyController {
  private maxConcurrency: number;
  private running: number = 0;
  private queue: Array<() => void> = [];

  /**
   * 创建并发控制器实例
   * @param {number} [maxConcurrency=5] - 最大并发数
   */
  constructor(maxConcurrency: number = 5) {
    this.maxConcurrency = maxConcurrency;
  }

  /**
   * 在并发限制下执行异步函数
   * @template T - 返回值类型
   * @param {() => Promise<T>} fn - 异步函数
   * @returns {Promise<T>} 函数执行结果
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.running >= this.maxConcurrency) {
      await new Promise<void>(resolve => this.queue.push(resolve));
    }

    this.running++;
    try {
      return await fn();
    } finally {
      this.running--;
      const next = this.queue.shift();
      if (next) next();
    }
  }
}
