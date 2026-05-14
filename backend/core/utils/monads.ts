/**
 * @module utils/monads
 * @description 函数式单子类型
 *
 * 提供：
 * - Maybe: 处理可能为 null/undefined 的值（Option 单子）
 * - Either: 处理可能失败的操作（Result 类型）
 */

// ==================== Maybe 单子 ====================

/**
 * Maybe 单子
 * @class Maybe
 * @description 处理可能为 null/undefined 的值，避免空值检查
 *
 * @template T - 包含值的类型
 *
 * @example
 * ```typescript
 * const name = Maybe.of(user?.profile?.name)
 *   .map(n => n.toUpperCase())
 *   .getOrElse('ANONYMOUS');
 *
 * const result = Maybe.nothing<string>()
 *   .orElse(Maybe.just('fallback'))
 *   .getOrElse('default');
 * ```
 */
export class Maybe<T> {
  private constructor(private value: T | null | undefined) {}

  /**
   * 从可能为 null/undefined 的值创建 Maybe
   * @template T - 值类型
   * @param {T | null | undefined} value - 输入值
   * @returns {Maybe<T>} Maybe 实例
   */
  static of<T>(value: T | null | undefined): Maybe<T> {
    return new Maybe(value);
  }

  /**
   * 创建包含值的 Maybe（Just）
   * @template T - 值类型
   * @param {T} value - 非空值
   * @returns {Maybe<T>} Just 实例
   */
  static just<T>(value: T): Maybe<T> {
    return new Maybe(value);
  }

  /**
   * 创建空值 Maybe（Nothing）
   * @template T - 值类型
   * @returns {Maybe<T>} Nothing 实例
   */
  static nothing<T>(): Maybe<T> {
    return new Maybe<T>(null);
  }

  /**
   * 检查是否为 Just（包含值）
   * @returns {boolean} 是否包含值
   */
  isJust(): boolean {
    return this.value !== null && this.value !== undefined;
  }

  /**
   * 检查是否为 Nothing（空值）
   * @returns {boolean} 是否为空值
   */
  isNothing(): boolean {
    return !this.isJust();
  }

  /**
   * 映射变换，仅在包含值时执行
   * @template U - 目标类型
   * @param {(x: T) => U} fn - 映射函数
   * @returns {Maybe<U>} 变换后的 Maybe
   */
  map<U>(fn: (x: T) => U): Maybe<U> {
    return this.isJust() ? Maybe.just(fn(this.value!)) : Maybe.nothing();
  }

  /**
   * 扁平化映射，仅在包含值时执行
   * @template U - 目标类型
   * @param {(x: T) => Maybe<U>} fn - 返回 Maybe 的映射函数
   * @returns {Maybe<U>} 扁平化后的 Maybe
   */
  flatMap<U>(fn: (x: T) => Maybe<U>): Maybe<U> {
    return this.isJust() ? fn(this.value!) : Maybe.nothing();
  }

  /**
   * 过滤，不满足条件时变为 Nothing
   * @param {(x: T) => boolean} predicate - 谓词函数
   * @returns {Maybe<T>} 过滤后的 Maybe
   */
  filter(predicate: (x: T) => boolean): Maybe<T> {
    return this.isJust() && predicate(this.value!) ? this : Maybe.nothing();
  }

  /**
   * 获取值或默认值
   * @param {T} defaultValue - 默认值
   * @returns {T} 包含的值或默认值
   */
  getOrElse(defaultValue: T): T {
    return this.isJust() ? this.value! : defaultValue;
  }

  /**
   * 获取值或抛出错误
   * @param {Error} error - 空值时抛出的错误
   * @returns {T} 包含的值
   * @throws {Error} 空值时抛出指定错误
   */
  getOrElseThrow(error: Error): T {
    if (this.isJust()) return this.value!;
    throw error;
  }

  /**
   * 返回自身或备选 Maybe
   * @param {Maybe<T>} alternative - 备选 Maybe
   * @returns {Maybe<T>} 自身（如果为 Just）或备选
   */
  orElse(alternative: Maybe<T>): Maybe<T> {
    return this.isJust() ? this : alternative;
  }

