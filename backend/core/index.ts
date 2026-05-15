/**
 * Forever - 核心模块统一导出
 *
 * 统一入口，所有子模块通过此文件对外暴露。
 * 修复记录：
 * - H3-H10: 所有 abstract class / class / enum 改用值导出
 * - H4: 补充 health / security / rate-limiter 模块导出
 * - H5: RateLimiter 命名冲突解决（SlidingWindowRateLimiter）
 * - M8-M17: 补充所有缺失类型导出
 * - M18: 消除 memory 模块重复导出
 */

// ============================================================================
// LLM 统一适配器
// ============================================================================

export {
  chat,
  chatStream,
  chatWithToolsUnified,
  chatStreamWithToolsUnified,
  detectLLMConfig,
  listProviders,
  listProviderNames,
  parseToolCallArguments,
  createToolResponseMessage,
  createAssistantToolCallMessage,
  convertToOpenAITool,
  convertToOpenAITools,
} from './llm/index';

export type {
  ChatMessage,
  LLMConfig,
  LLMResponse,
  LLMProvider,
  ToolCall,
  ToolDefinition as LLMToolDefinition,
  ToolCallResult,
  ChatWithToolsOptions,
  StreamChunk,
  StreamCallback,
  StreamWithToolsResult,
} from './llm/index';

// ============================================================================
// Python 桥接层
// ============================================================================

export {
  detectPython, checkPythonPackage, getPythonPackageVersion,
  synthesizeSpeech, generateTalkingVideo, checkEnvironment,
  storeLocalMemory, retrieveLocalMemories, getAllMemories, getMemoryCount,
  batchStoreMemories, updateMemory, deleteMemories, decayMemories, deduplicateMemories,
} from './bridge/index';

export type {
  TTSRequest, TTSResult, AvatarRequest, AvatarResult,
  EnvironmentStatus, MemoryStoreRequest, MemoryRetrieveRequest, MemoryItem, MemoryUpdateRequest,
} from './bridge/index';

// ============================================================================
// 人格系统
// ============================================================================

export { EmotionDynamicsEngine } from './personality/emotion-engine';
export { ConsistencyScorer } from './personality/consistency-scorer';
export { HumanImperfectionLayer } from './personality/human-imperfection';
export { buildSystemPrompt, buildReflectionPrompt, buildEmotionPrompt } from './personality/prompt-template';
export { buildPersonalityInjectionPrompt, buildConsistencyScoringPrompt } from './personality/personality-filter';

export type {
  CharacterCard,
} from './personality/character-card';

export type {
  OceanPersonality, PAD, EmotionLabel,
  Habit, SpeechPattern, ReactionTemplate,
} from './personality/personality-types';

// ============================================================================
// 伦理系统
// ============================================================================

export { GuardianEthicsSystem } from './ethics/guardian';
export type { EthicsAssessment } from './ethics/guardian';

// ============================================================================
// 基础设施
// ============================================================================

export { logger, LogLevel } from './logger';
export type { LogEntry } from './logger';
export { loadConfig, validateConfig } from './config';
export type { ForeverConfig } from './config';
export { eventBus } from './event-bus';
export type { EventType } from './event-bus';
export { ForeverError, LLMError, MemoryError, TTSError, ConfigError, withRetry, CircuitBreaker } from './errors';

// ============================================================================
// 健康检查（H4: 新增导出）
// ============================================================================

export {
  HealthChecker,
  createMemoryHealthCheck,
  createLLMHealthCheck,
  createDiskSpaceHealthCheck,
  createPythonHealthCheck,
} from './health';

export type {
  HealthCheckResult,
  HealthStatus,
  SystemHealth,
} from './health';

// ============================================================================
// 安全工具（H4: 新增导出）
// ============================================================================

export {
  InputSanitizer,
  TokenCounter,
  SlidingWindowRateLimiter,
} from './security';

// ============================================================================
// 速率限制器（H4: 新增导出，H5: 令牌桶算法）
// ============================================================================

export {
  RateLimiter as TokenBucketRateLimiter,
  defaultRateLimiter,
  strictRateLimiter,
  lenientRateLimiter,
} from './rate-limiter';

export type {
  RateLimitConfig,
  RateLimitStatus,
} from './rate-limiter';

// ============================================================================
// 多模态管线
// ============================================================================

export { runMultimodalPipeline } from './pipeline';
export type { PipelineOptions, PipelineResult } from './pipeline';

// ============================================================================
// 算法库
// ============================================================================

export {
  cosineSimilarity, euclideanDistance, manhattanDistance,
  padDistance, interpolatePAD, padToEmotion, EMOTION_TO_PAD,
  calculateImportance,
  forgettingCurve, calculateReviewInterval,
  binarySearch, quickSelect, topK,
  levenshteinDistance, stringSimilarity, calculateTfIdf,
  weightedRandom, softmax, temperatureSampling,
  movingAverage, exponentialMovingAverage,
  kMeans,
} from './algorithms/index';

