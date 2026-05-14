/**
 * Forever - 系统化工具定义（Tool System）
 *
 * 参考 LangChain Tools 设计，提供统一的工具注册、参数验证和执行框架。
 *
 * 核心概念：
 * - ToolDefinition: 工具定义（名称、描述、参数 Schema、处理函数）
 * - ToolResult: 工具执行结果
 * - ToolRegistry: 工具注册中心（注册、查询、执行）
 * - ToolExecutor: 带重试、超时、错误处理的工具执行器
 *
 * 内置工具集：
 * - WebSearchTool: 网络搜索
 * - CalculatorTool: 数学计算
 * - DateTimeTool: 日期时间查询
 * - MemorySearchTool: 记忆搜索
 * - MemoryStoreTool: 记忆存储
 * - FileReadTool: 文件读取
 * - FileWriteTool: 文件写入
 *
 * 典型用法：
 * ```ts
 * const registry = new ToolRegistry();
 * registry.register(WebSearchTool);
 * registry.register(CalculatorTool);
 *
 * const executor = new ToolExecutor(registry);
 * const result = await executor.execute('calculator', { expression: '2 + 3 * 4' });
 * ```
 */

import * as fs from 'fs';
import * as path from 'path';
import { logger } from '../logger';

// ============ 类型定义 ============

/**
 * JSON Schema 参数定义
 */
export type JsonSchema = Record<string, any>;

/**
 * 工具处理函数类型
 */
export type ToolHandler = (params: Record<string, any>) => Promise<any> | any;

/**
 * 工具定义
 *
 * 描述一个可被 LLM 调用的工具，包含名称、描述、参数 Schema 和处理函数。
 */
export interface ToolDefinition {
  /** 工具名称（唯一标识，用于 function calling） */
  name: string;
  /** 工具描述（LLM 用于判断何时调用此工具） */
  description: string;
  /** 参数 JSON Schema（遵循 OpenAI function calling 格式） */
  parameters: JsonSchema;
  /** 工具处理函数 */
  handler: ToolHandler;
  /** 返回值类型描述 */
  returnType?: string;
  /** 是否为危险操作（需要人工确认） */
  dangerous?: boolean;
  /** 超时时间（毫秒），0 表示不限制 */
  timeout?: number;
}

/**
 * 工具执行结果
 */
export interface ToolResult {
  /** 是否执行成功 */
  success: boolean;
  /** 返回数据 */
  data: any;
  /** 错误信息 */
  error?: string;
  /** 执行元数据 */
  metadata?: Record<string, any>;
}

/**
 * OpenAI function calling 格式的工具 Schema
 */
export interface OpenAIFunctionSchema {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: JsonSchema;
  };
}

/**
 * 工具执行器配置
 */
export interface ToolExecutorOptions {
  /** 最大重试次数（默认 2） */
  maxRetries?: number;
  /** 重试基础延迟（毫秒，默认 1000） */
  retryBaseDelay?: number;
  /** 默认超时时间（毫秒，默认 30000） */
  defaultTimeout?: number;
  /** 是否在执行前记录日志（默认 true） */
  logExecution?: boolean;
}

/**
 * 工具注册中心配置
 */
export interface ToolRegistryOptions {
  /** 是否允许覆盖已注册的工具（默认 false） */
  allowOverride?: boolean;
}

// ============ 参数验证 ============

/**
 * JSON Schema 参数验证器
 *
 * 提供轻量级的 JSON Schema 验证能力，支持：
 * - required 字段检查
 * - type 类型检查
 * - enum 枚举检查
 * - minimum/maximum 数值范围检查
 * - minLength/maxLength 字符串长度检查
 * - pattern 正则匹配
 */
