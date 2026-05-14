/**
 * @module parsers/list
 * @description 列表输出解析器
 *
 * 提供两种列表解析器：
 * - ListOutputParser: 将 LLM 输出解析为列表（支持编号列表、JSON 数组等格式）
 * - CommaSeparatedListOutputParser: 将逗号分隔的文本解析为列表
 */

import { BaseOutputParser } from './types';

// ============================================================================
// 列表输出解析器
// ============================================================================

/**
 * 列表输出解析器
 * @class ListOutputParser
 * @extends BaseOutputParser
 * @description 将 LLM 输出解析为列表
 *
 * @example
 * ```typescript
 * const parser = new ListOutputParser();
 * const result = await parser.parse('1. 第一项\n2. 第二项\n3. 第三项');
 * // => ['第一项', '第二项', '第三项']
 * ```
 */
export class ListOutputParser extends BaseOutputParser<string[]> {
  /** 列表项分隔符正则表达式 */
  private itemPattern: RegExp;

  constructor(itemPattern?: RegExp) {
    super();
    this.itemPattern = itemPattern || /^\s*(?:\d+[\.\)、]|\-|\*|\•)\s*(.+)$/gm;
  }

  /**
   * 解析 LLM 输出为列表
   * @param {string} text - LLM 生成的文本
   * @returns {Promise<string[]>} 解析后的列表
   */
  async parse(text: string): Promise<string[]> {
    // 尝试解析 JSON 数组
    try {
      const trimmed = text.trim();
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.map(String);
      }
    } catch {
      // 不是 JSON，继续其他解析方式
    }

    // 尝试从代码块中提取 JSON
    const codeBlockMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
    if (codeBlockMatch) {
      try {
        const parsed = JSON.parse(codeBlockMatch[1].trim());
        if (Array.isArray(parsed)) {
          return parsed.map(String);
        }
      } catch {
        // 继续其他方式
      }
    }

    // 使用正则匹配列表项
    const items: string[] = [];
    const pattern = new RegExp(this.itemPattern.source, this.itemPattern.flags);
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(text)) !== null) {
      items.push(match[1].trim());
    }

    // 如果正则没匹配到，按行分割
    if (items.length === 0) {
      const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
      return lines;
    }

    return items;
  }

  /**
   * 获取格式指令
   * @returns {string} 格式指令
   */
  getFormatInstructions(): string {
    return `Output a list of items, one per line. Each item should be prefixed with a number and a period (e.g., "1. item one"). Alternatively, you can output a JSON array.`;
  }
}

// ============================================================================
// 逗号分隔列表解析器
// ============================================================================

/**
 * 逗号分隔列表解析器
 * @class CommaSeparatedListOutputParser
 * @extends BaseOutputParser
 * @description 将逗号分隔的文本解析为列表
 *
 * @example
 * ```typescript
 * const parser = new CommaSeparatedListOutputParser();
 * const result = await parser.parse('苹果, 香蕉, 橙子');
 * // => ['苹果', '香蕉', '橙子']
 * ```
 */
export class CommaSeparatedListOutputParser extends BaseOutputParser<string[]> {
  /** 分隔符 */
  private separator: string;

  constructor(separator: string = ',') {
    super();
    this.separator = separator;
  }

  /**
   * 解析逗号分隔的文本为列表
   * @param {string} text - LLM 生成的文本
   * @returns {Promise<string[]>} 解析后的列表
   */
  async parse(text: string): Promise<string[]> {
    // 尝试解析 JSON 数组
    try {
      const parsed = JSON.parse(text.trim());
      if (Array.isArray(parsed)) {
        return parsed.map(String);
      }
    } catch {
      // 不是 JSON，继续
    }

    return text
      .split(this.separator)
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }

  /**
   * 获取格式指令
   * @returns {string} 格式指令
   */
  getFormatInstructions(): string {
    return `Output a comma-separated list of items. For example: "item1${this.separator} item2${this.separator} item3". Do not include any numbering or bullet points.`;
  }
}
