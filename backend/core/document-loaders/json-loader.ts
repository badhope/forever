/**
 * @module document-loaders/json-loader
 * @description JSON 文件加载器
 *
 * 加载 JSON 文件，支持 JSONPath 提取和字段映射。
 *
 * @example
 * ```typescript
 * // 加载整个 JSON
 * const loader1 = new JSONLoader('./data.json');
 *
 * // 加载 JSON 数组，指定内容字段和元数据字段
 * const loader2 = new JSONLoader('./data.json', {
 *   contentKey: 'text',
 *   metadataKeys: ['title', 'author'],
 * });
 * ```
 */

import * as fs from 'fs';
import type { Document, JSONLoaderConfig } from './types';
import { BaseDocumentLoader } from './splitters';

/**
 * JSON 文件加载器
 *
 * 支持加载单个 JSON 对象或 JSON 数组，
 * 可通过 JSONPath 提取特定字段，支持字段映射为文档内容和元数据。
 */
export class JSONLoader extends BaseDocumentLoader {
  /** 文件路径 */
  private filePath: string;
  /** 加载器配置 */
  private config: JSONLoaderConfig;
  /** 文件编码 */
  private encoding: BufferEncoding;

  /**
   * @param filePath - 文件路径
   * @param config - 加载器配置
   * @param encoding - 文件编码，默认 'utf-8'
   */
  constructor(
    filePath: string,
    config: JSONLoaderConfig = {},
    encoding: BufferEncoding = 'utf-8'
  ) {
    super(filePath);
    this.filePath = filePath;
    this.config = {
      contentKey: config.contentKey,
      metadataKeys: config.metadataKeys || [],
      isContent: config.isContent !== undefined ? config.isContent : true,
      jsonPath: config.jsonPath,
    };
    this.encoding = encoding;
  }

  /**
   * 加载 JSON 文件
   * @returns 文档列表
   * @throws {Error} 当文件读取或 JSON 解析失败时抛出异常
   */
  async load(): Promise<Document[]> {
    if (!fs.existsSync(this.filePath)) {
      throw new Error(`File not found: ${this.filePath}`);
    }

    const rawContent = fs.readFileSync(this.filePath, this.encoding);
    let data: any;

    try {
      data = JSON.parse(rawContent);
    } catch (error) {
      throw new Error(`Failed to parse JSON from ${this.filePath}: ${error}`);
    }

    // 如果配置了 JSONPath，提取对应字段
    if (this.config.jsonPath) {
      data = this.extractByPath(data, this.config.jsonPath);
    }

    // 如果配置了 isContent=false 且有 contentKey，按对象数组处理
    if (Array.isArray(data)) {
      return this.loadArray(data);
    }

    // 单个对象
    return this.loadObject(data);
  }

  /**
   * 加载对象数组
   * @param arr - 对象数组
   * @returns 文档列表
   */
  private loadArray(arr: any[]): Document[] {
    return arr.map((item, index) => {
      if (typeof item === 'string') {
        return {
          content: item,
          metadata: {
            source: this.filePath,
            index,
          },
        };
      }

      if (typeof item === 'object' && item !== null) {
        const contentKey = this.config.contentKey;
        let content: string;

        if (contentKey && contentKey in item) {
          content = typeof item[contentKey] === 'string'
            ? item[contentKey]
            : JSON.stringify(item[contentKey]);
        } else {
          content = JSON.stringify(item);
        }

        const metadata: Record<string, any> = {
          source: this.filePath,
          index,
        };

        for (const key of this.config.metadataKeys) {
          if (key in item) {
            metadata[key] = item[key];
          }
        }

        return { content, metadata };
      }

      return {
        content: String(item),
        metadata: { source: this.filePath, index },
      };
    });
  }

  /**
   * 加载单个对象
   * @param obj - JSON 对象
   * @returns 包含单个文档的数组
   */
  private loadObject(obj: any): Document[] {
    const content = JSON.stringify(obj, null, 2);
    const metadata: Record<string, any> = {
      source: this.filePath,
    };

    for (const key of this.config.metadataKeys) {
      if (key in obj) {
        metadata[key] = obj[key];
      }
    }

    return [{ content, metadata }];
  }

  /**
   * 简单 JSONPath 提取（支持点号分隔路径）
   * @param data - JSON 数据
   * @param jsonPath - JSONPath 表达式
   * @returns 提取的数据
   */
  private extractByPath(data: any, jsonPath: string): any {
    const parts = jsonPath.replace(/^\$\.?/, '').split('.');
    let current = data;

    for (const part of parts) {
      if (current === null || current === undefined) return null;

      // 支持数组索引，如 items[0]
      const arrayMatch = part.match(/^(\w+)\[(\d+)\]$/);
      if (arrayMatch) {
        const [, key, index] = arrayMatch;
        current = current[key];
        if (Array.isArray(current)) {
          current = current[parseInt(index, 10)];
        }
      } else {
        current = current[part];
      }
    }

    return current;
  }
}
