/**
 * Forever Core - Health Check System
 * 健康检查系统 - 参考 Kubernetes liveness/readiness probe 设计
 */

export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy' | 'unknown';

export interface HealthCheckResult {
  name: string;
  status: HealthStatus;
  message?: string;
  timestamp: Date;
  durationMs?: number;
  details?: Record<string, any>;
}

export interface HealthCheck {
  name: string;
  check: () => Promise<HealthCheckResult> | HealthCheckResult;
  critical: boolean;
  intervalMs?: number;
}

export class HealthChecker {
  private checks: Map<string, HealthCheck> = new Map();
  private results: Map<string, HealthCheckResult> = new Map();
  private subscribers: Array<(results: Map<string, HealthCheckResult>) => void> = [];

  register(check: HealthCheck): void {
    this.checks.set(check.name, check);
    console.log(`[HealthChecker] Registered: ${check.name}`);
  }

  unregister(name: string): void {
    this.checks.delete(name);
    this.results.delete(name);
  }

  async check(name: string): Promise<HealthCheckResult | null> {
    const check = this.checks.get(name);
    if (!check) {
      return null;
    }

    const startTime = Date.now();
    try {
      const result = await Promise.resolve(check.check());
      result.durationMs = Date.now() - startTime;
      this.results.set(name, result);
      this.notifySubscribers();
      return result;
    } catch (error) {
      const result: HealthCheckResult = {
        name,
        status: 'unhealthy',
        message: error instanceof Error ? error.message : String(error),
        timestamp: new Date(),
        durationMs: Date.now() - startTime,
      };
      this.results.set(name, result);
      this.notifySubscribers();
      return result;
    }
  }

  async checkAll(): Promise<Map<string, HealthCheckResult>> {
    const promises = Array.from(this.checks.keys()).map(name => this.check(name));
    await Promise.all(promises);
    return this.results;
  }

  getOverallStatus(): HealthStatus {
    if (this.results.size === 0) {
      return 'unknown';
    }

    const statuses = Array.from(this.results.values()).map(r => r.status);
    
    if (statuses.every(s => s === 'healthy')) {
      return 'healthy';
    }
    
    if (statuses.some(s => s === 'unhealthy')) {
      const criticalUnhealthy = Array.from(this.results.values())
        .filter(r => r.status === 'unhealthy' && this.checks.get(r.name)?.critical);
      if (criticalUnhealthy.length > 0) {
        return 'unhealthy';
      }
    }
    
    if (statuses.some(s => s === 'degraded' || s === 'unhealthy')) {
      return 'degraded';
    }
    
    return 'unknown';
  }

  subscribe(callback: (results: Map<string, HealthCheckResult>) => void): () => void {
    this.subscribers.push(callback);
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  private notifySubscribers(): void {
    for (const callback of this.subscribers) {
      try {
        callback(this.results);
      } catch (error) {
        console.error('[HealthChecker] Subscriber error:', error);
      }
    }
  }

  getResults(): Map<string, HealthCheckResult> {
    return new Map(this.results);
  }
}

export function createPluginHealthCheck(
  name: string,
  pluginGetter: () => any,
  critical: boolean = true
): HealthCheck {
  return {
    name: `plugin:${name}`,
    critical,
    check: async (): Promise<HealthCheckResult> => {
      try {
        const plugin = pluginGetter();
        if (!plugin) {
          return {
            name: `plugin:${name}`,
            status: 'unhealthy',
            message: `Plugin ${name} not found`,
            timestamp: new Date(),
          };
        }

        const status = plugin.getStatus?.();
        if (status?.ready) {
          return {
            name: `plugin:${name}`,
            status: 'healthy',
            message: 'Plugin is ready',
            timestamp: new Date(),
            details: status,
          };
        } else {
          return {
            name: `plugin:${name}`,
            status: status?.initialized ? 'degraded' : 'unhealthy',
            message: status?.error || 'Plugin not initialized',
            timestamp: new Date(),
            details: status,
          };
        }
      } catch (error) {
        return {
          name: `plugin:${name}`,
          status: 'unhealthy',
          message: error instanceof Error ? error.message : String(error),
          timestamp: new Date(),
        };
      }
    },
  };
}

export function createLLMHealthCheck(
  name: string,
  llmChecker: () => Promise<boolean>,
  critical: boolean = true
): HealthCheck {
  return {
    name: `llm:${name}`,
    critical,
    check: async (): Promise<HealthCheckResult> => {
      try {
        const startTime = Date.now();
        const available = await llmChecker();
        const durationMs = Date.now() - startTime;
        
        if (available) {
          return {
            name: `llm:${name}`,
            status: 'healthy',
            message: 'LLM is available',
            timestamp: new Date(),
            durationMs,
          };
        } else {
          return {
            name: `llm:${name}`,
            status: 'unhealthy',
            message: 'LLM is not available',
            timestamp: new Date(),
            durationMs,
          };
        }
      } catch (error) {
        return {
          name: `llm:${name}`,
          status: 'unhealthy',
          message: error instanceof Error ? error.message : String(error),
          timestamp: new Date(),
        };
      }
    },
  };
}

export function createMemoryHealthCheck(
  name: string,
  memoryGetter: () => any,
  critical: boolean = false
): HealthCheck {
  return {
    name: `memory:${name}`,
    critical,
    check: async (): Promise<HealthCheckResult> => {
      try {
        const memory = memoryGetter();
        if (!memory) {
          return {
            name: `memory:${name}`,
            status: 'unhealthy',
            message: `Memory ${name} not found`,
            timestamp: new Date(),
          };
        }

        const memories = await memory.getAll?.('health-check') || [];
        
        return {
          name: `memory:${name}`,
          status: 'healthy',
          message: `Memory system operational, ${memories.length} items stored`,
          timestamp: new Date(),
          details: { itemCount: memories.length },
        };
      } catch (error) {
        return {
          name: `memory:${name}`,
          status: 'unhealthy',
          message: error instanceof Error ? error.message : String(error),
          timestamp: new Date(),
        };
      }
    },
  };
}

export const healthChecker = new HealthChecker();