/**
 * @module agents
 * @description Forever 多智能体协作框架
 *
 * 参考 AutoGPT + CrewAI + LangGraph Multi-Agent 设计理念，
 * 提供智能体注册、编排、通信和团队协作能力。
 */

// 核心类型与基类
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

// 消息总线
export { AgentMessageBus } from './message-bus';

// 编排器
export { AgentOrchestrator } from './orchestrator';

// 预设团队模板
export {
  createResearchTeamConfigs,
  createWritingTeamConfigs,
  createCodingTeamConfigs,
  createResearchTeam,
  createWritingTeam,
  createCodingTeam,
} from './presets';
