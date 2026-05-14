/**
 * Forever - 检查点管理器
 *
 * 管理检查点的完整生命周期：
 * - 自动生成检查点 ID
 * - 自动添加时间戳
 * - 每线程最大数量限制（超出时自动删除最旧的）
 * - 按时间自动清理过期检查点
 * - 可选的定时自动快照
 *
 * 使用示例：
 * ```ts
 * const manager = new CheckpointManager(
 *   new FileCheckpointer('./data/checkpoints'),
 *   { maxCheckpointsPerThread: 50, maxAge: 3600000 }
 * );
 * const cp = await manager.save('thread-1', { step: 5, result: '...' });
 * const latest = await manager.loadLatest('thread-1');
 * ```
 */

import type { Checkpoint, CheckpointListOptions, CheckpointManagerOptions } from './types';
import { BaseCheckpointer } from './base';
import { FileCheckpointer } from './file';
import { logger } from '../logger';

/**
 * 检查点管理器
 */
export class CheckpointManager {
  private checkpointer: BaseCheckpointer;
  private options: Required<CheckpointManagerOptions>;
  private autoSnapshotTimer: ReturnType<typeof setInterval> | null = null;

  /**
   * @param checkpointer 检查点持久化后端
   * @param options 管理器配置
   */
  constructor(
    checkpointer: BaseCheckpointer,
    options: CheckpointManagerOptions = {},
  ) {
    this.checkpointer = checkpointer;
    this.options = {
      maxCheckpointsPerThread: options.maxCheckpointsPerThread ?? 100,
      maxAge: options.maxAge ?? 24 * 60 * 60 * 1000, // 24 小时
      autoCleanup: options.autoCleanup ?? true,
      autoSnapshotInterval: options.autoSnapshotInterval ?? 0,
    };

    // 启动自动快照（如果配置了）
    if (this.options.autoSnapshotInterval > 0) {
      this.startAutoSnapshot();
    }
  }

