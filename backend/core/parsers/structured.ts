/**
 * @module parsers/structured
 * @description 基于 JSON Schema 的结构化输出解析器
 *
 * 根据 JSON Schema 定义解析 LLM 输出为结构化对象，
 * 支持字段类型验证、类型转换和嵌套结构。
 *
 * @example
 * ```typescript
 * const parser = new StructuredOutputParser([
 *   { name: 'name', type: 'string', description: '人物姓名', required: true },
 *   { name: 'age', type: 'number', description: '人物年龄', required: true },
 *   { name: 'hobbies', type: 'array', description: '爱好列表', items: { name: 'hobby', type: 'string', description: '一个爱好' } },
 * ]);
 * const instructions = parser.getFormatInstructions();
 * const result = await parser.parse('{"name": "张三", "age": 25, "hobbies": ["阅读", "编程"]}');
 * ```
 */

import { BaseOutputParser } from './types';
import type { StructuredField } from './types';

/**
 * 基于 JSON Schema 的结构化输出解析器
 * @class StructuredOutputParser
 * @extends BaseOutputParser
 * @description 根据 JSON Schema 定义解析 LLM 输出为结构化对象
 */
export class StructuredOutputParser extends BaseOutputParser<Record<string, any>> {
  /** 字段定义列表 */
  private fields: StructuredField[];

  constructor(fields: StructuredField[]) {
    super();
    this.fields = fields;
  }

  /**
   * 解析 LLM 输出为结构化对象
   * @param {string} text - LLM 生成的文本
   * @returns {Promise<Record<string, any>>} 解析后的结构化对象
   * @throws {Error} 当 JSON 解析失败或字段验证失败时抛出异常
   */
  async parse(text: string): Promise<Record<string, any>> {
    // 尝试从文本中提取 JSON
    const jsonStr = this.extractJSON(text);
    const parsed = JSON.parse(jsonStr);

    // 验证并转换字段
    const result: Record<string, any> = {};

    for (const field of this.fields) {
      if (field.name in parsed) {
        result[field.name] = this.validateAndConvert(parsed[field.name], field);
      } else if (field.required) {
        throw new Error(`Missing required field: "${field.name}"`);
      } else if (field.default !== undefined) {
        result[field.name] = field.default;
      }
    }

    return result;
  }

  /**
   * 从文本中提取 JSON 字符串
   * @param {string} text - 原始文本
   * @returns {string} 提取的 JSON 字符串
   * @throws {Error} 当无法提取有效 JSON 时抛出异常
   */
  private extractJSON(text: string): string {
    // 尝试直接解析
    try {
      JSON.parse(text.trim());
      return text.trim();
    } catch {
      // 尝试提取 ```json ... ``` 代码块
      const codeBlockMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
      if (codeBlockMatch) {
        return codeBlockMatch[1].trim();
      }

      // 尝试提取 { ... } 或 [ ... ]
      const braceMatch = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
      if (braceMatch) {
        return braceMatch[1].trim();
      }

      throw new Error(`Unable to extract JSON from LLM output: ${text.substring(0, 200)}...`);
    }
  }

  /**
   * 验证并转换字段值
   * @param {any} value - 原始值
   * @param {StructuredField} field - 字段定义
   * @returns {any} 转换后的值
   * @throws {Error} 当类型验证失败时抛出异常
   */
  private validateAndConvert(value: any, field: StructuredField): any {
    switch (field.type) {
      case 'string':
        if (typeof value !== 'string') {
          value = String(value);
        }
        if (field.enum && !field.enum.includes(value)) {
          throw new Error(
            `Field "${field.name}" value "${value}" is not one of: ${field.enum.join(', ')}`
          );
        }
        return value;

      case 'number':
        if (typeof value !== 'number') {
          const num = Number(value);
          if (isNaN(num)) {
            throw new Error(`Field "${field.name}" value "${value}" cannot be converted to number`);
          }
          return num;
        }
        return value;

      case 'boolean':
        if (typeof value !== 'boolean') {
          if (value === 'true' || value === 1) return true;
          if (value === 'false' || value === 0) return false;
          throw new Error(`Field "${field.name}" value "${value}" cannot be converted to boolean`);
        }
        return value;

      case 'array':
        if (!Array.isArray(value)) {
          throw new Error(`Field "${field.name}" value is not an array`);
        }
        if (field.items) {
          return value.map((item: any) => this.validateAndConvert(item, field.items!));
        }
        return value;

      case 'object':
        if (typeof value !== 'object' || value === null || Array.isArray(value)) {
          throw new Error(`Field "${field.name}" value is not an object`);
        }
        if (field.properties) {
          const result: Record<string, any> = {};
          for (const [key, propField] of Object.entries(field.properties)) {
            if (key in value) {
              result[key] = this.validateAndConvert(value[key], propField);
            } else if (propField.required) {
              throw new Error(`Missing required nested field: "${field.name}.${key}"`);
            } else if (propField.default !== undefined) {
              result[key] = propField.default;
            }
          }
          return result;
        }
        return value;

      default:
        return value;
    }
  }

  /**
   * 获取格式指令
   * @returns {string} JSON 格式指令
   */
  getFormatInstructions(): string {
    const schema = this.buildSchema();
    return `You must output a valid JSON object that conforms to the following schema:

${JSON.stringify(schema, null, 2)}

Rules:
- Output ONLY valid JSON, no other text.
- All required fields must be present.
- Field types must match the schema.`;
  }

  /**
   * 构建 JSON Schema 对象
   * @returns {object} JSON Schema
   */
  private buildSchema(): object {
    const properties: Record<string, any> = {};
    const required: string[] = [];

    for (const field of this.fields) {
      const prop: any = {
        type: field.type,
        description: field.description,
      };

      if (field.enum) {
        prop.enum = field.enum;
      }
      if (field.items) {
        prop.items = { type: field.items.type };
      }
      if (field.properties) {
        prop.properties = {};
        for (const [key, subField] of Object.entries(field.properties)) {
          prop.properties[key] = { type: subField.type, description: subField.description };
        }
      }

      properties[field.name] = prop;

      if (field.required) {
        required.push(field.name);
      }
    }

    return {
      type: 'object',
      properties,
      required,
    };
  }
}
