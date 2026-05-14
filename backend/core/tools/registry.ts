/**
 * @module tools/registry
 * @description 工具注册中心
 *
 * 管理所有可用工具的注册、查询和执行。
 * 支持 JSON Schema 参数验证和 OpenAI function calling schema 生成。
 */

import { logger } from '../logger';
import type { ToolDefinition, ToolResult, OpenAIFunctionSchema, ToolRegistryOptions, JsonSchema } from './types';
import { SchemaValidator } from './types';

/**
 * 工具注册中心
 *
 * 管理所有可用工具的注册、查询和执行。
 * 支持 JSON Schema 参数验证和 OpenAI function calling schema 生成。
 */
export class ToolRegistry {
  private tools: Map<string, ToolDefinition> = new Map();
  private options: Required<ToolRegistryOptions>;

  /**
   * @param options 注册中心配置
   */
  constructor(options: ToolRegistryOptions = {}) {
    this.options = {
      allowOverride: options.allowOverride ?? false,
    };
  }

  /**
   * 注册工具
   *
   * @param tool 工具定义
   * @throws 如果工具已注册且不允许覆盖
   */
  register(tool: ToolDefinition): void {
    if (this.tools.has(tool.name) && !this.options.allowOverride) {
      throw new Error(`工具 "${tool.name}" 已注册，如需覆盖请设置 allowOverride=true`);
    }

    this.tools.set(tool.name, tool);
    logger.debug('tools:registry', `注册工具: ${tool.name}`);
  }

  /**
   * 批量注册工具
   */
  registerAll(tools: ToolDefinition[]): void {
    for (const tool of tools) {
      this.register(tool);
    }
  }

  /**
   * 注销工具
   *
   * @param name 工具名称
   * @returns 是否成功注销
   */
  unregister(name: string): boolean {
    const removed = this.tools.delete(name);
    if (removed) {
      logger.debug('tools:registry', `注销工具: ${name}`);
    }
    return removed;
  }

  /**
   * 执行工具
   *
   * 自动进行参数验证，验证通过后调用工具处理函数。
   *
   * @param name 工具名称
   * @param params 工具参数
   * @returns 工具执行结果
   */
  async execute(name: string, params: Record<string, any> = {}): Promise<ToolResult> {
    const tool = this.tools.get(name);
    if (!tool) {
      return {
        success: false,
        data: null,
        error: `工具 "${name}" 未注册`,
      };
    }

    // 参数验证
    const validationErrors = SchemaValidator.validate(params, tool.parameters);
    if (validationErrors.length > 0) {
      return {
        success: false,
        data: null,
        error: `参数验证失败: ${validationErrors.join('; ')}`,
      };
    }

    // 执行工具
    try {
      const startTime = Date.now();
      const data = await tool.handler(params);
      const duration = Date.now() - startTime;

      return {
        success: true,
        data,
        metadata: {
          toolName: name,
          duration,
        },
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      logger.error('tools:registry', `工具 ${name} 执行失败: ${errorMessage}`);

      return {
        success: false,
        data: null,
        error: errorMessage,
      };
    }
  }

  /**
   * 获取工具定义
   */
  getTool(name: string): ToolDefinition | undefined {
    return this.tools.get(name);
  }

  /**
   * 检查工具是否已注册
   */
  hasTool(name: string): boolean {
    return this.tools.has(name);
  }

  /**
   * 列出所有已注册工具
   */
  listTools(): ToolDefinition[] {
    return Array.from(this.tools.values());
  }

  /**
   * 获取所有工具名称
   */
  getToolNames(): string[] {
    return Array.from(this.tools.keys());
  }

  /**
   * 获取工具的 OpenAI function calling schema
   *
   * @param name 工具名称
   * @returns OpenAI function calling 格式的 Schema
   */
  getToolSchema(name: string): OpenAIFunctionSchema | null {
    const tool = this.tools.get(name);
    if (!tool) return null;

    return {
      type: 'function',
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters,
      },
    };
  }

  /**
   * 获取所有工具的 OpenAI function calling schema
   *
   * 用于传递给 LLM 的 tools 参数。
   */
  getAllToolSchemas(): OpenAIFunctionSchema[] {
    return Array.from(this.tools.values()).map(tool => ({
      type: 'function' as const,
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters,
      },
    }));
  }

  /**
   * 验证工具参数
   *
   * @param name 工具名称
   * @param params 待验证的参数
   * @returns 验证错误列表
   */
  validateParams(name: string, params: Record<string, any>): string[] {
    const tool = this.tools.get(name);
    if (!tool) {
      return [`工具 "${name}" 未注册`];
    }
    return SchemaValidator.validate(params, tool.parameters);
  }

  /**
   * 获取已注册工具数量
   */
  get size(): number {
    return this.tools.size;
  }

  /**
   * 清空所有注册的工具
   */
  clear(): void {
    this.tools.clear();
  }
}
