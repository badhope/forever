/**
 * @module parsers/pydantic
 * @description Pydantic 风格输出解析器
 *
 * 提供字段验证、类型转换功能的结构化解析器，
 * 类似 Python Pydantic 的 TypeScript 实现。
 *
 * @example
 * ```typescript
 * const parser = new PydanticOutputParser([
 *   { name: 'username', type: 'string', description: '用户名', required: true, validation: { minLength: 3, maxLength: 20, pattern: /^[a-zA-Z0-9_]+$/ } },
 *   { name: 'age', type: 'integer', description: '年龄', required: true, validation: { min: 0, max: 150 } },
 *   { name: 'email', type: 'string', description: '邮箱', required: true },
 *   { name: 'bio', type: 'string', description: '简介', default: '' },
 * ]);
 * const result = await parser.parse('{"username": "john", "age": 25, "email": "john@example.com"}');
 * ```
 */

import { BaseOutputParser } from './types';

// ============================================================================
// 类型定义
// ============================================================================

/**
 * 字段验证规则接口
 * @interface FieldValidation
 */
export interface FieldValidation {
  /** 最小值（数值类型） */
  min?: number;
  /** 最大值（数值类型） */
  max?: number;
  /** 最小长度（字符串/数组类型） */
  minLength?: number;
  /** 最大长度（字符串/数组类型） */
  maxLength?: number;
  /** 正则验证（字符串类型） */
  pattern?: RegExp;
  /** 自定义验证函数 */
  validator?: (value: any) => boolean | string;
}

/**
 * Pydantic 风格字段定义接口
 * @interface PydanticField
 */
export interface PydanticField {
  /** 字段名称 */
  name: string;
  /** 字段类型 */
  type: 'string' | 'number' | 'boolean' | 'integer' | 'array' | 'object' | 'date';
  /** 字段描述 */
  description: string;
  /** 是否必须 */
  required?: boolean;
  /** 默认值 */
  default?: any;
  /** 验证规则 */
  validation?: FieldValidation;
}

// ============================================================================
// PydanticOutputParser
// ============================================================================

/**
 * 类似 Pydantic 的 TypeScript 结构化输出解析器
 * @class PydanticOutputParser
 * @extends BaseOutputParser
 * @description 提供字段验证、类型转换功能的结构化解析器
 */
export class PydanticOutputParser extends BaseOutputParser<Record<string, any>> {
  /** 字段定义列表 */
  private fields: PydanticField[];

  constructor(fields: PydanticField[]) {
    super();
    this.fields = fields;
  }

  /**
   * 解析 LLM 输出
   * @param {string} text - LLM 生成的文本
   * @returns {Promise<Record<string, any>>} 解析后的对象
   * @throws {Error} 当解析或验证失败时抛出异常
   */
  async parse(text: string): Promise<Record<string, any>> {
    const jsonStr = this.extractJSON(text);
    const parsed = JSON.parse(jsonStr);
    const result: Record<string, any> = {};

    for (const field of this.fields) {
      let value: any;

      if (field.name in parsed) {
        value = this.convertType(parsed[field.name], field.type);
        this.validateField(value, field);
        result[field.name] = value;
      } else if (field.required) {
        throw new Error(`Missing required field: "${field.name}"`);
      } else if (field.default !== undefined) {
        result[field.name] = field.default;
      }
    }

    return result;
  }

  /**
   * 从文本中提取 JSON
   * @param {string} text - 原始文本
   * @returns {string} JSON 字符串
   */
  private extractJSON(text: string): string {
    try {
      JSON.parse(text.trim());
      return text.trim();
    } catch {
      const codeBlockMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
      if (codeBlockMatch) return codeBlockMatch[1].trim();

      const braceMatch = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
      if (braceMatch) return braceMatch[1].trim();

      throw new Error(`Unable to extract JSON from output: ${text.substring(0, 200)}...`);
    }
  }

