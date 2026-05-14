/**
 * Forever - 基于内存的检查点持久化
 *
 * 使用 Map 存储检查点数据，适用于单进程场景和测试。
 * 数据不持久化，进程重启后丢失。
 */

import type { Checkpoint, CheckpointListOptions } from './types';
import { BaseCheckpointer, logger } from './base';

/**
 * 基于内存的检查点持久化实现
 */
export class MemoryCheckpointer extends BaseCheckpointer {
  /** 线程 -> 检查点列表 */
  private threads: Map<string, Checkpoint[]> = new Map();

  async save(checkpoint: Checkpoint): Promise<void> {
    const threadId = checkpoint.threadId;
    if (!this.threads.has(threadId)) {
      this.threads.set(threadId, []);
    }
    const list = this.threads.get(threadId)!;

    // 如果存在同 ID 的检查点，替换它
    const existingIndex = list.findIndex(c => c.id === checkpoint.id);
    if (existingIndex >= 0) {
      list[existingIndex] = checkpoint;
    } else {
      list.push(checkpoint);
    }

    logger.debug('checkpoint:memory', `保存检查点 ${checkpoint.id} 到线程 ${threadId}`);
  }

  async load(threadId: string, checkpointId?: string): Promise<Checkpoint | null> {
    const list = this.threads.get(threadId);
    if (!list || list.length === 0) return null;

    if (checkpointId) {
      return list.find(c => c.id === checkpointId) ?? null;
    }

    // 返回最新的检查点
    return list[list.length - 1] ?? null;
  }

  async list(
    threadId: string,
    options: CheckpointListOptions = {},
  ): Promise<Checkpoint[]> {
    const list = this.threads.get(threadId) ?? [];
    const { limit, offset = 0, order = 'desc', metadataFilter } = options;

    let result = [...list];

    // 元数据过滤
    if (metadataFilter) {
      result = result.filter(cp => {
        if (!cp.metadata) return false;
        return Object.entries(metadataFilter).every(
          ([key, value]) => cp.metadata![key] === value,
        );
      });
    }

    // 按时间排序
    result.sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return order === 'desc' ? timeB - timeA : timeA - timeB;
    });

    // 分页
    const sliced = result.slice(offset);
    return limit !== undefined ? sliced.slice(0, limit) : sliced;
  }

  async delete(threadId: string, checkpointId: string): Promise<boolean> {
    const list = this.threads.get(threadId);
    if (!list) return false;

    const index = list.findIndex(c => c.id === checkpointId);
    if (index < 0) return false;

    list.splice(index, 1);
    logger.debug('checkpoint:memory', `删除检查点 ${checkpointId} 从线程 ${threadId}`);
    return true;
  }

  /**
   * 清空所有线程的检查点（用于测试）
   */
  clear(): void {
    this.threads.clear();
  }

  /**
   * 获取当前存储的线程数量
   */
  getThreadCount(): number {
    return this.threads.size;
  }
}
