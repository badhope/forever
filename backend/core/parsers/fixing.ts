/**
 * @module parsers/fixing
 * @description 输出修复与重试解析器
 *
 * 提供两种自动修复机制：
 * - OutputFixingParser: 解析失败时使用 LLM 自动修复输出
 * - RetryWithErrorOutputParser: 解析失败时将错误信息反馈给 LLM 重新生成
 */

import { BaseOutputParser } from './types';
import type { LLMCaller } from './types';

// ============================================================================
// 输出修复解析器
// ============================================================================

/**
 * 自动修复解析错误的包装器
 * @class OutputFixingParser
 * @extends BaseOutputParser
 * @description 当内部解析器解析失败时，使用 LLM 自动修复输出
 *
 * @example
 * ```typescript
 * const innerParser = new StructuredOutputParser([...]);
 * const fixingParser = new OutputFixingParser({
 *   parser: innerParser,
 *   llm: { invoke: async (prompt) => { ... } },
 *   maxRetries: 3,
 * });
 * const result = await fixingParser.parse(brokenOutput);
 * ```
 */
export class OutputFixingParser extends BaseOutputParser<any> {
  /** 内部解析器 */
  private parser: BaseOutputParser;
  /** LLM 调用器 */
  private llm: LLMCaller;
  /** 最大重试次数 */
  private maxRetries: number;

  /**
   * @param {object} options - 配置选项
   * @param {BaseOutputParser} options.parser - 内部解析器
   * @param {LLMCaller} options.llm - LLM 调用器
   * @param {number} [options.maxRetries=3] - 最大重试次数
   */
  constructor(options: {
    parser: BaseOutputParser;
    llm: LLMCaller;
    maxRetries?: number;
  }) {
    super();
    this.parser = options.parser;
    this.llm = options.llm;
    this.maxRetries = options.maxRetries || 3;
  }

  /**
   * 解析输出，失败时自动修复
   * @param {string} text - LLM 生成的文本
   * @returns {Promise<any>} 解析结果
   */
  async parse(text: string): Promise<any> {
    let lastError: Error | null = null;

    // 首先尝试直接解析
    try {
      return await this.parser.parse(text);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
    }

    // 解析失败，尝试使用 LLM 修复
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      const fixPrompt = this.buildFixPrompt(text, lastError!);
      try {
        const fixedOutput = await this.llm.invoke(fixPrompt);
        return await this.parser.parse(fixedOutput);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
      }
    }

    throw new Error(
      `Output fixing failed after ${this.maxRetries} retries. Last error: ${lastError!.message}`
    );
  }

  /**
   * 构建修复提示词
   * @param {string} originalOutput - 原始输出
   * @param {Error} error - 解析错误
   * @returns {string} 修复提示词
   */
  private buildFixPrompt(originalOutput: string, error: Error): string {
    return `The following output could not be parsed:

---
${originalOutput}
---

Error: ${error.message}

Format instructions:
${this.parser.getFormatInstructions()}

Please fix the output to conform to the format instructions above. Output ONLY the corrected result, no explanation.`;
  }

  /**
   * 获取格式指令
   * @returns {string} 格式指令
   */
  getFormatInstructions(): string {
    return this.parser.getFormatInstructions();
  }
}

// ============================================================================
// 带错误重试的解析器
// ============================================================================

/**
 * 解析失败时将错误信息反馈给 LLM 重新生成的解析器
 * @class RetryWithErrorOutputParser
 * @extends BaseOutputParser
 * @description 与 OutputFixingParser 类似，但会将完整的错误上下文和原始提示词一起发送给 LLM
 *
 * @example
 * ```typescript
 * const innerParser = new StructuredOutputParser([...]);
 * const retryParser = new RetryWithErrorOutputParser({
 *   parser: innerParser,
 *   llm: { invoke: async (prompt) => { ... } },
 *   maxRetries: 3,
 * });
 * const result = await retryParser.parseWithPrompt(brokenOutput, originalPrompt);
 * ```
 */
export class RetryWithErrorOutputParser extends BaseOutputParser<any> {
  /** 内部解析器 */
  private parser: BaseOutputParser;
  /** LLM 调用器 */
  private llm: LLMCaller;
  /** 最大重试次数 */
  private maxRetries: number;

  /**
   * @param {object} options - 配置选项
   * @param {BaseOutputParser} options.parser - 内部解析器
   * @param {LLMCaller} options.llm - LLM 调用器
   * @param {number} [options.maxRetries=3] - 最大重试次数
   */
  constructor(options: {
    parser: BaseOutputParser;
    llm: LLMCaller;
    maxRetries?: number;
  }) {
    super();
    this.parser = options.parser;
    this.llm = options.llm;
    this.maxRetries = options.maxRetries || 3;
  }

  /**
   * 带提示词上下文的解析（推荐使用此方法）
   * @param {string} text - LLM 生成的文本
   * @param {string} prompt - 原始提示词
   * @returns {Promise<any>} 解析结果
   */
  async parseWithPrompt(text: string, prompt: string): Promise<any> {
    let lastError: Error | null = null;

    // 首先尝试直接解析
    try {
      return await this.parser.parse(text);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
    }

    // 解析失败，将错误信息反馈给 LLM 重新生成
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      const retryPrompt = this.buildRetryPrompt(prompt, text, lastError!);
      try {
        const newOutput = await this.llm.invoke(retryPrompt);
        return await this.parser.parse(newOutput);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
      }
    }

    throw new Error(
      `Retry with error output failed after ${this.maxRetries} retries. Last error: ${lastError!.message}`
    );
  }

  /**
   * 解析输出（不带提示词上下文）
   * @param {string} text - LLM 生成的文本
   * @returns {Promise<any>} 解析结果
   */
  async parse(text: string): Promise<any> {
    return this.parseWithPrompt(text, '');
  }

  /**
   * 构建重试提示词
   * @param {string} originalPrompt - 原始提示词
   * @param {string} badOutput - 错误输出
   * @param {Error} error - 解析错误
   * @returns {string} 重试提示词
   */
  private buildRetryPrompt(originalPrompt: string, badOutput: string, error: Error): string {
    return `${originalPrompt}

---
Your previous response was:
${badOutput}

This response could not be parsed correctly. Error: ${error.message}

Please try again, making sure your output strictly follows the required format:
${this.parser.getFormatInstructions()}

Output ONLY the correctly formatted result.`;
  }

  /**
   * 获取格式指令
   * @returns {string} 格式指令
   */
  getFormatInstructions(): string {
    return this.parser.getFormatInstructions();
  }
}
