/**
 * Forever Core - Plugin System Interface
 * 插件系统核心接口定义
 */

export type PluginType = 'voice' | 'memory' | 'avatar' | 'ethics' | 'llm';

export interface PluginConfig {
  [key: string]: any;
}

export interface Plugin {
  id: string;
  name: string;
  version: string;
  type: PluginType;
  
  /**
   * 初始化插件
   * @param config 插件配置
   */
  initialize(config: PluginConfig): Promise<void>;
  
  /**
   * 关闭插件，释放资源
   */
  shutdown(): Promise<void>;
  
  /**
   * 获取插件状态
   */
  getStatus(): PluginStatus;
}

export interface PluginStatus {
  initialized: boolean;
  ready: boolean;
  lastError?: string;
}

// ==================== 语音插件 ====================

export interface VoiceConfig {
  /** 参考音频路径（用于克隆） */
  referenceAudioPath?: string;
  /** 预设声音ID */
  voiceId?: string;
  /** 情感强度 0.0-1.0 */
  exaggeration?: number;
  /** CFG权重 */
  cfgWeight?: number;
  /** 语速 */
  speed?: number;
  /** 音调 */
  pitch?: number;
}

export interface VoiceSynthesisResult {
  /** 音频数据 */
  audio: Buffer | ArrayBuffer;
  /** 采样率 */
  sampleRate: number;
  /** 时长（秒） */
  duration: number;
  /** 使用的配置 */
  config: VoiceConfig;
}

export interface VoicePlugin extends Plugin {
  type: 'voice';
  
  /**
   * 合成语音
   * @param text 要合成的文本
   * @param config 语音配置
   */
  synthesize(text: string, config?: VoiceConfig): Promise<VoiceSynthesisResult>;
  
  /**
   * 语音转文本（可选）
   * @param audio 音频数据
   */
  transcribe?(audio: Buffer): Promise<string>;
  
  /**
   * 克隆声音（可选）
   * @param referenceAudio 参考音频
   * @param name 克隆声音名称
   */
  cloneVoice?(referenceAudio: Buffer, name: string): Promise<string>;
}

// ==================== 记忆插件 ====================

export interface Memory {
  id: string;
  content: string;
  timestamp: Date;
  importance: number; // 0-1
  emotion?: string;
  metadata?: Record<string, any>;
}

export interface MemoryQuery {
  query: string;
  limit?: number;
  threshold?: number;
  filters?: Record<string, any>;
}

export interface MemorySearchResult {
  memories: Memory[];
  total: number;
  scores: number[];
}

export interface MemoryPlugin extends Plugin {
  type: 'memory';
  
  /**
   * 存储记忆
   * @param memory 记忆内容
   * @param characterId 角色ID
   */
  store(memory: Omit<Memory, 'id'>, characterId: string): Promise<Memory>;
  
  /**
   * 检索相关记忆
   * @param query 查询条件
   * @param characterId 角色ID
   */
  retrieve(query: MemoryQuery, characterId: string): Promise<MemorySearchResult>;
  
  /**
   * 获取所有记忆
   * @param characterId 角色ID
   */
  getAll(characterId: string): Promise<Memory[]>;
  
  /**
   * 删除记忆
   * @param memoryId 记忆ID
   */
  delete(memoryId: string): Promise<void>;
  
  /**
   * 更新记忆重要性
   * @param memoryId 记忆ID
   * @param importance 新的重要性分数
   */
  updateImportance(memoryId: string, importance: number): Promise<void>;
}

// ==================== 头像插件 ====================

export interface AvatarConfig {
  /** 基础图片路径 */
  baseImagePath?: string;
  /** Live2D模型路径 */
  modelPath?: string;
  /** 风格 */
  style: 'photo' | 'live2d' | 'animated';
  /** 尺寸 */
  resolution?: { width: number; height: number };
}

export interface AvatarRenderResult {
  /** 视频/图片数据 */
  data: Buffer;
  /** 格式 */
  format: 'mp4' | 'gif' | 'png';
  /** 时长（视频） */
  duration?: number;
}

export interface AvatarPlugin extends Plugin {
  type: 'avatar';
  
  /**
   * 渲染头像表情
   * @param emotion 情绪标签
   * @param config 头像配置
   */
  renderExpression(emotion: string, config: AvatarConfig): Promise<AvatarRenderResult>;
  
  /**
   * 生成说话视频
   * @param audio 音频数据
   * @param config 头像配置
   */
  speak(audio: Buffer, config: AvatarConfig): Promise<AvatarRenderResult>;
  
  /**
   * 生成眨眼动画（Live2D）
   * @param config 头像配置
   */
  blink?(config: AvatarConfig): Promise<AvatarRenderResult>;
}

// ==================== 伦理插件 ====================

export interface EthicsReport {
  passed: boolean;
  score: number; // 0-1
  issues: string[];
  suggestions?: string[];
}

export interface EthicsPlugin extends Plugin {
  type: 'ethics';
  
  /**
   * 检查输入内容
   * @param input 用户输入
   */
  checkInput(input: string): Promise<EthicsReport>;
  
  /**
   * 检查输出内容
   * @param input 用户输入
   * @param output AI输出
   */
  checkOutput(input: string, output: string): Promise<EthicsReport>;
  
  /**
   * 检查记忆内容
   * @param memory 记忆内容
   */
  checkMemory?(memory: string): Promise<EthicsReport>;
}

// ==================== LLM插件 ====================

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMConfig {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
}

export interface LLMResponse {
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
}

export interface LLMPlugin extends Plugin {
  type: 'llm';
  
  /**
   * 生成对话回复
   * @param messages 消息列表
   * @param config 生成配置
   */
  chat(messages: LLMMessage[], config?: LLMConfig): Promise<LLMResponse>;
  
  /**
   * 流式生成
   * @param messages 消息列表
   * @param config 生成配置
   * @param onChunk 回调函数
   */
  chatStream?(
    messages: LLMMessage[],
    config: LLMConfig,
    onChunk: (chunk: string) => void
  ): Promise<void>;
}