  /**
   * 对包含的值执行副作用操作
   * @param {(x: T) => void} fn - 副作用函数
   */
  forEach(fn: (x: T) => void): void {
    if (this.isJust()) fn(this.value!);
  }

  /**
   * 转为可空类型
   * @returns {T | null} 包含的值或 null
   */
  toNullable(): T | null {
    return this.isJust() ? this.value! : null;
  }
}

// ==================== Either 单子 ====================

/**
 * Either 类型
 * @class Either
 * @description 处理可能失败的操作，Left 表示错误，Right 表示成功
 *
 * @template L - 左值（错误）类型
 * @template R - 右值（成功）类型
 *
 * @example
 * ```typescript
 * function divide(a: number, b: number): Either<string, number> {
 *   if (b === 0) return Either.left('Division by zero');
 *   return Either.right(a / b);
 * }
 *
 * const result = divide(10, 3)
 *   .map(x => x * 2)
 *   .fold(
 *     err => `Error: ${err}`,
 *     val => `Result: ${val}`
 *   );
 * ```
 */
export class Either<L, R> {
  private constructor(
    private left: L | null,
    private right: R | null
  ) {}

  /**
   * 创建 Left（错误）值
   * @template L - 左值类型
   * @template R - 右值类型
   * @param {L} value - 错误值
   * @returns {Either<L, R>} Left 实例
   */
  static left<L, R>(value: L): Either<L, R> {
    return new Either<L, R>(value, null);
  }

  /**
   * 创建 Right（成功）值
   * @template L - 左值类型
   * @template R - 右值类型
   * @param {R} value - 成功值
   * @returns {Either<L, R>} Right 实例
   */
  static right<L, R>(value: R): Either<L, R> {
    return new Either<L, R>(null, value);
  }

  /**
   * 检查是否为 Left
   * @returns {boolean} 是否为 Left
   */
  isLeft(): boolean {
    return this.left !== null;
  }

  /**
   * 检查是否为 Right
   * @returns {boolean} 是否为 Right
   */
  isRight(): boolean {
    return this.right !== null;
  }

  /**
   * 映射右值（仅在 Right 时执行）
   * @template U - 目标类型
   * @param {(x: R) => U} fn - 映射函数
   * @returns {Either<L, U>} 变换后的 Either
   */
  map<U>(fn: (x: R) => U): Either<L, U> {
    return this.isRight() ? Either.right(fn(this.right!)) : Either.left(this.left!);
  }

  /**
   * 映射左值（仅在 Left 时执行）
   * @template U - 目标左值类型
   * @param {(x: L) => U} fn - 映射函数
   * @returns {Either<U, R>} 变换后的 Either
   */
  mapLeft<U>(fn: (x: L) => U): Either<U, R> {
    return this.isLeft() ? Either.left(fn(this.left!)) : Either.right(this.right!);
  }

  /**
   * 扁平化映射右值
   * @template U - 目标类型
   * @param {(x: R) => Either<L, U>} fn - 返回 Either 的映射函数
   * @returns {Either<L, U>} 扁平化后的 Either
   */
  flatMap<U>(fn: (x: R) => Either<L, U>): Either<L, U> {
    return this.isRight() ? fn(this.right!) : Either.left(this.left!);
  }

  /**
   * 折叠：根据 Left/Right 状态执行不同函数
   * @template U - 结果类型
   * @param {(x: L) => U} leftFn - Left 时的处理函数
   * @param {(x: R) => U} rightFn - Right 时的处理函数
   * @returns {U} 折叠结果
   */
  fold<U>(leftFn: (x: L) => U, rightFn: (x: R) => U): U {
    return this.isLeft() ? leftFn(this.left!) : rightFn(this.right!);
  }

  /**
   * 获取右值或默认值
   * @param {R} defaultValue - 默认值
   * @returns {R} 右值或默认值
   */
  getOrElse(defaultValue: R): R {
    return this.isRight() ? this.right! : defaultValue;
  }
}
