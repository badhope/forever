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
  CharacterCard, OceanPersonality, PAD, EmotionLabel,
  Habit, SpeechPattern, ReactionTemplate,
} from './personality/character-card';
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
