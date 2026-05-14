/**
 * @module tools/executor
 * @description 工具执行器
 *
 * 在 ToolRegistry 基础上增加：
 * - 自动重试（带指数退避）
 * - 执行超时控制
 * - 结构化错误处理
 * - 执行日志记录
 */

import { logger } from '../logger';
import type { ToolResult, ToolExecutorOptions } from './types';
import { ToolRegistry } from './registry';

/**
 * 工具执行器
 *
 * 在 ToolRegistry 基础上增加重试、超时和错误处理能力。
 */
export class ToolExecutor {
  private registry: ToolRegistry;
  private options: Required<ToolExecutorOptions>;

  /**
   * @param registry 工具注册中心
   * @param options 执行器配置
   */
  constructor(registry: ToolRegistry, options: ToolExecutorOptions = {}) {
    this.registry = registry;
    this.options = {
      maxRetries: options.maxRetries ?? 2,
      retryBaseDelay: options.retryBaseDelay ?? 1000,
      defaultTimeout: options.defaultTimeout ?? 30000,
      logExecution: options.logExecution ?? true,
    };
  }

  /**
   * 执行工具（带重试和超时）
   *
   * @param name 工具名称
   * @param params 工具参数
   * @param overrides 覆盖配置（超时、重试次数等）
   * @returns 工具执行结果
   */
  async execute(
    name: string,
    params: Record<string, any> = {},
    overrides?: {
      timeout?: number;
      maxRetries?: number;
    },
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

    if (this.options.logExecution) {
      logger.info('tools:executor', `执行工具: ${name}`, { params });
    }

    let lastError: string | undefined;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // 带超时的执行
        const result = await this.executeWithTimeout(name, params, timeout);

        if (this.options.logExecution && result.success) {
          logger.info('tools:executor', `工具 ${name} 执行成功`, {
            duration: result.metadata?.duration,
            attempt: attempt + 1,
          });
        }

        return result;
      } catch (err) {
        lastError = err instanceof Error ? err.message : String(err);

        if (this.options.logExecution) {
          logger.warn('tools:executor', `工具 ${name} 执行失败 (尝试 ${attempt + 1}/${maxRetries + 1}): ${lastError}`);
        }

        // 最后一次重试失败，不再等待
        if (attempt === maxRetries) break;

        // 指数退避
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

  /**
   * 带超时的工具执行
   */
  private async executeWithTimeout(
    name: string,
    params: Record<string, any>,
    timeout: number,
  ): Promise<ToolResult> {
    if (timeout <= 0) {
      // 不限制超时
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

      // 防止定时器阻止进程退出
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

  /**
   * 批量执行多个工具
   *
   * @param calls 工具调用列表 [{ name, params }]
   * @returns 执行结果列表
   */
  async executeBatch(
    calls: Array<{ name: string; params?: Record<string, any> }>,
  ): Promise<ToolResult[]> {
    return Promise.all(
      calls.map(call => this.execute(call.name, call.params || {})),
    );
  }

  /**
   * 获取底层注册中心
   */
  getRegistry(): ToolRegistry {
    return this.registry;
  }
}
