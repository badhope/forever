/**
 * @module document-loaders/recursive-splitter
 * @description 递归字符文本分割器
 *
 * 按层级递归分割文本：段落 -> 句子 -> 单词 -> 字符
 *
 * @example
 * ```typescript
 * const splitter = new RecursiveCharacterTextSplitter({
 *   chunkSize: 1000,
 *   chunkOverlap: 200,
 *   separators: ['\n\n', '\n', '。', '.', ' ', ''],
 * });
 * const chunks = await splitter.splitText(longText);
 * ```
 */

import { BaseTextSplitter } from './base-splitter';

/**
 * 递归字符文本分割器
 * @class RecursiveCharacterTextSplitter
 * @extends BaseTextSplitter
 * @description 按层级递归分割文本：段落 -> 句子 -> 单词 -> 字符
 */
export class RecursiveCharacterTextSplitter extends BaseTextSplitter {
  /** 块大小 */
  readonly chunkSize: number;
  /** 块重叠大小 */
  readonly chunkOverlap: number;
  /** 分隔符列表（按优先级排序） */
  readonly separators: string[];
  /** 最小块大小 */
  readonly minChunkSize: number;

  /**
   * @param options - 配置选项
   * @param options.chunkSize - 块大小（字符数），默认 1000
   * @param options.chunkOverlap - 块重叠大小，默认 200
   * @param options.separators - 分隔符列表
   * @param options.minChunkSize - 最小块大小，默认 50
   * @param options.keepSeparator - 是否保留分隔符，默认 true
   */
  constructor(options: {
    chunkSize?: number;
    chunkOverlap?: number;
    separators?: string[];
    minChunkSize?: number;
    keepSeparator?: boolean;
  } = {}) {
    super();
    this.chunkSize = options.chunkSize || 1000;
    this.chunkOverlap = options.chunkOverlap || 200;
    this.separators = options.separators || ['\n\n', '\n', '。', '.', ' ', ''];
    this.minChunkSize = options.minChunkSize || 50;
    this.keepSeparator = options.keepSeparator !== undefined ? options.keepSeparator : true;

    if (this.chunkOverlap >= this.chunkSize) {
      throw new Error('chunkOverlap must be less than chunkSize');
    }
  }

  /**
   * 分割文本
   * @param text - 要分割的文本
   * @returns 分割后的文本块数组
   */
  async splitText(text: string): Promise<string[]> {
    if (!text || text.length === 0) return [];

    // 如果文本小于块大小，直接返回
    if (text.length <= this.chunkSize) {
      return [text];
    }

    return this.recursiveSplit(text, this.separators);
  }

  /**
   * 递归分割
   * @param text - 要分割的文本
   * @param separators - 当前层级的分隔符
   * @returns 分割后的文本块数组
   */
  private recursiveSplit(text: string, separators: string[]): string[] {
    // 最终分隔符：按字符强制分割
    if (separators.length === 0) {
      return this.splitByCharCount(text);
    }

    const [separator, ...restSeparators] = separators;

    // 空分隔符：按字符强制分割
    if (separator === '') {
      return this.splitByCharCount(text);
    }

    // 按当前分隔符分割
    const splits = text.split(separator);

    // 合并分割结果
    const merged: string[] = [];
    let currentChunk = '';

    for (const split of splits) {
      const separatorStr = this.keepSeparator ? separator : '';
      const newChunk = currentChunk
        ? currentChunk + separatorStr + split
        : split;

      if (newChunk.length <= this.chunkSize) {
        currentChunk = newChunk;
      } else {
        // 当前块已满
        if (currentChunk) {
          merged.push(currentChunk);
        }

        // 如果单个分割块仍然太大，递归使用下一级分隔符
        if (split.length > this.chunkSize) {
          const subSplits = this.recursiveSplit(split, restSeparators);
          for (const subSplit of subSplits) {
            if (subSplit.length <= this.chunkSize) {
              merged.push(subSplit);
            } else {
              // 最终回退：按字符数强制分割
              merged.push(...this.splitByCharCount(subSplit));
            }
          }
          currentChunk = '';
        } else {
          currentChunk = split;
        }
      }
    }

    if (currentChunk) {
      merged.push(currentChunk);
    }

    // 添加重叠
    return this.addOverlap(merged);
  }

  /**
   * 按字符数强制分割
   * @param text - 文本
   * @returns 分割后的文本块
   */
  private splitByCharCount(text: string): string[] {
    const chunks: string[] = [];
    for (let i = 0; i < text.length; i += this.chunkSize) {
      chunks.push(text.substring(i, i + this.chunkSize));
    }
    return chunks;
  }

  /**
   * 为分割块添加重叠
   * @param chunks - 分割块
   * @returns 带重叠的分割块
   */
  private addOverlap(chunks: string[]): string[] {
    if (this.chunkOverlap <= 0 || chunks.length <= 1) {
      return chunks;
    }

    const result: string[] = [];

    for (let i = 0; i < chunks.length; i++) {
      let chunk = chunks[i];

      // 从前一个块取重叠部分
      if (i > 0) {
        const prevChunk = chunks[i - 1];
        const overlapStart = Math.max(0, prevChunk.length - this.chunkOverlap);
        const overlap = prevChunk.substring(overlapStart);
        chunk = overlap + chunk;
      }

      result.push(chunk);
    }

    return result;
  }
}
