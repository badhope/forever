/**
 * @module document-loaders/base-splitter
 * @description 文档加载器与文本分割器抽象基类
 *
 * 提供文档加载器和文本分割器的抽象基类：
 * - BaseDocumentLoader: 文档加载器抽象基类
 * - BaseTextSplitter: 文本分割器抽象基类
 */

import type { Document } from './types';

// ============================================================================
// 文档加载器抽象基类
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
   * @returns 加载的文档列表
   */
  abstract load(): Promise<Document[]>;

  /**
   * 加载并分割文档
   * @param splitter - 文本分割器
   * @returns 分割后的文档列表
   */
  async loadAndSplit(splitter?: BaseTextSplitter): Promise<Document[]> {
    const docs = await this.load();
    if (!splitter) return docs;
    return splitter.splitDocuments(docs);
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
   * @param text - 要分割的文本
   * @returns 分割后的文本块数组
   */
  abstract splitText(text: string): Promise<string[]>;

  /**
   * 分割文档列表
   * @param documents - 文档列表
   * @returns 分割后的文档列表
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
   * @param splits - 分割后的文本块
   * @param chunkSize - 块大小
   * @returns 合并后的文本块
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
