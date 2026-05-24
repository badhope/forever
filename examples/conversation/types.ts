/**
 * Forever - 对话系统类型定义
 *
 * 包含所有接口和类型定义
 */

import type { CharacterCard, Message } from '../character-card';
import type { LLMConfig } from '../../backend/core/llm/index';
import type { TieredMemoryManager } from '../../backend/memory/tiered-memory';

/** 对话结果接口 */
export interface ChatResult {
  response: string;
  emotionLabel: string;
  consistencyScore: number;
  memoriesUsed: number;
  memoriesExtracted: number;
  ethicsWarning?: string;
  layers: string[];
  reflectionSummary?: string;
}

/** 流式数据块类型 */
export type StreamChunk =
  | { type: 'token'; text: string }
  | {
      type: 'metadata';
      emotionLabel?: string;
      consistencyScore?: number;
      memoriesUsed?: number;
      memoriesExtracted?: number;
      layers?: string[];
      reflectionSummary?: string;
    };

/** 对话配置选项 */
export interface ConversationOptions {
  /** 是否启用记忆系统 */
  memoryEnabled?: boolean;
  /** 反思触发间隔（轮数） */
  reflectionInterval?: number;
  /** 一致性检查间隔（轮数） */
  consistencyCheckInterval?: number;
  /** 工作记忆最大消息数 */
  maxWorkingMemory?: number;
  /** 构建消息时包含的历史消息数 */
  historyContextLength?: number;
}

/** 伦理检查结果接口 */
export interface EthicsResult {
  riskLevel: 'safe' | 'warning' | 'critical';
  intervention?: string;
  reason?: string;
}

/** 记忆提取结果 */
export interface MemoryExtraction {
  worthRemembering: boolean;
  memories: Array<{
    content: string;
    importance: number;
    emotion: string;
    tags: string[];
  }>;
}

/** 反思结果 */
export interface ReflectionResult {
  summary: string;
  insights: Array<{
    type: string;
    content: string;
    importance: number;
    relatedMemories: string[];
  }>;
}

/** 重新导出依赖类型 */
export type { CharacterCard, Message, LLMConfig, TieredMemoryManager };
