/**
 * Forever - 角色卡类型定义
 */

import type { PAD } from './emotion-engine';

export interface CharacterCard {
  name: string;
  birthday: string;
  deathday: string;
  relationship: string;
  gender: 'male' | 'female';
  coreTraits: string[];
  speechStyle: string;
  catchphrases: string[];
  topics: string[];
  oceanPersonality: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  };
  baselineMood: PAD;
  habits: Array<{ trigger: string; action: string; probability: number }>;
  speechPattern: any;
  reactionTemplates: any[];
  lifeStory: string;
  importantMemories: string[];
  exampleDialogues: Array<{ user: string; character: string }>;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  emotion?: string;
  consistencyScore?: number;
}
