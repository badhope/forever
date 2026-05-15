/**
 * @module vector-store/qdrant
 * @description Qdrant 向量数据库适配器
 *
 * 通过 HTTP API 连接 Qdrant，支持持久化向量存储。
 * 适用于生产环境的 RAG 和语义搜索场景。
 */

import type { BaseVectorStore, Embedding, VectorStoreConfig, MetadataFilter } from './types';
import { matchesFilter } from './similarity';
import { logger } from '../logger';

const log = logger.createModule('vector-store:qdrant');

interface QdrantPoint {
  id: string;
  vector: number[];
  payload: {
    content: string;
    metadata: Record<string, any>;
  };
}

interface QdrantSearchResult {
  id: string;
  score: number;
  payload: {
    content: string;
    metadata: Record<string, any>;
  };
}

interface QdrantCollectionInfo {
  vectors_count: number;
  status: string;
}

/**
 * Qdrant 向量存储适配器
 *
 * 通过 REST API 与 Qdrant 交互，无需额外 SDK 依赖。
 *
 * @example
 * ```typescript
 * const store = new QdrantVectorStore({
 *   url: 'http://localhost:6333',
 *   collectionName: 'my-documents',
 *   dimension: 1536,
 * });
 * await store.initialize();
 * await store.addVectors([[0.1, 0.2, ...]], [{ content: 'hello', metadata: {} }]);
 * const results = await store.search([0.1, 0.2, ...], { topK: 5 });
 * ```
 */
export class QdrantVectorStore implements BaseVectorStore {
  private url: string;
  private collectionName: string;
  private dimension: number;
  private initialized = false;

  constructor(config: VectorStoreConfig & {
    /** Qdrant 服务 URL（默认 http://localhost:6333） */
    url?: string;
    /** 集合名称（默认 'forever_documents'） */
    collectionName?: string;
  }) {
    this.url = config.url || 'http://localhost:6333';
    this.collectionName = config.collectionName || 'forever_documents';
    this.dimension = config.dimension || 1536;
  }

  /**
   * 初始化：创建集合（如果不存在）
   */
  async initialize(): Promise<void> {
    try {
      const exists = await this.collectionExists();
      if (!exists) {
        await this.createCollection();
        log.info('initialize', `创建集合: ${this.collectionName}, 维度: ${this.dimension}`);
      }
      this.initialized = true;
      log.info('initialize', `Qdrant 初始化完成: ${this.collectionName}`);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      throw new Error(`Qdrant 初始化失败: ${msg}`);
    }
  }

  async addVector(vector: Embedding, document: { content: string; metadata?: Record<string, any> }): Promise<string> {
    const id = this.generateId();
    await this.upsertPoints([{ id, vector, content: document.content, metadata: document.metadata || {} }]);
    return id;
  }

  async addVectors(vectors: Embedding[], documents: Array<{ content: string; metadata?: Record<string, any> }>): Promise<string[]> {
    const points = vectors.map((vector, i) => ({
      id: this.generateId(i),
      vector,
      content: documents[i]?.content || '',
      metadata: documents[i]?.metadata || {},
    }));
    await this.upsertPoints(points);
    return points.map(p => p.id);
  }

  async search(query: Embedding, options?: { topK?: number; filter?: MetadataFilter }): Promise<Array<{ document: { content: string; metadata?: Record<string, any> }; score: number }>> {
    const topK = options?.topK || 5;

    const body: Record<string, any> = {
      vector: query,
      limit: topK,
      with_payload: true,
    };

    // Qdrant filter 转换
    if (options?.filter) {
      body.filter = this.convertFilter(options.filter);
    }

    const response = await fetch(
      `${this.url}/collections/${this.collectionName}/points/search`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      },
    );

    if (!response.ok) {
      throw new Error(`Qdrant 搜索失败: ${response.status}`);
    }

    const data = await response.json() as { result: QdrantSearchResult[] };

    return (data.result || []).map(item => ({
      document: {
        content: item.payload?.content || '',
        metadata: item.payload?.metadata || {},
      },
      score: item.score,
    }));
  }

  async delete(ids: string[]): Promise<void> {
    const response = await fetch(
      `${this.url}/collections/${this.collectionName}/points/delete`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ points: ids }),
      },
    );
    if (!response.ok) {
      throw new Error(`Qdrant 删除失败: ${response.status}`);
    }
  }

  async clear(): Promise<void> {
    // 删除并重建集合
    await fetch(
      `${this.url}/collections/${this.collectionName}`,
      { method: 'DELETE' },
    );
    await this.createCollection();
  }

  async size(): Promise<number> {
    const response = await fetch(
      `${this.url}/collections/${this.collectionName}`,
    );
    if (!response.ok) return 0;
    const data = await response.json() as { result: QdrantCollectionInfo };
    return data.result?.vectors_count || 0;
  }

  // ============================================================================
  // 内部方法
  // ============================================================================

  private async collectionExists(): Promise<boolean> {
    const response = await fetch(`${this.url}/collections/${this.collectionName}`);
    return response.ok;
  }

  private async createCollection(): Promise<void> {
    const response = await fetch(
      `${this.url}/collections/${this.collectionName}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vectors: {
            size: this.dimension,
            distance: 'Cosine',
          },
        }),
      },
    );
    if (!response.ok) {
      throw new Error(`创建 Qdrant 集合失败: ${response.status}`);
    }
  }

  private async upsertPoints(points: Array<{ id: string; vector: number[]; content: string; metadata: Record<string, any> }>): Promise<void> {
    const response = await fetch(
      `${this.url}/collections/${this.collectionName}/points`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          points: points.map(p => ({
            id: p.id,
            vector: p.vector,
            payload: {
              content: p.content,
              metadata: p.metadata,
            },
          })),
        }),
      },
    );
    if (!response.ok) {
      throw new Error(`Qdrant upsert 失败: ${response.status}`);
    }
  }

  private generateId(index?: number): string {
    return `forever_${Date.now()}_${index ?? Math.random().toString(36).slice(2)}`;
  }

  /**
   * 将 MetadataFilter 转换为 Qdrant filter 格式
   */
  private convertFilter(filter: MetadataFilter): any {
    const must: any[] = [];

    if (filter.equals) {
      for (const [key, value] of Object.entries(filter.equals)) {
        must.push({ key: `metadata.${key}`, match: { value } });
      }
    }

    // Qdrant 不直接支持 in/range/exists 的嵌套 metadata 过滤
    // 这里简化处理
    return must.length > 0 ? { must } : undefined;
  }
}
