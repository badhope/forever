import { PAD, EMOTION_PRESETS } from './personality-types';

export class EmotionDynamicsEngine {
  private currentPAD: PAD;
  private baselinePAD: PAD;
  private readonly decayRates = {
    pleasure: 0.3,
    arousal: 0.45,
    dominance: 0.15,
  };

  constructor(baselinePAD: PAD) {
    this.baselinePAD = { ...baselinePAD };
    this.currentPAD = { ...baselinePAD };
  }

  update(stimulusPAD: PAD): PAD {
    this.currentPAD = {
      pleasure: this.applyDecay('pleasure') + stimulusPAD.pleasure * this.decayRates.pleasure,
      arousal: this.applyDecay('arousal') + stimulusPAD.arousal * this.decayRates.arousal,
      dominance: this.applyDecay('dominance') + stimulusPAD.dominance * this.decayRates.dominance,
    };

    this.currentPAD = this.clampPAD(this.currentPAD);
    return { ...this.currentPAD };
  }

  private applyDecay(dimension: keyof PAD): number {
    const current = this.currentPAD[dimension];
    const baseline = this.baselinePAD[dimension];
    const decay = this.decayRates[dimension];
    return current + (baseline - current) * decay;
  }

  private clampPAD(pad: PAD): PAD {
    return {
      pleasure: Math.max(-1, Math.min(1, pad.pleasure)),
      arousal: Math.max(-1, Math.min(1, pad.arousal)),
      dominance: Math.max(-1, Math.min(1, pad.dominance)),
    };
  }

  getCurrentEmotion(): PAD {
    return { ...this.currentPAD };
  }

  getEmotionLabel(): string {
    const { pleasure, arousal, dominance } = this.currentPAD;
    
    if (pleasure < -0.4 && arousal > 0.3 && dominance < -0.2) {
      return '担忧';
    }
    if (pleasure > 0.5 && arousal > 0.2) {
      return '开心';
    }
    if (pleasure < -0.5 && arousal < -0.1) {
      return '感伤';
    }
    if (pleasure > -0.2 && pleasure < 0.3 && arousal < -0.2) {
      return '怀念';
    }
    if (pleasure > -0.2 && pleasure < 0.2 && dominance > 0.4) {
      return '念叨';
    }
    
    return '平静';
  }

  reset(): void {
    this.currentPAD = { ...this.baselinePAD };
  }

  static inferStimulus(userMessage: string): PAD {
    const msg = userMessage.toLowerCase();
    
    let pleasure = 0;
    let arousal = 0;
    let dominance = 0;

    if (msg.includes('想你') || msg.includes('怀念') || msg.includes('梦到')) {
      pleasure = 0.2;
      arousal = -0.3;
      dominance = -0.1;
    }
    
    if (msg.includes('病了') || msg.includes('不舒服') || msg.includes('发烧')) {
      pleasure = -0.6;
      arousal = 0.7;
      dominance = -0.5;
    }
    
    if (msg.includes('升职') || msg.includes('加薪') || msg.includes('开心')) {
      pleasure = 0.8;
      arousal = 0.5;
      dominance = 0.3;
    }
    
    if (msg.includes('吵架') || msg.includes('难过') || msg.includes('哭了')) {
      pleasure = -0.7;
      arousal = 0.4;
      dominance = -0.6;
    }
    
    if (msg.includes('加班') || msg.includes('熬夜') || msg.includes('累')) {
      pleasure = -0.3;
      arousal = 0.2;
      dominance = 0.4;
    }

    return { pleasure, arousal, dominance };
  }
}
