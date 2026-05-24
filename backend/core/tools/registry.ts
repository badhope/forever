import { logger } from '../logger';
import type { ToolDefinition, ToolResult, OpenAIFunctionSchema, ToolRegistryOptions, JsonSchema, ToolCategory } from './types';
import { SchemaValidator, DEFAULT_TOOL_CATEGORIES } from './types';

export class ToolRegistry {
  private tools: Map<string, ToolDefinition> = new Map();
  private categories: Map<string, ToolCategory> = new Map();
  private options: Required<ToolRegistryOptions>;

  constructor(options: ToolRegistryOptions = {}) {
    this.options = {
      allowOverride: options.allowOverride ?? false,
      defaultCategory: options.defaultCategory ?? 'utility',
    };
    
    for (const category of DEFAULT_TOOL_CATEGORIES) {
      this.categories.set(category.id, category);
    }
  }

  register(tool: ToolDefinition): void {
    if (this.tools.has(tool.name) && !this.options.allowOverride) {
      throw new Error(`工具 "${tool.name}" 已注册，如需覆盖请设置 allowOverride=true`);
    }

    if (!tool.category) {
      tool.category = this.options.defaultCategory;
    }

    this.tools.set(tool.name, tool);
    logger.debug('tools:registry', `注册工具: ${tool.name} (分类: ${tool.category})`);
  }

  registerAll(tools: ToolDefinition[]): void {
    for (const tool of tools) {
      this.register(tool);
    }
  }

  registerCategory(category: ToolCategory): void {
    this.categories.set(category.id, category);
  }

  unregister(name: string): boolean {
    const removed = this.tools.delete(name);
    if (removed) {
      logger.debug('tools:registry', `注销工具: ${name}`);
    }
    return removed;
  }

  async execute(name: string, params: Record<string, any> = {}): Promise<ToolResult> {
    const tool = this.tools.get(name);
    if (!tool) {
      return {
        success: false,
        data: null,
        error: `工具 "${name}" 未注册`,
      };
    }

    const validationErrors = SchemaValidator.validate(params, tool.parameters);
    if (validationErrors.length > 0) {
      return {
        success: false,
        data: null,
        error: `参数验证失败: ${validationErrors.join('; ')}`,
      };
    }

    try {
      const startTime = Date.now();
      const data = await tool.handler(params);
      const duration = Date.now() - startTime;

      return {
        success: true,
        data,
        metadata: {
          toolName: name,
          executionTimeMs: duration,
          timestamp: new Date(),
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

  getTool(name: string): ToolDefinition | undefined {
    return this.tools.get(name);
  }

  hasTool(name: string): boolean {
    return this.tools.has(name);
  }

  listTools(category?: string): ToolDefinition[] {
    let tools = Array.from(this.tools.values());
    if (category) {
      tools = tools.filter(t => t.category === category);
    }
    return tools;
  }

  listToolsByTags(tags: string[]): ToolDefinition[] {
    return Array.from(this.tools.values()).filter(tool => 
      tool.tags && tool.tags.some(tag => tags.includes(tag))
    );
  }

  getToolNames(category?: string): string[] {
    return this.listTools(category).map(t => t.name);
  }

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

  getAllToolSchemas(category?: string): OpenAIFunctionSchema[] {
    return this.listTools(category).map(tool => ({
      type: 'function' as const,
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters,
      },
    }));
  }

  getCategory(categoryId: string): ToolCategory | undefined {
    return this.categories.get(categoryId);
  }

  listCategories(): ToolCategory[] {
    return Array.from(this.categories.values());
  }

  getToolsByCategory(): Map<string, ToolDefinition[]> {
    const result = new Map<string, ToolDefinition[]>();
    for (const [categoryId, category] of this.categories) {
      result.set(categoryId, this.listTools(categoryId));
    }
    return result;
  }

  validateParams(name: string, params: Record<string, any>): string[] {
    const tool = this.tools.get(name);
    if (!tool) {
      return [`工具 "${name}" 未注册`];
    }
    return SchemaValidator.validate(params, tool.parameters);
  }

  get size(): number {
    return this.tools.size;
  }

  get categoryCount(): number {
    return this.categories.size;
  }

  clear(): void {
    this.tools.clear();
  }

  clearCategories(): void {
    this.categories.clear();
  }
}