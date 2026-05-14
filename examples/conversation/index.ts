/**
 * Forever - 对话系统模块
 *
 * 统一导出所有对话相关类和类型
 */

// 类型定义
export type {
  ChatResult,
  StreamChunk,
  ConversationOptions,
  EthicsResult,
  MemoryExtraction,
  ReflectionResult,
  CharacterCard,
  Message,
  LLMConfig,
  TieredMemoryManager,
} from './types';

// 核心类
export { ForeverConversation } from './core';

// 流式对话类
export { ForeverConversationStream } from './stream';

// 工具函数
export {
  applyHumanImperfection,
  calculateImportanceScore,
  truncateText,
  safeParseInt,
  logWarning,
  buildConsistencyPrompt,
  MEMORY_KEYWORDS,
} from './utils';
