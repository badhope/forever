import {
  PAD,
  EmotionLabel,
  EmotionIntensity,
  EmotionState,
  EmotionHistory,
  OceanPersonality,
  ConsistencyResult,
  VoiceEmotionMapping,
  DEFAULT_VOICE_EMOTION_MAPPINGS,
  EMOTION_LABELS_CN,
  EMOTION_INTENSITY_CN,
} from './personality-types';

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
  happy: { pleasure: 0.6, arousal: 0.4, dominance: 0.2 },
  excited: { pleasure: 0.5, arousal: 0.7, dominance: 0.3 },
  surprised: { pleasure: 0.3, arousal: 0.6, dominance: 0.1 },
  disappointed: { pleasure: -0.5, arousal: -0.2, dominance: -0.3 },
  hopeful: { pleasure: 0.4, arousal: 0.2, dominance: 0.2 },
  regretful: { pleasure: -0.4, arousal: -0.2, dominance: -0.2 },
};

const EMOTION_CENTROIDS: Array<{ label: EmotionLabel; pad: PAD }> = [
  { label: 'peaceful', pad: { pleasure: 0.2, arousal: -0.2, dominance: 0.0 } },
  { label: 'worried', pad: { pleasure: -0.3, arousal: 0.5, dominance: -0.1 } },
  { label: 'nostalgic', pad: { pleasure: 0.0, arousal: -0.3, dominance: -0.2 } },
  { label: 'caring', pad: { pleasure: 0.3, arousal: 0.1, dominance: 0.1 } },
  { label: 'chiding', pad: { pleasure: -0.1, arousal: 0.3, dominance: 0.2 } },
  { label: 'sad', pad: { pleasure: -0.5, arousal: -0.2, dominance: -0.3 } },
  { label: 'joyful', pad: { pleasure: 0.6, arousal: 0.3, dominance: 0.1 } },
  { label: 'happy', pad: { pleasure: 0.6, arousal: 0.4, dominance: 0.2 } },
  { label: 'angry', pad: { pleasure: -0.7, arousal: 0.8, dominance: 0.6 } },
  { label: 'anxious', pad: { pleasure: -0.4, arousal: 0.6, dominance: -0.3 } },
  { label: 'excited', pad: { pleasure: 0.5, arousal: 0.7, dominance: 0.3 } },
  { label: 'tired', pad: { pleasure: -0.2, arousal: -0.5, dominance: -0.2 } },
  { label: 'surprised', pad: { pleasure: 0.3, arousal: 0.6, dominance: 0.1 } },
  { label: 'disappointed', pad: { pleasure: -0.5, arousal: -0.2, dominance: -0.3 } },
  { label: 'hopeful', pad: { pleasure: 0.4, arousal: 0.2, dominance: 0.2 } },
  { label: 'regretful', pad: { pleasure: -0.4, arousal: -0.2, dominance: -0.2 } },
];

const LEXICON: Record<string, string[]> = {
  miss: ['想你', '想念', '怀念', '梦到', '好想', '忘不了', '思念', '惦记'],
  love: ['爱你', '最爱', '喜欢', '亲爱的', '宝贝', '心疼', '在乎'],
  worry: ['担心', '操心', '怕你', '别忘', '记得', '注意', '小心'],
  sick: ['病了', '感冒', '发烧', '不舒服', '难受', '头疼', '生病'],
  tired: ['累了', '加班', '熬夜', '辛苦', '疲惫', '困倦'],
  blame: ['不听话', '让你', '我就说', '你看你', '早就说', '调皮'],
  care: ['吃饭', '穿暖', '早点睡', '注意身体', '钱够吗', '照顾好'],
  sad: ['难过', '哭了', '心碎', '难受', '好想你', '伤心', '失落'],
  happy: ['开心', '高兴', '快乐', '幸福', '太棒了', '真好'],
  excited: ['兴奋', '激动', '迫不及待', '期待', '太棒了'],
  angry: ['生气', '愤怒', '火大', '气死我了', '讨厌'],
  anxious: ['紧张', '焦虑', '不安', '着急', '心烦'],
  surprised: ['惊讶', '没想到', '哇', '天呐', '居然'],
  disappointed: ['失望', '难过', '可惜', '遗憾'],
  hopeful: ['希望', '期待', '相信', '会好的'],
  regretful: ['后悔', '不该', '要是', '可惜'],
};

const EMOTION_TRANSITION_MATRIX: Partial<Record<EmotionLabel, Partial<Record<EmotionLabel, number>>>> = {
  peaceful: {
    happy: 0.2,
    worried: 0.15,
    nostalgic: 0.1,
    caring: 0.15,
    sad: 0.05,
  },
  happy: {
    peaceful: 0.3,
    excited: 0.25,
    caring: 0.2,
    sad: 0.1,
  },
  sad: {
    peaceful: 0.3,
    nostalgic: 0.25,
    worried: 0.2,
    happy: 0.1,
  },
  worried: {
    peaceful: 0.25,
    anxious: 0.2,
    caring: 0.2,
    sad: 0.15,
  },
  excited: {
    happy: 0.3,
    peaceful: 0.25,
    surprised: 0.2,
    tired: 0.15,
  },
};

