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
 */

import * as fs from 'fs';
import * as path from 'path';
import { chat, type LLMConfig } from '../core/llm/index';
import {
  storeLocalMemory,
  retrieveLocalMemories,
  getAllMemories,
  batchStoreMemories,
  updateMemory,
  deleteMemories,
} from '../core/bridge/index';

// ============ 类型定义 ============

export interface CoreMemoryBlock {
  id: string;
  category: 'identity' | 'relationship' | 'preference' | 'routine' | 'important_fact';
  content: string;
  lastUpdated: string;
}

export interface MemorySearchResult {
  content: string;
  score: number;
  source: 'core' | 'recall' | 'archival';
  metadata?: Record<string, unknown>;
}

export interface MemoryToolCall {
  name: string;
  arguments: Record<string, unknown>;
}

// ============ 分类标签映射 ============

const CATEGORY_LABELS: Record<CoreMemoryBlock['category'], string> = {
  identity: '身份与基本',
  relationship: '关系与人际',
  preference: '偏好与喜好',
  routine: '习惯与日常',
  important_fact: '重要事实',
};

// ============ 分层记忆管理器 ============

export class TieredMemoryManager {
  private characterId: string;
  private llmConfig: LLMConfig;
  private dataDir: string;

  /** Core Memory: 始终在上下文中，按类别分块 */
  private coreMemory: Map<string, CoreMemoryBlock> = new Map();

  /** Recall Memory 的 ChromaDB collection 标识 */
  private recallCollectionId: string;

  /** Archival Memory 的 ChromaDB collection 标识 */
  private archivalCollectionId: string;

  constructor(characterId: string, llmConfig: LLMConfig, dataDir?: string) {
    this.characterId = characterId;
    this.llmConfig = llmConfig;
    this.dataDir = dataDir || process.env.FOREVER_DATA_DIR || '/tmp';
    this.recallCollectionId = `${characterId}_recall`;
    this.archivalCollectionId = `${characterId}_archival`;
  }

  // ================================================================
  //  Core Memory 操作
  // ================================================================

