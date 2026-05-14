/**
 * Core Memory 模块 - 核心记忆操作
 *
 * Core Memory 是始终在上下文中的记忆，按类别分块存储：
 * - identity: 身份与基本信息
 * - relationship: 关系与人际
 * - preference: 偏好与喜好
 * - routine: 习惯与日常
 * - important_fact: 重要事实
 */

import * as fs from 'fs';
import * as path from 'path';

// ============ 类型定义 ============

export interface CoreMemoryBlock {
  id: string;
  category: 'identity' | 'relationship' | 'preference' | 'routine' | 'important_fact';
  content: string;
  lastUpdated: string;
}

/** 记忆搜索结果类型 */
export interface MemorySearchResult {
  content: string;
  score: number;
  source: 'archival' | 'recall';
  metadata: {
    id: string;
    importance: number;
    emotion: string;
    tags: string[];
  };
}

// ============ 分类标签映射 ============

export const CATEGORY_LABELS: Record<CoreMemoryBlock['category'], string> = {
  identity: '身份与基本',
  relationship: '关系与人际',
  preference: '偏好与喜好',
  routine: '习惯与日常',
  important_fact: '重要事实',
};

// ============ 核心记忆管理器 ============

export class CoreMemoryManager {
  private characterId: string;
  private dataDir: string;

  /** Core Memory: 始终在上下文中，按类别分块 */
  private coreMemory: Map<string, CoreMemoryBlock> = new Map();

  constructor(characterId: string, dataDir: string) {
    this.characterId = characterId;
    this.dataDir = dataDir;
  }

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
    habits?: Array<{ name?: string; description?: string; frequency?: string; content?: string; type?: string }>;
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
        .map(h => {
          // 支持两种 habits 格式：
          // 1. 旧格式: { name, description, frequency }
          // 2. 新格式 (Habit 类型): { content, type }
          const name = h.name || h.content || '';
          const desc = h.description || (h.type ? `[${h.type}]` : '');
          const freq = h.frequency || '';
          return `${name}${desc ? `：${desc}` : ''}${freq ? `（${freq}）` : ''}`;
        })
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
    this.saveToFile();
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
    this.saveToFile();

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
    this.saveToFile();

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
      this.saveToFile();
    }
    return deleted;
  }

  /**
   * 保存核心记忆到 JSON 文件
   *
   * 文件路径: `{dataDir}/core_memory_{characterId}.json`
   */
  saveToFile(): void {
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
      console.warn('[CoreMemoryManager] 保存核心记忆失败:', error);
    }
  }

  /**
   * 从 JSON 文件加载核心记忆
   *
   * 文件路径: `{dataDir}/core_memory_{characterId}.json`
   */
  loadFromFile(): void {
    try {
      const filePath = this.getCoreMemoryFilePath();

      if (!fs.existsSync(filePath)) {
        console.log('[CoreMemoryManager] 核心记忆文件不存在，使用空记忆初始化');
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

      console.log(`[CoreMemoryManager] 已加载 ${this.coreMemory.size} 个核心记忆块`);
    } catch (error) {
      console.warn('[CoreMemoryManager] 加载核心记忆失败:', error);
    }
  }

  /**
   * 获取核心记忆统计
   */
  getStats(): { coreBlocks: number; totalChars: number } {
    let totalChars = 0;
    for (const block of this.coreMemory.values()) {
      totalChars += block.content.length;
    }
    return {
      coreBlocks: this.coreMemory.size,
      totalChars,
    };
  }

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
   * 获取核心记忆文件路径
   */
  private getCoreMemoryFilePath(): string {
    // 清理 characterId 中的特殊字符，确保文件名安全
    const safeId = this.characterId.replace(/[^a-zA-Z0-9_\u4e00-\u9fff-]/g, '_');
    return path.join(this.dataDir, `core_memory_${safeId}.json`);
  }
}
