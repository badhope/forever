/**
 * @module tools/types
 * @description 工具系统的类型定义与参数验证器
 *
 * 定义工具定义、工具结果、OpenAI function calling schema 等核心类型，
 * 以及 JSON Schema 参数验证器。
 */

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
// 参数验证
// ============================================================================

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
