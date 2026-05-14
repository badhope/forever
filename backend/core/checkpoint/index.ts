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

// 类型导出
export type {
  Checkpoint,
  CheckpointListOptions,
  CheckpointManagerOptions,
} from './types';

// 基类导出
export { BaseCheckpointer } from './base';

// 实现导出
export { MemoryCheckpointer } from './memory';
export { FileCheckpointer } from './file';
export { CheckpointManager } from './manager';
