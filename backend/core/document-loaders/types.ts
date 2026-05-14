/**
 * @module document-loaders/types
 * @description 文档加载器的类型定义
 *
 * 定义文档接口、文本分割块接口以及各加载器的配置接口。
 */

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
