/**
 * Forever Core - Personality Types
 * 人格系统类型定义
 */

/**
 * Big Five OCEAN人格模型
 */
export interface OceanPersonality {
  /** 开放性 - 对新体验的开放程度 1-10 */
  openness: number;
  /** 尽责性 - 自律和组织程度 1-10 */
  conscientiousness: number;
  /** 外向性 - 社交和精力水平 1-10 */
  extraversion: number;
  /** 宜人性 - 合作和同情心 1-10 */
  agreeableness: number;
  /** 神经质 - 情绪稳定性 1-10 */
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
 * 情绪标签扩展
 */
export type EmotionLabel =
  | 'peaceful'
  | 'worried'
  | 'nostalgic'
  | 'caring'
  | 'chiding'
  | 'sad'
  | 'joyful'
  | 'happy'
  | 'angry'
  | 'anxious'
  | 'excited'
  | 'tired'
  | 'surprised'
  | 'disappointed'
  | 'hopeful'
  | 'regretful';

/**
 * 情绪强度
 */
export type EmotionIntensity = 'low' | 'medium' | 'high';

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
  /** 正式程度 */
  formality?: 'casual' | 'neutral' | 'formal';
  /** 幽默程度 */
  humorLevel?: 'none' | 'low' | 'medium' | 'high';
}

/**
 * 反应模板
 */
export interface ReactionTemplate {
  /** 场景关键词 */
  scenario: string;
  /** 反应文本 */
  reaction: string;
  /** 匹配情绪 */
  emotion?: EmotionLabel;
  /** 匹配人格特征 */
  personalityTrait?: keyof OceanPersonality;
}

/**
 * 人格特征描述
 */
export interface PersonalityTrait {
  key: keyof OceanPersonality;
  name: string;
  description: string;
  lowDescription: string;
  highDescription: string;
}

/**
 * 情绪状态
 */
export interface EmotionState {
  label: EmotionLabel;
  intensity: EmotionIntensity;
  pad: PAD;
  timestamp: Date;
  durationMs?: number;
}

/**
 * 情绪历史记录
 */
export interface EmotionHistory {
  states: EmotionState[];
  maxLength: number;
}

/**
 * 人格一致性评分结果
 */
export interface ConsistencyResult {
  score: number;
  explanation: string;
  breakdown: {
    dimension: keyof OceanPersonality;
    match: boolean;
    score: number;
  }[];
}

/**
 * 语音情绪参数
 */
export interface EmotionalVoiceConfig {
  pitch?: number;
  rate?: number;
  volume?: number;
  emotion: EmotionLabel;
  style?: string;
}

/**
 * 情绪对语音的影响
 */
export interface VoiceEmotionMapping {
  emotion: EmotionLabel;
  pitchShift: number;
  rateMultiplier: number;
  volumeMultiplier: number;
  style: string;
}

/**
 * OCEAN人格维度描述常量
 */
export const OCEAN_DIMENSIONS: PersonalityTrait[] = [
  {
    key: 'openness',
    name: '开放性',
    description: '对新观念、新体验和创造力的开放程度',
    lowDescription: '务实、传统、喜欢熟悉的事物',
    highDescription: '富有想象力、好奇、欣赏艺术和美',
  },
  {
    key: 'conscientiousness',
    name: '尽责性',
    description: '自律、组织和责任感的程度',
    lowDescription: '随性、不拘小节、灵活',
    highDescription: '有条理、可靠、追求成就',
  },
  {
    key: 'extraversion',
    name: '外向性',
    description: '社交互动和精力来源的倾向',
    lowDescription: '内向、喜欢独处、安静',
    highDescription: '外向、善于社交、充满活力',
  },
  {
    key: 'agreeableness',
    name: '宜人性',
    description: '合作、同情心和人际和谐的程度',
    lowDescription: '独立、直接、注重实际',
    highDescription: '友善、乐于助人、富有同情心',
  },
  {
    key: 'neuroticism',
    name: '神经质',
    description: '情绪稳定性和应对压力的能力',
    lowDescription: '情绪稳定、冷静、抗压能力强',
    highDescription: '敏感、情绪化、容易焦虑',
  },
];

/**
 * 情绪标签中文映射
 */
export const EMOTION_LABELS_CN: Record<EmotionLabel, string> = {
  peaceful: '平静',
  worried: '担忧',
  nostalgic: '怀念',
  caring: '关心',
  chiding: '念叨',
  sad: '感伤',
  joyful: '欣慰',
  happy: '开心',
  angry: '生气',
  anxious: '焦虑',
  excited: '兴奋',
  tired: '疲惫',
  surprised: '惊讶',
  disappointed: '失望',
  hopeful: '期待',
  regretful: '遗憾',
};

/**
 * 情绪强度中文映射
 */
export const EMOTION_INTENSITY_CN: Record<EmotionIntensity, string> = {
  low: '轻微',
  medium: '中等',
  high: '强烈',
};

/**
 * 默认情绪到语音参数的映射
 */
export const DEFAULT_VOICE_EMOTION_MAPPINGS: VoiceEmotionMapping[] = [
  { emotion: 'peaceful', pitchShift: 0, rateMultiplier: 1.0, volumeMultiplier: 1.0, style: 'calm' },
  { emotion: 'happy', pitchShift: 1.1, rateMultiplier: 1.1, volumeMultiplier: 1.1, style: 'bright' },
  { emotion: 'sad', pitchShift: 0.9, rateMultiplier: 0.85, volumeMultiplier: 0.9, style: 'gentle' },
  { emotion: 'angry', pitchShift: 1.15, rateMultiplier: 1.2, volumeMultiplier: 1.15, style: 'intense' },
  { emotion: 'worried', pitchShift: 0.95, rateMultiplier: 1.05, volumeMultiplier: 0.95, style: 'anxious' },
  { emotion: 'excited', pitchShift: 1.15, rateMultiplier: 1.25, volumeMultiplier: 1.15, style: 'energetic' },
  { emotion: 'tired', pitchShift: 0.9, rateMultiplier: 0.8, volumeMultiplier: 0.85, style: 'soft' },
  { emotion: 'caring', pitchShift: 1.0, rateMultiplier: 0.9, volumeMultiplier: 1.0, style: 'warm' },
  { emotion: 'nostalgic', pitchShift: 0.95, rateMultiplier: 0.85, volumeMultiplier: 0.95, style: 'melancholic' },
];

/**
 * 默认基线情绪配置
 */
export const DEFAULT_BASELINE_PAD: PAD = {
  pleasure: 0.1,
  arousal: 0,
  dominance: 0,
};

/**
 * 默认OCEAN人格配置
 */
export const DEFAULT_OCEAN_PERSONALITY: OceanPersonality = {
  openness: 5,
  conscientiousness: 5,
  extraversion: 5,
  agreeableness: 5,
  neuroticism: 5,
};