export type { PADEmotion, ImportanceFactors, ForgettingCurveParams } from './algorithms/index';

// ============================================================================
// 数学模型
// ============================================================================

export {
  DEFAULT_OCEAN,
  calculatePersonalityInfluence, oceanSimilarity, interpolateOcean,
  EmotionalStateMachine, emotionalContagion,
  MemoryNetwork,
  AttentionManager,
  calculateUtility, selectOptimalOption,
  BayesianBelief,
} from './math/index';

export type { OceanTraits, PersonalityInfluence, MemoryNode, AttentionConfig, DecisionOption } from './math/index';

// ============================================================================
// 函数式编程工具
// ============================================================================

export {
  identity, constant, compose, pipe, curry, partial,
  map, filter, reduce, flatMap, groupBy, sortBy, unique, uniqueBy, chunk, take, skip,
  memoize, memoizeWithTTL, debounce, throttle, withTimeout,
  LazySequence, Maybe, Either,
} from './utils/fp';

// ============================================================================
// 性能优化工具
// ============================================================================

export {
  LRUCache, TTLCache, MultiLevelCache,
  Batcher, DeduplicatedBatcher,
  Lazy, LazyAsync,
  ObjectPool,
  TokenBucket, ConcurrencyController,
  PerformanceTimer, withPerformance, withPerformanceAsync,
} from './utils/performance';

// ============================================================================
// 检查点持久化（H9: BaseCheckpointer 改为值导出）
// ============================================================================

export {
  BaseCheckpointer,
  MemoryCheckpointer,
  FileCheckpointer,
  CheckpointManager,
} from './checkpoint/index';

export type {
  Checkpoint,
  CheckpointListOptions,
  CheckpointListOptions as CheckpointFilter,
  CheckpointManagerOptions,
} from './checkpoint/index';

// ============================================================================
// 人工介入机制（M15: 补充缺失类型）
// ============================================================================

export { HumanInTheLoopManager } from './human-in-the-loop/index';

export type {
  InterventionType,
  InterventionStatus,
  HumanIntervention,
  InterventionPolicyRule,
  InterventionPolicy,
  InterventionRequestOptions,
  InterventionResolveOptions,
  InterventionRequestedEvent,
  InterventionResolvedEvent,
  InterventionTimeoutEvent,
} from './human-in-the-loop/index';

// ============================================================================
// 任务规划器（H3: PriorityStrategy 改为值导出，M16: 补充缺失类型）
// ============================================================================

export { TaskPlanner, PriorityStrategy } from './planner/index';

export type {
  TaskStatus,
  PlanStatus,
  TaskPriority,
  TaskComplexity as PlannerTaskComplexity,
  Task,
  Plan,
  PlanProgress,
  PriorityStrategyType,
  TaskPlannerOptions,
  LLMDecompositionResult,
} from './planner/index';

// ============================================================================
// 系统化工具定义
// ============================================================================

export {
  // 核心类
  ToolRegistry,
  ToolExecutor,
  SchemaValidator,
  // 基础工具
  WebSearchTool,
  CalculatorTool,
  DateTimeTool,
  FileReadTool,
  FileWriteTool,
  createMemorySearchTool,
  createMemoryStoreTool,
  // 工厂函数
  createDefaultToolRegistry,
  createSafeToolRegistry,
  createFullToolRegistry,
  // 浏览器工具
  browserBrowseTool,
  browserSearchTool,
  browserScreenshotTool,
  getBrowserTools,
  registerBrowserTools,
  // 代码执行工具
  codeExecuteJavascriptTool,
  codeExecutePythonTool,
  codeExecuteBashTool,
  codeExecuteTool,
  getCodeExecutionTools,
  registerCodeExecutionTools,
  // 记忆压缩（从 tools 导出，避免与 memory 模块重复）
  MemoryCompressor,
  LongTermMemory,
  calculateImportance as calculateMemoryImportance,
  updateImportanceOnAccess,
  DEFAULT_COMPRESSION_CONFIG,
} from './tools/index';

export type {
  JsonSchema,
  ToolHandler,
  ToolDefinition,
  ToolResult,
  OpenAIFunctionSchema,
  ToolExecutorOptions,
  ToolRegistryOptions,
  BrowseResult,
  SearchResult,
  CodeExecutionResult,
  CodeExecutionConfig,
  SupportedLanguage,
  MemoryEntry as ToolMemoryEntry,
  CompressionConfig as ToolCompressionConfig,
  CompressionResult as ToolCompressionResult,
} from './tools/index';

// ============================================================================
// 记忆管理（独立模块，M18: 不再重复导出 tools 中的同名项）
// ============================================================================

export {
  MemoryCompressor as MemoryCompressorModule,
  LongTermMemory as LongTermMemoryModule,
  calculateImportance as calculateMemoryImportanceFromModule,
  updateImportanceOnAccess as updateImportanceOnAccessFromModule,
  DEFAULT_COMPRESSION_CONFIG as DEFAULT_COMPRESSION_CONFIG_MODULE,
} from './memory/index';