export class SchemaValidator {
  /**
   * 验证参数是否符合 JSON Schema
   *
   * @param params 待验证的参数
   * @param schema JSON Schema 定义
   * @returns 验证错误列表，空数组表示验证通过
   */
  static validate(params: Record<string, any>, schema: JsonSchema): string[] {
    const errors: string[] = [];
    const properties = schema.properties || {};
    const required = schema.required || [];

    // 检查必填字段
    for (const fieldName of required) {
      if (params[fieldName] === undefined || params[fieldName] === null) {
        errors.push(`缺少必填参数: ${fieldName}`);
      }
    }

    // 检查每个已提供参数的类型和约束
    for (const [fieldName, value] of Object.entries(params)) {
      if (value === undefined || value === null) continue;

      const fieldSchema = properties[fieldName];
      if (!fieldSchema) {
        // 未在 schema 中定义的字段，跳过（宽松模式）
        continue;
      }

      // 类型检查
      if (fieldSchema.type) {
        const typeError = SchemaValidator.checkType(fieldName, value, fieldSchema.type);
        if (typeError) errors.push(typeError);
      }

      // 枚举检查
      if (fieldSchema.enum && Array.isArray(fieldSchema.enum)) {
        if (!fieldSchema.enum.includes(value)) {
          errors.push(
            `参数 ${fieldName} 的值 "${value}" 不在允许的枚举值中: [${fieldSchema.enum.join(', ')}]`,
          );
        }
      }

      // 数值范围检查
      if (typeof value === 'number') {
        if (fieldSchema.minimum !== undefined && value < fieldSchema.minimum) {
          errors.push(`参数 ${fieldName} 的值 ${value} 小于最小值 ${fieldSchema.minimum}`);
        }
        if (fieldSchema.maximum !== undefined && value > fieldSchema.maximum) {
          errors.push(`参数 ${fieldName} 的值 ${value} 大于最大值 ${fieldSchema.maximum}`);
        }
      }

      // 字符串长度检查
      if (typeof value === 'string') {
        if (fieldSchema.minLength !== undefined && value.length < fieldSchema.minLength) {
          errors.push(
            `参数 ${fieldName} 的长度 ${value.length} 小于最小长度 ${fieldSchema.minLength}`,
          );
        }
        if (fieldSchema.maxLength !== undefined && value.length > fieldSchema.maxLength) {
          errors.push(
            `参数 ${fieldName} 的长度 ${value.length} 超过最大长度 ${fieldSchema.maxLength}`,
          );
        }
        if (fieldSchema.pattern) {
          const regex = new RegExp(fieldSchema.pattern);
          if (!regex.test(value)) {
            errors.push(`参数 ${fieldName} 的值不匹配模式: ${fieldSchema.pattern}`);
          }
        }
      }
    }

    return errors;
  }

  /**
   * 检查值类型
   */
  private static checkType(fieldName: string, value: any, expectedType: string | string[]): string | null {
    const types = Array.isArray(expectedType) ? expectedType : [expectedType];

    for (const type of types) {
      switch (type) {
        case 'string':
          if (typeof value === 'string') return null;
          break;
        case 'number':
          if (typeof value === 'number' && !isNaN(value)) return null;
          break;
        case 'integer':
          if (typeof value === 'number' && Number.isInteger(value)) return null;
          break;
        case 'boolean':
          if (typeof value === 'boolean') return null;
          break;
        case 'array':
          if (Array.isArray(value)) return null;
          break;
        case 'object':
          if (typeof value === 'object' && value !== null && !Array.isArray(value)) return null;
          break;
      }
    }

    return `参数 ${fieldName} 的类型应为 ${types.join(' | ')}, 实际为 ${typeof value}`;
  }
}

// ============ 工具注册中心 ============

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

// ============ 工具执行器 ============

/**
 * 工具执行器
 *
 * 在 ToolRegistry 基础上增加：
 * - 自动重试（带指数退避）
 * - 执行超时控制
 * - 结构化错误处理
 * - 执行日志记录
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

// ============ 内置工具集 ============

/**
 * 网络搜索工具
 *
 * 执行网络搜索查询（需要外部搜索 API 支持）。
 */
