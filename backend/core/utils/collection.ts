/**
 * @module utils/collection
 * @description 集合操作高阶函数
 *
 * 提供柯里化的数组操作函数，支持链式组合：
 * - map, filter, reduce, flatMap: 基础数组变换
 * - groupBy, sortBy: 分组与排序
 * - unique, uniqueBy: 去重
 * - chunk, take, skip: 分块与切片
 * - parallel: 并行处理
 */

/**
 * 映射
 * @function map
 * @description 柯里化的数组映射函数
 * @template T - 源元素类型
 * @template U - 目标元素类型
 * @param {(x: T, i: number) => U} fn - 映射函数
 * @returns {(arr: T[]) => U[]} 接受数组并返回映射后的数组
 */
export const map = <T, U>(fn: (x: T, i: number) => U) => (arr: T[]): U[] =>
  arr.map(fn);

/**
 * 过滤
 * @function filter
 * @description 柯里化的数组过滤函数
 * @template T - 元素类型
 * @param {(x: T, i: number) => boolean} predicate - 谓词函数
 * @returns {(arr: T[]) => T[]} 接受数组并返回过滤后的数组
 */
export const filter = <T>(predicate: (x: T, i: number) => boolean) => (arr: T[]): T[] =>
  arr.filter(predicate);

/**
 * 归约
 * @function reduce
 * @description 柯里化的数组归约函数
 * @template T - 元素类型
 * @template U - 累加器类型
 * @param {(acc: U, x: T, i: number) => U} fn - 归约函数
 * @param {U} initial - 初始值
 * @returns {(arr: T[]) => U} 接受数组并返回归约结果
 */
export const reduce = <T, U>(fn: (acc: U, x: T, i: number) => U, initial: U) => (arr: T[]): U =>
  arr.reduce(fn, initial);

/**
 * 扁平化映射
 * @function flatMap
 * @description 柯里化的数组扁平化映射函数
 * @template T - 源元素类型
 * @template U - 目标元素类型
 * @param {(x: T) => U[]} fn - 映射函数，返回数组
 * @returns {(arr: T[]) => U[]} 接受数组并返回扁平化映射后的数组
 */
export const flatMap = <T, U>(fn: (x: T) => U[]) => (arr: T[]): U[] =>
  arr.flatMap(fn);

/**
 * 分组
 * @function groupBy
 * @description 按键函数对数组元素分组
 * @template T - 元素类型
 * @template K - 键类型
 * @param {(x: T) => K} fn - 键提取函数
 * @returns {(arr: T[]) => Map<K, T[]>} 接受数组并返回分组 Map
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
 * @function sortBy
 * @description 按键函数对数组排序
 * @template T - 元素类型
 * @param {(x: T) => number} fn - 数值键提取函数
 * @param {boolean} [ascending=true] - 是否升序排列
 * @returns {(arr: T[]) => T[]} 排序后的新数组（不修改原数组）
 */
export function sortBy<T>(fn: (x: T) => number, ascending: boolean = true): (arr: T[]) => T[] {
  return (arr: T[]) => {
    const sorted = [...arr].sort((a, b) => fn(a) - fn(b));
    return ascending ? sorted : sorted.reverse();
  };
}

/**
 * 去重
 * @function unique
 * @description 去除数组中的重复元素（基于严格相等）
 * @template T - 元素类型
 * @param {T[]} arr - 输入数组
 * @returns {T[]} 去重后的新数组
 */
export function unique<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}

/**
 * 按键去重
 * @function uniqueBy
 * @description 按键函数去重，保留首次出现的元素
 * @template T - 元素类型
 * @template K - 键类型
 * @param {(x: T) => K} fn - 键提取函数
 * @returns {(arr: T[]) => T[]} 接受数组并返回去重后的数组
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
 * @function chunk
 * @description 将数组按指定大小分块
 * @template T - 元素类型
 * @param {number} size - 每块大小
 * @returns {(arr: T[]) => T[][]} 接受数组并返回分块后的二维数组
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
 * @function take
 * @description 取数组前 n 个元素
 * @template T - 元素类型
 * @param {number} n - 要取的元素数量
 * @returns {(arr: T[]) => T[]} 接受数组并返回前 n 个元素
 */
export const take = <T>(n: number) => (arr: T[]): T[] => arr.slice(0, n);

/**
 * 跳过前 N 个
 * @function skip
 * @description 跳过数组前 n 个元素
 * @template T - 元素类型
 * @param {number} n - 要跳过的元素数量
 * @returns {(arr: T[]) => T[]} 接受数组并返回跳过前 n 个后的数组
 */
export const skip = <T>(n: number) => (arr: T[]): T[] => arr.slice(n);

/**
 * 并行处理
 * @function parallel
 * @description 使用 Promise.all 分批并行处理数组元素
 * @template T - 输入元素类型
 * @template U - 输出元素类型
 * @param {(x: T) => Promise<U>} fn - 异步处理函数
 * @param {number} [concurrency=5] - 每批并发数
 * @returns {Promise<(arr: T[]) => Promise<U[]>>} 返回一个接受数组的高阶函数
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
