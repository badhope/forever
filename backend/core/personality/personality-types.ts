/**
 * Forever - 人格系统类型定义
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
  id: string;
  type: 'catchphrase' | 'filler' | 'reaction' | 'topic_preference';
  content: string;
  probability: number;
  triggers: string[];
  cooldownMinutes: number;
  lastTriggeredAt?: Date;
}

/**
 * 语言模式
 */
export interface SpeechPattern {
  averageSentenceLength: 'short' | 'medium' | 'long';
  fillerWords: string[];
  questionFrequency: number;
  interruptionRate: number;
  dialect: string;
}

/**
 * 反应模板
 */
export interface ReactionTemplate {
  trigger: string;
  pattern: string[];
  description: string;
}