export const WebSearchTool: ToolDefinition = {
  name: 'web_search',
  description: '搜索互联网获取最新信息。当需要查找实时数据、新闻、事实或任何不在训练数据中的信息时使用。',
  parameters: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: '搜索查询关键词',
        minLength: 1,
        maxLength: 500,
      },
      numResults: {
        type: 'integer',
        description: '返回结果数量',
        minimum: 1,
        maximum: 20,
        default: 5,
      },
    },
    required: ['query'],
  },
  returnType: 'Array<{ title: string, snippet: string, url: string }>',
  timeout: 15000,
  handler: async (params) => {
    // 注意：实际使用时需要集成搜索 API（如 SerpAPI、Bing API 等）
    // 这里提供基础框架，具体实现取决于可用的搜索服务
    const { query, numResults = 5 } = params;

    logger.info('tools:web_search', `搜索: ${query}`);

    // 返回提示信息，实际使用时替换为真实搜索 API 调用
    return {
      message: '搜索功能需要配置外部搜索 API',
      query,
      numResults,
      results: [],
      hint: '请配置 FOREVER_SEARCH_API_KEY 环境变量以启用网络搜索',
    };
  },
};

/**
 * 数学计算工具
 *
 * 安全地执行数学表达式计算。
 */
export const CalculatorTool: ToolDefinition = {
  name: 'calculator',
  description: '执行数学计算。支持基本运算（+、-、*、/、%、**）、数学函数（sin、cos、tan、sqrt、abs、log、ceil、floor、round）和常量（PI、E）。不要用于复杂逻辑，仅用于数学计算。',
  parameters: {
    type: 'object',
    properties: {
      expression: {
        type: 'string',
        description: '数学表达式，例如 "2 + 3 * 4"、"sqrt(16) + pow(2, 10)"',
        minLength: 1,
        maxLength: 500,
      },
    },
    required: ['expression'],
  },
  returnType: 'number',
  timeout: 5000,
  handler: (params) => {
    const { expression } = params;

    // 安全检查：只允许数字、运算符、数学函数和括号
    const safePattern = /^[\d\s+\-*/%.(),eEPI]+|sin|cos|tan|sqrt|abs|log|ceil|floor|round|pow|min|max|Math\./;
    const sanitized = expression.replace(/Math\./g, '').replace(/\b(sin|cos|tan|sqrt|abs|log|ceil|floor|round|pow|min|max|PI|E)\b/g, '');

    // 检查是否包含危险字符
    if (/[a-zA-Z_$]/.test(sanitized.replace(/\s/g, ''))) {
      throw new Error('表达式包含不允许的字符，仅支持数学运算');
    }

    try {
      // 创建安全的计算环境
      const mathEnv = {
        sin: Math.sin,
        cos: Math.cos,
        tan: Math.tan,
        sqrt: Math.sqrt,
        abs: Math.abs,
        log: Math.log,
        ceil: Math.ceil,
        floor: Math.floor,
        round: Math.round,
        pow: Math.pow,
        min: Math.min,
        max: Math.max,
        PI: Math.PI,
        E: Math.E,
      };

      // 使用 Function 构造器创建安全的计算函数
      const funcBody = `"use strict"; return (${expression});`;
      const argNames = Object.keys(mathEnv);
      const argValues = Object.values(mathEnv);
      const func = new Function(...argNames, funcBody);
      const result = func(...argValues);

      if (typeof result !== 'number' || !isFinite(result)) {
        throw new Error(`计算结果无效: ${result}`);
      }

      return {
        expression,
        result,
        formatted: Number.isInteger(result) ? result.toString() : result.toFixed(6).replace(/\.?0+$/, ''),
      };
    } catch (err) {
      throw new Error(`数学计算错误: ${err instanceof Error ? err.message : String(err)}`);
    }
  },
};

