/**
 * @module document-loaders
 * @description 文档加载器与文本分割器（参考 LangChain Document Loaders + Text Splitters）
 *
 * 提供多种文档加载器和文本分割器，支持：
 * - 纯文本、JSON、Markdown、CSV 文件加载
 * - 递归字符分割（支持中文）
 * - Token 数量分割
 * - Markdown 标题层级分割
 * - 文档元数据管理
 */

import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// 接口与类型定义
// ============================================================================

/**
 * 文档接口
 * @interface Document
 */
export interface Document {
  /** 文档内容 */
  content: string;
  /** 文档元数据 */
  metadata: Record<string, any>;
  /** 文档页码（可选） */
  pageContent?: string;
}

/**
 * 文本分割块接口
 * @interface TextChunk
 */
export interface TextChunk {
  /** 分割后的文本内容 */
  text: string;
  /** 分割块的元数据 */
  metadata: Record<string, any>;
}

/**
 * JSON 加载器配置接口
 * @interface JSONLoaderConfig
 */
export interface JSONLoaderConfig {
  /** JSONPath 表达式（用于提取特定字段） */
  jsonPath?: string;
  /** 内容字段名（当 JSON 是对象数组时，指定哪个字段作为内容） */
  contentKey?: string;
  /** 元数据字段名列表 */
  metadataKeys?: string[];
  /** 是否将整个 JSON 作为内容 */
  isContent?: boolean;
}

/**
 * CSV 加载器配置接口
 * @interface CSVLoaderConfig
 */
export interface CSVLoaderConfig {
  /** 分隔符 */
  separator?: string;
  /** 内容列名 */
  contentColumn?: string;
  /** 元数据列名列表 */
  metadataColumns?: string[];
  /** 是否包含表头 */
  hasHeader?: boolean;
  /** 编码 */
  encoding?: BufferEncoding;
}

/**
 * Markdown 标题节点接口
 * @interface MarkdownHeading
 */
export interface MarkdownHeading {
  /** 标题层级（1-6） */
  level: number;
  /** 标题文本 */
  title: string;
  /** 标题下方的内容 */
  content: string;
  /** 在原文中的起始位置 */
  startIndex: number;
}

// ============================================================================
// 抽象基类
// ============================================================================

/**
 * 文档加载器抽象基类
 * @abstract
 * @class BaseDocumentLoader
 * @description 所有文档加载器的基类，定义核心加载接口
 */
export abstract class BaseDocumentLoader {
  /** 加载器来源标识 */
  source: string;

  constructor(source: string = 'unknown') {
    this.source = source;
  }

  /**
   * 加载文档
   * @returns {Promise<Document[]>} 加载的文档列表
   */
  abstract load(): Promise<Document[]>;

  /**
   * 加载并分割文档
   * @param {BaseTextSplitter} splitter - 文本分割器
   * @returns {Promise<Document[]>} 分割后的文档列表
   */
  async loadAndSplit(splitter?: BaseTextSplitter): Promise<Document[]> {
    const docs = await this.load();
    if (!splitter) return docs;
    return splitter.splitDocuments(docs);
  }
}

// ============================================================================
// 文本加载器
// ============================================================================

/**
 * 纯文本文件加载器
 * @class TextLoader
 * @extends BaseDocumentLoader
 * @description 加载纯文本文件为文档
 *
 * @example
 * ```typescript
 * const loader = new TextLoader('./example.txt');
 * const docs = await loader.load();
 * // => [{ content: '文件内容...', metadata: { source: './example.txt' } }]
 * ```
 */
export class TextLoader extends BaseDocumentLoader {
  /** 文件路径 */
  private filePath: string;
  /** 文件编码 */
  private encoding: BufferEncoding;

  /**
   * @param {string} filePath - 文件路径
   * @param {BufferEncoding} [encoding='utf-8'] - 文件编码
   */
  constructor(filePath: string, encoding: BufferEncoding = 'utf-8') {
    super(filePath);
    this.filePath = filePath;
    this.encoding = encoding;
  }

