/**
 * Health check system for monitoring system components
 */

/**
 * Status of an individual health check
 */
export interface CheckResult {
  name: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  message: string;
  responseTime: number;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

/**
 * Overall health status
 */
export interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  checks: CheckResult[];
  summary: {
    total: number;
    healthy: number;
    unhealthy: number;
    degraded: number;
  };
}

/**
 * Health check function type
 */
export type HealthCheckFunction = () => Promise<{
  status: 'healthy' | 'unhealthy' | 'degraded';
  message: string;
  metadata?: Record<string, unknown>;
}>;

/**
 * HealthChecker - Manages and executes health checks
 */
export class HealthChecker {
  private checks: Map<string, HealthCheckFunction> = new Map();

  /**
   * Registers a new health check
   * @param name - Unique name for the check
   * @param checkFn - Async function that performs the health check
   */
  registerCheck(name: string, checkFn: HealthCheckFunction): void {
    this.checks.set(name, checkFn);
  }

  /**
   * Unregisters a health check
   * @param name - Name of the check to remove
   */
  unregisterCheck(name: string): boolean {
    return this.checks.delete(name);
  }

  /**
   * Runs all registered health checks
   * @returns Promise resolving to overall health status
   */
  async runChecks(): Promise<HealthStatus> {
    const timestamp = new Date().toISOString();
    const checkPromises: Promise<CheckResult>[] = [];

    for (const [name, checkFn] of this.checks) {
      checkPromises.push(this.executeCheck(name, checkFn));
    }

    const results = await Promise.all(checkPromises);

    // Calculate overall status
    const unhealthyCount = results.filter(r => r.status === 'unhealthy').length;
    const degradedCount = results.filter(r => r.status === 'degraded').length;

    let overallStatus: 'healthy' | 'unhealthy' | 'degraded';
    if (unhealthyCount > 0) {
      overallStatus = 'unhealthy';
    } else if (degradedCount > 0) {
      overallStatus = 'degraded';
    } else {
      overallStatus = 'healthy';
    }

    return {
      status: overallStatus,
      timestamp,
      checks: results,
      summary: {
        total: results.length,
        healthy: results.filter(r => r.status === 'healthy').length,
        unhealthy: unhealthyCount,
        degraded: degradedCount
      }
    };
  }

  /**
   * Executes a single health check with timing
   * @param name - Check name
   * @param checkFn - Check function
   * @returns Check result
   */
  private async executeCheck(
    name: string,
    checkFn: HealthCheckFunction
  ): Promise<CheckResult> {
    const startTime = Date.now();
    
    try {
      const result = await checkFn();
      const responseTime = Date.now() - startTime;

      return {
        name,
        status: result.status,
        message: result.message,
        responseTime,
        timestamp: new Date().toISOString(),
        metadata: result.metadata
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      return {
        name,
        status: 'unhealthy',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        responseTime,
        timestamp: new Date().toISOString(),
        metadata: { error: true }
      };
    }
  }

  /**
   * Gets list of registered check names
   * @returns Array of check names
   */
  getRegisteredChecks(): string[] {
    return Array.from(this.checks.keys());
  }

  /**
   * Clears all registered checks
   */
  clearChecks(): void {
    this.checks.clear();
  }
}

/**
 * Built-in health check for LLM API connectivity
 * @param apiUrl - URL of the LLM API
 * @param timeoutMs - Request timeout in milliseconds
 * @returns Health check function
 */
export function createLLMHealthCheck(
  apiUrl: string = process.env.LLM_API_URL || 'http://localhost:11434',
  timeoutMs: number = 5000
): HealthCheckFunction {
  return async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const response = await fetch(`${apiUrl}/api/tags`, {
        method: 'GET',
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        return {
          status: 'healthy' as const,
          message: 'LLM API is accessible',
          metadata: { statusCode: response.status }
        };
      } else {
        return {
          status: 'unhealthy' as const,
          message: `LLM API returned status ${response.status}`,
          metadata: { statusCode: response.status }
        };
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return {
          status: 'unhealthy' as const,
          message: 'LLM API health check timed out',
          metadata: { timeout: timeoutMs }
        };
      }
      
      return {
        status: 'unhealthy' as const,
        message: `Failed to connect to LLM API: ${error instanceof Error ? error.message : 'Unknown error'}`,
        metadata: { error: error instanceof Error ? error.name : 'Unknown' }
      };
    }
  };
}

