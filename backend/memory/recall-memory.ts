/**
 * Recall Memory 模块 - 回忆记忆操作
 *
 * Recall Memory 是基于 ChromaDB 的向量存储，用于存储最近的对话历史。
 * 可以通过向量搜索快速检索相关记忆。
 */

import {
  storeLocalMemory,
  retrieveLocalMemories,
} from '../core/bridge/index';

import type { MemorySearchResult } from './core-memory';

// 重新导出 MemorySearchResult 以便使用
export type { MemorySearchResult };

// ============ 回忆记忆管理器 ============

export class RecallMemoryManager {
  private characterId: string;

  /** Recall Memory 的 ChromaDB collection 标识 */
  private recallCollectionId: string;

  constructor(characterId: string) {
    this.characterId = characterId;
    this.recallCollectionId = `${characterId}_recall`;
  }

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
      console.warn('[RecallMemoryManager] recallSearch 失败:', error);
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
      console.warn('[RecallMemoryManager] recallInsert 失败:', error);
    }
  }

  /**
   * 批量插入回忆记忆
   *
   * 用于一次性存储多条记忆记录。
   */
  async recallInsertBatch(
    items: Array<{
      content: string;
      importance?: number;
      metadata?: Record<string, unknown>;
    }>,
  ): Promise<void> {
    try {
      // 由于 bridge API 可能不支持真正的批量插入，
      // 这里使用 Promise.all 并行执行多个单条插入
      await Promise.all(
        items.map(item =>
          this.recallInsert(
            item.content,
            item.importance ?? 0.5,
            item.metadata,
          ),
        ),
      );
    } catch (error) {
      console.warn('[RecallMemoryManager] recallInsertBatch 失败:', error);
    }
  }

  /**
   * 获取回忆记忆数量统计
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