/**
 * 日期时间工具
 *
 * 查询当前日期时间和执行日期时间计算。
 */
export const DateTimeTool: ToolDefinition = {
  name: 'datetime',
  description: '获取当前日期时间或执行日期时间计算。当需要知道当前时间、日期计算、时间格式转换时使用。',
  parameters: {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        description: '操作类型',
        enum: ['now', 'format', 'diff', 'add', 'parse'],
        default: 'now',
      },
      dateStr: {
        type: 'string',
        description: '日期字符串（用于 format/diff/add/parse 操作）',
      },
      format: {
        type: 'string',
        description: '输出格式（默认 ISO 8601）',
      },
      amount: {
        type: 'integer',
        description: '时间增减量（用于 add 操作）',
      },
      unit: {
        type: 'string',
        description: '时间单位（用于 add 操作）',
        enum: ['seconds', 'minutes', 'hours', 'days', 'weeks', 'months', 'years'],
      },
    },
    required: [],
  },
  returnType: 'string | object',
  timeout: 3000,
  handler: (params) => {
    const { action = 'now', dateStr, format, amount, unit } = params;
    const now = new Date();

    switch (action) {
      case 'now': {
        if (format) {
          return formatDateTime(now, format);
        }
        return {
          iso: now.toISOString(),
          locale: now.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }),
          timestamp: now.getTime(),
          unix: Math.floor(now.getTime() / 1000),
          date: now.toLocaleDateString('zh-CN'),
          time: now.toLocaleTimeString('zh-CN'),
          weekday: ['日', '一', '二', '三', '四', '五', '六'][now.getDay()],
        };
      }

      case 'format': {
        if (!dateStr) {
          throw new Error('format 操作需要 dateStr 参数');
        }
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) {
          throw new Error(`无效的日期字符串: ${dateStr}`);
        }
        return formatDateTime(date, format || 'YYYY-MM-DD HH:mm:ss');
      }

      case 'diff': {
        if (!dateStr) {
          throw new Error('diff 操作需要 dateStr 参数');
        }
        const target = new Date(dateStr);
        if (isNaN(target.getTime())) {
          throw new Error(`无效的日期字符串: ${dateStr}`);
        }
        const diffMs = Math.abs(now.getTime() - target.getTime());
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        return {
          target: target.toISOString(),
          now: now.toISOString(),
          diffMs,
          diffSeconds: Math.floor(diffMs / 1000),
          diffMinutes,
          diffHours,
          diffDays,
          isPast: target < now,
          isFuture: target > now,
        };
      }

      case 'add': {
        if (!dateStr) {
          throw new Error('add 操作需要 dateStr 参数');
        }
        if (amount === undefined || !unit) {
          throw new Error('add 操作需要 amount 和 unit 参数');
        }
        const base = new Date(dateStr);
        if (isNaN(base.getTime())) {
          throw new Error(`无效的日期字符串: ${dateStr}`);
        }
        const multipliers: Record<string, number> = {
          seconds: 1000,
          minutes: 1000 * 60,
          hours: 1000 * 60 * 60,
          days: 1000 * 60 * 60 * 24,
          weeks: 1000 * 60 * 60 * 24 * 7,
          months: 1000 * 60 * 60 * 24 * 30,
          years: 1000 * 60 * 60 * 24 * 365,
        };
        const result = new Date(base.getTime() + amount * (multipliers[unit] || 0));
        return {
          original: base.toISOString(),
          result: result.toISOString(),
          added: `${amount} ${unit}`,
        };
      }

      case 'parse': {
        if (!dateStr) {
          throw new Error('parse 操作需要 dateStr 参数');
        }
        const parsed = new Date(dateStr);
        if (isNaN(parsed.getTime())) {
          throw new Error(`无法解析日期: ${dateStr}`);
        }
        return {
          input: dateStr,
          iso: parsed.toISOString(),
          timestamp: parsed.getTime(),
          valid: true,
        };
      }

      default:
        throw new Error(`未知操作: ${action}`);
    }
  },
};

