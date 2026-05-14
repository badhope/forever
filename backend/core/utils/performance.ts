/**
 * Forever 性能优化工具库
 * 包含缓存、批处理、惰性计算等性能优化功能
 */

// ==================== 缓存系统 ====================

/**
 * LRU 缓存 (Least Recently Used)
 */
export class LRUCache<K, V> {
  private cache: Map<K, V>;
  private maxSize: number;

  constructor(maxSize: number = 100) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  get(key: K): V | undefined {
    const value = this.cache.get(key);
    if (value !== undefined) {
      // 移动到最新位置
      this.cache.delete(key);
      this.cache.set(key, value);
    }
    return value;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // 删除最旧的
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  has(key: K): boolean {
    return this.cache.has(key);
  }

  delete(key: K): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  keys(): IterableIterator<K> {
    return this.cache.keys();
  }

  values(): IterableIterator<V> {
    return this.cache.values();
  }
}

/**
 * TTL 缓存 (带过期时间)
 */
export class TTLCache<K, V> {
  private cache: Map<K, { value: V; expires: number }>;
  private defaultTTL: number;

  constructor(defaultTTL: number = 60000) {
    this.cache = new Map();
    this.defaultTTL = defaultTTL;
  }

  get(key: K): V | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    if (entry.expires < Date.now()) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.value;
  }

  set(key: K, value: V, ttl?: number): void {
    const expires = Date.now() + (ttl ?? this.defaultTTL);
    this.cache.set(key, { value, expires });
  }

  has(key: K): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    if (entry.expires < Date.now()) {
      this.cache.delete(key);
      return false;
    }
    return true;
  }

  delete(key: K): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  /**
   * 清理过期条目
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

/**
 * 多级缓存 (L1: 内存, L2: 持久化)
 */
export class MultiLevelCache<K, V> {
  private l1: LRUCache<K, V>;
  private l2: Map<K, V>;
  private l1Size: number;

  constructor(l1Size: number = 100) {
    this.l1 = new LRUCache(l1Size);
    this.l2 = new Map();
    this.l1Size = l1Size;
  }

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

  set(key: K, value: V): void {
    this.l1.set(key, value);
    this.l2.set(key, value);
  }

  private promoteToL1(key: K, value: V): void {
    this.l1.set(key, value);
  }

  delete(key: K): boolean {
    const l1Deleted = this.l1.delete(key);
    const l2Deleted = this.l2.delete(key);
    return l1Deleted || l2Deleted;
  }
}

// ==================== 批处理系统 ====================

/**
 * 批处理器
 * 将多个请求合并为批量处理
 */
export class Batcher<T, R> {
  private batch: Array<{ item: T; resolve: (result: R) => void; reject: (error: Error) => void }>;
  private processFn: (items: T[]) => Promise<R[]>;
  private maxBatchSize: number;
  private maxWaitMs: number;
  private timeoutId: ReturnType<typeof setTimeout> | null = null;

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

/**
 * 去重批处理器
 * 相同 key 的请求只执行一次
 */
export class DeduplicatedBatcher<K, T, R> {
  private pending: Map<K, Array<{ resolve: (result: R) => void; reject: (error: Error) => void }>>;
  private processFn: (key: K, item: T) => Promise<R>;

  constructor(processFn: (key: K, item: T) => Promise<R>) {
    this.pending = new Map();
    this.processFn = processFn;
  }

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

// ==================== 惰性计算 ====================

/**
 * 惰性值
 * 只在首次访问时计算
 */
export class Lazy<T> {
  private factory: () => T;
  private value: T | undefined;
  private computed: boolean = false;

  constructor(factory: () => T) {
    this.factory = factory;
  }

  get(): T {
    if (!this.computed) {
      this.value = this.factory();
      this.computed = true;
    }
    return this.value!;
  }

  isComputed(): boolean {
    return this.computed;
  }

  reset(): void {
    this.computed = false;
    this.value = undefined;
  }
}

/**
 * 惰性异步值
 */
export class LazyAsync<T> {
  private factory: () => Promise<T>;
  private value: T | undefined;
  private promise: Promise<T> | null = null;

  constructor(factory: () => Promise<T>) {
    this.factory = factory;
  }