  /**
   * 初始化核心记忆（从角色卡加载）
   *
   * 将角色卡的各个字段映射为 CoreMemoryBlock：
   * - identity: 姓名、性别、生日、人生经历、核心特质、说话风格
   * - relationship: 与用户的关系、家庭关系
   * - preference: 话题偏好、口头禅
   * - routine: 习惯列表
   * - important_fact: 重要记忆
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
    const now = new Date().toISOString();

    // ---- identity 块 ----
    const identityParts: string[] = [];
    if (character.name) identityParts.push(`我叫${character.name}`);
    if (character.gender) identityParts.push(`性别${character.gender === 'male' ? '男' : character.gender === 'female' ? '女' : '其他'}`);
    if (character.birthday) identityParts.push(`生日是${character.birthday}`);
    if (character.deathday) identityParts.push(`离世于${character.deathday}`);
    if (character.coreTraits?.length) identityParts.push(`性格特点：${character.coreTraits.join('、')}`);
    if (character.speechStyle) identityParts.push(`说话风格：${character.speechStyle}`);
    if (character.lifeStory) identityParts.push(`人生经历：${character.lifeStory}`);

    if (identityParts.length > 0) {
      this.coreMemory.set('identity', {
        id: 'identity',
        category: 'identity',
        content: identityParts.join('。'),
        lastUpdated: now,
      });
    }

    // ---- relationship 块 ----
    const relationshipParts: string[] = [];
    if (character.relationship) relationshipParts.push(`与用户的关系：${character.relationship}`);
    if (character.familyRelations?.length) {
      for (const rel of character.familyRelations) {
        relationshipParts.push(`${rel.name}（${rel.relation}）：${rel.description}`);
      }
    }

    if (relationshipParts.length > 0) {
      this.coreMemory.set('relationship', {
        id: 'relationship',
        category: 'relationship',
        content: relationshipParts.join('；'),
        lastUpdated: now,
      });
    }

    // ---- preference 块 ----
    const preferenceParts: string[] = [];
    if (character.topics?.length) preferenceParts.push(`感兴趣的话题：${character.topics.join('、')}`);
    if (character.catchphrases?.length) preferenceParts.push(`口头禅：${character.catchphrases.join('、')}`);

    if (preferenceParts.length > 0) {
      this.coreMemory.set('preference', {
        id: 'preference',
        category: 'preference',
        content: preferenceParts.join('；'),
        lastUpdated: now,
      });
    }

    // ---- routine 块 ----
    if (character.habits?.length) {
      const routineContent = character.habits
        .map(h => `${h.name}${h.description ? `：${h.description}` : ''}${h.frequency ? `（${h.frequency}）` : ''}`)
        .join('；');

      this.coreMemory.set('routine', {
        id: 'routine',
        category: 'routine',
        content: routineContent,
        lastUpdated: now,
      });
    }

    // ---- important_fact 块 ----
    if (character.importantMemories?.length) {
      this.coreMemory.set('important_fact', {
        id: 'important_fact',
        category: 'important_fact',
        content: character.importantMemories.join('；'),
        lastUpdated: now,
      });
    }

    // 持久化到文件
    this.saveCoreMemory();
  }

  /**
   * 获取所有核心记忆（用于注入Prompt）
   *
   * 按类别分组，格式化为结构化文本，适合直接注入系统Prompt。
   */
  getCoreMemoryText(): string {
    if (this.coreMemory.size === 0) {
      return '';
    }

    const lines: string[] = ['<core_memory>'];

    // 按预定义顺序遍历类别
    const categoryOrder: CoreMemoryBlock['category'][] = [
      'identity', 'relationship', 'preference', 'routine', 'important_fact',
    ];

    for (const category of categoryOrder) {
      const block = this.coreMemory.get(category);
      if (block) {
        lines.push(`  <${block.id}>${block.content}</${block.id}>`);
      }
    }

    // 处理可能存在的自定义块（不在预定义类别中的）
    for (const [id, block] of this.coreMemory) {
      if (!categoryOrder.includes(id as CoreMemoryBlock['category'])) {
        lines.push(`  <${block.id}>${block.content}</${block.id}>`);
      }
    }

    lines.push('</core_memory>');
    return lines.join('\n');
  }

  /**
   * 替换核心记忆块
   *
   * 如果 blockId 是预定义类别，则替换对应类别的内容。
   * 如果 blockId 不存在，则创建新块。
   */
  coreMemoryReplace(blockId: string, newContent: string): CoreMemoryBlock {
    const existing = this.coreMemory.get(blockId);
    const now = new Date().toISOString();

    const block: CoreMemoryBlock = {
      id: blockId,
      category: existing?.category || this.inferCategory(blockId),
      content: newContent,
      lastUpdated: now,
    };

    this.coreMemory.set(blockId, block);
    this.saveCoreMemory();

    return block;
  }

  /**
   * 追加核心记忆
   *
   * 在已有核心记忆块的末尾追加内容。
   * 如果块不存在，则创建新块。
   */
  coreMemoryAppend(blockId: string, content: string): CoreMemoryBlock {
    const existing = this.coreMemory.get(blockId);
    const now = new Date().toISOString();

    const newContent = existing
      ? `${existing.content}\n${content}`
      : content;

    const block: CoreMemoryBlock = {
      id: blockId,
      category: existing?.category || this.inferCategory(blockId),
      content: newContent,
      lastUpdated: now,
    };

    this.coreMemory.set(blockId, block);
    this.saveCoreMemory();

    return block;
  }

  /**
   * 获取核心记忆块
   */
  getCoreBlock(blockId: string): CoreMemoryBlock | undefined {
    return this.coreMemory.get(blockId);
  }

  /**
   * 获取所有核心记忆块
   */
  getAllCoreBlocks(): CoreMemoryBlock[] {
    return Array.from(this.coreMemory.values());
  }

