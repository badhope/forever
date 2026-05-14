/**
 * @module document-loaders/token-splitter
 * @description Token 文本分割器
 *
 * 按 Token 数量分割文本（使用简单估算）。
 * 支持中英文混合文本的 Token 估算。
 *
 * @example
 * ```typescript
 * const splitter = new TokenTextSplitter({
 *   chunkSize: 500,
 *   chunkOverlap: 50,
 * });
 * const chunks = await splitter.splitText(longText);
 * ```
 */

import { BaseTextSplitter } from './base-splitter';

/**
 * Token 文本分割器
 * @class TokenTextSplitter
 * @extends BaseTextSplitter
 * @description 按 Token 数量分割文本（使用简单估算）
 */
export class TokenTextSplitter extends BaseTextSplitter {
  /** 块大小（Token 数） */
  readonly chunkSize: number;
  /** 块重叠大小（Token 数） */
  readonly chunkOverlap: number;
  /** 编码方式 */
  readonly encodingName: string;

  /**
   * @param options - 配置选项
   * @param options.chunkSize - 块大小（Token 数），默认 500
   * @param options.chunkOverlap - 块重叠大小，默认 50
   * @param options.encodingName - Token 编码方式名称，默认 'cl100k_base'
   */
  constructor(options: {
    chunkSize?: number;
    chunkOverlap?: number;
    encodingName?: string;
  } = {}) {
    super();
    this.chunkSize = options.chunkSize || 500;
    this.chunkOverlap = options.chunkOverlap || 50;
    this.encodingName = options.encodingName || 'cl100k_base';

    if (this.chunkOverlap >= this.chunkSize) {
      throw new Error('chunkOverlap must be less than chunkSize');
    }
  }

  /**
   * 估算文本的 Token 数量
   * @description 使用简单的启发式方法估算：
   * - 英文：约 4 个字符 = 1 个 token
   * - 中文：约 1.5 个字符 = 1 个 token
   * @param text - 文本
   * @returns 估算的 Token 数
   */
  estimateTokens(text: string): number {
    if (!text) return 0;

    let tokenCount = 0;
    for (const char of text) {
      const code = char.charCodeAt(0);
      // 中文字符、日文字符、韩文字符等 CJK 字符
      if (code >= 0x4e00 && code <= 0x9fff) {
        tokenCount += 0.67; // 约 1.5 个字符 = 1 个 token
      } else if (code >= 0x3040 && code <= 0x30ff) {
        // 日文假名
        tokenCount += 0.67;
      } else if (code >= 0xac00 && code <= 0xd7af) {
        // 韩文
        tokenCount += 0.67;
      } else {
        tokenCount += 0.25; // 约 4 个字符 = 1 个 token
      }
    }

    return Math.ceil(tokenCount);
  }

  /**
   * 按字符位置查找 Token 边界
   * @param text - 文本
   * @param targetTokens - 目标 Token 数
   * @returns 对应的字符位置
   */
  private findTokenBoundary(text: string, targetTokens: number): number {
    let tokenCount = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const code = char.charCodeAt(0);

      if (code >= 0x4e00 && code <= 0x9fff) {
        tokenCount += 0.67;
      } else if (code >= 0x3040 && code <= 0x30ff) {
        tokenCount += 0.67;
      } else if (code >= 0xac00 && code <= 0xd7af) {
        tokenCount += 0.67;
      } else {
        tokenCount += 0.25;
      }

      if (tokenCount >= targetTokens) {
        return i + 1;
      }
    }

    return text.length;
  }

  /**
   * 分割文本
   * @param text - 要分割的文本
   * @returns 分割后的文本块数组
   */
  async splitText(text: string): Promise<string[]> {
    if (!text || text.length === 0) return [];

    const totalTokens = this.estimateTokens(text);

    if (totalTokens <= this.chunkSize) {
      return [text];
    }

    const chunks: string[] = [];
    let remaining = text;

    while (remaining.length > 0) {
      const remainingTokens = this.estimateTokens(remaining);

      if (remainingTokens <= this.chunkSize) {
        chunks.push(remaining);
        break;
      }

      // 在块大小处找到字符边界
      const chunkEndChar = this.findTokenBoundary(remaining, this.chunkSize);

      // 尝试在句子或段落边界处分割
      let splitPoint = chunkEndChar;
      const searchRange = remaining.substring(0, chunkEndChar);

      // 优先在段落边界分割
      const paragraphBreak = searchRange.lastIndexOf('\n\n');
      if (paragraphBreak > this.chunkSize * 0.3) {
        splitPoint = paragraphBreak + 2;
      } else {
        // 其次在换行符处分割
        const lineBreak = searchRange.lastIndexOf('\n');
        if (lineBreak > this.chunkSize * 0.3) {
          splitPoint = lineBreak + 1;
        } else {
          // 最后在句号处分割
          const sentenceBreak = Math.max(
            searchRange.lastIndexOf('。'),
            searchRange.lastIndexOf('.'),
            searchRange.lastIndexOf('！'),
            searchRange.lastIndexOf('？'),
            searchRange.lastIndexOf('!'),
            searchRange.lastIndexOf('?')
          );
          if (sentenceBreak > this.chunkSize * 0.3) {
            splitPoint = sentenceBreak + 1;
          }
        }
      }

      chunks.push(remaining.substring(0, splitPoint).trim());
      remaining = remaining.substring(splitPoint).trim();
    }

    // 添加重叠
    return this.addTokenOverlap(chunks);
  }

  /**
   * 为分割块添加 Token 级别的重叠
   * @param chunks - 分割块
   * @returns 带重叠的分割块
   */
  private addTokenOverlap(chunks: string[]): string[] {
    if (this.chunkOverlap <= 0 || chunks.length <= 1) {
      return chunks;
    }

    const result: string[] = [];

    for (let i = 0; i < chunks.length; i++) {
      let chunk = chunks[i];

      if (i > 0) {
        const prevChunk = chunks[i - 1];
        const overlapCharStart = this.findTokenBoundary(
          prevChunk,
          this.estimateTokens(prevChunk) - this.chunkOverlap
        );
        const overlap = prevChunk.substring(overlapCharStart);
        chunk = overlap + chunk;
      }

      result.push(chunk);
    }

    return result;
  }
}
