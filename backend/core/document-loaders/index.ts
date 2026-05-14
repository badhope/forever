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

// 类型导出
export type {
  Document,
  TextChunk,
  JSONLoaderConfig,
  CSVLoaderConfig,
  MarkdownHeading,
} from './types';

// 抽象基类和分割器导出
export {
  BaseDocumentLoader,
  BaseTextSplitter,
  RecursiveCharacterTextSplitter,
  TokenTextSplitter,
  MarkdownTextSplitter,
} from './splitters';

// 加载器导出
export { TextLoader } from './text-loader';
export { JSONLoader } from './json-loader';
export { MarkdownLoader } from './markdown-loader';
export { CSVLoader } from './csv-loader';
