/**
 * Forever 函数式编程工具库
 * 提供高阶函数、组合子、惰性求值等函数式编程特性
 */

// ==================== 基础组合子 ====================

/**
 * 恒等函数
 */
export const identity = <T>(x: T): T => x;

/**
 * 常量函数
 * 返回一个总是返回相同值的函数
 */
export const constant = <T>(x: T) => (): T => x;

/**
 * 组合函数 (从右到左)
 * compose(f, g)(x) = f(g(x))
 */
export function compose<T>(...fns: Array<(x: T) => T>): (x: T) => T {
  return (x: T) => fns.reduceRight((acc, fn) => fn(acc), x);
}

/**
 * 管道函数 (从左到右)
 * pipe(x, f, g) = g(f(x))
 */
export function pipe<T>(x: T, ...fns: Array<(x: T) => T>): T {
  return fns.reduce((acc, fn) => fn(acc), x);
}

/**
 * 柯里化
 */
export function curry<T, U, V>(fn: (a: T, b: U) => V): (a: T) => (b: U) => V {
  return (a: T) => (b: U) => fn(a, b);
}

/**
 * 部分应用
 */
export function partial<T extends any[], U>(
  fn: (...args: T) => U,
  ...presetArgs: Partial<T>
): (...args: any[]) => U {
  return (...laterArgs: any[]) => fn(...(presetArgs as T), ...laterArgs);
}

// ==================== 数组高阶函数 ====================

/**
 * 映射
 */
export const map = <T, U>(fn: (x: T, i: number) => U) => (arr: T[]): U[] =>
  arr.map(fn);

/**
 * 过滤
 */
export const filter = <T>(predicate: (x: T, i: number) => boolean) => (arr: T[]): T[] =>
  arr.filter(predicate);

/**
 * 归约
 */
export const reduce = <T, U>(fn: (acc: U, x: T, i: number) => U, initial: U) => (arr: T[]): U =>
  arr.reduce(fn, initial);

/**
 * 扁平化映射
 */
export const flatMap = <T, U>(fn: (x: T) => U[]) => (arr: T[]): U[] =>
  arr.flatMap(fn);

/**
 * 分组
 */
export function groupBy<T, K>(fn: (x: T) => K): (arr: T[]) => Map<K, T[]> {
  return (arr: T[]) => {
    const groups = new Map<K, T[]>();
    for (const item of arr) {
      const key = fn(item);
      const group = groups.get(key) || [];
      group.push(item);
      groups.set(key, group);
    }
    return groups;
  };
}

/**
 * 按键排序
 */
export function sortBy<T>(fn: (x: T) => number, ascending: boolean = true): (arr: T[]) => T[] {
  return (arr: T[]) => {
    const sorted = [...arr].sort((a, b) => fn(a) - fn(b));
    return ascending ? sorted : sorted.reverse();
  };
}

/**
 * 去重
 */
export function unique<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}

/**
 * 按键去重
 */
