/**
 * @module parsers/enum
 * @description 枚举输出解析器
 *
 * 将 LLM 输出限制为预定义枚举值之一，
 * 支持精确匹配和包含匹配两种策略。
 *
 * @example
 * ```typescript
 * const parser = new EnumOutputParser(['positive', 'negative', 'neutral']);
 * const result = await parser.parse('positive');
 * // => 'positive'
 * ```
 */

import { BaseOutputParser } from './types';

/**
 * 枚举输出解析器
 * @class EnumOutputParser
 * @extends BaseOutputParser
 * @description 将 LLM 输出限制为枚举值之一
 */
export class EnumOutputParser extends BaseOutputParser<string> {
  /** 允许的枚举值 */
  private enumValues: string[];

  constructor(enumValues: string[]) {
    super();
    if (enumValues.length === 0) {
      throw new Error('EnumOutputParser requires at least one enum value');
    }
    this.enumValues = enumValues;
  }

  /**
   * 解析 LLM 输出，确保结果为枚举值之一
   * @param {string} text - LLM 生成的文本
   * @returns {Promise<string>} 匹配的枚举值
   * @throws {Error} 当输出不匹配任何枚举值时抛出异常
   */
  async parse(text: string): Promise<string> {
    const trimmed = text.trim().toLowerCase();

    // 精确匹配
    for (const value of this.enumValues) {
      if (value.toLowerCase() === trimmed) {
        return value;
      }
    }

    // 包含匹配
    for (const value of this.enumValues) {
      if (trimmed.includes(value.toLowerCase()) || value.toLowerCase().includes(trimmed)) {
        return value;
      }
    }

    throw new Error(
      `Output "${text}" does not match any of the allowed values: ${this.enumValues.join(', ')}`
    );
  }

  /**
   * 获取格式指令
   * @returns {string} 格式指令
   */
  getFormatInstructions(): string {
    return `You must output exactly one of the following values: ${this.enumValues.map((v) => `"${v}"`).join(', ')}. Do not include any other text.`;
  }
}
