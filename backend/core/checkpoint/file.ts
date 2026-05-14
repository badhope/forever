/**
 * Forever - 基于文件系统的检查点持久化
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

import * as fs from 'fs';
import * as path from 'path';
import type { Checkpoint, CheckpointListOptions } from './types';
import { BaseCheckpointer, logger } from './base';

/**
 * 基于文件系统的检查点持久化实现
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