/**
 * Built-in health check for ChromaDB memory system
 * @param chromaUrl - URL of the ChromaDB server
 * @param timeoutMs - Request timeout in milliseconds
 * @returns Health check function
 */
export function createChromaDBHealthCheck(
  chromaUrl: string = process.env.CHROMADB_URL || 'http://localhost:8000',
  timeoutMs: number = 5000
): HealthCheckFunction {
  return async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const response = await fetch(`${chromaUrl}/api/v1/heartbeat`, {
        method: 'GET',
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json().catch(() => ({}));
        return {
          status: 'healthy' as const,
          message: 'ChromaDB is accessible',
          metadata: { 
            statusCode: response.status,
            heartbeat: data.nanosecond_heartbeat 
          }
        };
      } else {
        return {
          status: 'unhealthy' as const,
          message: `ChromaDB returned status ${response.status}`,
          metadata: { statusCode: response.status }
        };
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return {
          status: 'unhealthy' as const,
          message: 'ChromaDB health check timed out',
          metadata: { timeout: timeoutMs }
        };
      }
      
      return {
        status: 'unhealthy' as const,
        message: `Failed to connect to ChromaDB: ${error instanceof Error ? error.message : 'Unknown error'}`,
        metadata: { error: error instanceof Error ? error.name : 'Unknown' }
      };
    }
  };
}

/**
 * Built-in health check for disk space
 * @param warningThreshold - Warning threshold in percentage (default: 80)
 * @param criticalThreshold - Critical threshold in percentage (default: 90)
 * @returns Health check function
 */
export function createDiskSpaceHealthCheck(
  warningThreshold: number = 80,
  criticalThreshold: number = 90
): HealthCheckFunction {
  return async () => {
    try {
      // Note: In a real implementation, you'd use a library like 'check-disk-space'
      // or execute a system command to get actual disk usage
      // This is a placeholder implementation
      
      // Simulated disk usage check
      const usedPercentage = 0; // Would be actual value from system
      
      if (usedPercentage >= criticalThreshold) {
        return {
          status: 'unhealthy' as const,
          message: `Disk usage critical: ${usedPercentage.toFixed(1)}%`,
          metadata: { 
            usedPercentage,
            criticalThreshold,
            warningThreshold
          }
        };
      } else if (usedPercentage >= warningThreshold) {
        return {
          status: 'degraded' as const,
          message: `Disk usage high: ${usedPercentage.toFixed(1)}%`,
          metadata: { 
            usedPercentage,
            criticalThreshold,
            warningThreshold
          }
        };
      } else {
        return {
          status: 'healthy' as const,
          message: `Disk usage normal: ${usedPercentage.toFixed(1)}%`,
          metadata: { 
            usedPercentage,
            criticalThreshold,
            warningThreshold
          }
        };
      }
    } catch (error) {
      return {
        status: 'unhealthy' as const,
        message: `Failed to check disk space: ${error instanceof Error ? error.message : 'Unknown error'}`,
        metadata: { error: error instanceof Error ? error.name : 'Unknown' }
      };
    }
  };
}

/**
 * Creates a health checker with all built-in checks pre-registered
 * @returns Configured HealthChecker instance
 */
export function createDefaultHealthChecker(): HealthChecker {
  const checker = new HealthChecker();
  
  checker.registerCheck('llm-api', createLLMHealthCheck());
  checker.registerCheck('chromadb', createChromaDBHealthCheck());
  checker.registerCheck('disk-space', createDiskSpaceHealthCheck());
  
  return checker;
}

// Export a default instance
export const defaultHealthChecker = createDefaultHealthChecker();
