/**
 * Forever - MemGPT式分层记忆系统
 *
 * 三层记忆架构（参考 MemGPT / Letta）：
 * - Core Memory: 核心记忆，始终在上下文中（角色身份、关键关系、重要偏好）
 * - Recall Memory: 回忆记忆，可检索的对话历史（通过向量搜索）
 * - Archival Memory: 归档记忆，长期存储的大量记忆（通过向量搜索，更低优先级）
 *
 * 智能体可以通过"记忆工具"主动管理自己的记忆：
 * - core_memory_replace: 替换核心记忆块
 * - core_memory_append: 追加核心记忆
 * - recall_memory_search: 搜索回忆记忆
 * - archival_memory_insert: 插入归档记忆
 * - archival_memory_search: 搜索归档记忆
 *
 * 本模块是主入口，组合了四个子模块：
 * - CoreMemoryManager: 核心记忆操作
 * - RecallMemoryManager: 回忆记忆操作
 * - ArchivalMemoryManager: 归档记忆操作
 * - MemoryToolsExecutor: LLM记忆工具解析与执行
 */

import type { LLMConfig } from '../core/llm/index';
import { getAllMemories } from '../core/bridge/index';

import {
  CoreMemoryManager,
  CoreMemoryBlock,
  CATEGORY_LABELS,
} from './core-memory';

import {
  RecallMemoryManager,
} from './recall-memory';

import {
  ArchivalMemoryManager,
} from './archival-memory';

import {
  MemoryToolsExecutor,
  MemoryToolCall,
  MemoryToolsDependencies,
} from './memory-tools';

// ============ 重新导出类型 ============

export type { CoreMemoryBlock, MemoryToolCall };
export { CATEGORY_LABELS };

export interface MemorySearchResult {
  content: string;
  score: number;
  source: 'core' | 'recall' | 'archival';
  metadata?: Record<string, unknown>;
}

// ============ 分层记忆管理器（主入口） ============

export class TieredMemoryManager {
  private characterId: string;
  private llmConfig: LLMConfig;
  private dataDir: string;

  // 子管理器
  private coreManager: CoreMemoryManager;
  private recallManager: RecallMemoryManager;
  private archivalManager: ArchivalMemoryManager;
  private toolsExecutor: MemoryToolsExecutor;

  constructor(characterId: string, llmConfig: LLMConfig, dataDir?: string) {
    this.characterId = characterId;
    this.llmConfig = llmConfig;
    this.dataDir = dataDir || process.env.FOREVER_DATA_DIR || '/tmp';

    // 初始化子管理器
    this.coreManager = new CoreMemoryManager(characterId, this.dataDir);
    this.recallManager = new RecallMemoryManager(characterId);
    this.archivalManager = new ArchivalMemoryManager(characterId);

    // 初始化工具执行器
    const deps: MemoryToolsDependencies = {
      coreManager: this.coreManager,
      recallManager: this.recallManager,
      archivalManager: this.archivalManager,
    };
    this.toolsExecutor = new MemoryToolsExecutor(deps);
  }

  // ================================================================
  //  Core Memory 操作（委托给 CoreMemoryManager）
  // ================================================================

  /**
   * 初始化核心记忆（从角色卡加载）
   */
  initializeFromCharacterCard(character: {
    name?: string;
    gender?: string;
    birthday?: string;
    deathday?: string;
    relationship?: string;
    coreTraits?: string[];
    speechStyle?: string;
    catchphrases?: string[];
    topics?: string[];
    lifeStory?: string;
    importantMemories?: string[];
    familyRelations?: Array<{ name: string; relation: string; description: string }>;
    habits?: Array<{ name: string; description: string; frequency?: string }>;
  }): void {
    this.coreManager.initializeFromCharacterCard(character);
  }

  /**
   * 获取所有核心记忆（用于注入Prompt）
   */
  getCoreMemoryText(): string {
    return this.coreManager.getCoreMemoryText();
  }

  /**
   * 替换核心记忆块
   */
  coreMemoryReplace(blockId: string, newContent: string): CoreMemoryBlock {
    return this.coreManager.coreMemoryReplace(blockId, newContent);
  }

