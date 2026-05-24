/**
 * Forever Core - Retry Strategy System
 * 重试策略系统 - 参考 Polly resilience 库设计
 */

export type RetryStrategyType = 'fixed' | 'exponential' | 'linear' | 'fibonacci' | 'custom';

export interface RetryConfig {
  maxAttempts: number;
  initialDelayMs: number;
  maxDelayMs: number;
  strategy: RetryStrategyType;
  retryableErrors?: Array<new (...args: any[]) => Error>;
  onRetry?: (attempt: number, delayMs: number, error: Error) => void;
  shouldRetry?: (error: Error, attempt: number) => boolean;
}

export interface RetryAttempt {
  attempt: number;
  delayMs: number;
  error?: Error;
  success: boolean;
  timestamp: Date;
}

export interface RetryStats {
  totalAttempts: number;
  successfulAttempts: number;
  failedAttempts: number;
  totalDelayMs: number;
  averageDelayMs: number;
  attempts: RetryAttempt[];
}

export class RetryStrategy {
  private config: Required<RetryConfig>;
  private attempts: RetryAttempt[] = [];

  constructor(config: RetryConfig) {
    this.config = {
      maxAttempts: config.maxAttempts ?? 3,
      initialDelayMs: config.initialDelayMs ?? 1000,
      maxDelayMs: config.maxDelayMs ?? 30000,
      strategy: config.strategy ?? 'exponential',
      retryableErrors: config.retryableErrors ?? [Error],
      onRetry: config.onRetry ?? (() => {}),
      shouldRetry: config.shouldRetry ?? (() => true),
    };
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    this.attempts = [];
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= this.config.maxAttempts; attempt++) {
      const attemptRecord: RetryAttempt = {
        attempt,
        delayMs: 0,
        success: false,
        timestamp: new Date(),
      };

      try {
        const result = await fn();
        attemptRecord.success = true;
        this.attempts.push(attemptRecord);
        this.clearOldAttempts();
        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        attemptRecord.error = lastError;

        const shouldRetry = this.shouldRetryAttempt(lastError, attempt);
        
        if (!shouldRetry || attempt >= this.config.maxAttempts) {
          attemptRecord.success = false;
          this.attempts.push(attemptRecord);
          this.clearOldAttempts();
          throw lastError;
        }

        const delay = this.calculateDelay(attempt);
        attemptRecord.delayMs = delay;
        this.attempts.push(attemptRecord);

        this.config.onRetry(attempt, delay, lastError);

        await this.sleep(delay);
      }
    }

    this.clearOldAttempts();
    throw lastError;
  }

  private shouldRetryAttempt(error: Error, attempt: number): boolean {
    if (this.config.shouldRetry && !this.config.shouldRetry(error, attempt)) {
      return false;
    }

    for (const ErrorClass of this.config.retryableErrors) {
      if (error instanceof ErrorClass) {
        return true;
      }
    }

    return false;
  }

  private calculateDelay(attempt: number): number {
    const baseDelay = this.config.initialDelayMs;
    let delay: number;

    switch (this.config.strategy) {
      case 'fixed':
        delay = baseDelay;
        break;
        
      case 'linear':
        delay = baseDelay * attempt;
        break;
        
      case 'exponential':
        delay = baseDelay * Math.pow(2, attempt - 1);
        break;
        
      case 'fibonacci':
        delay = baseDelay * this.fibonacci(attempt);
        break;
        
      case 'custom':
      default:
        delay = baseDelay;
    }

    return Math.min(delay, this.config.maxDelayMs);
  }

  private fibonacci(n: number): number {
    if (n <= 1) return 1;
    let a = 1, b = 1;
    for (let i = 2; i < n; i++) {
      const temp = a + b;
      a = b;
      b = temp;
    }
    return b;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private clearOldAttempts(): void {
    const maxStoredAttempts = 100;
    if (this.attempts.length > maxStoredAttempts) {
      this.attempts = this.attempts.slice(-maxStoredAttempts);
    }
  }

  getStats(): RetryStats {
    const successfulAttempts = this.attempts.filter(a => a.success);
    const failedAttempts = this.attempts.filter(a => !a.success);
    const totalDelayMs = this.attempts.reduce((sum, a) => sum + a.delayMs, 0);

    return {
      totalAttempts: this.attempts.length,
      successfulAttempts: successfulAttempts.length,
      failedAttempts: failedAttempts.length,
      totalDelayMs,
      averageDelayMs: this.attempts.length > 0 ? totalDelayMs / this.attempts.length : 0,
      attempts: [...this.attempts],
    };
  }

  reset(): void {
    this.attempts = [];
  }
}

export function withRetry<T>(
  fn: () => Promise<T>,
  config?: Partial<RetryConfig>
): Promise<T> {
  const strategy = new RetryStrategy({
    maxAttempts: 3,
    initialDelayMs: 1000,
    maxDelayMs: 30000,
    strategy: 'exponential',
    ...config,
  });
  
  return strategy.execute(fn);
}

export const defaultRetryConfig: RetryConfig = {
  maxAttempts: 3,
  initialDelayMs: 1000,
  maxDelayMs: 30000,
  strategy: 'exponential',
  retryableErrors: [
    Error,
    TypeError,
    RangeError,
  ],
};