  /**
   * 删除核心记忆块
   */
  removeCoreBlock(blockId: string): boolean {
    const deleted = this.coreMemory.delete(blockId);
    if (deleted) {
      this.saveCoreMemory();
    }
    return deleted;
  }

  // ================================================================
  //  Recall Memory 操作
  // ================================================================

  /**
   * 搜索回忆记忆（最近的对话相关记忆）
   *
   * 使用 ChromaDB 向量搜索，collection 标识为 `{characterId}_recall`。
   */
  async recallSearch(query: string, limit: number = 5): Promise<MemorySearchResult[]> {
    try {
      const memories = await retrieveLocalMemories({
        query,
        characterId: this.recallCollectionId,
        limit,
      });

      return memories.map(m => ({
        content: m.content,
        score: m.score ?? 0.5,
        source: 'recall' as const,
        metadata: {
          id: m.id,
          importance: m.importance,
          emotion: m.emotion,
          tags: m.tags,
        },
      }));
    } catch (error) {
      console.warn('[TieredMemory] recallSearch 失败:', error);
      return [];
    }
  }

  /**
   * 存储到回忆记忆
   *
   * 使用 ChromaDB 存储，collection 标识为 `{characterId}_recall`。
   */
  async recallInsert(
    content: string,
    importance: number = 0.5,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    try {
      await storeLocalMemory({
        content,
        characterId: this.recallCollectionId,
        importance,
        emotion: (metadata?.emotion as string) || '',
        tags: (metadata?.tags as string[]) || [],
        source: 'chat',
      });
    } catch (error) {
      console.warn('[TieredMemory] recallInsert 失败:', error);
    }
  }

  // ================================================================
  //  Archival Memory 操作
  // ================================================================

  /**
   * 搜索归档记忆（长期大量记忆）
   *
   * 使用 ChromaDB 向量搜索，collection 标识为 `{characterId}_archival`。
   */
  async archivalSearch(query: string, limit: number = 5): Promise<MemorySearchResult[]> {
    try {
      const memories = await retrieveLocalMemories({
        query,
        characterId: this.archivalCollectionId,
        limit,
      });

      return memories.map(m => ({
        content: m.content,
        score: m.score ?? 0.5,
        source: 'archival' as const,
        metadata: {
          id: m.id,
          importance: m.importance,
          emotion: m.emotion,
          tags: m.tags,
        },
      }));
    } catch (error) {
      console.warn('[TieredMemory] archivalSearch 失败:', error);
      return [];
    }
  }

  /**
   * 插入归档记忆
   *
   * 使用 ChromaDB 存储，collection 标识为 `{characterId}_archival`。
   */
  async archivalInsert(
    content: string,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    try {
      await storeLocalMemory({
        content,
        characterId: this.archivalCollectionId,
        importance: (metadata?.importance as number) ?? 0.3,
        emotion: (metadata?.emotion as string) || '',
        tags: (metadata?.tags as string[]) || [],
        source: 'reflection',
      });
    } catch (error) {
      console.warn('[TieredMemory] archivalInsert 失败:', error);
    }
  }

  // ================================================================
  //  统一搜索
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

    for (const block of this.coreMemory.values()) {
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
      const recallResults = await this.recallSearch(query, limit);
      allResults.push(...recallResults);
    } catch {
      // 静默处理
    }

