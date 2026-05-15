/**
 * @module rag
 * @description RAG (Retrieval-Augmented Generation) 管线
 *
 * 端到端 RAG 实现：
 * 1. 文档加载 → 文本分割 → Embedding → 向量存储（索引阶段）
 * 2. 用户查询 → Embedding → 向量检索 → 上下文组装 → LLM 生成（查询阶段）
 */

import type { EmbeddingConfig } from '../embedding/index';
import { embedText, embedTexts } from '../embedding/index';
import type { BaseVectorStore, MetadataFilter } from '../vector-store/index';
import type { ChatMessage, LLMConfig } from '../llm/types';
import { chat } from '../llm/index';
import { TextLoader, JSONLoader, MarkdownLoader, CSVLoader } from '../document-loaders/index';
import { RecursiveCharacterTextSplitter, TokenTextSplitter } from '../document-loaders/index';
import { logger } from '../logger';

// ============================================================================
// 类型定义
// ============================================================================

export interface DocumentChunk {
  /** 文本内容 */
  content: string;
  /** 来源文件名 */
  source: string;
  /** 在原文中的偏移量 */
  offset?: number;
  /** 元数据 */
  metadata: Record<string, any>;
}

export interface RAGConfig {
  /** Embedding 配置 */
  embeddingConfig: EmbeddingConfig;
  /** LLM 配置 */
  llmConfig: LLMConfig;
  /** 向量存储 */
  vectorStore: BaseVectorStore;
  /** 文本分割 chunk 大小（字符数） */
  chunkSize?: number;
  /** 文本分割 chunk 重叠（字符数） */
  chunkOverlap?: number;
  /** 检索返回的文档数量 */
  topK?: number;
  /** 检索相似度阈值 */
  similarityThreshold?: number;
}

export interface RAGQueryOptions {
  /** 返回文档数量（覆盖默认） */
  topK?: number;
  /** 相似度阈值（覆盖默认） */
  similarityThreshold?: number;
  /** 元数据过滤 */
  filter?: MetadataFilter;
  /** 自定义系统提示 */
  systemPrompt?: string;
}

export interface RAGResult {
  /** 生成的回答 */
  answer: string;
  /** 检索到的相关文档 */
  retrievedDocs: DocumentChunk[];
  /** 检索分数 */
  scores: number[];
}

// ============================================================================
// RAG 管线
// ============================================================================

const log = logger.createModule('rag');

/**
 * RAG 管线
 *
 * 提供文档索引和查询检索增强生成的完整实现。
 *
 * @example
 * ```typescript
 * const rag = new RAGPipeline({
 *   embeddingConfig: { provider: 'openai', apiKey: 'sk-xxx' },
 *   llmConfig: { provider: 'openai', apiKey: 'sk-xxx' },
 *   vectorStore: new InMemoryVectorStore(),
 * });
 *
 * // 索引文档
 * await rag.indexFiles(['./docs/readme.md', './docs/api.json']);
 *
 * // 查询
 * const result = await rag.query('如何使用这个 API？');
 * console.log(result.answer);
 * ```
 */
export class RAGPipeline {
  private config: Required<Pick<RAGConfig, 'chunkSize' | 'chunkOverlap' | 'topK' | 'similarityThreshold'>> & RAGConfig;
  private splitter: RecursiveCharacterTextSplitter;

  constructor(config: RAGConfig) {
    this.config = {
      ...config,
      chunkSize: config.chunkSize ?? 500,
      chunkOverlap: config.chunkOverlap ?? 50,
      topK: config.topK ?? 5,
      similarityThreshold: config.similarityThreshold ?? 0.3,
    };
    this.splitter = new RecursiveCharacterTextSplitter({
      chunkSize: this.config.chunkSize,
      chunkOverlap: this.config.chunkOverlap,
    });
  }

  // ============================================================================
  // 索引阶段
  // ============================================================================

  /**
   * 索引单个文本
   *
   * @param text - 文本内容
   * @param source - 来源标识
   * @param metadata - 附加元数据
   */
  async indexText(
    text: string,
    source: string,
    metadata: Record<string, any> = {},
  ): Promise<void> {
    log.info('indexText', `索引文本: ${source}, 长度: ${text.length}`);

    // 分割文本
    const chunks = this.splitter.splitText(text);

    // 生成 Embedding
    const embeddings = await embedTexts(
      chunks.map(c => c.content),
      this.config.embeddingConfig,
    );

    // 存入向量数据库
    const ids = await this.config.vectorStore.addVectors(
      embeddings,
      chunks.map((chunk, i) => ({
        content: chunk.content,
        metadata: {
          source,
          chunkIndex: i,
          totalChunks: chunks.length,
          ...metadata,
        },
      })),
    );

    log.info('indexText', `完成索引: ${source}, ${chunks.length} 个分块, ${ids.length} 个向量`);
  }

  /**
   * 索引文件
   *
   * 根据文件扩展名自动选择加载器。
   *
   * @param filePaths - 文件路径列表
   */
  async indexFiles(filePaths: string[]): Promise<void> {
    for (const filePath of filePaths) {
      try {
        const content = await this.loadFile(filePath);
        await this.indexText(content, filePath);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        log.error('indexFiles', `索引文件失败: ${filePath}, 错误: ${errorMessage}`);
      }
    }
  }

