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
        const data = await response.json().catch(() => ({})) as { nanosecond_heartbeat?: number };
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
      const { exec } = await import('child_process');
      const { promisify } = await import('util');
      const execAsync = promisify(exec);

      let usedPercentage: number;
      let totalGB: number;
      let freeGB: number;

      // 根据平台选择命令
      const platform = process.platform;
      if (platform === 'win32') {
        // Windows: 使用 wmic 或 PowerShell
        try {
          const { stdout } = await execAsync('wmic logicaldisk get size,freespace /format:csv', { timeout: 10000 });
          const lines = stdout.trim().split('\n').filter((l: string) => l.includes(','));
          if (lines.length > 0) {
            const parts = lines[lines.length - 1].split(',');
            const freeSpace = parseFloat(parts[1]) || 0;
            const size = parseFloat(parts[2]) || 1;
            usedPercentage = ((size - freeSpace) / size) * 100;
            totalGB = size / (1024 * 1024 * 1024);
            freeGB = freeSpace / (1024 * 1024 * 1024);
          } else {
            throw new Error('无法解析磁盘信息');
          }
        } catch {
          // 回退方案
          usedPercentage = 0;
          totalGB = 0;
          freeGB = 0;
        }
      } else {
        // Linux / macOS: 使用 df
        try {
          const { stdout } = await execAsync('df -k /', { timeout: 10000 });
          const lines = stdout.trim().split('\n');
          if (lines.length >= 2) {
            const parts = lines[1].split(/\s+/);
            const totalKB = parseInt(parts[1], 10) || 1;
            const usedKB = parseInt(parts[2], 10) || 0;
            const freeKB = parseInt(parts[3], 10) || 0;
            usedPercentage = (usedKB / totalKB) * 100;
            totalGB = totalKB / (1024 * 1024);
            freeGB = freeKB / (1024 * 1024);
          } else {
            throw new Error('无法解析 df 输出');
          }
        } catch {
          // 回退方案：尝试 macOS 的 diskutil
          try {
            const { stdout } = await execAsync("diskutil info / | grep 'Capacity' | head -1", { timeout: 10000 });
            usedPercentage = 0;
            totalGB = 0;
            freeGB = 0;
          } catch {
            usedPercentage = 0;
            totalGB = 0;
            freeGB = 0;
          }
        }
      }
      
      if (usedPercentage >= criticalThreshold) {
        return {
          status: 'unhealthy' as const,
          message: `磁盘空间严重不足: ${usedPercentage.toFixed(1)}% 已用 (剩余 ${freeGB.toFixed(1)}GB / 共 ${totalGB.toFixed(1)}GB)`,
          metadata: { 
            usedPercentage,
            totalGB,
            freeGB,
            criticalThreshold,
            warningThreshold
          }
        };
      } else if (usedPercentage >= warningThreshold) {
        return {
          status: 'degraded' as const,
          message: `磁盘空间不足: ${usedPercentage.toFixed(1)}% 已用 (剩余 ${freeGB.toFixed(1)}GB / 共 ${totalGB.toFixed(1)}GB)`,
          metadata: { 
            usedPercentage,
            totalGB,
            freeGB,
            criticalThreshold,
            warningThreshold
          }
        };
      } else {
        return {
          status: 'healthy' as const,
          message: `磁盘空间正常: ${usedPercentage.toFixed(1)}% 已用 (剩余 ${freeGB.toFixed(1)}GB / 共 ${totalGB.toFixed(1)}GB)`,
          metadata: { 
            usedPercentage,
            totalGB,
            freeGB,
            criticalThreshold,
            warningThreshold
          }
        };
      }
    } catch (error) {
      return {
        status: 'unhealthy' as const,
        message: `磁盘空间检查失败: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
