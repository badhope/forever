/**
 * Forever Core - Session Types
 * 会话管理系统类型定义
 */

import { EmotionState, EmotionLabel, EmotionIntensity, PAD } from '../personality/personality-types';
import { OceanPersonality } from '../personality/personality-types';

// ==================== 会话相关类型 ====================

export interface Message {
  id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: MessageMetadata;
}

export interface MessageMetadata {
  emotion?: EmotionLabel;
  emotionIntensity?: EmotionIntensity;
  emotionPAD?: PAD;
  toolsUsed?: string[];
  responseTime?: number;
  tokenCount?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface SessionState {
  id: string;
  characterId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  lastActiveAt: Date;
  isActive: boolean;
  messageCount: number;
  
  // 情绪状态
  currentEmotion: EmotionState;
  emotionHistory: EmotionState[];
  
  // 对话上下文
  context: Record<string, any>;
  
  // 人格配置
  oceanPersonality?: OceanPersonality;
  
  // 会话元数据
  metadata: SessionMetadata;
}

export interface SessionMetadata {
  title?: string;
  description?: string;
  tags?: string[];
  channel?: string;
  location?: string;
  customFields?: Record<string, any>;
}

export interface SessionConfig {
  maxHistory?: number;
  enableEmotion?: boolean;
  enableMemory?: boolean;
  autoSaveInterval?: number;
  emotionDecayRate?: {
    pleasure?: number;
    arousal?: number;
    dominance?: number;
  };
}

// ==================== 会话持久化相关 ====================

export interface SessionStorage {
  /** 存储会话 */
  save(session: SessionState): Promise<void>;
  /** 加载会话 */
  load(sessionId: string): Promise<SessionState | null>;
  /** 获取用户的所有会话 */
  listByUser(userId: string): Promise<SessionState[]>;
  /** 获取角色的所有会话 */
  listByCharacter(characterId: string): Promise<SessionState[]>;
  /** 删除会话 */
  delete(sessionId: string): Promise<void>;
  /** 搜索会话 */
  search(query: string, options?: SearchOptions): Promise<SessionState[]>;
}

export interface SearchOptions {
  limit?: number;
  offset?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'lastActiveAt';
  sortOrder?: 'asc' | 'desc';
  userId?: string;
  characterId?: string;
  tags?: string[];
}

// ==================== 会话管理器相关 ====================

export interface SessionManagerConfig {
  defaultConfig: SessionConfig;
  storage?: SessionStorage;
  autoSave?: boolean;
}

export interface SessionEvent {
  type: 'created' | 'updated' | 'deleted' | 'messageAdded' | 'emotionChanged' | 'active' | 'inactive';
  sessionId: string;
  timestamp: Date;
  data?: any;
}

export type SessionEventListener = (event: SessionEvent) => void;
