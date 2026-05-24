
/**
 * Forever AI - 知识库管理器
 * 整合 RAG 功能的核心实现
 */

import { 
  KnowledgeItem, 
  KnowledgeQuery, 
  KnowledgeResult, 
  ChunkConfig,
  RAGConfig 
} from './types';
import { EmbeddingService } from './embedding-service';
import { VectorStore, VectorSearchResult } from './vector-store';
import { logger } from '../logger';
import { generateId } from '../utils';

export class KnowledgeBase {
  private embeddingService: EmbeddingService;
  private vectorStore: VectorStore;
  private chunkConfig: ChunkConfig;
  private topK: number;
  private rerankEnabled: boolean;

  constructor(config: RAGConfig) {
    this.embeddingService = new EmbeddingService(config.embedding);
    this.vectorStore = new VectorStore(config.vectorStore);
    this.chunkConfig = {
      size: config.chunkSize || 500,
      overlap: config.chunkOverlap || 50,
      separator: '\n',
    };
    this.topK = config.topK || 5;
    this.rerankEnabled = config.rerank || false;
  }

  async initialize(): Promise<void> {
    await this.vectorStore.initialize();
    logger.info('knowledge:base', 'Knowledge base initialized');
  }

  async addDocument(
    content: string,
    metadata: Record<string, any> = {},
    category?: string,
    tags?: string[],
    source?: string
  ): Promise<KnowledgeItem[]> {
    const chunks = this.chunkText(content);
    const items: KnowledgeItem[] = [];

    logger.info('knowledge:base', 'Adding document to knowledge base', {
      contentLength: content.length,
      chunksCount: chunks.length,
    });

    for (const chunk of chunks) {
      const embedding = await this.embeddingService.embed(chunk);
      
      const item: KnowledgeItem = {
        id: generateId('kb_'),
        content: chunk,
        embedding,
        metadata,
        category,
        tags,
        source,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await this.vectorStore.add(item);
      items.push(item);
    }

    logger.info('knowledge:base', 'Document added to knowledge base', {
      itemsCreated: items.length,
    });

    return items;
  }

  async query(query: KnowledgeQuery): Promise<KnowledgeResult[]> {
    const { text, embedding, limit, threshold } = query;
    const searchLimit = limit || this.topK;

    let queryEmbedding: number[];

    if (embedding) {
      queryEmbedding = embedding;
    } else if (text) {
      queryEmbedding = await this.embeddingService.embed(text);
    } else {
      throw new Error('Either text or embedding must be provided');
    }

    let results = await this.vectorStore.search(queryEmbedding, searchLimit, threshold);

    if (query.category) {
      results = results.filter(r => r.item.category === query.category);
    }

    if (query.tags && query.tags.length > 0) {
      results = results.filter(r =>
        query.tags!.some(tag => r.item.tags?.includes(tag))
      );
    }

    if (this.rerankEnabled && text) {
      results = await this.rerankResults(results, text);
    }

    return results.map(r => ({
      item: r.item,
      score: r.score,
      highlights: this.extractHighlights(r.item.content, text),
    }));
  }

  async retrieveContext(query: string, maxTokens?: number): Promise<string> {
    const results = await this.query({ text: query, limit: this.topK });

    if (results.length === 0) {
      return '';
    }

    const contexts = results.map(r => r.item.content);
    return contexts.join('\n\n');
  }

  async findById(id: string): Promise<KnowledgeItem | null> {
    return this.vectorStore.findById(id);
  }

  async findByCategory(category: string): Promise<KnowledgeItem[]> {
    return this.vectorStore.findByCategory(category);
  }

  async updateDocument(id: string, content: string, metadata?: Record<string, any>): Promise<KnowledgeItem | null> {
    const embedding = await this.embeddingService.embed(content);
    
    const updated = await this.vectorStore.update(id, {
      content,
      embedding,
      metadata,
      updatedAt: new Date(),
    });

    if (updated) {
      logger.info('knowledge:base', 'Document updated in knowledge base', { id });
    }

    return updated;
  }

  async deleteDocument(id: string): Promise<boolean> {
    const deleted = await this.vectorStore.delete(id);
    
    if (deleted) {
      logger.info('knowledge:base', 'Document deleted from knowledge base', { id });
    }

    return deleted;
  }

  async getStatistics(): Promise<{
    totalDocuments: number;
    totalChunks: number;
    categories: string[];
    tags: string[];
  }> {
    const all = await this.vectorStore.getAll();
    const categories = [...new Set(all.map(item => item.category).filter(Boolean))] as string[];
    const tags = [...new Set(all.flatMap(item => item.tags || []))];

    return {
      totalDocuments: all.length,
      totalChunks: all.length,
      categories,
      tags,
    };
  }

  private chunkText(text: string): string[] {
    const chunks: string[] = [];
    const separator = this.chunkConfig.separator;
    const chunkSize = this.chunkConfig.size;
    const overlap = this.chunkConfig.overlap;

    const paragraphs = text.split(separator).filter(p => p.trim().length > 0);
    
    let currentChunk = '';

    for (const paragraph of paragraphs) {
      if (currentChunk.length + paragraph.length > chunkSize) {
        if (currentChunk.length > 0) {
          chunks.push(currentChunk.trim());
        }
        
        const overlapText = currentChunk.slice(-overlap);
        currentChunk = overlapText + paragraph;
      } else {
        currentChunk += (currentChunk.length > 0 ? separator : '') + paragraph;
      }
    }

    if (currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  }

  private async rerankResults(
    results: VectorSearchResult[],
    query: string
  ): Promise<VectorSearchResult[]> {
    const queryTerms = query.toLowerCase().split(/\s+/);

    return results.map(result => {
      const content = result.item.content.toLowerCase();
      let termMatches = 0;

      for (const term of queryTerms) {
        if (content.includes(term)) {
          termMatches++;
        }
      }

      const rerankScore = termMatches / queryTerms.length;
      const combinedScore = result.score * 0.7 + rerankScore * 0.3;

      return {
        ...result,
        score: combinedScore,
      };
    }).sort((a, b) => b.score - a.score);
  }

  private extractHighlights(content: string, query?: string): string[] {
    if (!query) {
      return [];
    }

    const highlights: string[] = [];
    const queryTerms = query.toLowerCase().split(/\s+/);
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);

    for (const sentence of sentences) {
      const lowerSentence = sentence.toLowerCase();
      for (const term of queryTerms) {
        if (lowerSentence.includes(term) && sentence.trim().length > 20) {
          highlights.push(sentence.trim());
          break;
        }
      }
    }

    return highlights.slice(0, 3);
  }

  async clear(): Promise<void> {
    await this.vectorStore.clear();
    this.embeddingService.clearCache();
    logger.info('knowledge:base', 'Knowledge base cleared');
  }
}

export const knowledgeBase = new KnowledgeBase({
  embedding: {
    provider: 'local',
    model: 'local-embedding',
    dimensions: 1536,
    apiKey: '',
  },
  vectorStore: {
    provider: 'memory',
    collectionName: 'forever_knowledge',
    distanceFunction: 'cosine',
  },
  chunkSize: 500,
  chunkOverlap: 50,
  topK: 5,
  rerank: true,
});