  /**
   * 加载文本文件
   * @returns {Promise<Document[]>} 包含单个文档的数组
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

// ============================================================================
// JSON 加载器
// ============================================================================

/**
 * JSON 文件加载器
 * @class JSONLoader
 * @extends BaseDocumentLoader
 * @description 加载 JSON 文件，支持 JSONPath 提取和字段映射
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
export class JSONLoader extends BaseDocumentLoader {
  /** 文件路径 */
  private filePath: string;
  /** 加载器配置 */
  private config: JSONLoaderConfig;
  /** 文件编码 */
  private encoding: BufferEncoding;

  /**
   * @param {string} filePath - 文件路径
   * @param {JSONLoaderConfig} [config] - 加载器配置
   * @param {BufferEncoding} [encoding='utf-8'] - 文件编码
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
   * @returns {Promise<Document[]>} 文档列表
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
   * @param {any[]} arr - 对象数组
   * @returns {Document[]} 文档列表
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
   * @param {any} obj - JSON 对象
   * @returns {Document[]} 包含单个文档的数组
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
   * @param {any} data - JSON 数据
   * @param {string} jsonPath - JSONPath 表达式
   * @returns {any} 提取的数据
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

// ============================================================================
// Markdown 加载器
// ============================================================================

/**
 * Markdown 文件加载器
 * @class MarkdownLoader
 * @extends BaseDocumentLoader
 * @description 加载 Markdown 文件，保留标题层级结构
 *
 * @example
 * ```typescript
 * const loader = new MarkdownLoader('./README.md');
 * const docs = await loader.load();
 * ```
 */
export class MarkdownLoader extends BaseDocumentLoader {
  /** 文件路径 */
  private filePath: string;
  /** 文件编码 */
  private encoding: BufferEncoding;

  /**
   * @param {string} filePath - 文件路径
   * @param {BufferEncoding} [encoding='utf-8'] - 文件编码
   */
  constructor(filePath: string, encoding: BufferEncoding = 'utf-8') {
    super(filePath);
    this.filePath = filePath;
    this.encoding = encoding;
  }

  /**
   * 加载 Markdown 文件
   * @returns {Promise<Document[]>} 包含单个文档的数组
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
   * @param {string} content - Markdown 内容
   * @returns {MarkdownHeading[]} 标题列表
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

// ============================================================================
// CSV 加载器
// ============================================================================

/**
 * CSV 文件加载器
 * @class CSVLoader
 * @extends BaseDocumentLoader
 * @description 加载 CSV 文件，支持指定内容列和元数据列
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
export class CSVLoader extends BaseDocumentLoader {
  /** 文件路径 */
  private filePath: string;
  /** 加载器配置 */
  private config: Required<CSVLoaderConfig>;

