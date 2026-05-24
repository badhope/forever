/**
 * Forever - 角色卡类型定义
 * 统一从 backend 导出，避免重复定义
 */

export type { CharacterCard } from '../backend/core/personality/character-card';
export type { PAD } from '../backend/core/personality/personality-types';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  emotion?: string;
  consistencyScore?: number;
}
