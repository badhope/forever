/**
 * Forever - 核心模块统一导出
 */

// LLM 统一适配器
export { chat, chatStream, detectLLMConfig, listProviders, listProviderNames } from './llm/index';
export type { ChatMessage, LLMConfig, LLMResponse, LLMProvider } from './llm/index';

// Python 桥接层
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

// 人格系统
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
export type { OceanPersonality as OceanPersonalityType } from './personality/personality-types';

// 伦理系统
export { GuardianEthicsSystem } from './ethics/guardian';
export type { EthicsAssessment } from './ethics/guardian';

// 基础设施
export { logger, LogLevel } from './logger';
export type { LogEntry } from './logger';
export { loadConfig, validateConfig } from './config';
export type { ForeverConfig } from './config';
export { eventBus } from './event-bus';
export type { EventType } from './event-bus';
export { ForeverError, LLMError, MemoryError, TTSError, ConfigError, withRetry, CircuitBreaker } from './errors';

// 多模态管线
export { runMultimodalPipeline } from './pipeline';
export type { PipelineOptions, PipelineResult } from './pipeline';

// 算法库
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

// 数学模型
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

// 函数式编程工具
export {
  identity, constant, compose, pipe, curry, partial,
  map, filter, reduce, flatMap, groupBy, sortBy, unique, uniqueBy, chunk, take, skip,
  memoize, memoizeWithTTL, debounce, throttle, withTimeout,
  LazySequence, Maybe, Either,
} from './utils/fp';

// 性能优化工具
export {
  LRUCache, TTLCache, MultiLevelCache,
  Batcher, DeduplicatedBatcher,
  Lazy, LazyAsync,
  ObjectPool,
  TokenBucket, ConcurrencyController,
  PerformanceTimer, withPerformance, withPerformanceAsync,
} from './utils/performance';

// 检查点持久化
export { MemoryCheckpointer, FileCheckpointer, CheckpointManager } from './checkpoint/index';
export type { Checkpoint, CheckpointListOptions as CheckpointFilter } from './checkpoint/index';

// 人工介入机制
export { HumanInTheLoopManager } from './human-in-the-loop/index';
export type { HumanIntervention, InterventionPolicy, InterventionPolicyRule } from './human-in-the-loop/index';

// 任务规划器
export { TaskPlanner } from './planner/index';
export type { Task, Plan, PlanProgress, PriorityStrategy } from './planner/index';

// 系统化工具定义
export { ToolRegistry, ToolExecutor, createDefaultToolRegistry } from './tools/index';
export type { ToolDefinition, ToolResult } from './tools/index';

// 向量存储抽象层
export { InMemoryVectorStore } from './vector-store/index';
export type { Embedding, VectorStoreConfig, MetadataFilter, BaseVectorStore } from './vector-store/index';

// 输出解析器
export {
  StructuredOutputParser, ListOutputParser, EnumOutputParser,
  CommaSeparatedListOutputParser, PydanticOutputParser,
  OutputFixingParser, RetryWithErrorOutputParser,
} from './parsers/index';
export type { BaseOutputParser, StructuredField as FieldDefinition, ParseResult } from './parsers/index';

// 回调与追踪系统
export { CallbackManager, Tracer, ConsoleCallbackHandler, FileCallbackHandler } from './callbacks/index';
export type { CallbackEvent, BaseCallbackHandler, TraceSpan } from './callbacks/index';

// 文档加载器与文本分割器
export {
  TextLoader, JSONLoader, MarkdownLoader, CSVLoader,
  RecursiveCharacterTextSplitter, TokenTextSplitter, MarkdownTextSplitter,
} from './document-loaders/index';
export type { Document, BaseDocumentLoader, BaseTextSplitter } from './document-loaders/index';

// 多智能体协作
export {
  AgentOrchestrator, AgentMessageBus,
  createResearchTeam, createWritingTeam, createCodingTeam,
} from './agents/index';
export type { AgentId, AgentConfig, AgentMessage, AgentState, BaseAgent, AgentRole } from './agents/index';

// AI 思考能力
export {
  ThinkingManager,
  ChainOfThoughtStrategy, ReActStrategy,
  SelfReflectionStrategy, SelfRefineStrategy, TreeOfThoughtStrategy,
} from './thinking/index';
export type { ThinkingStrategy, ThinkingResult } from './thinking/index';
