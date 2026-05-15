/**
 * @module memory/compression
 * @description 长期记忆压缩模块
 *
 * 实现记忆压缩算法，用于：
 * - 摘要生成（Summarization）
 * - 重要性评分（Importance Scoring）
 * - 时间衰减（Time Decay）
 * - 向量化压缩（Vector Compression）
 */

import type { ChatMessage } from '../llm/types';
import { chat } from '../llm';

// ============================================================================
// 类型定义
// ============================================================================

/**
 * 记忆条目
 */
export interface MemoryEntry {
  /** 唯一ID */
  id: string;
  /** 记忆内容 */
  content: string;
  /** 创建时间戳 */
  timestamp: number;
  /** 重要性评分（0-1） */
  importance: number;
  /** 访问次数 */
  accessCount: number;
  /** 最后访问时间 */
  lastAccessed: number;
  /** 记忆类型 */
  type: 'conversation' | 'fact' | 'event' | 'summary';
  /** 关联的记忆ID */
  relatedIds?: string[];
  /** 元数据 */
  metadata?: Record<string, any>;
}

/**
 * 压缩配置
 */
export interface CompressionConfig {
  /** 最大记忆数量（触发压缩的阈值） */
  maxMemories: number;
  /** 压缩目标数量 */
  targetMemories: number;
  /** 重要性阈值（低于此值的记忆会被优先压缩） */
  importanceThreshold: number;
  /** 时间衰减因子（0-1，越大衰减越快） */
  decayFactor: number;
  /** 是否启用LLM摘要 */
  enableLLMSummarization: boolean;
  /** LLM配置（用于摘要生成） */
  llmConfig?: any;
}

/**
 * 压缩结果
 */
export interface CompressionResult {
  /** 被压缩的记忆ID */
  compressedIds: string[];
  /** 生成的新摘要记忆 */
  summaryMemory?: MemoryEntry;
  /** 保留的记忆 */
  retainedMemories: MemoryEntry[];
  /** 压缩率 */
  compressionRatio: number;
}

// ============================================================================
// 默认配置
// ============================================================================

export const DEFAULT_COMPRESSION_CONFIG: CompressionConfig = {
  maxMemories: 100,
  targetMemories: 50,
  importanceThreshold: 0.3,
  decayFactor: 0.95,
  enableLLMSummarization: true,
};

// ============================================================================
// 重要性评分
// ============================================================================

/**
 * 计算记忆的重要性评分
 *
 * 基于以下因素：
 * - 内容长度（越长越重要）
 * - 关键词密度（包含关键词越多越重要）
 * - 访问频率（访问越多越重要）
 * - 时间衰减（越新越重要）
 */
export function calculateImportance(
  content: string,
  accessCount: number,
  timestamp: number,
  keywords: string[] = [],
): number {
  // 基础分数
  let score = 0.5;

  // 长度因子（对数缩放）
  const lengthFactor = Math.min(Math.log10(content.length + 1) / 3, 0.2);
  score += lengthFactor;

  // 关键词匹配
  if (keywords.length > 0) {
    const matchedKeywords = keywords.filter(kw =>
      content.toLowerCase().includes(kw.toLowerCase())
    );
    const keywordFactor = (matchedKeywords.length / keywords.length) * 0.2;
    score += keywordFactor;
  }

  // 访问频率因子（对数缩放）
  const accessFactor = Math.min(Math.log10(accessCount + 1) / 3, 0.15);
  score += accessFactor;

  // 时间衰减
  const age = Date.now() - timestamp;
  const daysOld = age / (1000 * 60 * 60 * 24);
  const decayFactor = Math.exp(-daysOld / 30); // 30天半衰期
  score *= decayFactor;

  return Math.min(Math.max(score, 0), 1);
}

/**
 * 更新记忆的重要性（考虑访问）
 */
export function updateImportanceOnAccess(
  memory: MemoryEntry,
  decayFactor: number = 0.95,
): MemoryEntry {
  const now = Date.now();
  const timeSinceLastAccess = now - memory.lastAccessed;
  const hoursSinceAccess = timeSinceLastAccess / (1000 * 60 * 60);

  // 时间衰减
  const decay = Math.pow(decayFactor, hoursSinceAccess);
  let newImportance = memory.importance * decay;

  // 访问增加重要性
  newImportance = Math.min(newImportance + 0.05, 1);

  return {
    ...memory,
    importance: newImportance,
    accessCount: memory.accessCount + 1,
    lastAccessed: now,
  };
}

// ============================================================================
// 记忆压缩
// ============================================================================

/**
 * 记忆压缩器
 */
export class MemoryCompressor {
  private config: CompressionConfig;

