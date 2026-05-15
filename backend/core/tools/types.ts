/**
 * @module tools/types
 * @description 工具系统的类型定义与参数验证器
 *
 * 定义工具定义、工具结果、OpenAI function calling schema 等核心类型，
 * 以及 JSON Schema 参数验证器（内部使用 ajv 实现）。
 */

import Ajv from 'ajv';

// ============================================================================
// 类型定义
// ============================================================================

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

// ============================================================================
// 参数验证（内部委托给 ajv）
// ============================================================================

/**
 * JSON Schema 参数验证器
 *
 * 提供轻量级的 JSON Schema 验证能力，内部使用 ajv 实现。
 * 支持 JSON Schema Draft-07 规范的全部验证能力：
 * - required 字段检查
 * - type 类型检查
 * - enum 枚举检查
 * - minimum/maximum 数值范围检查
 * - minLength/maxLength 字符串长度检查
 * - pattern 正则匹配
 * - 以及 ajv 支持的所有其他 JSON Schema 关键字
 */
export class SchemaValidator {
  private static ajv = new Ajv({ allErrors: true });

  /**
   * 验证参数是否符合 JSON Schema
   *
   * @param params 待验证的参数
   * @param schema JSON Schema 定义
   * @returns 验证错误列表，空数组表示验证通过
   */
  static validate(params: Record<string, any>, schema: JsonSchema): string[] {
    const validate = SchemaValidator.ajv.compile(schema);
    const valid = validate(params);

    if (valid) {
      return [];
    }

    return (validate.errors ?? []).map(
      (err) => `${err.instancePath || '/'} ${err.message || '验证失败'}`.trim(),
    );
  }
}