export class EmotionDynamicsEngine {
  private currentPAD: PAD;
  private baselinePAD: PAD;
  private readonly decayRates = { pleasure: 0.15, arousal: 0.35, dominance: 0.08 };
  private readonly maxAmplitude = 0.8;
  private lastUpdateTime: number;
  private emotionHistory: EmotionHistory;
  private voiceMappings: VoiceEmotionMapping[];

  constructor(baselinePAD: PAD = { pleasure: 0.1, arousal: 0, dominance: 0 }) {
    this.baselinePAD = baselinePAD;
    this.currentPAD = { ...baselinePAD };
    this.lastUpdateTime = Date.now();
    this.emotionHistory = { states: [], maxLength: 50 };
    this.voiceMappings = [...DEFAULT_VOICE_EMOTION_MAPPINGS];
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

  private clampPAD(pad: PAD): PAD {
    return {
      pleasure: Math.max(-this.maxAmplitude, Math.min(this.maxAmplitude, pad.pleasure)),
      arousal: Math.max(-this.maxAmplitude, Math.min(this.maxAmplitude, pad.arousal)),
      dominance: Math.max(-this.maxAmplitude, Math.min(this.maxAmplitude, pad.dominance)),
    };
  }

  private calculateEmotionIntensity(pad: PAD): EmotionIntensity {
    const magnitude = Math.sqrt(
      pad.pleasure * pad.pleasure +
      pad.arousal * pad.arousal +
      pad.dominance * pad.dominance
    );
    if (magnitude < 0.2) return 'low';
    if (magnitude < 0.5) return 'medium';
    return 'high';
  }

  private recordEmotionState(): void {
    const state: EmotionState = {
      label: this.getEmotionLabel(),
      intensity: this.calculateEmotionIntensity(this.currentPAD),
      pad: { ...this.currentPAD },
      timestamp: new Date(),
    };

    this.emotionHistory.states.push(state);
    if (this.emotionHistory.states.length > this.emotionHistory.maxLength) {
      this.emotionHistory.states.shift();
    }
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
    
    this.recordEmotionState();
    
    return { ...this.currentPAD };
  }

  updateFromText(text: string): PAD {
    const stimulus = EmotionDynamicsEngine.inferStimulusSemantic(text);
    return this.update(stimulus);
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
    return EMOTION_LABELS_CN[this.getEmotionLabel()] || '平静';
  }

  getEmotionIntensity(): EmotionIntensity {
    return this.calculateEmotionIntensity(this.currentPAD);
  }

  getEmotionIntensityChinese(): string {
    return EMOTION_INTENSITY_CN[this.getEmotionIntensity()] || '中等';
  }

  getEmotionHistory(): EmotionState[] {
    return [...this.emotionHistory.states];
  }

  getEmotionSummary(): {
    currentLabel: EmotionLabel;
    currentLabelCn: string;
    intensity: EmotionIntensity;
    intensityCn: string;
    pad: PAD;
    recentEmotions: EmotionLabel[];
  } {
    const recentEmotions = this.emotionHistory.states
      .slice(-5)
      .map(s => s.label);
    
    return {
      currentLabel: this.getEmotionLabel(),
      currentLabelCn: this.getEmotionLabelChinese(),
      intensity: this.getEmotionIntensity(),
      intensityCn: this.getEmotionIntensityChinese(),
      pad: this.getCurrentEmotion(),
      recentEmotions,
    };
  }

  calculatePersonalityConsistency(personality: OceanPersonality, text: string): ConsistencyResult {
    const currentEmotion = this.getEmotionLabel();
    const breakdown = [];
    let totalScore = 0;

    const evaluateDimension = (
      dimension: keyof OceanPersonality,
      value: number
    ): { match: boolean; score: number; reason: string } => {
      switch (dimension) {
        case 'extraversion':
          if (value > 7) {
            const outgoingEmotions: EmotionLabel[] = ['happy', 'excited', 'joyful'];
            const matches = outgoingEmotions.includes(currentEmotion);
            return { match: matches, score: matches ? 8 : 4, reason: matches ? '外向性格倾向积极情绪' : '外向性格但当前情绪较为内敛' };
          } else if (value < 4) {
            const introvertedEmotions: EmotionLabel[] = ['peaceful', 'nostalgic', 'sad'];
            const matches = introvertedEmotions.includes(currentEmotion);
            return { match: matches, score: matches ? 8 : 4, reason: matches ? '内向性格倾向平静情绪' : '内向性格但当前情绪较为外向' };
          }
          return { match: true, score: 7, reason: '中等外向性，情绪适配' };

        case 'neuroticism':
          if (value > 7) {
            const emotionalEmotions: EmotionLabel[] = ['anxious', 'worried', 'sad', 'angry'];
            const matches = emotionalEmotions.includes(currentEmotion);
            return { match: matches, score: matches ? 8 : 5, reason: matches ? '高神经质倾向情绪波动' : '高神经质但情绪稳定' };
          } else if (value < 4) {
            const stableEmotions: EmotionLabel[] = ['peaceful', 'happy', 'caring'];
            const matches = stableEmotions.includes(currentEmotion);
            return { match: matches, score: matches ? 8 : 5, reason: matches ? '低神经质倾向情绪稳定' : '低神经质但情绪不稳定' };
          }
          return { match: true, score: 7, reason: '中等神经质，情绪适配' };

        case 'agreeableness':
          if (value > 7) {
            const caringEmotions: EmotionLabel[] = ['caring', 'happy', 'joyful', 'hopeful'];
            const matches = caringEmotions.includes(currentEmotion);
            return { match: matches, score: matches ? 8 : 5, reason: matches ? '高宜人性倾向关怀情绪' : '高宜人性但情绪较为冷淡' };
          } else if (value < 4) {
            const assertiveEmotions: EmotionLabel[] = ['angry', 'chiding'];
            const matches = assertiveEmotions.includes(currentEmotion);
            return { match: matches, score: matches ? 8 : 5, reason: matches ? '低宜人性倾向直接表达' : '低宜人性但情绪温和' };
          }
          return { match: true, score: 7, reason: '中等宜人性，情绪适配' };

        case 'openness':
          if (value > 7) {
            const creativeEmotions: EmotionLabel[] = ['excited', 'surprised', 'joyful'];
            const matches = creativeEmotions.includes(currentEmotion);
            return { match: matches, score: matches ? 8 : 5, reason: matches ? '高开放性倾向好奇情绪' : '高开放性但情绪较为保守' };
          }
          return { match: true, score: 7, reason: '开放性对情绪影响较小' };

        case 'conscientiousness':
          if (value > 7) {
            const organizedEmotions: EmotionLabel[] = ['peaceful', 'caring', 'worried'];
            const matches = organizedEmotions.includes(currentEmotion);
            return { match: matches, score: matches ? 8 : 5, reason: matches ? '高尽责性倾向细致情绪' : '高尽责性但情绪较为随性' };
          }
          return { match: true, score: 7, reason: '尽责性对情绪影响较小' };

        default:
          return { match: true, score: 7, reason: '未知维度' };
      }
    };

    for (const [key, value] of Object.entries(personality)) {
      const result = evaluateDimension(key as keyof OceanPersonality, value);
      breakdown.push({
        dimension: key as keyof OceanPersonality,
        match: result.match,
        score: result.score,
      });
      totalScore += result.score;
    }

    const averageScore = Math.round(totalScore / 5);
    let explanation: string;
    
    if (averageScore >= 8) {
      explanation = '情绪表达与人格高度一致';
    } else if (averageScore >= 6) {
      explanation = '情绪表达与人格基本一致';
    } else if (averageScore >= 4) {
      explanation = '情绪表达与人格部分一致';
    } else {
      explanation = '情绪表达与人格存在差异';
    }

    return {
      score: averageScore,
      explanation,
      breakdown,
    };
  }

  predictNextEmotion(): EmotionLabel {
    const currentLabel = this.getEmotionLabel();
    const transitions = EMOTION_TRANSITION_MATRIX[currentLabel];
    
    if (!transitions) {
      return currentLabel;
    }

    const totalWeight = Object.values(transitions).reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;

    for (const [nextEmotion, weight] of Object.entries(transitions)) {
      random -= weight;
      if (random <= 0) {
        return nextEmotion as EmotionLabel;
      }
    }

    return currentLabel;
  }

  getVoiceEmotionConfig(): {
    pitchShift: number;
    rateMultiplier: number;
    volumeMultiplier: number;
    style: string;
  } {
    const currentEmotion = this.getEmotionLabel();
    const mapping = this.voiceMappings.find(m => m.emotion === currentEmotion);
    
    if (mapping) {
      return {
        pitchShift: mapping.pitchShift,
        rateMultiplier: mapping.rateMultiplier,
        volumeMultiplier: mapping.volumeMultiplier,
        style: mapping.style,
      };
    }

    return {
      pitchShift: 0,
      rateMultiplier: 1.0,
      volumeMultiplier: 1.0,
      style: 'neutral',
    };
  }

  addVoiceMapping(mapping: VoiceEmotionMapping): void {
    const index = this.voiceMappings.findIndex(m => m.emotion === mapping.emotion);
    if (index >= 0) {
      this.voiceMappings[index] = mapping;
    } else {
      this.voiceMappings.push(mapping);
    }
  }

  reset(): void {
    this.currentPAD = { ...this.baselinePAD };
    this.lastUpdateTime = Date.now();
    this.emotionHistory = { states: [], maxLength: this.emotionHistory.maxLength };
  }

  setBaselinePAD(baseline: PAD): void {
    this.baselinePAD = baseline;
    if (this.emotionHistory.states.length === 0) {
      this.currentPAD = { ...baseline };
    }
  }
}