  constructor(config: Partial<CompressionConfig> = {}) {
    this.config = { ...DEFAULT_COMPRESSION_CONFIG, ...config };
  }

  /**
   * 检查是否需要压缩
   */
  shouldCompress(memories: MemoryEntry[]): boolean {
    return memories.length > this.config.maxMemories;
  }

  /**
   * 压缩记忆
   *
   * 策略：
   * 1. 按重要性排序
   * 2. 保留高重要性记忆
   * 3. 对低重要性记忆进行摘要合并
   */
  async compress(memories: MemoryEntry[]): Promise<CompressionResult> {
    if (!this.shouldCompress(memories)) {
      return {
        compressedIds: [],
        retainedMemories: memories,
        compressionRatio: 1,
      };
    }

    // 更新所有记忆的重要性（应用时间衰减）
    const updatedMemories = memories.map(m => ({
      ...m,
      importance: calculateImportance(
        m.content,
        m.accessCount,
        m.timestamp,
      ),
    }));

    // 按重要性排序
    const sortedMemories = updatedMemories.sort((a, b) => b.importance - a.importance);

    // 确定保留和压缩的记忆
    const retainCount = Math.min(this.config.targetMemories, sortedMemories.length);
    const retainedMemories = sortedMemories.slice(0, retainCount);
    const toCompress = sortedMemories.slice(retainCount);

    if (toCompress.length === 0) {
      return {
        compressedIds: [],
        retainedMemories,
        compressionRatio: 1,
      };
    }

    // 生成摘要
    let summaryMemory: MemoryEntry | undefined;
    if (this.config.enableLLMSummarization && this.config.llmConfig) {
      try {
        summaryMemory = await this.generateSummary(toCompress);
      } catch (error) {
        console.error('生成摘要失败:', error);
      }
    }

    // 如果没有LLM摘要，使用简单合并
    if (!summaryMemory) {
      summaryMemory = this.createSimpleSummary(toCompress);
    }

    const compressionRatio = retainedMemories.length / memories.length;

    return {
      compressedIds: toCompress.map(m => m.id),
      summaryMemory,
      retainedMemories: summaryMemory
        ? [...retainedMemories, summaryMemory]
        : retainedMemories,
      compressionRatio,
    };
  }

  /**
   * 使用LLM生成摘要
   */
  private async generateSummary(memories: MemoryEntry[]): Promise<MemoryEntry> {
    const contents = memories.map(m => m.content).join('\n\n---\n\n');

    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: '你是一个记忆摘要助手。请将以下记忆内容压缩成简洁的摘要，保留关键信息。',
      },
      {
        role: 'user',
        content: `请将以下内容总结成一段简洁的摘要（200字以内）：\n\n${contents}`,
      },
    ];

    const response = await chat(messages, this.config.llmConfig!);

    return {
      id: `summary-${Date.now()}`,
      content: response.content,
      timestamp: Date.now(),
      importance: Math.max(...memories.map(m => m.importance)) * 0.8,
      accessCount: 0,
      lastAccessed: Date.now(),
      type: 'summary',
      relatedIds: memories.map(m => m.id),
      metadata: {
        compressedCount: memories.length,
        originalIds: memories.map(m => m.id),
      },
    };
  }

  /**
   * 创建简单摘要（无LLM时备用）
   */
  private createSimpleSummary(memories: MemoryEntry[]): MemoryEntry {
    // 提取每个记忆的前100个字符
    const excerpts = memories
      .map(m => m.content.slice(0, 100) + (m.content.length > 100 ? '...' : ''))
      .join('\n');

    const content = `[摘要] ${memories.length} 条记忆:\n${excerpts}`;

    return {
      id: `summary-${Date.now()}`,
      content,
      timestamp: Date.now(),
      importance: Math.max(...memories.map(m => m.importance)) * 0.8,
      accessCount: 0,
      lastAccessed: Date.now(),
      type: 'summary',
      relatedIds: memories.map(m => m.id),
      metadata: {
        compressedCount: memories.length,
        originalIds: memories.map(m => m.id),
      },
    };
  }

  /**
   * 选择性压缩（基于查询相关性）
   *
   * 保留与查询相关的记忆，压缩其他记忆
   */
  async compressWithQuery(
    memories: MemoryEntry[],
    query: string,
    relevanceScores: Map<string, number>,
  ): Promise<CompressionResult> {
    // 按相关性排序
    const sortedMemories = memories.sort((a, b) => {
      const scoreA = relevanceScores.get(a.id) || 0;
      const scoreB = relevanceScores.get(b.id) || 0;
      return scoreB - scoreA;
    });

    // 保留高相关性记忆
    const relevantCount = Math.ceil(memories.length * 0.3); // 保留30%
    const relevantMemories = sortedMemories.slice(0, relevantCount);
    const otherMemories = sortedMemories.slice(relevantCount);

    // 压缩其他记忆
    let summaryMemory: MemoryEntry | undefined;
    if (otherMemories.length > 0) {
      if (this.config.enableLLMSummarization && this.config.llmConfig) {
        try {
          summaryMemory = await this.generateSummary(otherMemories);
        } catch {
          summaryMemory = this.createSimpleSummary(otherMemories);
        }
      } else {
        summaryMemory = this.createSimpleSummary(otherMemories);
      }
    }

    return {
      compressedIds: otherMemories.map(m => m.id),
      summaryMemory,
      retainedMemories: summaryMemory
        ? [...relevantMemories, summaryMemory]
        : relevantMemories,
      compressionRatio: relevantMemories.length / memories.length,
    };
  }
}

