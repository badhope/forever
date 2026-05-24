import { logger } from '../logger';
import type { ToolResult, ToolExecutorOptions, RequiredToolExecutorOptions } from './types';
import { ToolRegistry } from './registry';
import { toolSandbox, ExecutionContext } from './sandbox';

export interface ToolExecutionOptions {
  timeout?: number;
  maxRetries?: number;
  context?: ExecutionContext;
  bypassSandbox?: boolean;
}

export class ToolExecutor {
  private registry: ToolRegistry;
  private options: RequiredToolExecutorOptions;

  constructor(registry: ToolRegistry, options: ToolExecutorOptions = {}) {
    this.registry = registry;
    this.options = {
      maxRetries: options.maxRetries ?? 2,
      retryBaseDelay: options.retryBaseDelay ?? 1000,
      defaultTimeout: options.defaultTimeout ?? 30000,
      logExecution: options.logExecution ?? true,
      onRetry: options.onRetry,
    };
  }

  async execute(
    name: string,
    params: Record<string, any> = {},
    overrides?: ToolExecutionOptions,
  ): Promise<ToolResult> {
    const tool = this.registry.getTool(name);
    if (!tool) {
      return {
        success: false,
        data: null,
        error: `工具 "${name}" 未注册`,
      };
    }

    const timeout = overrides?.timeout ?? tool.timeout ?? this.options.defaultTimeout;
    const maxRetries = overrides?.maxRetries ?? this.options.maxRetries;
    const context = overrides?.context;
    const bypassSandbox = overrides?.bypassSandbox ?? false;

    if (this.options.logExecution) {
      logger.info('tools:executor', `执行工具: ${name}`, { params, sandbox: !bypassSandbox });
    }

    if (!bypassSandbox) {
      const sandboxResult = await toolSandbox.execute(tool, params, context);
      if (!sandboxResult.success) {
        return sandboxResult;
      }
      return sandboxResult;
    }

    let lastError: string | undefined;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await this.executeWithTimeout(name, params, timeout);

        if (this.options.logExecution && result.success) {
          logger.info('tools:executor', `工具 ${name} 执行成功`, {
            duration: result.metadata?.duration,
            attempt: attempt + 1,
          });
        }

        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        lastError = error.message;

        if (this.options.logExecution) {
          logger.warn('tools:executor', `工具 ${name} 执行失败 (尝试 ${attempt + 1}/${maxRetries + 1}): ${lastError}`);
        }

        if (this.options.onRetry && attempt < maxRetries) {
          this.options.onRetry(name, attempt + 1, error);
        }

        if (attempt === maxRetries) break;

        const delay = this.options.retryBaseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    return {
      success: false,
      data: null,
      error: lastError || `工具 ${name} 执行失败`,
      metadata: { attempts: maxRetries + 1 },
    };
  }

  private async executeWithTimeout(
    name: string,
    params: Record<string, any>,
    timeout: number,
  ): Promise<ToolResult> {
    if (timeout <= 0) {
      return this.registry.execute(name, params);
    }

    return new Promise<ToolResult>((resolve) => {
      let settled = false;

      const timer = setTimeout(() => {
        if (!settled) {
          settled = true;
          resolve({
            success: false,
            data: null,
            error: `工具 ${name} 执行超时 (${timeout}ms)`,
            metadata: { timeout },
          });
        }
      }, timeout);

      if (timer.unref) {
        timer.unref();
      }

      this.registry.execute(name, params).then(result => {
        if (!settled) {
          settled = true;
          clearTimeout(timer);
          resolve(result);
        }
      }).catch(err => {
        if (!settled) {
          settled = true;
          clearTimeout(timer);
          resolve({
            success: false,
            data: null,
            error: err instanceof Error ? err.message : String(err),
          });
        }
      });
    });
  }

  async executeBatch(
    calls: Array<{ name: string; params?: Record<string, any> }>,
  ): Promise<ToolResult[]> {
    return Promise.all(
      calls.map(call => this.execute(call.name, call.params || {})),
    );
  }

  getRegistry(): ToolRegistry {
    return this.registry;
  }
}