    // 3. Archival Memory 向量搜索
    try {
      const archivalResults = await this.archivalSearch(query, limit);
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

  // ================================================================
  //  LLM 记忆工具调用
  // ================================================================

  /**
   * 解析 LLM 输出中的记忆工具调用
   *
   * 支持的格式：
   * - `{"name": "core_memory_replace", "arguments": {"blockId": "...", "content": "..."}}`
   * - `{"name": "core_memory_append", "arguments": {"blockId": "...", "content": "..."}}`
   * - `{"name": "recall_memory_search", "arguments": {"query": "...", "limit": 5}}`
   * - `{"name": "archival_memory_insert", "arguments": {"content": "..."}}`
   * - `{"name": "archival_memory_search", "arguments": {"query": "...", "limit": 5}}`
   *
   * LLM 可能在输出中嵌入多个工具调用 JSON 对象。
   */
  parseMemoryToolCalls(llmOutput: string): MemoryToolCall[] {
    const toolCalls: MemoryToolCall[] = [];

    // 已知的记忆工具名称
    const knownTools = new Set([
      'core_memory_replace',
      'core_memory_append',
      'recall_memory_search',
      'archival_memory_insert',
      'archival_memory_search',
    ]);

    // 匹配 JSON 对象模式：{"name": "...", "arguments": {...}}
    // 使用非贪婪匹配，支持嵌套 JSON
    const jsonPattern = /\{"name"\s*:\s*"([^"]+)"\s*,\s*"arguments"\s*:\s*(\{[^}]*\})\s*\}/g;

    let match: RegExpExecArray | null;
    while ((match = jsonPattern.exec(llmOutput)) !== null) {
      const toolName = match[1];
      if (!knownTools.has(toolName)) {
        continue;
      }

      try {
        const args = JSON.parse(match[2]);
        toolCalls.push({
          name: toolName,
          arguments: args,
        });
      } catch {
        // 参数解析失败，跳过
        console.warn(`[TieredMemory] 无法解析工具调用参数: ${match[2]}`);
      }
    }

    // 备用模式：匹配更复杂的嵌套 arguments
    if (toolCalls.length === 0) {
      const complexPattern = /\{"name"\s*:\s*"([^"]+)"\s*,\s*"arguments"\s*:\s*(\{[\s\S]*?\})\s*\}/g;
      while ((match = complexPattern.exec(llmOutput)) !== null) {
        const toolName = match[1];
        if (!knownTools.has(toolName)) {
          continue;
        }

        try {
          const args = JSON.parse(match[2]);
          toolCalls.push({
            name: toolName,
            arguments: args,
          });
        } catch {
          // 尝试修复常见的 JSON 问题（如末尾多余逗号）
          try {
            const cleaned = match[2].replace(/,\s*([}\]])/g, '$1');
            const args = JSON.parse(cleaned);
            toolCalls.push({
              name: toolName,
              arguments: args,
            });
          } catch {
            console.warn(`[TieredMemory] 无法解析复杂工具调用参数`);
          }
        }
      }
    }

    return toolCalls;
  }

  /**
   * 执行记忆工具调用
   *
   * 路由到对应的记忆操作方法，返回结果文本。
   */
  async executeMemoryToolCall(toolCall: MemoryToolCall): Promise<string> {
    const { name, arguments: args } = toolCall;

    try {
      switch (name) {
        case 'core_memory_replace': {
          const blockId = String(args.blockId || '');
          const content = String(args.content || '');
          if (!blockId || !content) {
            return '[记忆工具错误] core_memory_replace 需要 blockId 和 content 参数';
          }
          const block = this.coreMemoryReplace(blockId, content);
          return `[记忆已更新] 核心记忆 "${block.id}" 已替换为: ${block.content}`;
        }

        case 'core_memory_append': {
          const blockId = String(args.blockId || '');
          const content = String(args.content || '');
          if (!blockId || !content) {
            return '[记忆工具错误] core_memory_append 需要 blockId 和 content 参数';
          }
          const block = this.coreMemoryAppend(blockId, content);
          return `[记忆已追加] 核心记忆 "${block.id}" 已追加内容`;
        }

        case 'recall_memory_search': {
          const query = String(args.query || '');
          const limit = Number(args.limit) || 5;
          if (!query) {
            return '[记忆工具错误] recall_memory_search 需要 query 参数';
          }
          const results = await this.recallSearch(query, limit);
          if (results.length === 0) {
            return '[回忆搜索] 未找到相关记忆';
          }
          const formatted = results
            .map((r, i) => `${i + 1}. [分数: ${r.score.toFixed(2)}] ${r.content}`)
            .join('\n');
          return `[回忆搜索结果]\n${formatted}`;
        }

        case 'archival_memory_insert': {
          const content = String(args.content || '');
          if (!content) {
            return '[记忆工具错误] archival_memory_insert 需要 content 参数';
          }
          await this.archivalInsert(content, args as Record<string, unknown>);
          return `[归档已插入] 内容已存入归档记忆`;
        }

        case 'archival_memory_search': {
          const query = String(args.query || '');
          const limit = Number(args.limit) || 5;
          if (!query) {
            return '[记忆工具错误] archival_memory_search 需要 query 参数';
          }
          const results = await this.archivalSearch(query, limit);
          if (results.length === 0) {
            return '[归档搜索] 未找到相关记忆';
          }
          const formatted = results
            .map((r, i) => `${i + 1}. [分数: ${r.score.toFixed(2)}] ${r.content}`)
            .join('\n');
          return `[归档搜索结果]\n${formatted}`;
        }

        default:
          return `[记忆工具错误] 未知工具: ${name}`;
      }
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      return `[记忆工具执行失败] ${name}: ${errMsg}`;
    }
  }

  /**
   * 生成记忆工具的 Prompt 描述（注入到系统 Prompt 中）
   *
   * 告诉 LLM 它可以使用哪些记忆工具以及如何使用它们。
   */
  getMemoryToolsPrompt(): string {
    return `你拥有一个分层记忆系统来管理你的长期记忆。你可以使用以下工具来主动管理记忆：

## 可用记忆工具

### 1. core_memory_replace - 替换核心记忆
替换一个核心记忆块的完整内容。核心记忆始终在你的上下文中。
- 参数: {"name": "core_memory_replace", "arguments": {"blockId": "<块ID>", "content": "<新内容>"}}
- 可用块ID: identity, relationship, preference, routine, important_fact
- 使用场景: 当你发现某个核心信息需要更新时（如用户告诉你他们的新工作）

### 2. core_memory_append - 追加核心记忆
向已有的核心记忆块追加新内容。
- 参数: {"name": "core_memory_append", "arguments": {"blockId": "<块ID>", "content": "<追加内容>"}}
- 使用场景: 当你需要在不覆盖现有信息的情况下添加新信息时

### 3. recall_memory_search - 搜索回忆记忆
搜索过去的对话历史中与查询相关的记忆。
- 参数: {"name": "recall_memory_search", "arguments": {"query": "<搜索内容>", "limit": <数量>}}
- 使用场景: 当你需要回忆之前对话中提到的信息时

### 4. archival_memory_insert - 插入归档记忆
将信息存入长期归档记忆。归档记忆不会自动出现在上下文中，但可以通过搜索检索。
- 参数: {"name": "archival_memory_insert", "arguments": {"content": "<要归档的内容>"}}
- 使用场景: 当你学到新的重要信息但不想占用核心记忆空间时

### 5. archival_memory_search - 搜索归档记忆
搜索长期归档记忆中与查询相关的信息。
- 参数: {"name": "archival_memory_search", "arguments": {"query": "<搜索内容>", "limit": <数量>}}
- 使用场景: 当你需要查找之前归档的详细信息时

## 使用规则
- 只在对话中出现值得记住的重要信息时才使用记忆工具
- 日常寒暄不需要记忆
- 替换核心记忆时要谨慎，确保新内容准确完整
- 你可以在一次回复中使用多个记忆工具
- 工具调用的JSON格式必须正确`;
  }

  // ================================================================
  //  持久化
  // ================================================================

  /**
   * 保存核心记忆到 JSON 文件
   *
   * 文件路径: `{dataDir}/core_memory_{characterId}.json`
   */
  saveCoreMemory(): void {
    try {
      const data: Record<string, CoreMemoryBlock> = {};
      for (const [key, block] of this.coreMemory) {
        data[key] = block;
      }

      const filePath = this.getCoreMemoryFilePath();
      const dir = path.dirname(filePath);

      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
      console.warn('[TieredMemory] 保存核心记忆失败:', error);
    }
  }

  /**
   * 从 JSON 文件加载核心记忆
   *
   * 文件路径: `{dataDir}/core_memory_{characterId}.json`
   */
  loadCoreMemory(): void {
    try {
      const filePath = this.getCoreMemoryFilePath();

      if (!fs.existsSync(filePath)) {
        console.log('[TieredMemory] 核心记忆文件不存在，使用空记忆初始化');
        return;
      }

      const raw = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(raw) as Record<string, CoreMemoryBlock>;

      this.coreMemory.clear();
      for (const [key, block] of Object.entries(data)) {
        if (block && block.id && block.content && block.category) {
          this.coreMemory.set(key, block);
        }
      }

      console.log(`[TieredMemory] 已加载 ${this.coreMemory.size} 个核心记忆块`);
    } catch (error) {
      console.warn('[TieredMemory] 加载核心记忆失败:', error);
    }
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
    let recallCount = 0;
    let archivalCount = 0;

    // 获取 recall 记忆数量
    try {
      const recallMemories = await getAllMemories(this.recallCollectionId);
      recallCount = recallMemories.length;
    } catch {
      // ChromaDB 可能不可用
    }

    // 获取 archival 记忆数量
    try {
      const archivalMemories = await getAllMemories(this.archivalCollectionId);
      archivalCount = archivalMemories.length;
    } catch {
      // ChromaDB 可能不可用
    }

    return {
      coreBlocks: this.coreMemory.size,
      recallCount,
      archivalCount,
    };
  }

  /**
   * 获取核心记忆统计（同步版本）
   */
  getCoreStats(): { coreBlocks: number; totalChars: number } {
    let totalChars = 0;
    for (const block of this.coreMemory.values()) {
      totalChars += block.content.length;
    }
    return {
      coreBlocks: this.coreMemory.size,
      totalChars,
    };
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
    await this.recallInsert(content, importance);

    // 如果重要性较高，同时存入 Archival Memory 作为长期备份
    if (importance >= 0.7) {
      await this.archivalInsert(content, { importance });
    }
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
      this.coreMemoryAppend(category, content);
      await this.archivalInsert(content, { importance, ...metadata });
      return `core+archival (importance=${importance.toFixed(2)})`;
    } else if (importance >= 0.5) {
      // 中等重要性：存入回忆记忆
      await this.recallInsert(content, importance, metadata);
      return `recall (importance=${importance.toFixed(2)})`;
    } else {
      // 低重要性：仅存入归档
      await this.archivalInsert(content, { importance, ...metadata });
      return `archival (importance=${importance.toFixed(2)})`;
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
   * 推断核心记忆块的类别
   */
  private inferCategory(blockId: string): CoreMemoryBlock['category'] {
    const categoryMap: Record<string, CoreMemoryBlock['category']> = {
      identity: 'identity',
      relationship: 'relationship',
      preference: 'preference',
      routine: 'routine',
      important_fact: 'important_fact',
      important: 'important_fact',
      fact: 'important_fact',
      habit: 'routine',
      habits: 'routine',
      like: 'preference',
      dislike: 'preference',
      family: 'relationship',
      friend: 'relationship',
    };

    const idLower = blockId.toLowerCase();
    for (const [key, category] of Object.entries(categoryMap)) {
      if (idLower.includes(key)) {
        return category;
      }
    }

    return 'important_fact'; // 默认类别
  }

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
   * 获取核心记忆文件路径
   */
  private getCoreMemoryFilePath(): string {
    // 清理 characterId 中的特殊字符，确保文件名安全
    const safeId = this.characterId.replace(/[^a-zA-Z0-9_\u4e00-\u9fff-]/g, '_');
    return path.join(this.dataDir, `core_memory_${safeId}.json`);
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
