/**
 * Forever Core - Circuit Breaker Pattern
 * 熔断器模式 - 参考 Netflix Hystrix 设计
 */

export type CircuitState = 'closed' | 'open' | 'half-open';

export interface CircuitBreakerConfig {
  name: string;
  failureThreshold: number;
  successThreshold: number;
  timeout: number;
  resetTimeout: number;
  halfOpenMaxCalls: number;
}

export interface CircuitBreakerStats {
  name: string;
  state: CircuitState;
  failureCount: number;
  successCount: number;
  lastFailureTime?: Date;
  lastSuccessTime?: Date;
  totalCalls: number;
  totalFailures: number;
  totalSuccesses: number;
  halfOpenCalls: number;
}

export class CircuitBreaker {
  private state: CircuitState = 'closed';
  private failureCount: number = 0;
  private successCount: number = 0;
  private lastFailureTime?: Date;
  private lastSuccessTime?: Date;
  private halfOpenCalls: number = 0;
  
  private readonly config: Required<CircuitBreakerConfig>;

  constructor(config: CircuitBreakerConfig) {
    this.config = {
      failureThreshold: config.failureThreshold ?? 5,
      successThreshold: config.successThreshold ?? 2,
      timeout: config.timeout ?? 60000,
      resetTimeout: config.resetTimeout ?? 30000,
      halfOpenMaxCalls: config.halfOpenMaxCalls ?? 3,
      name: config.name,
    };
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (this.shouldAttemptReset()) {
        this.transitionTo('half-open');
        this.halfOpenCalls = 0;
      } else {
        throw new CircuitBreakerOpenError(this.config.name, this.lastFailureTime);
      }
    }

    if (this.state === 'half-open') {
      if (this.halfOpenCalls >= this.config.halfOpenMaxCalls) {
        throw new CircuitBreakerOpenError(this.config.name, this.lastFailureTime);
      }
      this.halfOpenCalls++;
    }

    try {
      const result = await this.executeWithTimeout(fn);
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private async executeWithTimeout<T>(fn: () => Promise<T>): Promise<T> {
    const timeoutPromise = new Promise<T>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Circuit breaker ${this.config.name} execution timed out`));
      }, this.config.timeout);
    });

    return Promise.race([fn(), timeoutPromise]);
  }

  private shouldAttemptReset(): boolean {
    if (!this.lastFailureTime) return true;
    const elapsed = Date.now() - this.lastFailureTime.getTime();
    return elapsed >= this.config.resetTimeout;
  }

  private onSuccess(): void {
    this.lastSuccessTime = new Date();

    if (this.state === 'half-open') {
      this.successCount++;
      if (this.successCount >= this.config.successThreshold) {
        this.transitionTo('closed');
      }
    } else if (this.state === 'closed') {
      this.failureCount = Math.max(0, this.failureCount - 1);
    }
  }

  private onFailure(): void {
    this.lastFailureTime = new Date();
    this.failureCount++;

    if (this.state === 'half-open') {
      this.transitionTo('open');
    } else if (this.state === 'closed') {
      if (this.failureCount >= this.config.failureThreshold) {
        this.transitionTo('open');
      }
    }
  }

  private transitionTo(newState: CircuitState): void {
    const oldState = this.state;
    this.state = newState;
    
    if (newState === 'closed') {
      this.failureCount = 0;
      this.successCount = 0;
    } else if (newState === 'open') {
      this.successCount = 0;
    } else if (newState === 'half-open') {
      this.halfOpenCalls = 0;
    }

    console.log(`[CircuitBreaker:${this.config.name}] State transition: ${oldState} -> ${newState}`);
  }

  getState(): CircuitState {
    return this.state;
  }

  getStats(): CircuitBreakerStats {
    return {
      name: this.config.name,
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastFailureTime: this.lastFailureTime,
      lastSuccessTime: this.lastSuccessTime,
      totalCalls: this.failureCount + this.successCount,
      totalFailures: this.failureCount,
      totalSuccesses: this.successCount,
      halfOpenCalls: this.halfOpenCalls,
    };
  }

  reset(): void {
    this.transitionTo('closed');
    this.halfOpenCalls = 0;
  }

  forceOpen(): void {
    this.transitionTo('open');
  }

  forceClosed(): void {
    this.transitionTo('closed');
  }
}

export class CircuitBreakerOpenError extends Error {
  constructor(
    public readonly circuitName: string,
    public readonly lastFailureTime?: Date
  ) {
    super(`Circuit breaker '${circuitName}' is open. Last failure: ${lastFailureTime?.toISOString() || 'unknown'}`);
    this.name = 'CircuitBreakerOpenError';
  }
}

export class CircuitBreakerRegistry {
  private breakers: Map<string, CircuitBreaker> = new Map();

  register(name: string, config: CircuitBreakerConfig): CircuitBreaker {
    const breaker = new CircuitBreaker(config);
    this.breakers.set(name, breaker);
    return breaker;
  }

  get(name: string): CircuitBreaker | undefined {
    return this.breakers.get(name);
  }

  unregister(name: string): void {
    this.breakers.delete(name);
  }

  getAllStats(): Record<string, CircuitBreakerStats> {
    const stats: Record<string, CircuitBreakerStats> = {};
    for (const [name, breaker] of this.breakers) {
      stats[name] = breaker.getStats();
    }
    return stats;
  }

  resetAll(): void {
    for (const breaker of this.breakers.values()) {
      breaker.reset();
    }
  }
}

export const circuitBreakerRegistry = new CircuitBreakerRegistry();

export function withCircuitBreaker<T>(
  name: string,
  fn: () => Promise<T>,
  config?: Partial<CircuitBreakerConfig>
): Promise<T> {
  let breaker = circuitBreakerRegistry.get(name);
  
  if (!breaker && config) {
    breaker = circuitBreakerRegistry.register(name, { 
      name, 
      failureThreshold: 5,
      successThreshold: 2,
      timeout: 60000,
      resetTimeout: 30000,
      halfOpenMaxCalls: 3,
      ...config 
    });
  }
  
  if (!breaker) {
    return fn();
  }
  
  return breaker.execute(fn);
}