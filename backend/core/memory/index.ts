/**
 * @module memory
 * @description 记忆管理模块
 *
 * 提供长期记忆存储、压缩和检索功能。
 */

export {
  MemoryCompressor,
  LongTermMemory,
  calculateImportance,
  updateImportanceOnAccess,
  DEFAULT_COMPRESSION_CONFIG,
  type MemoryEntry,
  type CompressionConfig,
  type CompressionResult,
} from './compression';
