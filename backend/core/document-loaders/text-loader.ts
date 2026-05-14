/**
 * @module document-loaders/text-loader
 * @description 纯文本文件加载器
 *
 * 加载纯文本文件为文档对象。
 *
 * @example
 * ```typescript
 * const loader = new TextLoader('./example.txt');
 * const docs = await loader.load();
 * // => [{ content: '文件内容...', metadata: { source: './example.txt' } }]
 * ```
 */

import * as fs from 'fs';
import * as path from 'path';
import type { Document } from './types';
import { BaseDocumentLoader } from './splitters';

/**
 * 纯文本文件加载器
 *
 * 加载纯文本文件为文档，自动提取文件元数据（大小、创建/修改时间等）。
 */
export class TextLoader extends BaseDocumentLoader {
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
   * 加载文本文件
   * @returns 包含单个文档的数组
   * @throws {Error} 当文件不存在或读取失败时抛出异常
   */
  async load(): Promise<Document[]> {
    if (!fs.existsSync(this.filePath)) {
      throw new Error(`File not found: ${this.filePath}`);
    }

    const content = fs.readFileSync(this.filePath, this.encoding);
    const stat = fs.statSync(this.filePath);

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
        },
      },
    ];
  }
}
