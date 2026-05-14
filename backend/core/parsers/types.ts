/**
 * @module parsers/types
 * @description 解析器核心类型定义
 *
 * 定义输出解析器的基类、字段定义、解析结果等核心类型。
 */

// ============================================================================
// 字段定义接口
// ============================================================================

/**
 * 结构化字段定义接口
 * @interface StructuredField
 */
export interface StructuredField {
  /** 字段名称 */
  name: string;
  /** 字段类型 */
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  /** 字段描述 */
  description: string;
  /** 是否必须 */
  required?: boolean;
  /** 默认值 */
  default?: any;
  /** 枚举可选值（仅当 type 为 string 时有效） */
  enum?: string[];
  /** 数组元素类型（仅当 type 为 array 时有效） */
  items?: StructuredField;
  /** 对象属性（仅当 type 为 object 时有效） */
  properties?: Record<string, StructuredField>;
}

// ============================================================================
// 解析结果接口
// ============================================================================

/**
 * 解析结果接口
 * @interface ParseResult
 */
export interface ParseResult {
  /** 解析是否成功 */
  success: boolean;
  /** 解析后的数据 */
  data?: any;
  /** 错误信息 */
  error?: string;
}

// ============================================================================
// LLM 调用接口
// ============================================================================

/**
 * LLM 调用接口（用于重试机制）
 * @interface LLMCaller
 */
export interface LLMCaller {
  /**
   * 调用 LLM 生成文本
   * @param {string} prompt - 提示词
   * @returns {Promise<string>} LLM 生成的文本
   */
  invoke: (prompt: string) => Promise<string>;
}

// ============================================================================
// 抽象基类
// ============================================================================

/**
 * 输出解析器抽象基类
 * @abstract
 * @class BaseOutputParser
 * @description 所有输出解析器的基类，定义核心解析接口
 *
 * @template T - 解析输出的类型
 */
export abstract class BaseOutputParser<T = any> {
  /**
   * 解析 LLM 输出
   * @param {string} text - LLM 生成的文本
   * @returns {Promise<T>} 解析后的结果
   */
  abstract parse(text: string): Promise<T>;

  /**
   * 带提示词上下文的解析
   * @param {string} text - LLM 生成的文本
   * @param {string} prompt - 原始提示词
   * @returns {Promise<T>} 解析后的结果
   */
  async parseWithPrompt(text: string, prompt: string): Promise<T> {
    return this.parse(text);
  }

  /**
   * 获取格式指令（用于添加到提示词中指导 LLM 输出格式）
   * @returns {string} 格式指令文本
   */
  abstract getFormatInstructions(): string;

  /**
   * 安全解析（不抛出异常）
   * @param {string} text - LLM 生成的文本
   * @returns {Promise<ParseResult>} 解析结果
   */
  async safeParse(text: string): Promise<ParseResult> {
    try {
      const data = await this.parse(text);
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