  /**
   * @param {string} filePath - 文件路径
   * @param {CSVLoaderConfig} [config] - 加载器配置
   */
  constructor(filePath: string, config: CSVLoaderConfig = {}) {
    super(filePath);
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
   * @returns {Promise<Document[]>} 文档列表（每行一个文档）
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
      headers = dataLines.map((_, i) => `column_${i}`);
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
   * @param {string} line - CSV 行
   * @param {string} separator - 分隔符
   * @returns {string[]} 字段值数组
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

// ============================================================================
// 文本分割器抽象基类
// ============================================================================

/**
 * 文本分割器抽象基类
 * @abstract
 * @class BaseTextSplitter
 * @description 所有文本分割器的基类
 */
export abstract class BaseTextSplitter {
  /** 是否保留分隔符 */
  keepSeparator: boolean = true;

  /**
   * 分割文本
   * @param {string} text - 要分割的文本
   * @returns {Promise<string[]>} 分割后的文本块数组
   */
  abstract splitText(text: string): Promise<string[]>;

  /**
   * 分割文档列表
   * @param {Document[]} documents - 文档列表
   * @returns {Promise<Document[]>} 分割后的文档列表
   */
  async splitDocuments(documents: Document[]): Promise<Document[]> {
    const result: Document[] = [];

    for (const doc of documents) {
      const chunks = await this.splitText(doc.content);

      for (let i = 0; i < chunks.length; i++) {
        result.push({
          content: chunks[i],
          metadata: {
            ...doc.metadata,
            chunkIndex: i,
            chunkTotal: chunks.length,
          },
        });
      }
    }

    return result;
  }

  /**
   * 合并小块文本
   * @param {string[]} splits - 分割后的文本块
   * @param {number} chunkSize - 块大小
   * @returns {string[]} 合并后的文本块
   */
  protected mergeSplits(splits: string[], chunkSize: number): string[] {
    const merged: string[] = [];
    let currentChunk = '';

    for (const split of splits) {
      if (currentChunk.length + split.length > chunkSize && currentChunk.length > 0) {
        merged.push(currentChunk.trim());
        currentChunk = split;
      } else {
        currentChunk += split;
      }
    }

    if (currentChunk.trim().length > 0) {
      merged.push(currentChunk.trim());
    }

    return merged;
  }
}

// ============================================================================
// 递归字符文本分割器
// ============================================================================

/**
 * 递归字符文本分割器
 * @class RecursiveCharacterTextSplitter
 * @extends BaseTextSplitter
 * @description 按层级递归分割文本：段落 -> 句子 -> 单词 -> 字符
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
   * @param {object} options - 配置选项
   * @param {number} [options.chunkSize=1000] - 块大小（字符数）
   * @param {number} [options.chunkOverlap=200] - 块重叠大小
   * @param {string[]} [options.separators] - 分隔符列表
   * @param {number} [options.minChunkSize=50] - 最小块大小
   * @param {boolean} [options.keepSeparator=true] - 是否保留分隔符
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
   * @param {string} text - 要分割的文本
   * @returns {Promise<string[]>} 分割后的文本块数组
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
   * @param {string} text - 要分割的文本
   * @param {string[]} separators - 当前层级的分隔符
   * @returns {string[]} 分割后的文本块数组
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
   * @param {string} text - 文本
   * @returns {string[]} 分割后的文本块
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
   * @param {string[]} chunks - 分割块
   * @returns {string[]} 带重叠的分割块
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

// ============================================================================
// Token 文本分割器
// ============================================================================

/**
 * Token 文本分割器
 * @class TokenTextSplitter
 * @extends BaseTextSplitter
 * @description 按 Token 数量分割文本（使用简单估算）
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
export class TokenTextSplitter extends BaseTextSplitter {
  /** 块大小（Token 数） */
  readonly chunkSize: number;
  /** 块重叠大小（Token 数） */
  readonly chunkOverlap: number;
  /** 编码方式 */
  readonly encodingName: string;

  /**
   * @param {object} options - 配置选项
   * @param {number} [options.chunkSize=500] - 块大小（Token 数）
   * @param {number} [options.chunkOverlap=50] - 块重叠大小
   * @param {string} [options.encodingName='cl100k_base'] - Token 编码方式名称
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
   * @param {string} text - 文本
   * @returns {number} 估算的 Token 数
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
   * @param {string} text - 文本
   * @param {number} targetTokens - 目标 Token 数
   * @returns {number} 对应的字符位置
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
   * @param {string} text - 要分割的文本
   * @returns {Promise<string[]>} 分割后的文本块数组
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
   * @param {string[]} chunks - 分割块
   * @returns {string[]} 带重叠的分割块
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

// ============================================================================
// Markdown 文本分割器
// ============================================================================

/**
 * Markdown 文本分割器
 * @class MarkdownTextSplitter
 * @extends BaseTextSplitter
 * @description 按 Markdown 标题层级分割文本
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
   * @param {object} options - 配置选项
   * @param {boolean} [options.splitByHeaders=true] - 是否按标题分割
   * @param {number} [options.maxHeaderLevel=2] - 最大分割标题层级
   * @param {number} [options.chunkSize=2000] - 后备块大小
   * @param {number} [options.chunkOverlap=200] - 后备块重叠大小
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
   * @param {string} text - Markdown 文本
   * @returns {Promise<string[]>} 分割后的文本块数组
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
   * @param {string} text - Markdown 文本
   * @returns {string[]} 分割后的文本块
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
