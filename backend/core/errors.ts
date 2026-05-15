/**
 * Forever - 错误处理系统
 * 自定义错误类型 + 重试机制（retry） + 断路器（opossum）
 */

import retry from 'retry';
// @ts-expect-error - opossum lacks type declarations
import CircuitBreakerLib from 'opossum';

// ============================================================================
// 自定义错误类
// ============================================================================

export class ForeverError extends Error {
  constructor(
    message: string,
    public code: string,
    public cause?: Error,
  ) {
    super(message);
    this.name = 'ForeverError';
  }
}

export class LLMError extends ForeverError {
  constructor(message: string, code: string = 'LLM_ERROR', cause?: Error) {
    super(message, code, cause);
    this.name = 'LLMError';
  }
}

export class MemoryError extends ForeverError {
  constructor(message: string, code: string = 'MEMORY_ERROR', cause?: Error) {
    super(message, code, cause);
    this.name = 'MemoryError';
  }
}

export class TTSError extends ForeverError {
  constructor(message: string, code: string = 'TTS_ERROR', cause?: Error) {
    super(message, code, cause);
    this.name = 'TTSError';
  }
}

export class ConfigError extends ForeverError {
  constructor(message: string, code: string = 'CONFIG_ERROR', cause?: Error) {
    super(message, code, cause);
    this.name = 'ConfigError';
  }
}

// ============================================================================
// 带指数退避的重试（内部委托给 retry 模块）
// ============================================================================

/**
 * 带指数退避的重试
 * @param fn 需要重试的异步函数
 * @param options 重试配置
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    baseDelay?: number;
    maxDelay?: number;
    shouldRetry?: (error: Error) => boolean;
  } = {},
): Promise<T> {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    shouldRetry = () => true,
  } = options;

  const operation = retry.operation({
    retries: maxRetries,
    factor: 2,
    minTimeout: baseDelay,
    maxTimeout: maxDelay,
    randomize: true,
  });

  return new Promise<T>((resolve, reject) => {
    operation.attempt(async (currentAttempt: number) => {
      try {
        const result = await fn();
        resolve(result);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));

        if (!shouldRetry(error)) {
          reject(error);
          return;
        }

        if (!operation.retry(error)) {
          reject(operation.mainError());
        }
      }
    });
  });
}

// ============================================================================
// 断路器（内部委托给 opossum）
// ============================================================================

/**
 * 断路器选项
 */
export interface CircuitBreakerOptions {
  /** 触发熔断的失败次数阈值（默认 5） */
  failureThreshold?: number;
  /** 熔断后重置超时时间（毫秒，默认 30000） */
  resetTimeout?: number;
  /** 半开状态下允许的最大尝试次数（默认 1） */
  halfOpenMaxAttempts?: number;
}

/**
 * 简易断路器
 *
 * 状态说明:
 * - closed: 正常状态，允许请求通过
 * - open: 熔断状态，拒绝所有请求
 * - half-open: 半开状态，允许一个请求通过以测试是否恢复
 *
 * 内部使用 opossum 实现。
 */
export class CircuitBreaker {
  private breaker: CircuitBreakerLib;

  constructor(options: CircuitBreakerOptions = {}) {
    const {
      failureThreshold = 5,
      resetTimeout = 30000,
      halfOpenMaxAttempts = 1,
    } = options;

    // 创建一个空操作函数作为 opossum 的包装目标
    // 实际执行通过 execute 方法传入
    this.breaker = new CircuitBreakerLib(
      async (_action: string, fn: () => Promise<any>) => fn(),
      {
        errorThresholdPercentage: 0,
        volumeThreshold: failureThreshold,
        resetTimeout,
        halfOpenMaxAttempts,
      },
    );
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    return this.breaker.fire('execute', fn);
  }

  get isOpen(): boolean {
    return this.breaker.opened;
  }

  get isClosed(): boolean {
    return this.breaker.closed;
  }

  get isHalfOpen(): boolean {
    return this.breaker.halfOpen;
  }

  getState(): string {
    if (this.breaker.opened) return 'open';
    if (this.breaker.halfOpen) return 'half-open';
    return 'closed';
  }

  reset(): void {
    this.breaker.open(); // opossum 的 open() 方法会重置断路器
    this.breaker.close();
  }

  on(event: string, callback: (...args: any[]) => void): void {
    this.breaker.on(event, callback);
  }
}
