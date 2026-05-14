/**
 * @module utils/fp
 * @description Forever 函数式编程工具库（Barrel Export）
 *
 * 提供高阶函数、组合子、惰性求值等函数式编程特性。
 * 所有子模块通过此文件统一导出，保持向后兼容。
 */

// 基础组合子
export { identity, constant, compose, pipe, curry, partial } from './combinators';

// 集合操作
export {
  map, filter, reduce, flatMap,
  groupBy, sortBy,
  unique, uniqueBy,
  chunk, take, skip,
  parallel,
} from './collection';

// 函数包装器
export {
  memoize, memoizeWithTTL,
  debounce, throttle,
  withRetry, withTimeout,
} from './wrappers';

// 惰性求值
export { LazySequence } from './lazy-sequence';

// 单子类型
export { Maybe, Either } from './monads';

// 聚合导出对象
import { identity, constant, compose, pipe, curry, partial } from './combinators';
import {
  map, filter, reduce, flatMap,
  groupBy, sortBy,
  unique, uniqueBy,
  chunk, take, skip,
  parallel,
} from './collection';
import {
  memoize, memoizeWithTTL,
  debounce, throttle,
  withRetry, withTimeout,
} from './wrappers';
import { LazySequence } from './lazy-sequence';
import { Maybe, Either } from './monads';

/**
 * 函数式编程工具聚合对象
 * @description 提供所有 FP 工具的统一命名空间访问
 */
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
