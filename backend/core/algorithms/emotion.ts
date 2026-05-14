/**
 * Forever 算法库 - 情感计算算法 (PAD模型)
 *
 * 基于 PAD 情感模型（Pleasure-Arousal-Dominance）提供情感距离计算、
 * 情感插值和情感标签转换等功能。
 */

/**
 * PAD 情感模型参数
 * Pleasure (愉悦度): [-1, 1]
 * Arousal (激活度): [-1, 1]
 * Dominance (支配度): [-1, 1]
 */
export interface PADEmotion {
  /** 愉悦度 */
  pleasure: number;
  /** 激活度 */
  arousal: number;
  /** 支配度 */
  dominance: number;
}

/**
 * 情感标签到 PAD 值的映射
 */
export const EMOTION_TO_PAD: Record<string, PADEmotion> = {
  // 积极情感
  'joy': { pleasure: 0.8, arousal: 0.6, dominance: 0.3 },
  'excited': { pleasure: 0.7, arousal: 0.9, dominance: 0.4 },
  'content': { pleasure: 0.6, arousal: -0.2, dominance: 0.2 },
  'proud': { pleasure: 0.7, arousal: 0.3, dominance: 0.7 },
  'grateful': { pleasure: 0.6, arousal: -0.1, dominance: -0.2 },

  // 消极情感
  'anger': { pleasure: -0.7, arousal: 0.7, dominance: 0.6 },
  'fear': { pleasure: -0.7, arousal: 0.7, dominance: -0.6 },
  'sadness': { pleasure: -0.7, arousal: -0.4, dominance: -0.4 },
  'disgust': { pleasure: -0.6, arousal: 0.2, dominance: -0.1 },
  'shame': { pleasure: -0.6, arousal: -0.2, dominance: -0.6 },

  // 中性情感
  'neutral': { pleasure: 0, arousal: 0, dominance: 0 },
  'surprise': { pleasure: 0.2, arousal: 0.8, dominance: 0 },
  'curious': { pleasure: 0.4, arousal: 0.5, dominance: 0.1 },
  'bored': { pleasure: -0.3, arousal: -0.6, dominance: -0.3 },
  'anxious': { pleasure: -0.5, arousal: 0.5, dominance: -0.4 },
};

/**
 * 计算两个 PAD 情感状态之间的距离
 * 使用加权欧几里得距离
 *
 * @param a - 情感状态 A
 * @param b - 情感状态 B
 * @returns 情感距离
 */
export function padDistance(a: PADEmotion, b: PADEmotion): number {
  const weights = { pleasure: 1.0, arousal: 0.8, dominance: 0.6 };

  const dp = (a.pleasure - b.pleasure) * weights.pleasure;
  const da = (a.arousal - b.arousal) * weights.arousal;
  const dd = (a.dominance - b.dominance) * weights.dominance;

  return Math.sqrt(dp * dp + da * da + dd * dd);
}

/**
 * 情感状态插值
 * 用于平滑情感过渡
 *
 * @param from - 起始情感状态
 * @param to - 目标情感状态
 * @param t - 插值系数 [0, 1]
 * @returns 插值后的情感状态
 */
export function interpolatePAD(
  from: PADEmotion,
  to: PADEmotion,
  t: number,
): PADEmotion {
  const clampedT = Math.max(0, Math.min(1, t));

  return {
    pleasure: from.pleasure + (to.pleasure - from.pleasure) * clampedT,
    arousal: from.arousal + (to.arousal - from.arousal) * clampedT,
    dominance: from.dominance + (to.dominance - from.dominance) * clampedT,
  };
}

/**
 * 根据 PAD 值找到最接近的情感标签
 *
 * @param pad - PAD 情感状态
 * @returns 最接近的情感标签名称
 */
export function padToEmotion(pad: PADEmotion): string {
  let closestEmotion = 'neutral';
  let minDistance = Infinity;

  for (const [emotion, emotionPad] of Object.entries(EMOTION_TO_PAD)) {
    const distance = padDistance(pad, emotionPad);
    if (distance < minDistance) {
      minDistance = distance;
      closestEmotion = emotion;
    }
  }

  return closestEmotion;
}