  /**
   * 追加核心记忆
   */
  coreMemoryAppend(blockId: string, content: string): CoreMemoryBlock {
    return this.coreManager.coreMemoryAppend(blockId, content);
  }

  /**
   * 获取核心记忆块
   */
  getCoreBlock(blockId: string): CoreMemoryBlock | undefined {
    return this.coreManager.getCoreBlock(blockId);
  }

  /**
   * 获取所有核心记忆块
   */
  getAllCoreBlocks(): CoreMemoryBlock[] {
    return this.coreManager.getAllCoreBlocks();
  }

  /**
   * 删除核心记忆块
   */
  removeCoreBlock(blockId: string): boolean {
    return this.coreManager.removeCoreBlock(blockId);
  }

  // ================================================================
  //  Recall Memory 操作（委托给 RecallMemoryManager）
  // ================================================================

  /**
   * 搜索回忆记忆（最近的对话相关记忆）
   */
  async recallSearch(query: string, limit: number = 5): Promise<MemorySearchResult[]> {
    return this.recallManager.recallSearch(query, limit);
  }

  /**
   * 存储到回忆记忆
   */
  async recallInsert(
    content: string,
    importance: number = 0.5,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    return this.recallManager.recallInsert(content, importance, metadata);
  }

  // ================================================================
  //  Archival Memory 操作（委托给 ArchivalMemoryManager）
  // ================================================================

  /**
   * 搜索归档记忆（长期大量记忆）
   */
  async archivalSearch(query: string, limit: number = 5): Promise<MemorySearchResult[]> {
    return this.archivalManager.archivalSearch(query, limit);
  }

  /**
   * 插入归档记忆
   */
  async archivalInsert(
    content: string,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    return this.archivalManager.archivalInsert(content, metadata);
  }

  // ================================================================
  //  统一搜索与智能存储
  // ================================================================

  /**
   * 跨层搜索（同时搜索 Core + Recall + Archival）
   *
   * 1. Core Memory: 基于关键词匹配（始终在上下文中，分数最高）
   * 2. Recall Memory: 向量搜索（对话历史）
   * 3. Archival Memory: 向量搜索（长期记忆）
   *
   * 结果去重后按分数降序排列。
   */
  async searchAll(query: string, limit: number = 10): Promise<MemorySearchResult[]> {
    const allResults: MemorySearchResult[] = [];

    // 1. Core Memory 关键词匹配
    const queryLower = query.toLowerCase();
    const queryTokens = queryLower.split(/\s+/).filter(t => t.length > 1);
    const coreBlocks = this.coreManager.getAllCoreBlocks();

    for (const block of coreBlocks) {
      const blockLower = block.content.toLowerCase();
      let matchScore = 0;

      // 计算匹配度：基于 token 命中率
      let matchedTokens = 0;
      for (const token of queryTokens) {
        if (blockLower.includes(token)) {
          matchedTokens++;
        }
      }

      if (matchedTokens > 0) {
        matchScore = matchedTokens / queryTokens.length;
        // Core Memory 的分数加权，因为它是始终在上下文中的
        matchScore = Math.min(1.0, matchScore * 1.2 + 0.3);
      } else if (blockLower.includes(queryLower)) {
        // 整体包含查询字符串
        matchScore = 0.7;
      }

      if (matchScore > 0.3) {
        allResults.push({
          content: block.content,
          score: matchScore,
          source: 'core',
          metadata: {
            blockId: block.id,
            category: block.category,
            lastUpdated: block.lastUpdated,
          },
        });
      }
    }

    // 2. Recall Memory 向量搜索
    try {
      const recallResults = await this.recallManager.recallSearch(query, limit);
      allResults.push(...recallResults);
    } catch {
      // 静默处理
    }

    // 3. Archival Memory 向量搜索
    try {
      const archivalResults = await this.archivalManager.archivalSearch(query, limit);
      allResults.push(...archivalResults);
    } catch {
      // 静默处理
    }

    // 去重：相似内容只保留分数最高的
    const deduplicated = this.deduplicateResults(allResults);

    // 按分数降序排列，取 top limit
    deduplicated.sort((a, b) => b.score - a.score);
    return deduplicated.slice(0, limit);
  }