/**
 * 格式化日期时间
 */
function formatDateTime(date: Date, format: string): string {
  const pad = (n: number) => n.toString().padStart(2, '0');

  return format
    .replace('YYYY', date.getFullYear().toString())
    .replace('MM', pad(date.getMonth() + 1))
    .replace('DD', pad(date.getDate()))
    .replace('HH', pad(date.getHours()))
    .replace('mm', pad(date.getMinutes()))
    .replace('ss', pad(date.getSeconds()));
}

/**
 * 记忆搜索工具
 *
 * 搜索分层记忆系统中的相关记忆。
 * 需要外部注入 TieredMemoryManager 实例。
 */
export function createMemorySearchTool(
  memorySearch: (query: string, limit?: number) => Promise<Array<{ content: string; score: number; source: string }>>,
): ToolDefinition {
  return {
    name: 'memory_search',
    description: '搜索记忆中存储的信息。当需要回忆之前对话的内容、用户偏好、重要事实等信息时使用。',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: '搜索查询内容',
          minLength: 1,
          maxLength: 500,
        },
        limit: {
          type: 'integer',
          description: '返回结果数量',
          minimum: 1,
          maximum: 20,
          default: 5,
        },
      },
      required: ['query'],
    },
    returnType: 'Array<{ content: string, score: number, source: string }>',
    timeout: 10000,
    handler: async (params) => {
      const { query, limit = 5 } = params;
      const results = await memorySearch(query, limit);
      return results.map(r => ({
        content: r.content,
        score: Math.round(r.score * 100) / 100,
        source: r.source,
      }));
    },
  };
}

/**
 * 记忆存储工具
 *
 * 向分层记忆系统中存储新的记忆。
 * 需要外部注入存储函数。
 */
export function createMemoryStoreTool(
  memoryStore: (content: string, importance?: number, metadata?: Record<string, any>) => Promise<string>,
): ToolDefinition {
  return {
    name: 'memory_store',
    description: '将重要信息存储到记忆中。当需要记住用户偏好、重要事实、关键对话内容时使用。',
    parameters: {
      type: 'object',
      properties: {
        content: {
          type: 'string',
          description: '要存储的记忆内容',
          minLength: 1,
          maxLength: 2000,
        },
        importance: {
          type: 'number',
          description: '重要性评分 (0-1)，越高越重要',
          minimum: 0,
          maximum: 1,
          default: 0.5,
        },
        category: {
          type: 'string',
          description: '记忆类别',
          enum: ['fact', 'preference', 'event', 'relationship', 'routine', 'other'],
          default: 'fact',
        },
      },
      required: ['content'],
    },
    returnType: 'string',
    timeout: 5000,
    handler: async (params) => {
      const { content, importance = 0.5, category = 'fact' } = params;
      const result = await memoryStore(content, importance, { category });
      return {
        status: 'stored',
        content,
        importance,
        category,
        result,
      };
    },
  };
}

/**
 * 文件读取工具
 *
 * 读取指定路径的文件内容。
 */
