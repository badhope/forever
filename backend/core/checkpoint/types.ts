/**
 * Forever - 检查点持久化系统类型定义
 *
 * 定义检查点系统的核心类型：Checkpoint、CheckpointListOptions、CheckpointManagerOptions 等。
 */

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
