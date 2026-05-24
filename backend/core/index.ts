/**
 * Forever Core - Main Export
 * 参考 OpenClaw 架构
 */

// 日志系统
export { logger, LogLevel, LogEntry } from './logger';

// 基础设施层
export * from './infrastructure';

// 插件系统
export {
  Plugin,
  PluginType,
  PluginConfig,
  PluginStatus,
  VoicePlugin,
  VoiceConfig,
  VoiceSynthesisResult,
  MemoryPlugin,
  Memory,
  MemoryQuery,
  MemorySearchResult,
  MemoryInsight,
  MemoryPattern,
  MemoryReflection,
  AvatarPlugin,
  AvatarConfig,
  AvatarRenderResult,
  EthicsPlugin,
  EthicsReport,
  LLMPlugin,
  LLMMessage,
} from './plugin/plugin-interface';

export type {
  MemoryEmbedding,
  MemoryPromotionRule,
  MemoryDream,
} from './memory/memory-host-sdk';

export {
  PluginManager,
  getPluginManager,
  resetPluginManager,
} from './plugin/plugin-manager';

// 智能体框架层
export type {
  AgentState,
  AgentStateUpdate,
} from './agent/state';

export {
  AgentStateAnnotation,
  EmotionState,
  Message,
  createInitialState,
  updateState,
  addToWorkingMemory,
  addNewMemory,
} from './agent/state';

export {
  createAgentGraph,
  AgentRuntime,
  getAgentRuntime,
  resetAgentRuntime,
  loadCharacterNode,
  retrieveMemoriesNode,
  analyzeEmotionNode,
  buildPromptNode,
  generateResponseNode,
  reflectConsistencyNode,
  synthesizeVoiceNode,
  extractNewMemoriesNode,
  updateWorkingMemoryNode,
} from './agent/graph';

export {
  SkillRegistry,
  skillRegistry,
} from './agent/skills';

export type {
  Skill,
  SkillContext,
  SkillMetadata,
  SkillParameter,
  SkillParameterType,
  SkillExecution,
  SkillExecutionStatus,
} from './agent/skills';

export {
  SubagentRegistry,
  subagentRegistry,
} from './agent/subagents';

export type {
  Subagent,
  SubagentConfig,
  SubagentStatus,
  SubagentTask,
  SubagentMessage,
  SubagentCommunicationMode,
} from './agent/subagents';

export {
  TaskFlowEngine,
  taskFlowEngine,
} from './agent/task-flow';

export type {
  TaskFlowDefinition,
  TaskFlowNode,
  TaskFlowEdge,
  TaskFlowNodeType,
  TaskFlowEdgeType,
  TaskFlowContext,
  TaskFlowNodeResult,
  TaskFlowExecution,
} from './agent/task-flow';

// 人格系统
export {
  CharacterCard,
  FamilyRelation,
  DialoguePair,
  createDefaultCharacterCard,
  validateCharacterCard,
} from './personality/character-card';

export {
  OceanPersonality,
  PAD,
  EmotionLabel,
  Habit,
  SpeechPattern,
  ReactionTemplate,
} from './personality/personality-types';

export { EmotionDynamicsEngine } from './personality/emotion-engine';

export { buildSystemPrompt } from './personality/prompt-template';

// 工具系统
export type {
  JsonSchema,
  ToolHandler,
  ToolDefinition,
  ToolResult,
  OpenAIFunctionSchema,
  ToolExecutorOptions,
  ToolRegistryOptions,
  ToolCategory,
  ToolPermission,
  ToolPermissionLevel,
  ToolSandboxConfig,
} from './tools/types';

export { SchemaValidator } from './tools/types';
export { ToolRegistry } from './tools/registry';
export { ToolExecutor, ToolExecutionOptions } from './tools/executor';
export { ToolSandbox, toolSandbox, ExecutionContext } from './tools/sandbox';

export {
  WebSearchTool,
  CalculatorTool,
  GetCurrentTimeTool,
  FormatDateTool,
  ParseDateTool,
  DateDiffTool,
  AddTimeTool,
  SubtractTimeTool,
  GetWeekInfoTool,
  ReadFileTool,
  WriteFileTool,
  DeleteFileTool,
  ListDirectoryTool,
  FileExistsTool,
  CreateDirectoryTool,
  CopyFileTool,
  MoveFileTool,
  GetFileInfoTool,
  JsonParseTool,
  JsonStringifyTool,
  JsonFormatTool,
  JsonValidateTool,
  JsonGetTool,
  JsonMergeTool,
  SleepTool,
  GenerateIdTool,
  TimestampTool,
  Base64EncodeTool,
  Base64DecodeTool,
  UrlEncodeTool,
  UrlDecodeTool,
  RandomStringTool,
  HashTool,
  CompareVersionTool,
  createMemorySearchTool,
  createMemoryStoreTool,
  createDefaultToolRegistry,
  createSafeToolRegistry,
  createFullToolRegistry,
} from './tools/builtin-tools';

// LLM系统
export type {
  LLMProvider,
  ChatMessage,
  LLMConfig,
  LLMResponse,
  EnvLLMConfig,
  ToolCall,
  ToolDefinition as LlmToolDefinition,
  ToolCallResult,
  ChatWithToolsOptions,
  StreamChunk,
  StreamCallback,
  StreamWithToolsResult,
} from './llm/types';

export { detectLLMConfig } from './llm/config';

export {
  PROVIDERS,
  getProvider,
  listProviders,
  listProviderNames,
} from './llm/providers';

export {
  chat,
  chatOpenAICompatible,
  chatWithTools,
  chatStream,
  chatStreamWithTools,
  parseToolCallArguments,
  createToolResponseMessage,
  createAssistantToolCallMessage,
} from './llm/index';

export { chatAnthropic } from './llm/anthropic-client';

// 回调系统
export type {
  CallbackEvent,
  CallbackEventType,
  LLMCallbackData,
  ToolCallbackData,
  ChainCallbackData,
  AgentCallbackData,
  MemoryCallbackData,
} from './callbacks/types';

export { BaseCallbackHandler } from './callbacks/handler';
export { CallbackManager } from './callbacks/manager';
export { TraceSpan, Tracer } from './callbacks/tracer';
export { ConsoleCallbackHandler, FileCallbackHandler } from './callbacks/handlers';

// 记忆系统
export {
  LocalMemoryPlugin,
  EnhancedMemoryStore,
  DEFAULT_MEMORY_CONFIG,
  MemoryHostSDK,
  memoryHostSDK,
} from './memory';

export type {
  EnhancedMemory,
  MemoryConfig,
  MemoryType,
} from './memory';

// 会话系统
export * from './session';

// 媒体系统
export * from './media';

// Markdown 处理系统
export * from './markdown';

// 智能体框架层新增
export * from './agent';

// 多智能体协作层 (第四层)
export * from './multi-agent';

// 应用生态层 (第五层)
export * from './application';

// 数据库层
export * from './database';

// 知识库层
export * from './knowledge';

// 工具函数库
export * from './utils';