  /**
   * 智能记忆路由：根据内容自动决定存储到哪一层
   *
   * @param content 记忆内容
   * @param importance 重要性评分
   * @param metadata 附加元数据
   */
  async smartStore(
    content: string,
    importance: number = 0.5,
    metadata?: Record<string, unknown>,
  ): Promise<string> {
    if (importance >= 0.8) {
      // 高重要性：更新核心记忆 + 存入归档
      const category = this.inferCategoryFromContent(content);
      this.coreManager.coreMemoryAppend(category, content);
      await this.archivalManager.archivalInsert(content, { importance, ...metadata });
      return `core+archival (importance=${importance.toFixed(2)})`;
    } else if (importance >= 0.5) {
      // 中等重要性：存入回忆记忆
      await this.recallManager.recallInsert(content, importance, metadata);
      return `recall (importance=${importance.toFixed(2)})`;
    } else {
      // 低重要性：仅存入归档
      await this.archivalManager.archivalInsert(content, { importance, ...metadata });
      return `archival (importance=${importance.toFixed(2)})`;
    }
  }

  // ================================================================
  //  LLM 记忆工具调用（委托给 MemoryToolsExecutor）
  // ================================================================

  /**
   * 解析 LLM 输出中的记忆工具调用
   */
  parseMemoryToolCalls(llmOutput: string): MemoryToolCall[] {
    return this.toolsExecutor.parseMemoryToolCalls(llmOutput);
  }

  /**
   * 执行记忆工具调用
   */
  async executeMemoryToolCall(toolCall: MemoryToolCall): Promise<string> {
    return this.toolsExecutor.executeMemoryToolCall(toolCall);
  }

  /**
   * 批量执行多个记忆工具调用
   */
  async executeMemoryToolCalls(toolCalls: MemoryToolCall[]): Promise<string[]> {
    return this.toolsExecutor.executeMemoryToolCalls(toolCalls);
  }

  /**
   * 生成记忆工具的 Prompt 描述（注入到系统 Prompt 中）
   */
  getMemoryToolsPrompt(): string {
    return this.toolsExecutor.getMemoryToolsPrompt();
  }

  /**
   * 检查 LLM 输出是否包含记忆工具调用
   */
  hasMemoryToolCalls(llmOutput: string): boolean {
    return this.toolsExecutor.hasMemoryToolCalls(llmOutput);
  }

  // ================================================================
  //  持久化（委托给 CoreMemoryManager）
  // ================================================================

  /**
   * 保存核心记忆到 JSON 文件
   */
  saveCoreMemory(): void {
    this.coreManager.saveToFile();
  }

  /**
   * 从 JSON 文件加载核心记忆
   */
  loadCoreMemory(): void {
    this.coreManager.loadFromFile();
  }

  // ================================================================
  //  统计信息
  // ================================================================

  /**
   * 获取记忆统计
   *
   * 返回各层记忆的数量统计。
   */
  async getStats(): Promise<{
    coreBlocks: number;
    recallCount: number;
    archivalCount: number;
  }> {
    const recallCollectionId = `${this.characterId}_recall`;
    const archivalCollectionId = `${this.characterId}_archival`;

    let recallCount = 0;
    let archivalCount = 0;

    // 获取 recall 记忆数量
    try {
      const recallMemories = await getAllMemories(recallCollectionId);
      recallCount = recallMemories.length;
    } catch {
      // ChromaDB 可能不可用
    }

    // 获取 archival 记忆数量
    try {
      const archivalMemories = await getAllMemories(archivalCollectionId);
      archivalCount = archivalMemories.length;
    } catch {
      // ChromaDB 可能不可用
    }

    const coreStats = this.coreManager.getStats();

    return {
      coreBlocks: coreStats.coreBlocks,
      recallCount,
      archivalCount,
    };
  }

  /**
   * 获取核心记忆统计（同步版本）
   */
  getCoreStats(): { coreBlocks: number; totalChars: number } {
    return this.coreManager.getStats();
  }

  // ================================================================
  //  高级功能：自动记忆管理
  // ================================================================

