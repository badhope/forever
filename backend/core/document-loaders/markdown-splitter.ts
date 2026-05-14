/**
 * @module document-loaders/markdown-splitter
 * @description Markdown 文本分割器
 *
 * 按 Markdown 标题层级分割文本，当标题分割后块仍过大时，
 * 回退使用递归字符分割器进一步分割。
 *
 * @example
 * ```typescript
 * const splitter = new MarkdownTextSplitter({
 *   splitByHeaders: true,
 *   maxHeaderLevel: 2,
 * });
 * const chunks = await splitter.splitText(markdownContent);
 * ```
 */

import { BaseTextSplitter } from './base-splitter';
import { RecursiveCharacterTextSplitter } from './recursive-splitter';

/**
 * Markdown 文本分割器
 * @class MarkdownTextSplitter
 * @extends BaseTextSplitter
 * @description 按 Markdown 标题层级分割文本
 */
export class MarkdownTextSplitter extends BaseTextSplitter {
  /** 是否按标题分割 */
  readonly splitByHeaders: boolean;
  /** 最大分割标题层级（1-6） */
  readonly maxHeaderLevel: number;
  /** 块大小（当标题分割后块仍过大时的后备分割大小） */
  readonly chunkSize: number;
  /** 块重叠大小 */
  readonly chunkOverlap: number;

  /**
   * @param options - 配置选项
   * @param options.splitByHeaders - 是否按标题分割，默认 true
   * @param options.maxHeaderLevel - 最大分割标题层级，默认 2
   * @param options.chunkSize - 后备块大小，默认 2000
   * @param options.chunkOverlap - 后备块重叠大小，默认 200
   */
  constructor(options: {
    splitByHeaders?: boolean;
    maxHeaderLevel?: number;
    chunkSize?: number;
    chunkOverlap?: number;
  } = {}) {
    super();
    this.splitByHeaders = options.splitByHeaders !== undefined ? options.splitByHeaders : true;
    this.maxHeaderLevel = options.maxHeaderLevel || 2;
    this.chunkSize = options.chunkSize || 2000;
    this.chunkOverlap = options.chunkOverlap || 200;
  }

  /**
   * 分割文本
   * @param text - Markdown 文本
   * @returns 分割后的文本块数组
   */
  async splitText(text: string): Promise<string[]> {
    if (!text || text.length === 0) return [];

    if (!this.splitByHeaders) {
      // 不按标题分割，使用递归字符分割作为后备
      const fallbackSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: this.chunkSize,
        chunkOverlap: this.chunkOverlap,
        separators: ['\n\n', '\n', '。', '.', ' ', ''],
      });
      return fallbackSplitter.splitText(text);
    }

    // 按标题分割
    const sections = this.splitByMarkdownHeaders(text);
    const chunks: string[] = [];

    for (const section of sections) {
      // 如果单个 section 仍然过大，进一步分割
      if (section.length > this.chunkSize) {
        const fallbackSplitter = new RecursiveCharacterTextSplitter({
          chunkSize: this.chunkSize,
          chunkOverlap: this.chunkOverlap,
          separators: ['\n\n', '\n', '。', '.', ' ', ''],
        });
        const subChunks = await fallbackSplitter.splitText(section);
        chunks.push(...subChunks);
      } else {
        chunks.push(section);
      }
    }

    return chunks;
  }

  /**
   * 按 Markdown 标题分割文本
   * @param text - Markdown 文本
   * @returns 分割后的文本块
   */
  private splitByMarkdownHeaders(text: string): string[] {
    const lines = text.split('\n');
    const sections: string[] = [];
    let currentSection: string[] = [];
    let currentHeaderLevel = 0;
    let hasContent = false;

    for (const line of lines) {
      const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);

      if (headerMatch) {
        const level = headerMatch[1].length;

        // 如果遇到同级或更高级标题，保存当前 section
        if (
          hasContent &&
          currentSection.length > 0 &&
          level <= this.maxHeaderLevel &&
          level <= currentHeaderLevel
        ) {
          const sectionText = currentSection.join('\n').trim();
          if (sectionText) {
            sections.push(sectionText);
          }
          currentSection = [];
          hasContent = false;
        }

        currentHeaderLevel = level;
        currentSection.push(line);
      } else {
        currentSection.push(line);
        if (line.trim().length > 0) {
          hasContent = true;
        }
      }
    }

    // 保存最后一个 section
    const lastSection = currentSection.join('\n').trim();
    if (lastSection) {
      sections.push(lastSection);
    }

    // 如果没有按标题分割成功（没有标题或标题层级不够），返回整个文本
    if (sections.length === 0) {
      return [text];
    }

    return sections;
  }
}
