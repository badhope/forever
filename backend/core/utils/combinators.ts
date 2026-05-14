/**
 * @module utils/combinators
 * @description 基础函数组合子
 *
 * 提供函数式编程的基础组合工具：
 * - identity: 恒等函数
 * - constant: 常量函数
 * - compose: 从右到左组合函数
 * - pipe: 从左到右管道函数
 * - curry: 柯里化
 * - partial: 部分应用
 */

/**
 * 恒等函数
 * @function identity
 * @description 返回输入值本身，常作为默认转换函数
 * @template T - 值类型
 * @param {T} x - 输入值
 * @returns {T} 输入值本身
 */
export const identity = <T>(x: T): T => x;

/**
 * 常量函数
 * @function constant
 * @description 返回一个总是返回相同值的函数
 * @template T - 值类型
 * @param {T} x - 要返回的常量值
 * @returns {() => T} 总是返回 x 的函数
 */
export const constant = <T>(x: T) => (): T => x;

/**
 * 组合函数 (从右到左)
 * @function compose
 * @description 将多个函数组合为一个函数，执行顺序从右到左
 * compose(f, g, h)(x) = f(g(h(x)))
 * @template T - 值类型
 * @param {Array<(x: T) => T>} fns - 要组合的函数数组
 * @returns {(x: T) => T} 组合后的函数
 */
export function compose<T>(...fns: Array<(x: T) => T>): (x: T) => T {
  return (x: T) => fns.reduceRight((acc, fn) => fn(acc), x);
}

/**
 * 管道函数 (从左到右)
 * @function pipe
 * @description 将值依次通过多个函数处理，执行顺序从左到右
 * pipe(x, f, g, h) = h(g(f(x)))
 * @template T - 值类型
 * @param {T} x - 初始值
 * @param {Array<(x: T) => T>} fns - 处理函数数组
 * @returns {T} 最终结果
 */
export function pipe<T>(x: T, ...fns: Array<(x: T) => T>): T {
  return fns.reduce((acc, fn) => fn(acc), x);
}

/**
 * 柯里化
 * @function curry
 * @description 将二元函数转换为两个一元函数的嵌套
 * @template T - 第一个参数类型
 * @template U - 第二个参数类型
 * @template V - 返回值类型
 * @param {(a: T, b: U) => V} fn - 要柯里化的二元函数
 * @returns {(a: T) => (b: U) => V} 柯里化后的函数
 */
export function curry<T, U, V>(fn: (a: T, b: U) => V): (a: T) => (b: U) => V {
  return (a: T) => (b: U) => fn(a, b);
}

/**
 * 部分应用
 * @function partial
 * @description 预设函数的部分参数，返回接受剩余参数的新函数
 * @template T - 原函数参数类型元组
 * @template U - 返回值类型
 * @param {(...args: T) => U} fn - 原函数
 * @param {...Partial<T>} presetArgs - 预设的参数
 * @returns {(...args: any[]) => U} 部分应用后的函数
 */
export function partial<T extends any[], U>(
  fn: (...args: T) => U,
  ...presetArgs: Partial<T>
): (...args: any[]) => U {
  return (...laterArgs: any[]) => fn(...(presetArgs as T), ...laterArgs);
}
