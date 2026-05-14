/**
 * @module utils/lazy-sequence
 * @description 惰性序列
 *
 * 提供惰性求值的序列操作，支持链式调用和按需计算。
 * 只有在终端操作（toArray, reduce, forEach）时才实际遍历元素。
 *
 * @example
 * ```typescript
 * const result = LazySequence.range(0, 1000)
 *   .filter(x => x % 2 === 0)
 *   .map(x => x * x)
 *   .take(5)
 *   .toArray(); // [0, 4, 16, 36, 64]
 * ```
 */

/**
 * 惰性序列
 * @class LazySequence
 * @description 基于迭代器的惰性序列，支持链式操作
 *
 * @template T - 元素类型
 */
export class LazySequence<T> {
  private iterator: Iterator<T>;

  /**
   * 创建惰性序列实例
   * @param {Iterator<T>} iterator - 底层迭代器
   */
  constructor(iterator: Iterator<T>) {
    this.iterator = iterator;
  }

  /**
   * 从可迭代对象创建惰性序列
   * @template T - 元素类型
   * @param {Iterable<T>} iterable - 可迭代对象
   * @returns {LazySequence<T>} 惰性序列
   */
  static from<T>(iterable: Iterable<T>): LazySequence<T> {
    return new LazySequence(iterable[Symbol.iterator]());
  }

  /**
   * 创建数值范围惰性序列
   * @param {number} start - 起始值（包含）
   * @param {number} end - 结束值（不包含）
   * @param {number} [step=1] - 步长
   * @returns {LazySequence<number>} 数值惰性序列
   */
  static range(start: number, end: number, step: number = 1): LazySequence<number> {
    return new LazySequence(function* () {
      for (let i = start; i < end; i += step) {
        yield i;
      }
    }());
  }

  /**
   * 创建重复值惰性序列
   * @template T - 元素类型
   * @param {T} value - 要重复的值
   * @param {number} count - 重复次数
   * @returns {LazySequence<T>} 重复值惰性序列
   */
  static repeat<T>(value: T, count: number): LazySequence<T> {
    return new LazySequence(function* () {
      for (let i = 0; i < count; i++) {
        yield value;
      }
    }());
  }

  /**
   * 映射变换
   * @template U - 目标元素类型
   * @param {(x: T) => U} fn - 映射函数
   * @returns {LazySequence<U>} 映射后的惰性序列
   */
  map<U>(fn: (x: T) => U): LazySequence<U> {
    const self = this;
    return new LazySequence(function* () {
      for (const item of self.toIterable()) {
        yield fn(item);
      }
    }());
  }

  /**
   * 过滤
   * @param {(x: T) => boolean} predicate - 谓词函数
   * @returns {LazySequence<T>} 过滤后的惰性序列
   */
  filter(predicate: (x: T) => boolean): LazySequence<T> {
    const self = this;
    return new LazySequence(function* () {
      for (const item of self.toIterable()) {
        if (predicate(item)) yield item;
      }
    }());
  }

  /**
   * 取前 n 个元素
   * @param {number} n - 要取的元素数量
   * @returns {LazySequence<T>} 截断后的惰性序列
   */
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

  /**
   * 跳过前 n 个元素
   * @param {number} n - 要跳过的元素数量
   * @returns {LazySequence<T>} 跳过后的惰性序列
   */
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

  /**
   * 归约（终端操作）
   * @template U - 累加器类型
   * @param {(acc: U, x: T) => U} fn - 归约函数
   * @param {U} initial - 初始值
   * @returns {U} 归约结果
   */
  reduce<U>(fn: (acc: U, x: T) => U, initial: U): U {
    let acc = initial;
    for (const item of this.toIterable()) {
      acc = fn(acc, item);
    }
    return acc;
  }

  /**
   * 遍历执行（终端操作）
   * @param {(x: T) => void} fn - 对每个元素执行的函数
   */
  forEach(fn: (x: T) => void): void {
    for (const item of this.toIterable()) {
      fn(item);
    }
  }

  /**
   * 转为数组（终端操作）
   * @returns {T[]} 数组
   */
  toArray(): T[] {
    return [...this.toIterable()];
  }

  /**
   * 将迭代器包装为可迭代对象
   * @returns {Iterable<T>} 可迭代对象
   */
  private toIterable(): Iterable<T> {
    return { [Symbol.iterator]: () => this.iterator };
  }
}
