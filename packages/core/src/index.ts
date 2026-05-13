/**
 * Forever Core - Main Export
 * 核心包统一导出
 */

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
  AvatarPlugin,
  AvatarConfig,
  AvatarRenderResult,
  EthicsPlugin,
  EthicsReport,
  LLMPlugin,
  LLMMessage,
  LLMConfig,
  LLMResponse,
} from './plugin/plugin-interface';

export {
  PluginManager,
  getPluginManager,
  resetPluginManager,
} from './plugin/plugin-manager';

// 智能体
export {
  AgentState,
  EmotionState,
  Message,
  StateChannels,
  createInitialState,
  updateState,
  addToWorkingMemory,
  addNewMemory,
} from './agent/state';

export {
  loadCharacterNode,
  retrieveMemoriesNode,
  analyzeEmotionNode,
  buildPromptNode,
  generateResponseNode,
  reflectConsistencyNode,
  synthesizeVoiceNode,
  extractNewMemoriesNode,
  updateWorkingMemoryNode,
} from './agent/nodes';

export {
  createAgentGraph,
  AgentRuntime,
  getAgentRuntime,
  resetAgentRuntime,
} from './agent/graph';

// 人格系统
export {
  CharacterCard,
  FamilyRelation,
  DialoguePair,
  VoiceConfig,
  AvatarConfig,
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
