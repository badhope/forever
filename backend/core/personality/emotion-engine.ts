import { PAD, EmotionLabel } from './personality-types';

const PAD_COVARIANCE_MATRIX = [
  [1.00,  0.25, -0.15],
  [0.25,  1.00,  0.40],
  [-0.15, 0.40,  1.00],
];

const SEMANTIC_EMBEDDINGS: Record<string, PAD> = {
  positive: { pleasure: 0.4, arousal: 0.2, dominance: 0.1 },
  negative: { pleasure: -0.5, arousal: 0.3, dominance: 0.0 },
  sad: { pleasure: -0.6, arousal: -0.3, dominance: -0.4 },
  angry: { pleasure: -0.7, arousal: 0.8, dominance: 0.6 },
  anxious: { pleasure: -0.4, arousal: 0.6, dominance: -0.3 },
  love: { pleasure: 0.7, arousal: 0.3, dominance: -0.1 },
  miss: { pleasure: 0.1, arousal: -0.4, dominance: -0.2 },
  worry: { pleasure: -0.3, arousal: 0.5, dominance: -0.2 },
  blame: { pleasure: -0.3, arousal: 0.4, dominance: 0.3 },
  care: { pleasure: 0.2, arousal: 0.1, dominance: 0.1 },
  tired: { pleasure: -0.2, arousal: -0.5, dominance: -0.2 },
  sick: { pleasure: -0.5, arousal: 0.2, dominance: -0.4 },
};

const EMOTION_CENTROIDS: Array<{ label: EmotionLabel; pad: PAD }> = [
  { label: 'peaceful', pad: { pleasure: 0.2, arousal: -0.2, dominance: 0.0 } },
  { label: 'worried', pad: { pleasure: -0.3, arousal: 0.5, dominance: -0.1 } },
  { label: 'nostalgic', pad: { pleasure: 0.0, arousal: -0.3, dominance: -0.2 } },
  { label: 'caring', pad: { pleasure: 0.3, arousal: 0.1, dominance: 0.1 } },
  { label: 'chiding', pad: { pleasure: -0.1, arousal: 0.3, dominance: 0.2 } },
  { label: 'sad', pad: { pleasure: -0.5, arousal: -0.2, dominance: -0.3 } },
  { label: 'joyful', pad: { pleasure: 0.6, arousal: 0.3, dominance: 0.1 } },
];

const LEXICON: Record<string, string[]> = {
  miss: ['想你', '想念', '怀念', '梦到', '好想', '忘不了', '思念'],
  love: ['爱你', '最爱', '喜欢', '亲爱的'],
  worry: ['担心', '操心', '怕你', '别忘', '记得'],
  sick: ['病了', '感冒', '发烧', '不舒服', '难受', '头疼'],
  tired: ['累了', '加班', '熬夜', '辛苦'],
  blame: ['不听话', '让你', '我就说', '你看你', '早就说'],
  care: ['吃饭', '穿暖', '早点睡', '注意身体', '钱够吗'],
  sad: ['难过', '哭了', '心碎', '难受', '好想你'],
};

export class EmotionDynamicsEngine {
  private currentPAD: PAD;
  private baselinePAD: PAD;
  private readonly decayRates = { pleasure: 0.15, arousal: 0.35, dominance: 0.08 };
  private readonly maxAmplitude = 0.8;
  private lastUpdateTime: number;

  constructor(baselinePAD: PAD) {
    this.baselinePAD = baselinePAD;
    this.currentPAD = { ...baselinePAD };
    this.lastUpdateTime = Date.now();
  }

  private applyCovariance(pad: PAD): PAD {
    const result = { ...pad };
    result.pleasure = pad.pleasure + 0.25 * pad.arousal + (-0.15) * pad.dominance;
    result.arousal = 0.25 * pad.pleasure + pad.arousal + 0.40 * pad.dominance;
    result.dominance = (-0.15) * pad.pleasure + 0.40 * pad.arousal + pad.dominance;
    return this.clampPAD(result);
  }