// ============================================================================
// 记忆管理器（集成压缩）
// ============================================================================

/**
 * 长期记忆管理器
 *
 * 自动管理记忆存储，当记忆数量超过阈值时自动压缩。
 */
export class LongTermMemory {
  private memories: Map<string, MemoryEntry> = new Map();
  private compressor: MemoryCompressor;
  private config: CompressionConfig;

  constructor(config: Partial<CompressionConfig> = {}) {
    this.config = { ...DEFAULT_COMPRESSION_CONFIG, ...config };
    this.compressor = new MemoryCompressor(this.config);
  }

  /**
   * 添加记忆
   */
  add(content: string, type: MemoryEntry['type'] = 'conversation'): MemoryEntry {
    const entry: MemoryEntry = {
      id: `mem-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      content,
      timestamp: Date.now(),
      importance: calculateImportance(content, 0, Date.now()),
      accessCount: 0,
      lastAccessed: Date.now(),
      type,
    };

    this.memories.set(entry.id, entry);

    // 检查是否需要压缩
    this.checkAndCompress();

    return entry;
  }

  /**
   * 获取记忆
   */
  get(id: string): MemoryEntry | undefined {
    const memory = this.memories.get(id);
    if (memory) {
      // 更新访问统计
      const updated = updateImportanceOnAccess(memory, this.config.decayFactor);
      this.memories.set(id, updated);
      return updated;
    }
    return undefined;
  }

  /**
   * 获取所有记忆
   */
  getAll(): MemoryEntry[] {
    return Array.from(this.memories.values()).sort(
      (a, b) => b.importance - a.importance
    );
  }

  /**
   * 搜索记忆（简单关键词匹配）
   */
  search(keywords: string[]): MemoryEntry[] {
    return this.getAll().filter(memory =>
      keywords.some(kw =>
        memory.content.toLowerCase().includes(kw.toLowerCase())
      )
    );
  }

  /**
   * 删除记忆
   */
  delete(id: string): boolean {
    return this.memories.delete(id);
  }

  /**
   * 清空所有记忆
   */
  clear(): void {
    this.memories.clear();
  }

  /**
   * 获取记忆数量
   */
  get size(): number {
    return this.memories.size;
  }

  /**
   * 检查并执行压缩
   */
  private async checkAndCompress(): Promise<void> {
    if (this.compressor.shouldCompress(this.getAll())) {
      const result = await this.compressor.compress(this.getAll());

      // 删除被压缩的记忆
      for (const id of result.compressedIds) {
        this.memories.delete(id);
      }

      // 添加摘要记忆
      if (result.summaryMemory) {
        this.memories.set(result.summaryMemory.id, result.summaryMemory);
      }

      console.log(
        `记忆压缩完成: ${result.compressedIds.length} 条记忆被压缩，压缩率 ${(
          result.compressionRatio * 100
        ).toFixed(1)}%`
      );
    }
  }

  /**
   * 手动触发压缩
   */
  async compress(): Promise<CompressionResult> {
    const result = await this.compressor.compress(this.getAll());

    // 应用压缩结果
    for (const id of result.compressedIds) {
      this.memories.delete(id);
    }

    if (result.summaryMemory) {
      this.memories.set(result.summaryMemory.id, result.summaryMemory);
    }

    return result;
  }

  /**
   * 导出记忆
   */
  export(): MemoryEntry[] {
    return this.getAll();
  }

  /**
   * 导入记忆
   */
  import(entries: MemoryEntry[]): void {
    for (const entry of entries) {
      this.memories.set(entry.id, entry);
    }
    this.checkAndCompress();
  }
}

// ============================================================================
// 导出
// ============================================================================

export {
  MemoryCompressor,
  LongTermMemory,
  calculateImportance,
  updateImportanceOnAccess,
  DEFAULT_COMPRESSION_CONFIG,
};
