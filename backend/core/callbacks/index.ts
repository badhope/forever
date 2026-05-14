/**
 * @module callbacks
 * @description 回调与追踪系统（参考 LangChain Callbacks + LangSmith）
 *
 * 提供完整的执行追踪和回调机制，支持：
 * - LLM、工具、链、Agent 的生命周期事件回调
 * - 异步回调处理器
 * - 执行追踪树（TraceSpan）
 * - 彩色控制台输出
 * - JSON 日志文件记录
 * - 统计信息收集（LLM 调用次数、工具调用次数、Token 使用量）
 */

// 类型导出
export type {
  CallbackEventType,
  CallbackEvent,
  LLMCallbackData,
  ToolCallbackData,
  ChainCallbackData,
  AgentCallbackData,
  MemoryCallbackData,
} from './types';

// 抽象基类
export { BaseCallbackHandler } from './handler';

// 回调管理器
export { CallbackManager } from './manager';

// 追踪系统
export { TraceSpan, Tracer } from './tracer';
export type { TraceStats } from './tracer';

// 内置处理器
export { ConsoleCallbackHandler, FileCallbackHandler } from './handlers';
export type { FileCallbackHandlerConfig } from './handlers';
