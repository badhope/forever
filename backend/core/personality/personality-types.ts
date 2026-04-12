export interface OceanPersonality {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
}

export interface PAD {
  pleasure: number;
  arousal: number;
  dominance: number;
}

export interface Habit {
  id: string;
  type: 'catchphrase' | 'filler' | 'reaction' | 'topic_preference';
  content: string;
  probability: number;
  triggers: string[];
  cooldownMinutes: number;
  lastTriggeredAt?: Date;
}

export interface SpeechPattern {
  averageSentenceLength: 'short' | 'medium' | 'long';
  fillerWords: string[];
  questionFrequency: number;
  interruptionRate: number;
  dialect: string;
}

export interface ReactionTemplate {
  trigger: string;
  pattern: string[];
  description: string;
}

export const EMOTION_PRESETS: Record<string, PAD> = {
  calm: { pleasure: 0, arousal: -0.3, dominance: 0 },
  happy: { pleasure: 0.7, arousal: 0.4, dominance: 0.2 },
  worried: { pleasure: -0.5, arousal: 0.6, dominance: -0.4 },
  sad: { pleasure: -0.7, arousal: -0.2, dominance: -0.6 },
  nostalgic: { pleasure: 0.2, arousal: -0.4, dominance: -0.2 },
  nagging: { pleasure: -0.1, arousal: 0.3, dominance: 0.6 },
};

export function createDefaultPersonality(): OceanPersonality {
  return {
    openness: 5,
    conscientiousness: 5,
    extraversion: 5,
    agreeableness: 5,
    neuroticism: 5,
  };
}

export function createDefaultPAD(): PAD {
  return {
    pleasure: 0,
    arousal: 0,
    dominance: 0,
  };
}

export function validatePersonality(p: OceanPersonality): string[] {
  const errors: string[] = [];
  const keys: (keyof OceanPersonality)[] = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'];
  
  for (const key of keys) {
    if (p[key] < 1 || p[key] > 10) {
      errors.push(`${key} 必须在 1-10 范围内`);
    }
  }
  
  return errors;
}