  /**
   * 处理对话轮次：自动提取记忆并存储
   *
   * 1. 将对话内容存入 Recall Memory
   * 2. 如果对话包含重要信息，提示 LLM 决定是否更新 Core Memory
   *
   * @param userMessage 用户消息
   * @param assistantReply 助手回复
   * @param importance 重要性评分 (0-1)
   */
  async processConversationTurn(
    userMessage: string,
    assistantReply: string,
    importance: number = 0.5,
  ): Promise<void> {
    // 存入 Recall Memory
    const content = `用户: ${userMessage}\n我: ${assistantReply}`;
    await this.recallManager.recallInsert(content, importance);

    // 如果重要性较高，同时存入 Archival Memory 作为长期备份
    if (importance >= 0.7) {
      await this.archivalManager.archivalInsert(content, { importance });
    }
  }

  /**
   * 获取完整的记忆上下文（用于 Prompt 注入）
   *
   * 包含核心记忆文本和可选的相关记忆搜索结果。
   *
   * @param currentQuery 当前用户查询（用于搜索相关记忆）
   * @param searchLimit 搜索结果数量限制
   */
  async getMemoryContext(currentQuery?: string, searchLimit: number = 3): Promise<string> {
    const parts: string[] = [];

    // 1. 核心记忆（始终包含）
    const coreText = this.getCoreMemoryText();
    if (coreText) {
      parts.push(coreText);
    }

    // 2. 如果有当前查询，搜索相关记忆
    if (currentQuery && currentQuery.trim().length > 2) {
      const searchResults = await this.searchAll(currentQuery, searchLimit);

      // 过滤掉已经在 Core Memory 中的结果
      const nonCoreResults = searchResults.filter(r => r.source !== 'core');

      if (nonCoreResults.length > 0) {
        const recallResults = nonCoreResults.filter(r => r.source === 'recall');
        const archivalResults = nonCoreResults.filter(r => r.source === 'archival');

        if (recallResults.length > 0) {
          parts.push('<recall_memory>');
          parts.push('以下是与你当前对话相关的过去记忆：');
          for (const r of recallResults) {
            parts.push(`- ${r.content}`);
          }
          parts.push('</recall_memory>');
        }

        if (archivalResults.length > 0) {
          parts.push('<archival_memory>');
          parts.push('以下是来自长期归档的相关记忆：');
          for (const r of archivalResults) {
            parts.push(`- ${r.content}`);
          }
          parts.push('</archival_memory>');
        }
      }
    }

    return parts.join('\n\n');
  }

  // ================================================================
  //  内部辅助方法
  // ================================================================

  /**
   * 根据内容推断核心记忆类别
   */
  private inferCategoryFromContent(content: string): CoreMemoryBlock['category'] {
    const lower = content.toLowerCase();

    // 关系关键词
    const relationshipKeywords = ['朋友', '家人', '妈妈', '爸爸', '爱人', '关系', '认识', '同事', '同学'];
    if (relationshipKeywords.some(kw => lower.includes(kw))) {
      return 'relationship';
    }

    // 偏好关键词
    const preferenceKeywords = ['喜欢', '讨厌', '爱好', '最爱', '偏好', '口味', '风格'];
    if (preferenceKeywords.some(kw => lower.includes(kw))) {
      return 'preference';
    }

    // 习惯关键词
    const routineKeywords = ['每天', '经常', '习惯', '总是', '定期', '通常', '作息'];
    if (routineKeywords.some(kw => lower.includes(kw))) {
      return 'routine';
    }

    return 'important_fact';
  }

  /**
   * 去重搜索结果：相似内容只保留分数最高的
   */
  private deduplicateResults(results: MemorySearchResult[]): MemorySearchResult[] {
    const seen = new Map<string, MemorySearchResult>();

    for (const result of results) {
      // 标准化内容用于比较：去除空白、截取前30字符
      const normalized = result.content.replace(/\s/g, '').slice(0, 30);

      const existing = seen.get(normalized);
      if (!existing || result.score > existing.score) {
        seen.set(normalized, result);
      }
    }

    return Array.from(seen.values());
  }
}
