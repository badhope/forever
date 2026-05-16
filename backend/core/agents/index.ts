/**
 * @module agents
 * @description Forever 多智能体协作框架
 *
 * 参考 AutoGPT + CrewAI + LangGraph Multi-Agent 设计理念，
 * 提供智能体注册、编排、通信和团队协作能力。
 *
 * 核心功能：
 * - 多智能体编排（流水线/并行/辩论）
 * - 流式输出支持（StreamingAgent）
 * - 函数调用集成（Function Calling）
 * - Handoffs — Agent 间动态任务委托
 * - Sessions — 会话持久化管理
 * - Guardrails — 并行安全检查管线
 * - MCP — Model Context Protocol 集成
 * - Graph — 图状态机执行引擎
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
// 增强运行时
// ============================================================================

export {
  StreamingAgent,
  SimpleAgent,
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

// ============================================================================
// Handoffs — Agent 间动态任务委托
// ============================================================================

export {
  HandoffManager,
  type HandoffRule,
  type HandoffCondition,
  type HandoffEvent,
  type HandoffResult,
  type HandoffListener,
} from './handoffs';

// ============================================================================
// Sessions — 会话持久化管理
// ============================================================================

export {
  AgentSession,
  type SessionConfig,
  type SessionMetadata,
} from './sessions';

// ============================================================================
// Guardrails — 并行安全检查管线
// ============================================================================

export {
  GuardrailPipeline,
  createPromptInjectionCheck,
  createMaxLengthCheck,
  createDefaultGuardrailPipeline,
  type GuardrailResult,
  type GuardrailPipelineResult,
  type GuardrailAction,
  type GuardrailCheckConfig,
  type GuardrailPipelineConfig,
} from './guardrails';

// ============================================================================
// MCP — Model Context Protocol 集成
// ============================================================================

export {
  MCPClient,
  type MCPServerConfig,
  type MCPTool,
  type MCPToolResult,
  type MCPConnectionStatus,
} from './mcp';

// ============================================================================
// Graph — 图状态机执行引擎
// ============================================================================

export {
  AgentGraph,
  type NodeProcessor,
  type ConditionalRouter,
  type GraphState,
  type GraphNodeDefinition,
  type GraphEdgeDefinition,
  type ConditionalEdgeDefinition,
  type GraphExecutionResult,
} from './graph';