export const FileReadTool: ToolDefinition = {
  name: 'file_read',
  description: '读取文件内容。当需要查看文件内容、读取配置文件、查看代码文件时使用。',
  parameters: {
    type: 'object',
    properties: {
      filePath: {
        type: 'string',
        description: '文件绝对路径',
        minLength: 1,
        maxLength: 1000,
      },
      encoding: {
        type: 'string',
        description: '文件编码',
        default: 'utf-8',
      },
      maxLines: {
        type: 'integer',
        description: '最大读取行数（0 表示全部读取）',
        minimum: 0,
        default: 0,
      },
    },
    required: ['filePath'],
  },
  returnType: 'string',
  dangerous: true,
  timeout: 10000,
  handler: (params) => {
    const { filePath, encoding = 'utf-8', maxLines = 0 } = params;

    // 安全检查：确保路径是绝对路径
    if (!path.isAbsolute(filePath)) {
      throw new Error('文件路径必须是绝对路径');
    }

    if (!fs.existsSync(filePath)) {
      throw new Error(`文件不存在: ${filePath}`);
    }

    const stat = fs.statSync(filePath);
    if (!stat.isFile()) {
      throw new Error(`路径不是文件: ${filePath}`);
    }

    // 文件大小限制（10MB）
    const MAX_SIZE = 10 * 1024 * 1024;
    if (stat.size > MAX_SIZE) {
      throw new Error(`文件过大 (${stat.size} bytes)，最大支持 ${MAX_SIZE} bytes`);
    }

    const content = fs.readFileSync(filePath, encoding);

    if (maxLines > 0) {
      const lines = content.split('\n');
      return {
        filePath,
        totalLines: lines.length,
        returnedLines: Math.min(maxLines, lines.length),
        content: lines.slice(0, maxLines).join('\n'),
        truncated: lines.length > maxLines,
      };
    }

    return {
      filePath,
      size: stat.size,
      content,
    };
  },
};

/**
 * 文件写入工具
 *
 * 将内容写入指定路径的文件。
 */
export const FileWriteTool: ToolDefinition = {
  name: 'file_write',
  description: '将内容写入文件。当需要创建新文件、保存结果、修改配置时使用。注意：此操作会覆盖已有文件内容。',
  parameters: {
    type: 'object',
    properties: {
      filePath: {
        type: 'string',
        description: '文件绝对路径',
        minLength: 1,
        maxLength: 1000,
      },
      content: {
        type: 'string',
        description: '要写入的内容',
      },
      encoding: {
        type: 'string',
        description: '文件编码',
        default: 'utf-8',
      },
      append: {
        type: 'boolean',
        description: '是否追加模式（true 则不覆盖已有内容）',
        default: false,
      },
    },
    required: ['filePath', 'content'],
  },
  returnType: 'object',
  dangerous: true,
  timeout: 10000,
  handler: (params) => {
    const { filePath, content, encoding = 'utf-8', append = false } = params;

    // 安全检查：确保路径是绝对路径
    if (!path.isAbsolute(filePath)) {
      throw new Error('文件路径必须是绝对路径');
    }

    // 确保目录存在
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // 写入文件
    if (append) {
      fs.appendFileSync(filePath, content, encoding);
    } else {
      fs.writeFileSync(filePath, content, encoding);
    }

    const stat = fs.statSync(filePath);

    return {
      filePath,
      size: stat.size,
      mode: append ? 'append' : 'overwrite',
      success: true,
    };
  },
};

/**
 * 创建包含所有内置工具的注册中心
 *
 * @param memorySearchFn 记忆搜索函数（可选）
 * @param memoryStoreFn 记忆存储函数（可选）
 * @returns 配置好内置工具的 ToolRegistry 实例
 */
export function createDefaultToolRegistry(
  memorySearchFn?: (query: string, limit?: number) => Promise<Array<{ content: string; score: number; source: string }>>,
  memoryStoreFn?: (content: string, importance?: number, metadata?: Record<string, any>) => Promise<string>,
): ToolRegistry {
  const registry = new ToolRegistry();

  // 注册核心内置工具
  registry.register(CalculatorTool);
  registry.register(DateTimeTool);
  registry.register(FileReadTool);
  registry.register(FileWriteTool);
  registry.register(WebSearchTool);

  // 注册记忆工具（如果提供了回调函数）
  if (memorySearchFn) {
    registry.register(createMemorySearchTool(memorySearchFn));
  }
  if (memoryStoreFn) {
    registry.register(createMemoryStoreTool(memoryStoreFn));
  }

  return registry;
}

// ============ 导出 ============

export {
  ToolRegistry,
  ToolExecutor,
  SchemaValidator,
};
