
/**
 * Forever AI - 知识库类型定义
 */

export interface KnowledgeItem {
  id: string;
  content: string;
  embedding?: number[];
  metadata: KnowledgeMetadata;
  category?: string;
  tags?: string[];
  source?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface KnowledgeMetadata {
  author?: string;
  title?: string;
  language?: string;
  importance?: number;
  confidence?: number;
  [key: string]: any;
}

export interface KnowledgeQuery {
  text?: string;
  embedding?: number[];
  category?: string;
  tags?: string[];
  filters?: Record<string, any>;
  limit?: number;
  threshold?: number;
}

export interface KnowledgeResult {
  item: KnowledgeItem;
  score: number;
  highlights?: string[];
}

export interface EmbeddingConfig {
  provider: 'openai' | 'anthropic' | 'local';
  model: string;
  dimensions: number;
  apiKey?: string;
}

export interface VectorStoreConfig {
  provider: 'memory' | 'qdrant' | 'chroma' | 'pinecone';
  url?: string;
  apiKey?: string;
  collectionName?: string;
  distanceFunction?: 'cosine' | 'euclidean' | 'dotproduct';
}

export interface RAGConfig {
  embedding: EmbeddingConfig;
  vectorStore: VectorStoreConfig;
  chunkSize?: number;
  chunkOverlap?: number;
  topK?: number;
  rerank?: boolean;
}

export interface ChunkConfig {
  size: number;
  overlap: number;
  separator: string;
}
