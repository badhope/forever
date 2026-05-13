/**
 * Forever Core - Personality Types
 * 人格系统类型定义
 */

/**
 * Big Five OCEAN人格模型
 */
export interface OceanPersonality {
  /** 开放性 1-10 */
  openness: number;
  /** 尽责性 1-10 */
  conscientiousness: number;
  /** 外向性 1-10 */
  extraversion: number;
  /** 宜人性 1-10 */
  agreeableness: number;
  /** 神经质 1-10 */
  neuroticism: number;
}

/**
 * PAD情绪模型
 */
export interface PAD {
  /** 愉悦度 -1 ~ 1 */
  pleasure: number;
  /** 唤醒度 -1 ~ 1 */
  arousal: number;
  /** 支配度 -1 ~ 1 */
  dominance: number;
}

/**
 * 情绪标签
 */
export type EmotionLabel =
  | 'peaceful'
  | 'worried'
  | 'nostalgic'
  | 'caring'
  | 'chiding'
  | 'sad'
  | 'joyful';

/**
 * 习惯动作
 */
export interface Habit {
  /** 触发条件 */
  trigger: string;
  /** 动作描述 */
  action: string;
  /** 触发概率 0-1 */
  probability: number;
}

/**
 * 语言模式
 */
export interface SpeechPattern {
  /** 填充词 */
  fillers?: string[];
  /** 句子长度 */
  sentenceLength?: 'short' | 'medium' | 'long';
  /** 提问频率 */
  questionFrequency?: 'low' | 'medium' | 'high';
}

/**
 * 反应模板
 */
export interface ReactionTemplate {
  /** 场景 */
  scenario: string;
  /** 反应 */
  reaction: string;
  /** 情绪 */
  emotion?: EmotionLabel;
}
