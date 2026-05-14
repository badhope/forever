/**
 * @module document-loaders/markdown-loader
 * @description Markdown 文件加载器
 *
 * 加载 Markdown 文件，保留标题层级结构。
 *
 * @example
 * ```typescript
 * const loader = new MarkdownLoader('./README.md');
 * const docs = await loader.load();
 * ```
 */

import * as fs from 'fs';
import * as path from 'path';
import type { Document, MarkdownHeading } from './types';
import { BaseDocumentLoader } from './splitters';

/**
 * Markdown 文件加载器
 *
 * 加载 Markdown 文件，自动解析标题层级结构并附加到文档元数据中。
 */
export class MarkdownLoader extends BaseDocumentLoader {
  /** 文件路径 */
  private filePath: string;
  /** 文件编码 */
  private encoding: BufferEncoding;

  /**
   * @param filePath - 文件路径
   * @param encoding - 文件编码，默认 'utf-8'
   */
  constructor(filePath: string, encoding: BufferEncoding = 'utf-8') {
    super(filePath);
    this.filePath = filePath;
    this.encoding = encoding;
  }

  /**
   * 加载 Markdown 文件
   * @returns 包含单个文档的数组
   * @throws {Error} 当文件不存在或读取失败时抛出异常
   */
  async load(): Promise<Document[]> {
    if (!fs.existsSync(this.filePath)) {
      throw new Error(`File not found: ${this.filePath}`);
    }

    const content = fs.readFileSync(this.filePath, this.encoding);
    const stat = fs.statSync(this.filePath);

    // 解析标题层级
    const headings = this.parseHeadings(content);

    return [
      {
        content,
        metadata: {
          source: this.filePath,
          filename: path.basename(this.filePath),
          extension: path.extname(this.filePath),
          size: stat.size,
          created: stat.birthtime,
          modified: stat.mtime,
          headings,
        },
      },
    ];
  }

  /**
   * 解析 Markdown 标题层级
   * @param content - Markdown 内容
   * @returns 标题列表
   */
  private parseHeadings(content: string): MarkdownHeading[] {
    const headings: MarkdownHeading[] = [];
    const lines = content.split('\n');
    let currentHeading: MarkdownHeading | null = null;

    for (let i = 0; i < lines.length; i++) {
      const match = lines[i].match(/^(#{1,6})\s+(.+)$/);
      if (match) {
        // 保存前一个标题的内容
        if (currentHeading) {
          currentHeading.content = currentHeading.content.trimEnd();
        }

        const level = match[1].length;
        const title = match[2].trim();

        currentHeading = {
          level,
          title,
          content: '',
          startIndex: i,
        };

        headings.push(currentHeading);
      } else if (currentHeading) {
        currentHeading.content += lines[i] + '\n';
      }
    }

    // 保存最后一个标题的内容
    if (currentHeading) {
      currentHeading.content = currentHeading.content.trimEnd();
    }

    return headings;
  }
}
