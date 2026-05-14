/**
 * @module document-loaders/csv-loader
 * @description CSV 文件加载器
 *
 * 加载 CSV 文件，支持指定内容列和元数据列。
 *
 * @example
 * ```typescript
 * const loader = new CSVLoader('./data.csv', {
 *   contentColumn: 'text',
 *   metadataColumns: ['category', 'date'],
 * });
 * const docs = await loader.load();
 * ```
 */

import * as fs from 'fs';
import type { Document, CSVLoaderConfig } from './types';
import { BaseDocumentLoader } from './splitters';

/**
 * CSV 文件加载器
 *
 * 加载 CSV 文件，每行生成一个文档。
 * 支持自定义分隔符、内容列和元数据列。
 */
export class CSVLoader extends BaseDocumentLoader {
  /** 文件路径 */
  private filePath: string;
  /** 加载器配置 */
  private config: Required<CSVLoaderConfig>;

  /**
   * @param filePath - 文件路径
   * @param config - 加载器配置
   */
  constructor(filePath: string, config: CSVLoaderConfig = {}) {
    super(filePath);
    this.filePath = filePath;
    this.config = {
      separator: config.separator || ',',
      contentColumn: config.contentColumn || '',
      metadataColumns: config.metadataColumns || [],
      hasHeader: config.hasHeader !== undefined ? config.hasHeader : true,
      encoding: config.encoding || 'utf-8',
    };
  }

  /**
   * 加载 CSV 文件
   * @returns 文档列表（每行一个文档）
   * @throws {Error} 当文件不存在或读取失败时抛出异常
   */
  async load(): Promise<Document[]> {
    if (!fs.existsSync(this.filePath)) {
      throw new Error(`File not found: ${this.filePath}`);
    }

    const rawContent = fs.readFileSync(this.filePath, this.config.encoding);
    const lines = rawContent.split(/\r?\n/).filter((line) => line.trim().length > 0);

    if (lines.length === 0) return [];

    let headers: string[];
    let dataLines: string[];

    if (this.config.hasHeader) {
      headers = this.parseCSVLine(lines[0], this.config.separator);
      dataLines = lines.slice(1);
    } else {
      // 没有表头，使用列索引
      headers = lines.map((_, i) => `column_${i}`);
      dataLines = lines;
    }

    return dataLines.map((line, index) => {
      const values = this.parseCSVLine(line, this.config.separator);
      const row: Record<string, string> = {};

      for (let i = 0; i < headers.length; i++) {
        row[headers[i]] = values[i] || '';
      }

      // 确定内容字段
      let content: string;
      if (this.config.contentColumn && this.config.contentColumn in row) {
        content = row[this.config.contentColumn];
      } else {
        // 默认使用所有列的内容
        content = Object.values(row).join(' ');
      }

      // 构建元数据
      const metadata: Record<string, any> = {
        source: this.filePath,
        row: index + 1,
      };

      for (const key of this.config.metadataColumns) {
        if (key in row) {
          metadata[key] = row[key];
        }
      }

      return { content, metadata };
    });
  }

  /**
   * 解析单行 CSV（处理引号内的分隔符）
   * @param line - CSV 行
   * @param separator - 分隔符
   * @returns 字段值数组
   */
  private parseCSVLine(line: string, separator: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (inQuotes) {
        if (char === '"') {
          if (i + 1 < line.length && line[i + 1] === '"') {
            // 转义引号
            current += '"';
            i++;
          } else {
            inQuotes = false;
          }
        } else {
          current += char;
        }
      } else {
        if (char === '"') {
          inQuotes = true;
        } else if (char === separator) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
    }

    result.push(current.trim());
    return result;
  }
}