  private applyTimeDecay(): PAD {
    const now = Date.now();
    const deltaMinutes = (now - this.lastUpdateTime) / 60000;
    this.lastUpdateTime = now;

    return {
      pleasure: Math.exp(-this.decayRates.pleasure * deltaMinutes),
      arousal: Math.exp(-this.decayRates.arousal * deltaMinutes),
      dominance: Math.exp(-this.decayRates.dominance * deltaMinutes),
    };
  }

  static inferStimulusSemantic(userMessage: string): PAD {
    const msg = userMessage.toLowerCase();
    const scores: Record<string, number> = {};
    let totalHits = 0;

    for (const [emotion, keywords] of Object.entries(LEXICON)) {
      scores[emotion] = 0;
      for (const kw of keywords) {
        if (msg.includes(kw)) {
          scores[emotion] += 1;
          totalHits++;
        }
      }
    }

    if (totalHits === 0) {
      return { pleasure: 0, arousal: 0, dominance: 0 };
    }

    const result: PAD = { pleasure: 0, arousal: 0, dominance: 0 };
    for (const [emotion, count] of Object.entries(scores)) {
      if (count > 0 && SEMANTIC_EMBEDDINGS[emotion]) {
        const weight = count / totalHits;
        const embedding = SEMANTIC_EMBEDDINGS[emotion];
        result.pleasure += embedding.pleasure * weight;
        result.arousal += embedding.arousal * weight;
        result.dominance += embedding.dominance * weight;
      }
    }

    return result;
  }

  update(stimulusPAD: PAD): PAD {
    const decayMultipliers = this.applyTimeDecay();

    this.currentPAD = {
      pleasure: this.baselinePAD.pleasure +
        (this.currentPAD.pleasure - this.baselinePAD.pleasure) * decayMultipliers.pleasure +
        stimulusPAD.pleasure * (1 - this.decayRates.pleasure),
      arousal: this.baselinePAD.arousal +
        (this.currentPAD.arousal - this.baselinePAD.arousal) * decayMultipliers.arousal +
        stimulusPAD.arousal * (1 - this.decayRates.arousal),
      dominance: this.baselinePAD.dominance +
        (this.currentPAD.dominance - this.baselinePAD.dominance) * decayMultipliers.dominance +
        stimulusPAD.dominance * (1 - this.decayRates.dominance),
    };

    this.currentPAD = this.applyCovariance(this.currentPAD);
    this.currentPAD = this.clampPAD(this.currentPAD);
    return { ...this.currentPAD };
  }

  private clampPAD(pad: PAD): PAD {
    return {
      pleasure: Math.max(-this.maxAmplitude, Math.min(this.maxAmplitude, pad.pleasure)),
      arousal: Math.max(-this.maxAmplitude, Math.min(this.maxAmplitude, pad.arousal)),
      dominance: Math.max(-this.maxAmplitude, Math.min(this.maxAmplitude, pad.dominance)),
    };
  }

  getCurrentEmotion(): PAD {
    return { ...this.currentPAD };
  }

  getEmotionLabel(): EmotionLabel {
    let closest: EmotionLabel = 'peaceful';
    let minDistance = Infinity;

    for (const centroid of EMOTION_CENTROIDS) {
      const distance = Math.sqrt(
        Math.pow(this.currentPAD.pleasure - centroid.pad.pleasure, 2) +
        Math.pow(this.currentPAD.arousal - centroid.pad.arousal, 2) +
        Math.pow(this.currentPAD.dominance - centroid.pad.dominance, 2)
      );
      if (distance < minDistance) {
        minDistance = distance;
        closest = centroid.label;
      }
    }

    return closest;
  }

  getEmotionLabelChinese(): string {
    const labelMap: Record<EmotionLabel, string> = {
      peaceful: '平静',
      worried: '担忧',
      nostalgic: '怀念',
      caring: '关心',
      chiding: '念叨',
      sad: '感伤',
      joyful: '欣慰',
    };
    return labelMap[this.getEmotionLabel()];
  }

  reset(): void {
    this.currentPAD = { ...this.baselinePAD };
    this.lastUpdateTime = Date.now();
  }
}
