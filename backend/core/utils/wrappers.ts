/**
 * @module utils/wrappers
 * @description 函数包装工具
 *
 * 提供常用的高阶函数包装器：
 * - memoize: 同步记忆化
 * - memoizeWithTTL: 带 TTL 的记忆化
 * - debounce: 防抖
 * - throttle: 节流
 * - withRetry: 重试包装器
 * - withTimeout: 超时包装器
 */

/**
 * 记忆化
 * @function memoize
 * @description 缓存函数结果，相同参数直接返回缓存值
 * @template T - 参数类型元组
 * @template U - 返回值类型
 * @param {(...args: T) => U} fn - 要记忆化的函数
 * @param {...args: T) => string} [keyFn] - 可选的自定义缓存键生成函数
 * @returns {(...args: T) => U} 记忆化后的函数
 */
export function memoize<T extends any[], U>(
  fn: (...args: T) => U,
  keyFn?: (...args: T) => string
): (...args: T) => U {
  const cache = new Map<string, U>();

  return (...args: T): U => {
    const key = keyFn ? keyFn(...args) : JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}

/**
 * 带 TTL 的记忆化
 * @function memoizeWithTTL
 * @description 缓存函数结果，条目在指定时间后自动过期
 * @template T - 参数类型元组
 * @template U - 返回值类型
 * @param {(...args: T) => U} fn - 要记忆化的函数
 * @param {number} ttlMs - 缓存过期时间（毫秒）
 * @param {...args: T) => string} [keyFn] - 可选的自定义缓存键生成函数
 * @returns {(...args: T) => U} 带 TTL 的记忆化函数
 */
export function memoizeWithTTL<T extends any[], U>(
  fn: (...args: T) => U,
  ttlMs: number,
  keyFn?: (...args: T) => string
): (...args: T) => U {
  const cache = new Map<string, { value: U; expires: number }>();

  return (...args: T): U => {
    const key = keyFn ? keyFn(...args) : JSON.stringify(args);
    const cached = cache.get(key);

    if (cached && cached.expires > Date.now()) {
      return cached.value;
    }

    const result = fn(...args);
    cache.set(key, { value: result, expires: Date.now() + ttlMs });
    return result;
  };
}

/**
 * 防抖
 * @function debounce
 * @description 延迟执行函数，如果在延迟时间内再次调用则重新计时
 * @template T - 参数类型元组
 * @param {(...args: T) => void} fn - 要防抖的函数
 * @param {number} delay - 延迟时间（毫秒）
 * @returns {(...args: T) => void} 防抖后的函数
 */
export function debounce<T extends any[]>(
  fn: (...args: T) => void,
  delay: number
): (...args: T) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: T): void => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * 节流
 * @function throttle
 * @description 限制函数执行频率，在间隔时间内最多执行一次
 * @template T - 参数类型元组
 * @param {(...args: T) => void} fn - 要节流的函数
 * @param {number} interval - 最小执行间隔（毫秒）
 * @returns {(...args: T) => void} 节流后的函数
 */
export function throttle<T extends any[]>(
  fn: (...args: T) => void,
  interval: number
): (...args: T) => void {
  let lastTime = 0;

  return (...args: T): void => {
    const now = Date.now();
    if (now - lastTime >= interval) {
      lastTime = now;
      fn(...args);
    }
  };
}

/**
 * 重试包装器
 * @function withRetry
 * @description 包装异步函数，失败时自动重试（指数退避）
 * @template T - 参数类型元组
 * @template U - 返回值类型
 * @param {(...args: T) => Promise<U>} fn - 要包装的异步函数
 * @param {number} [maxRetries=3] - 最大重试次数
 * @param {number} [delayMs=1000] - 初始延迟时间（毫秒），每次重试翻倍
 * @returns {(...args: T) => Promise<U>} 带重试的异步函数
 */
export function withRetry<T extends any[], U>(
  fn: (...args: T) => Promise<U>,
  maxRetries: number = 3,
  delayMs: number = 1000
): (...args: T) => Promise<U> {
  return async (...args: T): Promise<U> => {
    let lastError: Error;

    for (let i = 0; i <= maxRetries; i++) {
      try {
        return await fn(...args);
      } catch (error) {
        lastError = error as Error;
        if (i < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, delayMs * Math.pow(2, i)));
        }
      }
    }

    throw lastError!;
  };
}

/**
 * 超时包装器
 * @function withTimeout
 * @description 包装异步函数，超时后自动拒绝
 * @template T - 参数类型元组
 * @template U - 返回值类型
 * @param {(...args: T) => Promise<U>} fn - 要包装的异步函数
 * @param {number} timeoutMs - 超时时间（毫秒）
 * @returns {(...args: T) => Promise<U>} 带超时的异步函数
 * @throws {Error} 超时时抛出 'Timeout' 错误
 */
export function withTimeout<T extends any[], U>(
  fn: (...args: T) => Promise<U>,
  timeoutMs: number
): (...args: T) => Promise<U> {
  return (...args: T): Promise<U> => {
    return Promise.race([
      fn(...args),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), timeoutMs)
      ),
    ]);
  };
}