  async get(): Promise<T> {
    if (this.promise) return this.promise;
    this.promise = this.factory().then(value => {
      this.value = value;
      return value;
    });
    return this.promise;
  }

  getValue(): T | undefined {
    return this.value;
  }

  reset(): void {
    this.promise = null;
    this.value = undefined;
  }
}

// ==================== 对象池 ====================

/**
 * 通用对象池
 */
export class ObjectPool<T> {
  private pool: T[] = [];
  private createFn: () => T;
  private resetFn: (obj: T) => void;
  private maxSize: number;

  constructor(
    createFn: () => T,
    resetFn: (obj: T) => void,
    maxSize: number = 10
  ) {
    this.createFn = createFn;
    this.resetFn = resetFn;
    this.maxSize = maxSize;
  }

  acquire(): T {
    if (this.pool.length > 0) {
      return this.pool.pop()!;
    }
    return this.createFn();
  }

  release(obj: T): void {
    if (this.pool.length < this.maxSize) {
      this.resetFn(obj);
      this.pool.push(obj);
    }
  }

  size(): number {
    return this.pool.length;
  }

  clear(): void {
    this.pool = [];
  }
}

// ==================== 限流器 ====================

/**
 * 令牌桶限流器
 */
export class TokenBucket {
  private tokens: number;
  private lastRefill: number;
  private capacity: number;
  private refillRate: number; // tokens per ms

  constructor(capacity: number, refillRatePerSecond: number) {
    this.capacity = capacity;
    this.tokens = capacity;
    this.lastRefill = Date.now();
    this.refillRate = refillRatePerSecond / 1000;
  }

  tryConsume(tokens: number = 1): boolean {
    this.refill();

    if (this.tokens >= tokens) {
      this.tokens -= tokens;
      return true;
    }
    return false;
  }

  async consume(tokens: number = 1): Promise<void> {
    while (!this.tryConsume(tokens)) {
      const waitMs = Math.ceil((tokens - this.tokens) / this.refillRate);
      await new Promise(resolve => setTimeout(resolve, waitMs));
    }
  }

  private refill(): void {
    const now = Date.now();
    const elapsed = now - this.lastRefill;
    const tokensToAdd = elapsed * this.refillRate;

    this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }
}

/**
 * 并发控制器
 */
export class ConcurrencyController {
  private maxConcurrency: number;
  private running: number = 0;
  private queue: Array<() => void> = [];

  constructor(maxConcurrency: number = 5) {
    this.maxConcurrency = maxConcurrency;
  }

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

// ==================== 性能监控 ====================

/**
 * 性能计时器
 */
export class PerformanceTimer {
  private marks: Map<string, number> = new Map();
  private measures: Array<{ name: string; duration: number }> = [];

  mark(name: string): void {
    this.marks.set(name, performance.now());
  }

  measure(name: string, startMark: string, endMark?: string): number {
    const start = this.marks.get(startMark);
    const end = endMark ? this.marks.get(endMark) : performance.now();

    if (start === undefined) {
      throw new Error(`Mark '${startMark}' not found`);
    }

    const duration = (end ?? performance.now()) - start;
    this.measures.push({ name, duration });
    return duration;
  }

  getMeasures(): Array<{ name: string; duration: number }> {
    return [...this.measures];
  }

  clear(): void {
    this.marks.clear();
    this.measures = [];
  }
}

/**
 * 函数性能包装器
 */
export function withPerformance<T extends any[], R>(
  fn: (...args: T) => R,
  name: string,
  onMeasure?: (name: string, duration: number) => void
): (...args: T) => R {
  return (...args: T): R => {
    const start = performance.now();
    try {
      return fn(...args);
    } finally {
      const duration = performance.now() - start;
      if (onMeasure) {
        onMeasure(name, duration);
      }
    }
  };
}

/**
 * 异步函数性能包装器
 */
export function withPerformanceAsync<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  name: string,
  onMeasure?: (name: string, duration: number) => void
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    const start = performance.now();
    try {
      return await fn(...args);
    } finally {
      const duration = performance.now() - start;
      if (onMeasure) {
        onMeasure(name, duration);
      }
    }
  };
}

// ==================== 导出 ====================

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
