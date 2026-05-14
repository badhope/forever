/**
 * Forever - 检查点持久化系统
 *
 * 参考 LangGraph Checkpointer 设计，提供工作流状态检查点的保存、加载与管理能力。
 *
 * 核心概念：
 * - Checkpoint: 工作流在某一时刻的完整状态快照
 * - Thread: 对话线程，不同线程的检查点互相隔离
 * - Checkpointer: 检查点持久化后端（内存 / 文件系统）
 * - CheckpointManager: 管理检查点生命周期，支持自动快照、数量限制、时间清理
 *
 * 典型用法：
 * ```ts
 * const manager = new CheckpointManager(new MemoryCheckpointer());
 * await manager.save('thread-1', { step: 1, data: '...' });
 * const state = await manager.load('thread-1');
 * ```
 */

import * as fs from 'fs';
import * as path from 'path';
import { logger } from '../logger';

// ============ 类型定义 ============

/**
 * 检查点：工作流在某一时刻的完整状态快照
 */
export interface Checkpoint {
  /** 检查点唯一标识 */
  id: string;
  /** 所属线程 ID */
  threadId: string;
  /** 工作流状态数据 */
  state: Record<string, any>;
  /** 创建时间戳（ISO 8601） */
  timestamp: string;
  /** 附加元数据 */
  metadata?: Record<string, any>;
}

/**
 * 检查点列表过滤选项
 */
export interface CheckpointListOptions {
  /** 最大返回数量 */
  limit?: number;
  /** 起始偏移量 */
  offset?: number;
  /** 按时间排序方向 */
  order?: 'asc' | 'desc';
  /** 按元数据过滤 */
  metadataFilter?: Record<string, any>;
}

/**
 * 检查点管理器配置
 */
export interface CheckpointManagerOptions {
  /** 每个线程最大保留检查点数量（默认 100） */
  maxCheckpointsPerThread?: number;
  /** 检查点最大保留时长（毫秒），超时自动清理（默认 24h） */
  maxAge?: number;
  /** 是否在每次保存时自动清理过期检查点（默认 true） */
  autoCleanup?: boolean;
  /** 自动快照间隔（毫秒），0 表示不自动快照（默认 0） */
  autoSnapshotInterval?: number;
}

// ============ 抽象基类 ============

/**
 * 检查点持久化后端抽象类
 *
 * 所有 Checkpointer 实现必须继承此类并实现四个核心方法。
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

// ============ 内存检查点实现 ============

/**
 * 基于内存的检查点持久化
 *
 * 使用 Map 存储检查点数据，适用于单进程场景和测试。
 * 数据不持久化，进程重启后丢失。
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

// ============ 文件检查点实现 ============

/**
 * 基于文件系统的检查点持久化
 *
 * 每个线程一个目录，检查点以 JSON 文件存储。
 * 目录结构：
 * ```
 * data/checkpoints/
 *   ├── thread-1/
 *   │   ├── cp_abc123.json
 *   │   └── cp_def456.json
 *   └── thread-2/
 *       └── cp_ghi789.json
 * ```
 */
export class FileCheckpointer extends BaseCheckpointer {
  private basePath: string;

  /**
   * @param basePath 检查点根目录路径（默认 data/checkpoints）
   */
  constructor(basePath?: string) {
    super();
    this.basePath = basePath || path.join(process.cwd(), 'data', 'checkpoints');
  }

  /**
   * 获取线程的检查点目录路径
   */
  private getThreadDir(threadId: string): string {
    return path.join(this.basePath, threadId);
  }

  /**
   * 获取检查点文件路径
   */
  private getCheckpointPath(threadId: string, checkpointId: string): string {
    return path.join(this.getThreadDir(threadId), `${checkpointId}.json`);
  }

  /**
   * 确保线程目录存在
   */
  private ensureThreadDir(threadId: string): void {
    const dir = this.getThreadDir(threadId);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  async save(checkpoint: Checkpoint): Promise<void> {
    this.ensureThreadDir(checkpoint.threadId);
    const filePath = this.getCheckpointPath(checkpoint.threadId, checkpoint.id);
    const content = JSON.stringify(checkpoint, null, 2);
    fs.writeFileSync(filePath, content, 'utf-8');
    logger.debug('checkpoint:file', `保存检查点 ${checkpoint.id} 到 ${filePath}`);
  }

  async load(threadId: string, checkpointId?: string): Promise<Checkpoint | null> {
    if (checkpointId) {
      const filePath = this.getCheckpointPath(threadId, checkpointId);
      if (!fs.existsSync(filePath)) return null;
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content) as Checkpoint;
    }

    // 加载最新的检查点
    const checkpoints = await this.list(threadId, { limit: 1, order: 'desc' });
    return checkpoints.length > 0 ? checkpoints[0] : null;
  }

  async list(
    threadId: string,
    options: CheckpointListOptions = {},
  ): Promise<Checkpoint[]> {
    const threadDir = this.getThreadDir(threadId);
    if (!fs.existsSync(threadDir)) return [];

    const { limit, offset = 0, order = 'desc', metadataFilter } = options;

    let files: string[];
    try {
      files = fs.readdirSync(threadDir).filter(f => f.endsWith('.json'));
    } catch {
      return [];
    }

    // 读取并解析所有检查点
    let checkpoints: Checkpoint[] = files.map(f => {
      const content = fs.readFileSync(path.join(threadDir, f), 'utf-8');
      return JSON.parse(content) as Checkpoint;
    });

    // 元数据过滤
    if (metadataFilter) {
      checkpoints = checkpoints.filter(cp => {
        if (!cp.metadata) return false;
        return Object.entries(metadataFilter).every(
          ([key, value]) => cp.metadata![key] === value,
        );
      });
    }

    // 按时间排序
    checkpoints.sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return order === 'desc' ? timeB - timeA : timeA - timeB;
    });

    // 分页
    const sliced = checkpoints.slice(offset);
    return limit !== undefined ? sliced.slice(0, limit) : sliced;
  }

  async delete(threadId: string, checkpointId: string): Promise<boolean> {
    const filePath = this.getCheckpointPath(threadId, checkpointId);
    if (!fs.existsSync(filePath)) return false;

    fs.unlinkSync(filePath);
    logger.debug('checkpoint:file', `删除检查点 ${checkpointId} 从线程 ${threadId}`);
    return true;
  }

  /**
   * 删除整个线程的所有检查点
   * @param threadId 线程 ID
   */
  async deleteThread(threadId: string): Promise<boolean> {
    const threadDir = this.getThreadDir(threadId);
    if (!fs.existsSync(threadDir)) return false;

    try {
      fs.rmSync(threadDir, { recursive: true, force: true });
      logger.debug('checkpoint:file', `删除线程 ${threadId} 的所有检查点`);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 列出所有线程 ID
   */
  listThreads(): string[] {
    if (!fs.existsSync(this.basePath)) return [];

    try {
      return fs.readdirSync(this.basePath).filter(name => {
        const fullPath = path.join(this.basePath, name);
        return fs.statSync(fullPath).isDirectory();
      });
    } catch {
      return [];
    }
  }
}

// ============ 检查点管理器 ============

/**
 * 检查点管理器
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

// ============ 导出 ============

export {
  MemoryCheckpointer,
  FileCheckpointer,
  CheckpointManager,
};
