/**
 * @module utils/lazy
 * @description 惰性计算工具
 *
 * 提供：
 * - Lazy: 同步惰性值，首次访问时计算
 * - LazyAsync: 异步惰性值，首次访问时异步计算并缓存 Promise
 */

// ==================== 惰性值 ====================

/**
 * 惰性值
 * @class Lazy
 * @description 只在首次访问时计算值，后续访问直接返回缓存结果
 *
 * @template T - 值类型
 *
 * @example
 * ```typescript
 * const heavy = new Lazy(() => expensiveComputation());
 * // 此时不会计算
 * const value = heavy.get(); // 首次访问时计算
 * const sameValue = heavy.get(); // 直接返回缓存结果
 * ```
 */
export class Lazy<T> {
  private factory: () => T;
  private value: T | undefined;
  private computed: boolean = false;

  /**
   * 创建惰性值实例
   * @param {() => T} factory - 值工厂函数，首次访问时调用
   */
  constructor(factory: () => T) {
    this.factory = factory;
  }

  /**
   * 获取值，首次调用时执行工厂函数并缓存结果
   * @returns {T} 计算后的值
   */
  get(): T {
    if (!this.computed) {
      this.value = this.factory();
      this.computed = true;
    }
    return this.value!;
  }

  /**
   * 检查值是否已计算
   * @returns {boolean} 是否已计算
   */
  isComputed(): boolean {
    return this.computed;
  }

  /**
   * 重置惰性值，下次访问时重新计算
   */
  reset(): void {
    this.computed = false;
    this.value = undefined;
  }
}

// ==================== 惰性异步值 ====================

/**
 * 惰性异步值
 * @class LazyAsync
 * @description 首次访问时异步计算值，后续访问共享同一个 Promise
 *
 * @template T - 值类型
 *
 * @example
 * ```typescript
 * const lazyData = new LazyAsync(() => fetchRemoteData());
 * // 并发调用只触发一次请求
 * const [data1, data2] = await Promise.all([
 *   lazyData.get(),
 *   lazyData.get(),
 * ]);
 * ```
 */
export class LazyAsync<T> {
  private factory: () => Promise<T>;
  private value: T | undefined;
  private promise: Promise<T> | null = null;

  /**
   * 创建惰性异步值实例
   * @param {() => Promise<T>} factory - 异步值工厂函数
   */
  constructor(factory: () => Promise<T>) {
    this.factory = factory;
  }

  /**
   * 获取异步值，首次调用时执行工厂函数，后续调用共享 Promise
   * @returns {Promise<T>} 异步计算结果的 Promise
   */
  async get(): Promise<T> {
    if (this.promise) return this.promise;
    this.promise = this.factory().then(value => {
      this.value = value;
      return value;
    });
    return this.promise;
  }

  /**
   * 获取已计算的同步值（如果已就绪）
   * @returns {T | undefined} 已计算的值，未就绪返回 undefined
   */
  getValue(): T | undefined {
    return this.value;
  }

  /**
   * 重置惰性异步值，下次访问时重新计算
   */
  reset(): void {
    this.promise = null;
    this.value = undefined;
  }
}
