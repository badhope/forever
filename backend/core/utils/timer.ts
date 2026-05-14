/**
 * @module utils/timer
 * @description 性能计时与监控工具
 *
 * 提供：
 * - PerformanceTimer: 性能计时器，支持标记和度量
 * - withPerformance: 同步函数性能包装器
 * - withPerformanceAsync: 异步函数性能包装器
 */

// ==================== 性能计时器 ====================

/**
 * 性能计时器
 * @class PerformanceTimer
 * @description 基于 performance.now() 的高精度计时器，支持多个标记点
 *
 * @example
 * ```typescript
 * const timer = new PerformanceTimer();
 * timer.mark('start');
 * // ... 执行操作 ...
 * timer.mark('end');
 * const duration = timer.measure('operation', 'start', 'end');
 * console.log(timer.getMeasures());
 * ```
 */
export class PerformanceTimer {
  private marks: Map<string, number> = new Map();
  private measures: Array<{ name: string; duration: number }> = [];

  /**
   * 设置一个时间标记
   * @param {string} name - 标记名称
   */
  mark(name: string): void {
    this.marks.set(name, performance.now());
  }

  /**
   * 计算两个标记之间的时间差
   * @param {string} name - 度量名称
   * @param {string} startMark - 起始标记名称
   * @param {string} [endMark] - 结束标记名称，省略则使用当前时间
   * @returns {number} 时间差（毫秒）
   * @throws {Error} 当起始标记不存在时抛出错误
   */
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

  /**
   * 获取所有度量结果
   * @returns {Array<{ name: string; duration: number }>} 度量结果数组
   */
  getMeasures(): Array<{ name: string; duration: number }> {
    return [...this.measures];
  }

  /**
   * 清空所有标记和度量结果
   */
  clear(): void {
    this.marks.clear();
    this.measures = [];
  }
}

// ==================== 函数性能包装器 ====================

/**
 * 同步函数性能包装器
 * @function withPerformance
 * @description 包装同步函数，每次调用时记录执行时间
 *
 * @template T - 参数元组类型
 * @template R - 返回值类型
 * @param {(...args: T) => R} fn - 要包装的函数
 * @param {string} name - 度量名称
 * @param {(name: string, duration: number) => void} [onMeasure] - 度量回调
 * @returns {(...args: T) => R} 包装后的函数
 *
 * @example
 * ```typescript
 * const timedFn = withPerformance(
 *   (x: number) => x * 2,
 *   'double',
 *   (name, duration) => console.log(`${name}: ${duration}ms`)
 * );
 * timedFn(21); // 控制台输出: double: 0.012ms
 * ```
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
 * @function withPerformanceAsync
 * @description 包装异步函数，每次调用时记录执行时间（包含 await 等待时间）
 *
 * @template T - 参数元组类型
 * @template R - 返回值类型
 * @param {(...args: T) => Promise<R>} fn - 要包装的异步函数
 * @param {string} name - 度量名称
 * @param {(name: string, duration: number) => void} [onMeasure] - 度量回调
 * @returns {(...args: T) => Promise<R>} 包装后的异步函数
 *
 * @example
 * ```typescript
 * const timedFetch = withPerformanceAsync(
 *   (url: string) => fetch(url),
 *   'fetch',
 *   (name, duration) => console.log(`${name}: ${duration}ms`)
 * );
 * await timedFetch('https://example.com');
 * ```
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