  /**
   * 类型转换
   * @param {any} value - 原始值
   * @param {string} type - 目标类型
   * @returns {any} 转换后的值
   * @throws {Error} 当无法转换时抛出异常
   */
  private convertType(value: any, type: string): any {
    switch (type) {
      case 'string':
        return String(value);
      case 'number':
        if (typeof value !== 'number') {
          const num = Number(value);
          if (isNaN(num)) throw new Error(`Cannot convert "${value}" to number`);
          return num;
        }
        return value;
      case 'integer':
        if (typeof value !== 'number' || !Number.isInteger(value)) {
          const num = parseInt(value, 10);
          if (isNaN(num)) throw new Error(`Cannot convert "${value}" to integer`);
          return num;
        }
        return value;
      case 'boolean':
        if (typeof value !== 'boolean') {
          if (value === 'true' || value === 1) return true;
          if (value === 'false' || value === 0) return false;
          throw new Error(`Cannot convert "${value}" to boolean`);
        }
        return value;
      case 'date':
        if (typeof value === 'string') {
          const date = new Date(value);
          if (isNaN(date.getTime())) throw new Error(`Invalid date: "${value}"`);
          return date.toISOString();
        }
        if (value instanceof Date) return value.toISOString();
        throw new Error(`Cannot convert "${value}" to date`);
      case 'array':
        if (!Array.isArray(value)) throw new Error(`Value is not an array`);
        return value;
      case 'object':
        if (typeof value !== 'object' || value === null || Array.isArray(value)) {
          throw new Error(`Value is not an object`);
        }
        return value;
      default:
        return value;
    }
  }

  /**
   * 验证字段值
   * @param {any} value - 字段值
   * @param {PydanticField} field - 字段定义
   * @throws {Error} 当验证失败时抛出异常
   */
  private validateField(value: any, field: PydanticField): void {
    const v = field.validation;
    if (!v) return;

    if (v.min !== undefined && typeof value === 'number' && value < v.min) {
      throw new Error(`Field "${field.name}" value ${value} is less than minimum ${v.min}`);
    }
    if (v.max !== undefined && typeof value === 'number' && value > v.max) {
      throw new Error(`Field "${field.name}" value ${value} is greater than maximum ${v.max}`);
    }
    if (v.minLength !== undefined && typeof value === 'string' && value.length < v.minLength) {
      throw new Error(
        `Field "${field.name}" length ${value.length} is less than minimum ${v.minLength}`
      );
    }
    if (v.maxLength !== undefined && typeof value === 'string' && value.length > v.maxLength) {
      throw new Error(
        `Field "${field.name}" length ${value.length} is greater than maximum ${v.maxLength}`
      );
    }
    if (v.pattern !== undefined && typeof value === 'string' && !v.pattern.test(value)) {
      throw new Error(
        `Field "${field.name}" value "${value}" does not match pattern ${v.pattern.toString()}`
      );
    }
    if (v.validator) {
      const result = v.validator(value);
      if (result === false) {
        throw new Error(`Field "${field.name}" failed custom validation`);
      }
      if (typeof result === 'string') {
        throw new Error(`Field "${field.name}" validation error: ${result}`);
      }
    }
  }

  /**
   * 获取格式指令
   * @returns {string} 格式指令
   */
  getFormatInstructions(): string {
    const schema = this.buildSchema();
    return `You must output a valid JSON object conforming to the following schema:

${JSON.stringify(schema, null, 2)}

Validation rules:
${this.fields
  .filter((f) => f.validation)
  .map((f) => {
    const rules: string[] = [];
    const v = f.validation!;
    if (v.min !== undefined) rules.push(`minimum value: ${v.min}`);
    if (v.max !== undefined) rules.push(`maximum value: ${v.max}`);
    if (v.minLength !== undefined) rules.push(`minimum length: ${v.minLength}`);
    if (v.maxLength !== undefined) rules.push(`maximum length: ${v.maxLength}`);
    if (v.pattern) rules.push(`must match pattern: ${v.pattern.toString()}`);
    return `- "${f.name}": ${rules.join(', ')}`;
  })
  .join('\n')}

Output ONLY valid JSON, no other text.`;
  }

  /**
   * 构建 JSON Schema
   * @returns {object} JSON Schema
   */
  private buildSchema(): object {
    const properties: Record<string, any> = {};
    const required: string[] = [];

    for (const field of this.fields) {
      properties[field.name] = {
        type: field.type === 'integer' ? 'number' : field.type,
        description: field.description,
      };
      if (field.required) {
        required.push(field.name);
      }
    }

    return { type: 'object', properties, required };
  }
}