  /**
   * 生成唯一的检查点 ID
   */
  private generateId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).slice(2, 8);
    return `cp_${timestamp}_${random}`;
  }

  /**
   * 保存检查点
   *
   * 自动生成 ID、添加时间戳，并在需要时清理过期检查点。
   *
   * @param threadId 线程 ID
   * @param state 工作流状态
   * @param metadata 附加元数据
   * @returns 保存后的检查点
   */
  async save(
    threadId: string,
    state: Record<string, any>,
    metadata?: Record<string, any>,
  ): Promise<Checkpoint> {
    const checkpoint: Checkpoint = {
      id: this.generateId(),
      threadId,
      state,
      timestamp: new Date().toISOString(),
      metadata,
    };

    await this.checkpointer.save(checkpoint);

    // 自动清理
    if (this.options.autoCleanup) {
      await this.enforceMaxCheckpoints(threadId);
      await this.cleanupExpired(threadId);
    }

    logger.info('checkpoint:manager', `保存检查点 ${checkpoint.id} 到线程 ${threadId}`);
    return checkpoint;
  }

  /**
   * 加载指定检查点
   *
   * @param threadId 线程 ID
   * @param checkpointId 检查点 ID，不传则加载最新
   */
  async load(threadId: string, checkpointId?: string): Promise<Checkpoint | null> {
    return this.checkpointer.load(threadId, checkpointId);
  }

  /**
   * 加载线程的最新检查点
   * @param threadId 线程 ID
   */
  async loadLatest(threadId: string): Promise<Checkpoint | null> {
    return this.checkpointer.getLatest(threadId);
  }

  /**
   * 列出线程的所有检查点
   */
  async list(
    threadId: string,
    options?: CheckpointListOptions,
  ): Promise<Checkpoint[]> {
    return this.checkpointer.list(threadId, options);
  }

  /**
   * 删除指定检查点
   */
  async delete(threadId: string, checkpointId: string): Promise<boolean> {
    return this.checkpointer.delete(threadId, checkpointId);
  }

  /**
   * 检查线程是否有检查点
   */
  async hasCheckpoints(threadId: string): Promise<boolean> {
    return this.checkpointer.hasCheckpoints(threadId);
  }

  /**
   * 强制执行最大检查点数量限制
   *
   * 超出限制时，按时间顺序删除最旧的检查点。
   */
  private async enforceMaxCheckpoints(threadId: string): Promise<void> {
    const max = this.options.maxCheckpointsPerThread;
    const checkpoints = await this.checkpointer.list(threadId, {
      order: 'asc', // 最旧的在前
    });

    if (checkpoints.length <= max) return;

    const toDelete = checkpoints.slice(0, checkpoints.length - max);
    for (const cp of toDelete) {
      await this.checkpointer.delete(threadId, cp.id);
      logger.debug('checkpoint:manager', `因数量限制删除检查点 ${cp.id}`);
    }
  }

  /**
   * 清理过期的检查点
   *
   * 删除超过 maxAge 时长的检查点。
   */
  async cleanupExpired(threadId: string): Promise<number> {
    const now = Date.now();
    const maxAge = this.options.maxAge;
    const checkpoints = await this.checkpointer.list(threadId, {
      order: 'asc',
    });

    let deletedCount = 0;
    for (const cp of checkpoints) {
      const age = now - new Date(cp.timestamp).getTime();
      if (age > maxAge) {
        await this.checkpointer.delete(threadId, cp.id);
        deletedCount++;
        logger.debug('checkpoint:manager', `因过期删除检查点 ${cp.id}`);
      } else {
        // 按时间排序，遇到未过期的就可以停止
        break;
      }
    }

    return deletedCount;
  }

  /**
   * 清理所有线程的过期检查点
   */
  async cleanupAllExpired(): Promise<number> {
    // 如果是 FileCheckpointer，可以列出所有线程
    let threadIds: string[] = [];
    if (this.checkpointer instanceof FileCheckpointer) {
      threadIds = this.checkpointer.listThreads();
    } else {
      // MemoryCheckpointer 没有直接列出线程的方法，暂不处理
      logger.warn('checkpoint:manager', '当前 checkpointer 不支持列出所有线程');
      return 0;
    }

    let totalDeleted = 0;
    for (const threadId of threadIds) {
      const deleted = await this.cleanupExpired(threadId);
      totalDeleted += deleted;
    }

    if (totalDeleted > 0) {
      logger.info('checkpoint:manager', `清理了 ${totalDeleted} 个过期检查点`);
    }
    return totalDeleted;
  }

  /**
   * 启动定时自动快照
   *
   * 需要配合 autoSnapshotCallback 使用，由调用方提供当前状态的获取逻辑。
   */
  startAutoSnapshot(
    callback?: (threadId: string) => Promise<Record<string, any> | null>,
    threadId?: string,
  ): void {
    if (this.autoSnapshotTimer) {
      clearInterval(this.autoSnapshotTimer);
    }

    if (this.options.autoSnapshotInterval <= 0) return;

    this.autoSnapshotTimer = setInterval(async () => {
      if (callback && threadId) {
        try {
          const state = await callback(threadId);
          if (state) {
            await this.save(threadId, state, { autoSnapshot: true });
            logger.debug('checkpoint:manager', `自动快照完成: ${threadId}`);
          }
        } catch (err) {
          logger.error('checkpoint:manager', '自动快照失败', err);
        }
      }
    }, this.options.autoSnapshotInterval);

    // 防止定时器阻止进程退出
    if (this.autoSnapshotTimer.unref) {
      this.autoSnapshotTimer.unref();
    }
  }

  /**
   * 停止自动快照
   */
  stopAutoSnapshot(): void {
    if (this.autoSnapshotTimer) {
      clearInterval(this.autoSnapshotTimer);
      this.autoSnapshotTimer = null;
    }
  }

  /**
   * 获取检查点统计信息
   */
  async getStats(threadId: string): Promise<{
    count: number;
    oldest: string | null;
    newest: string | null;
  }> {
    const checkpoints = await this.checkpointer.list(threadId, {
      order: 'asc',
    });

    if (checkpoints.length === 0) {
      return { count: 0, oldest: null, newest: null };
    }

    return {
      count: checkpoints.length,
      oldest: checkpoints[0].timestamp,
      newest: checkpoints[checkpoints.length - 1].timestamp,
    };
  }

  /**
   * 销毁管理器，停止自动快照
   */
  destroy(): void {
    this.stopAutoSnapshot();
  }
}
