/**
 * Forever - 错误处理系统
 * 自定义错误类型 + 重试机制 + 断路器
 */

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

  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));

      // 如果不应重试或已达到最大重试次数，直接抛出
      if (!shouldRetry(lastError) || attempt === maxRetries) {
        throw lastError;
      }

      // 计算带抖动的指数退避延迟
      const exponentialDelay = baseDelay * Math.pow(2, attempt);
      const jitter = Math.random() * baseDelay;
      const delay = Math.min(exponentialDelay + jitter, maxDelay);

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  // 理论上不会到达此处，但 TypeScript 需要返回值
  throw lastError!;
}

/**
 * 简易断路器
 *
 * 状态说明:
 * - closed: 正常状态，允许请求通过
 * - open: 熔断状态，拒绝所有请求
 * - half-open: 半开状态，允许一个请求通过以测试是否恢复
 */
export class CircuitBreaker {
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  private failureCount = 0;
  private lastFailureTime = 0;

  constructor(
    private failureThreshold: number = 5,
    private resetTimeout: number = 30000,
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // 检查是否应该从 open 转为 half-open
    if (this.state === 'open') {
      const elapsed = Date.now() - this.lastFailureTime;
      if (elapsed >= this.resetTimeout) {
        this.state = 'half-open';
      } else {
        throw new ForeverError(
          `Circuit breaker is open, retry after ${Math.ceil((this.resetTimeout - elapsed) / 1000)}s`,
          'CIRCUIT_OPEN',
        );
      }
    }

    try {
      const result = await fn();

      // 请求成功，重置状态
      if (this.state === 'half-open') {
        this.state = 'closed';
      }
      this.failureCount = 0;

      return result;
    } catch (err) {
      this.failureCount++;
      this.lastFailureTime = Date.now();

      if (this.state === 'half-open' || this.failureCount >= this.failureThreshold) {
        this.state = 'open';
      }

      throw err;
    }
  }

  getState(): string {
    return this.state;
  }

  reset(): void {
    this.state = 'closed';
    this.failureCount = 0;
    this.lastFailureTime = 0;
  }
}
