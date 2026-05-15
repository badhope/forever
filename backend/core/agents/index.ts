/**
 * @module agents
 * @description Forever 多智能体协作框架
 *
 * 参考 AutoGPT + CrewAI + LangGraph Multi-Agent 设计理念，
 * 提供智能体注册、编排、通信和团队协作能力。
 * 
 * 新增功能：
 * - 流式输出支持（StreamingAgent）
 * - 函数调用集成（Function Calling）
 * - 增强运行时（Agent Runtime）
 */

// ============================================================================
// 核心类型与基类
// ============================================================================

export type {
  AgentId,
  AgentConfig,
  AgentMessage,
  AgentState,
  AgentStatus,
  AgentMessageType,
  MessageFilter,
  MessageSubscriptionCallback,
  PipelineStep,
  PipelineResult,
  ParallelResult,
  DebateRound,
  DebateResult,
  TeamTemplate,
} from './types';

export { AgentRole, BaseAgent, generateMessageId } from './types';

// ============================================================================
// 消息总线
// ============================================================================

export { AgentMessageBus } from './message-bus';

// ============================================================================
// 编排器
// ============================================================================

export { AgentOrchestrator } from './orchestrator';

// ============================================================================
// 增强运行时（新增）
// ============================================================================

export {
  // 核心类
  StreamingAgent,
  SimpleAgent,
  // 类型
  type RuntimeConfig,
  type StreamOutputCallback,
  type ToolCallCallback,
} from './runtime';

// ============================================================================
// 预设团队模板
// ============================================================================

export {
  createResearchTeamConfigs,
  createWritingTeamConfigs,
  createCodingTeamConfigs,
  createResearchTeam,
  createWritingTeam,
  createCodingTeam,
} from './presets';