export function uniqueBy<T, K>(fn: (x: T) => K): (arr: T[]) => T[] {
  return (arr: T[]) => {
    const seen = new Set<K>();
    return arr.filter(item => {
      const key = fn(item);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };
}

/**
 * 分块
 */
export function chunk<T>(size: number): (arr: T[]) => T[][] {
  return (arr: T[]) => {
    const chunks: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  };
}

/**
 * 取前 N 个
 */
export const take = <T>(n: number) => (arr: T[]): T[] => arr.slice(0, n);

/**
 * 跳过前 N 个
 */
export const skip = <T>(n: number) => (arr: T[]): T[] => arr.slice(n);

/**
 * 并行处理 (使用 Promise.all)
 */
export async function parallel<T, U>(
  fn: (x: T) => Promise<U>,
  concurrency: number = 5
): Promise<(arr: T[]) => Promise<U[]>> {
  return async (arr: T[]) => {
    const results: U[] = [];
    for (let i = 0; i < arr.length; i += concurrency) {
      const batch = arr.slice(i, i + concurrency);
      const batchResults = await Promise.all(batch.map(fn));
      results.push(...batchResults);
    }
    return results;
  };
}

// ==================== 函数组合工具 ====================

/**
 * 记忆化
 * 缓存函数结果
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

// ==================== 惰性求值 ====================

/**
 * 惰性序列
 */
export class LazySequence<T> {
  private iterator: Iterator<T>;

  constructor(iterator: Iterator<T>) {
    this.iterator = iterator;
  }

  static from<T>(iterable: Iterable<T>): LazySequence<T> {
    return new LazySequence(iterable[Symbol.iterator]());
  }

  static range(start: number, end: number, step: number = 1): LazySequence<number> {
    return new LazySequence(function* () {
      for (let i = start; i < end; i += step) {
        yield i;
      }
    }());
  }

  static repeat<T>(value: T, count: number): LazySequence<T> {
    return new LazySequence(function* () {
      for (let i = 0; i < count; i++) {
        yield value;
      }
    }());
  }

  map<U>(fn: (x: T) => U): LazySequence<U> {
    const self = this;
    return new LazySequence(function* () {
      for (const item of self.toIterable()) {
        yield fn(item);
      }
    }());
  }

  filter(predicate: (x: T) => boolean): LazySequence<T> {
    const self = this;
    return new LazySequence(function* () {
      for (const item of self.toIterable()) {
        if (predicate(item)) yield item;
      }
    }());
  }

  take(n: number): LazySequence<T> {
    const self = this;
    return new LazySequence(function* () {
      let count = 0;
      for (const item of self.toIterable()) {
        if (count >= n) break;
        yield item;
        count++;
      }
    }());
  }

  skip(n: number): LazySequence<T> {
    const self = this;
    return new LazySequence(function* () {
      let count = 0;
      for (const item of self.toIterable()) {
        if (count >= n) yield item;
        count++;
      }
    }());
  }

  reduce<U>(fn: (acc: U, x: T) => U, initial: U): U {
    let acc = initial;
    for (const item of this.toIterable()) {
      acc = fn(acc, item);
    }
    return acc;
  }

  forEach(fn: (x: T) => void): void {
    for (const item of this.toIterable()) {
      fn(item);
    }
  }

  toArray(): T[] {
    return [...this.toIterable()];
  }

  private toIterable(): Iterable<T> {
    return { [Symbol.iterator]: () => this.iterator };
  }
}

// ==================== 可选值处理 ====================

/**
 * Maybe 单子
 * 处理可能为 null/undefined 的值
 */
export class Maybe<T> {
  private constructor(private value: T | null | undefined) {}

  static of<T>(value: T | null | undefined): Maybe<T> {
    return new Maybe(value);
  }

  static just<T>(value: T): Maybe<T> {
    return new Maybe(value);
  }

  static nothing<T>(): Maybe<T> {
    return new Maybe<T>(null);
  }

  isJust(): boolean {
    return this.value !== null && this.value !== undefined;
  }

  isNothing(): boolean {
    return !this.isJust();
  }

  map<U>(fn: (x: T) => U): Maybe<U> {
    return this.isJust() ? Maybe.just(fn(this.value!)) : Maybe.nothing();
  }

  flatMap<U>(fn: (x: T) => Maybe<U>): Maybe<U> {
    return this.isJust() ? fn(this.value!) : Maybe.nothing();
  }

  filter(predicate: (x: T) => boolean): Maybe<T> {
    return this.isJust() && predicate(this.value!) ? this : Maybe.nothing();
  }

  getOrElse(defaultValue: T): T {
    return this.isJust() ? this.value! : defaultValue;
  }

  getOrElseThrow(error: Error): T {
    if (this.isJust()) return this.value!;
    throw error;
  }

  orElse(alternative: Maybe<T>): Maybe<T> {
    return this.isJust() ? this : alternative;
  }

  forEach(fn: (x: T) => void): void {
    if (this.isJust()) fn(this.value!);
  }

  toNullable(): T | null {
    return this.isJust() ? this.value! : null;
  }
}

/**
 * Either 类型
 * 处理可能失败的操作
 */
export class Either<L, R> {
  private constructor(
    private left: L | null,
    private right: R | null
  ) {}

  static left<L, R>(value: L): Either<L, R> {
    return new Either<L, R>(value, null);
  }

  static right<L, R>(value: R): Either<L, R> {
    return new Either<L, R>(null, value);
  }

  isLeft(): boolean {
    return this.left !== null;
  }

  isRight(): boolean {
    return this.right !== null;
  }

  map<U>(fn: (x: R) => U): Either<L, U> {
    return this.isRight() ? Either.right(fn(this.right!)) : Either.left(this.left!);
  }

  mapLeft<U>(fn: (x: L) => U): Either<U, R> {
    return this.isLeft() ? Either.left(fn(this.left!)) : Either.right(this.right!);
  }

  flatMap<U>(fn: (x: R) => Either<L, U>): Either<L, U> {
    return this.isRight() ? fn(this.right!) : Either.left(this.left!);
  }

  fold<U>(leftFn: (x: L) => U, rightFn: (x: R) => U): U {
    return this.isLeft() ? leftFn(this.left!) : rightFn(this.right!);
  }

  getOrElse(defaultValue: R): R {
    return this.isRight() ? this.right! : defaultValue;
  }
}

// ==================== 导出 ====================

export const FP = {
  // 基础
  identity,
  constant,
  compose,
  pipe,
  curry,
  partial,

  // 数组
  map,
  filter,
  reduce,
  flatMap,
  groupBy,
  sortBy,
  unique,
  uniqueBy,
  chunk,
  take,
  skip,
  parallel,

  // 函数包装
  memoize,
  memoizeWithTTL,
  debounce,
  throttle,
  withRetry,
  withTimeout,

  // 惰性求值
  LazySequence,

  // 可选值
  Maybe,
  Either,
};

export default FP;
