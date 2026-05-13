/**
 * Forever Core - Agent State Management
 * 智能体状态管理 - 基于LangGraph的状态定义
 */

import { CharacterCard } from '../personality/character-card';
import { Memory } from '../plugin/plugin-interface';

/**
 * 情绪状态 (PAD模型)
 */
export interface EmotionState {
  /** 愉悦度 -1(悲伤) ~ 1(开心) */
  pleasure: number;
  /** 唤醒度 -1(平静) ~ 1(激动) */
  arousal: number;
  /** 支配度 -1(顺从) ~ 1(强势) */
  dominance: number;
}

/**
 * 对话消息
 */
export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  emotion?: EmotionState;
  consistencyScore?: number;
}

/**
 * 智能体状态
 */
export interface AgentState {
  // ========== 输入 ==========
  /** 用户输入 */
  userMessage: string;
  /** 会话ID */
  sessionId: string;
  /** 角色ID */
  characterId: string;
  
  // ========== 角色数据 ==========
  /** 角色卡 */
  character: CharacterCard | null;
  
  // ========== 记忆 ==========
  /** 检索到的相关记忆 */
  retrievedMemories: Memory[];
  /** 工作记忆（最近对话） */
  workingMemory: Message[];
  /** 新生成的记忆 */
  newMemories: Memory[];
  
  // ========== 情绪 ==========
  /** 当前情绪状态 */
  currentEmotion: EmotionState;
  /** 情绪标签 */
  emotionLabel: string;
  
  // ========== 生成 ==========
  /** 系统Prompt */
  systemPrompt: string;
  /** 生成的回复 */
  response: string;
  /** 一致性评分 */
  consistencyScore: number;
  /** 反思反馈 */
  reflectionFeedback: string;
  
  // ========== 输出 ==========
  /** 语音数据 */
  voiceData?: Buffer;
  /** 头像数据 */
  avatarData?: Buffer;
  
  // ========== 错误 ==========
  /** 错误信息 */
  error?: string;
  
  // ========== 元数据 ==========
  /** 开始时间 */
  startTime: number;
  /** 当前步骤 */
  currentStep: string;
}

/**
 * 状态通道定义（用于LangGraph）
 */
export const StateChannels = {
  userMessage: {
    value: (x: string, y?: string) => y ?? x,
    default: () => '',
  },
  sessionId: {
    value: (x: string, y?: string) => y ?? x,
    default: () => '',
  },
  characterId: {
    value: (x: string, y?: string) => y ?? x,
    default: () => '',
  },
  character: {
    value: (x: CharacterCard | null, y?: CharacterCard | null) => y ?? x,
    default: () => null,
  },
  retrievedMemories: {
    value: (x: Memory[], y?: Memory[]) => y ?? x,
    default: () => [],
  },
  workingMemory: {
    value: (x: Message[], y?: Message[]) => y ?? x,
    default: () => [],
  },
  newMemories: {
    value: (x: Memory[], y?: Memory[]) => y ?? x,
    default: () => [],
  },
  currentEmotion: {
    value: (x: EmotionState, y?: EmotionState) => y ?? x,
    default: () => ({ pleasure: 0, arousal: 0, dominance: 0 }),
  },
  emotionLabel: {
    value: (x: string, y?: string) => y ?? x,
    default: () => '平静',
  },
  systemPrompt: {
    value: (x: string, y?: string) => y ?? x,
    default: () => '',
  },
  response: {
    value: (x: string, y?: string) => y ?? x,
    default: () => '',
  },
  consistencyScore: {
    value: (x: number, y?: number) => y ?? x,
    default: () => 0,
  },
  reflectionFeedback: {
    value: (x: string, y?: string) => y ?? x,
    default: () => '',
  },
  error: {
    value: (x: string | undefined, y?: string | undefined) => y ?? x,
    default: () => undefined,
  },
  startTime: {
    value: (x: number, y?: number) => y ?? x,
    default: () => Date.now(),
  },
  currentStep: {
    value: (x: string, y?: string) => y ?? x,
    default: () => 'init',
  },
};

/**
 * 创建初始状态
 */
export function createInitialState(
  userMessage: string,
  characterId: string,
  sessionId?: string
): AgentState {
  return {
    userMessage,
    sessionId: sessionId || `session_${Date.now()}`,
    characterId,
    character: null,
    retrievedMemories: [],
    workingMemory: [],
    newMemories: [],
    currentEmotion: { pleasure: 0, arousal: 0, dominance: 0 },
    emotionLabel: '平静',
    systemPrompt: '',
    response: '',
    consistencyScore: 0,
    reflectionFeedback: '',
    startTime: Date.now(),
    currentStep: 'init',
  };
}

/**
 * 状态更新辅助函数
 */
export function updateState(
  state: AgentState,
  updates: Partial<AgentState>
): AgentState {
  return { ...state, ...updates };
}

/**
 * 添加工作记忆
 */
export function addToWorkingMemory(
  state: AgentState,
  message: Omit<Message, 'timestamp'>
): AgentState {
  const newMessage: Message = {
    ...message,
    timestamp: new Date(),
  };
  
  // 保持最近15轮对话
  const maxWorkingMemory = 15;
  const updatedMemory = [...state.workingMemory, newMessage];
  if (updatedMemory.length > maxWorkingMemory) {
    updatedMemory.shift();
  }
  
  return { ...state, workingMemory: updatedMemory };
}

/**
 * 添加新生成的记忆
 */
export function addNewMemory(
  state: AgentState,
  memory: Omit<Memory, 'id' | 'timestamp'>
): AgentState {
  const newMemory: Memory = {
    ...memory,
    id: `mem_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
    timestamp: new Date(),
  };
  
  return {
    ...state,
    newMemories: [...state.newMemories, newMemory],
  };
}
