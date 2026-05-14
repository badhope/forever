/**
 * Archival Memory 模块 - 归档记忆操作
 *
 * Archival Memory 是基于 ChromaDB 的长期存储，用于保存反思、洞察和大量历史记忆。
 * 相比 Recall Memory，Archival Memory 存储更大量的数据，但检索优先级较低。
 */

import {
  storeLocalMemory,
  retrieveLocalMemories,
} from '../core/bridge/index';

import type { MemorySearchResult } from './core-memory';

// 重新导出 MemorySearchResult 以便使用
export type { MemorySearchResult };

// ============ 归档记忆管理器 ============

export class ArchivalMemoryManager {
  private characterId: string;

  /** Archival Memory 的 ChromaDB collection 标识 */
  private archivalCollectionId: string;

  constructor(characterId: string) {
    this.characterId = characterId;
    this.archivalCollectionId = `${characterId}_archival`;
  }

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
          emotion: m.emotion ?? '',
          tags: m.tags ?? [],
        },
      }));
    } catch (error) {
      console.warn('[ArchivalMemoryManager] archivalSearch 失败:', error);
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
      console.warn('[ArchivalMemoryManager] archivalInsert 失败:', error);
    }
  }

  /**
   * 批量插入归档记忆
   *
   * 用于一次性存储多条归档记忆记录。
   */
  async archivalInsertBatch(
    items: Array<{
      content: string;
      metadata?: Record<string, unknown>;
    }>,
  ): Promise<void> {
    try {
      // 由于 bridge API 可能不支持真正的批量插入，
      // 这里使用 Promise.all 并行执行多个单条插入
      await Promise.all(
        items.map(item =>
          this.archivalInsert(
            item.content,
            item.metadata,
          ),
        ),
      );
    } catch (error) {
      console.warn('[ArchivalMemoryManager] archivalInsertBatch 失败:', error);
    }
  }

  /**
   * 获取归档记忆数量统计
   */
  async getCount(): Promise<number> {
    try {
      // 尝试通过搜索空字符串或特殊查询来获取数量
      // 由于 bridge API 限制，这里返回 0 表示未知
      // 实际项目中可以实现专门的计数 API
      return 0;
    } catch {
      return 0;
    }
  }
}
