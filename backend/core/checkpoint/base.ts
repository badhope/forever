/**
 * Forever - 检查点持久化系统抽象基类
 *
 * 定义检查点持久化后端的抽象接口。
 * 所有 Checkpointer 实现必须继承此类并实现四个核心方法。
 */

import type { Checkpoint, CheckpointListOptions } from './types';
import { logger } from '../logger';

/**
 * 检查点持久化后端抽象类
 *
 * 支持线程隔离：不同 threadId 的检查点完全独立。
 */
export abstract class BaseCheckpointer {
  /**
   * 保存检查点
   * @param checkpoint 要保存的检查点数据
   */
  abstract save(checkpoint: Checkpoint): Promise<void>;

  /**
   * 加载指定检查点
   * @param threadId 线程 ID
   * @param checkpointId 检查点 ID，不传则加载最新
   */
  abstract load(threadId: string, checkpointId?: string): Promise<Checkpoint | null>;

  /**
   * 列出线程的所有检查点
   * @param threadId 线程 ID
   * @param options 过滤和排序选项
   */
  abstract list(threadId: string, options?: CheckpointListOptions): Promise<Checkpoint[]>;

  /**
   * 删除指定检查点
   * @param threadId 线程 ID
   * @param checkpointId 检查点 ID
   */
  abstract delete(threadId: string, checkpointId: string): Promise<boolean>;

  /**
   * 获取线程的最新检查点
   * @param threadId 线程 ID
   */
  async getLatest(threadId: string): Promise<Checkpoint | null> {
    const checkpoints = await this.list(threadId, { limit: 1, order: 'desc' });
    return checkpoints.length > 0 ? checkpoints[0] : null;
  }

  /**
   * 检查指定线程是否存在检查点
   * @param threadId 线程 ID
   */
  async hasCheckpoints(threadId: string): Promise<boolean> {
    const checkpoints = await this.list(threadId, { limit: 1 });
    return checkpoints.length > 0;
  }
}

// Re-export logger for subclasses
export { logger };