  /**
   * 索引文档块列表
   *
   * @param chunks - 预分割的文档块
   */
  async indexChunks(chunks: DocumentChunk[]): Promise<void> {
    if (chunks.length === 0) return;

    const embeddings = await embedTexts(
      chunks.map(c => c.content),
      this.config.embeddingConfig,
    );

    await this.config.vectorStore.addVectors(
      embeddings,
      chunks.map(chunk => ({
        content: chunk.content,
        metadata: chunk.metadata,
      })),
    );

    log.info('indexChunks', `索引 ${chunks.length} 个文档块`);
  }

  // ============================================================================
  // 查询阶段
  // ============================================================================

  /**
   * RAG 查询
   *
   * 将用户查询转为向量 → 检索相关文档 → 组装上下文 → LLM 生成回答。
   *
   * @param query - 用户查询
   * @param options - 查询选项
   * @returns RAG 结果（回答 + 检索文档 + 分数）
   */
  async query(query: string, options: RAGQueryOptions = {}): Promise<RAGResult> {
    const topK = options.topK ?? this.config.topK;
    const threshold = options.similarityThreshold ?? this.config.similarityThreshold;

    log.info('query', `查询: "${query.slice(0, 50)}...", topK: ${topK}`);

    // 1. 查询向量化
    const queryEmbedding = await embedText(query, this.config.embeddingConfig);

    // 2. 向量检索
    const searchResults = await this.config.vectorStore.search(queryEmbedding, {
      topK,
      filter: options.filter,
    });

    // 3. 过滤低分结果
    const filtered = searchResults.filter(r => r.score >= threshold);
    const retrievedDocs: DocumentChunk[] = filtered.map(r => ({
      content: r.document.content,
      source: r.document.metadata?.source ?? 'unknown',
      metadata: r.document.metadata ?? {},
    }));
    const scores = filtered.map(r => r.score);

    if (retrievedDocs.length === 0) {
      log.warn('query', '未检索到相关文档，使用纯 LLM 回答');
      const answer = await this.generateWithoutContext(query, options.systemPrompt);
      return { answer, retrievedDocs: [], scores: [] };
    }

    // 4. 组装上下文
    const context = retrievedDocs
      .map((doc, i) => `[文档 ${i + 1}] (来源: ${doc.source})\n${doc.content}`)
      .join('\n\n---\n\n');

    // 5. LLM 生成
    const systemPrompt = options.systemPrompt || this.buildRAGSystemPrompt(context);
    const answer = await this.generateWithRAG(query, systemPrompt);

    log.info('query', `完成查询, 检索 ${retrievedDocs.length} 个文档`);

    return { answer, retrievedDocs, scores };
  }

  /**
   * 仅检索（不生成回答）
   *
   * @param query - 用户查询
   * @param topK - 返回数量
   * @returns 检索到的文档和分数
   */
  async retrieve(
    query: string,
    topK?: number,
  ): Promise<{ docs: DocumentChunk[]; scores: number[] }> {
    const k = topK ?? this.config.topK;
    const queryEmbedding = await embedText(query, this.config.embeddingConfig);
    const results = await this.config.vectorStore.search(queryEmbedding, { topK: k });

    return {
      docs: results.map(r => ({
        content: r.document.content,
        source: r.document.metadata?.source ?? 'unknown',
        metadata: r.document.metadata ?? {},
      })),
      scores: results.map(r => r.score),
    };
  }

  // ============================================================================
  // 内部方法
  // ============================================================================

  /**
   * 加载文件内容
   */
  private async loadFile(filePath: string): Promise<string> {
    const ext = filePath.split('.').pop()?.toLowerCase();

    switch (ext) {
      case 'json': {
        const loader = new JSONLoader(filePath);
        const docs = await loader.load();
        return docs.map(d => d.content).join('\n\n');
      }
      case 'md':
      case 'markdown': {
        const loader = new MarkdownLoader(filePath);
        const docs = await loader.load();
        return docs.map(d => d.content).join('\n\n');
      }
      case 'csv': {
        const loader = new CSVLoader(filePath);
        const docs = await loader.load();
        return docs.map(d => d.content).join('\n\n');
      }
      default: {
        const loader = new TextLoader(filePath);
        const docs = await loader.load();
        return docs.map(d => d.content).join('\n\n');
      }
    }
  }

  /**
   * 构建 RAG 系统提示
   */
  private buildRAGSystemPrompt(context: string): string {
    return [
      '你是一个知识助手。请基于以下检索到的文档内容回答用户问题。',
      '',
      '规则：',
      '1. 仅基于提供的文档内容回答，不要编造信息',
      '2. 如果文档中没有相关信息，请明确说明',
      '3. 引用文档来源时，标注文档编号',
      '4. 回答应准确、完整、有条理',
      '',
      '参考文档：',
      context,
    ].join('\n');
  }

  /**
   * 带上下文的 LLM 生成
   */
  private async generateWithRAG(query: string, systemPrompt: string): Promise<string> {
    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: query },
    ];
    const response = await chat(messages, this.config.llmConfig);
    return response.content;
  }

  /**
   * 无上下文的 LLM 生成
   */
  private async generateWithoutContext(query: string, systemPrompt?: string): Promise<string> {
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: systemPrompt || '你是一个有帮助的 AI 助手。请基于你的知识回答问题，并说明这并非来自检索文档。',
      },
      { role: 'user', content: query },
    ];
    const response = await chat(messages, this.config.llmConfig);
    return response.content;
  }
}