export type {
  MemoryEntry,
  CompressionConfig,
  CompressionResult,
} from './memory/index';

// ============================================================================
// 向量存储抽象层（H6: BaseVectorStore 改为值导出，M8: 补充 VectorSearchResult）
// ============================================================================

export {
  BaseVectorStore,
  InMemoryVectorStore,
  QdrantVectorStore,
  cosineSimilarity as vectorCosineSimilarity,
  euclideanDistance as vectorEuclideanDistance,
  dotProduct,
  computeSimilarity,
  matchesFilter,
} from './vector-store/index';

export type {
  Embedding,
  VectorSearchResult,
  VectorStoreConfig,
  MetadataFilter,
} from './vector-store/index';

// ============================================================================
// 输出解析器（H7: BaseOutputParser 改为值导出，M19-M20: 补充缺失类型）
// ============================================================================

export {
  BaseOutputParser,
  StructuredOutputParser,
  ListOutputParser,
  CommaSeparatedListOutputParser,
  EnumOutputParser,
  PydanticOutputParser,
  OutputFixingParser,
  RetryWithErrorOutputParser,
} from './parsers/index';

export type {
  StructuredField,
  StructuredField as FieldDefinition,
  ParseResult,
  LLMCaller,
  FieldValidation,
  PydanticField,
} from './parsers/index';

// ============================================================================
// 回调与追踪系统（H9: BaseCallbackHandler 改为值导出，M10-M11: 补充缺失类型）
// ============================================================================

export {
  BaseCallbackHandler,
  CallbackManager,
  TraceSpan,
  Tracer,
  ConsoleCallbackHandler,
  FileCallbackHandler,
} from './callbacks/index';

export type {
  CallbackEventType,
  CallbackEvent,
  LLMCallbackData,
  ToolCallbackData,
  ChainCallbackData,
  AgentCallbackData,
  MemoryCallbackData,
  TraceStats,
  FileCallbackHandlerConfig,
} from './callbacks/index';

// ============================================================================
// 文档加载器与文本分割器（H8: BaseDocumentLoader/BaseTextSplitter 改为值导出）
// ============================================================================

export {
  BaseDocumentLoader,
  BaseTextSplitter,
  TextLoader,
  JSONLoader,
  MarkdownLoader,
  CSVLoader,
  RecursiveCharacterTextSplitter,
  TokenTextSplitter,
  MarkdownTextSplitter,
} from './document-loaders/index';

export type {
  Document,
  TextChunk,
  JSONLoaderConfig,
  CSVLoaderConfig,
  MarkdownHeading,
} from './document-loaders/index';

// ============================================================================
// 多智能体协作（H10: BaseAgent 改为值导出，M13: 补充缺失类型）
// ============================================================================

export {
  AgentRole,
  BaseAgent,
  generateMessageId,
  AgentMessageBus,
  AgentOrchestrator,
  StreamingAgent,
  SimpleAgent,
  createResearchTeamConfigs,
  createWritingTeamConfigs,
  createCodingTeamConfigs,
  createResearchTeam,
  createWritingTeam,
  createCodingTeam,
} from './agents/index';

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
  RuntimeConfig,
  StreamOutputCallback,
  ToolCallCallback,
} from './agents/index';

// ============================================================================
// AI 思考能力（M14: 补充缺失类型）
// ============================================================================

export {
  ThinkingManager,
  ChainOfThoughtStrategy,
  ReActStrategy,
  SelfReflectionStrategy,
  SelfRefineStrategy,
  TreeOfThoughtStrategy,
} from './thinking/index';

export type {
  ThinkingResult,
  ThinkingStrategy,
  ReflectionAssessment,
  RefineFeedback,
  ThoughtNode,
  TreeOfThoughtResult,
  TaskComplexity as ThinkingTaskComplexity,
  CoTLanguage,
  ChainOfThoughtConfig,
  ReActConfig,
  ReActStep,
  SelfReflectionConfig,
  SelfRefineConfig,
  TreeOfThoughtConfig,
  // 注意：thinking 模块有自己的 LLMConfig，用别名区分
  LLMConfig as ThinkingLLMConfig,
} from './thinking/index';

// ============================================================================
// Embedding 模型调用层（P0-2: 新增）
// ============================================================================

export {
  embedText,
  embedTexts,
  detectEmbeddingConfig,
  listEmbeddingProviders,
  EMBEDDING_PROVIDERS,
} from './embedding/index';

export type {
  EmbeddingConfig,
  EmbeddingResponse,
  EmbeddingProvider,
} from './embedding/index';

// ============================================================================
// RAG 管线（P0-3: 新增）
// ============================================================================

export { RAGPipeline } from './rag/index';

export type {
  DocumentChunk,
  RAGConfig,
  RAGQueryOptions,
  RAGResult,
} from './rag/index';
