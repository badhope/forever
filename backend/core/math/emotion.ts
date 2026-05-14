/**
 * Forever 数学模型库 - 情感动力学模型
 *
 * 提供情感状态机（追踪情感的持续和转变）和情感传染模型
 * （模拟情感在用户和 AI 之间的传递）。
 */

import type { PADEmotion } from '../algorithms/emotion';
import { EMOTION_TO_PAD, interpolatePAD } from '../algorithms/emotion';

/**
 * 情感状态机
 * 追踪情感的持续和转变
 */
export class EmotionalStateMachine {
  private currentEmotion: PADEmotion;
  private targetEmotion: PADEmotion;
  private transitionSpeed: number;
  private emotionHistory: Array<{ emotion: PADEmotion; timestamp: number }>;
  private readonly maxHistoryLength = 100;

  constructor(
    initialEmotion: PADEmotion = EMOTION_TO_PAD['neutral'],
    transitionSpeed: number = 0.1,
  ) {
    this.currentEmotion = { ...initialEmotion };
    this.targetEmotion = { ...initialEmotion };
    this.transitionSpeed = transitionSpeed;
    this.emotionHistory = [];
  }

  /**
   * 设置目标情感
   */
  setTargetEmotion(emotion: PADEmotion): void {
    this.targetEmotion = { ...emotion };
  }

  /**
   * 设置目标情感标签
   */
  setTargetEmotionLabel(label: string): void {
    const pad = EMOTION_TO_PAD[label] || EMOTION_TO_PAD['neutral'];
    this.setTargetEmotion(pad);
  }

  /**
   * 更新情感状态 (每帧调用)
   *
   * @param deltaTime - 时间增量（默认 1.0）
   * @returns 更新后的当前情感状态
   */
  update(deltaTime: number = 1.0): PADEmotion {
    // 向目标情感插值
    const t = Math.min(1, this.transitionSpeed * deltaTime);
    this.currentEmotion = interpolatePAD(this.currentEmotion, this.targetEmotion, t);

    // 记录历史
    this.emotionHistory.push({
      emotion: { ...this.currentEmotion },
      timestamp: Date.now(),
    });

    // 限制历史长度
    if (this.emotionHistory.length > this.maxHistoryLength) {
      this.emotionHistory.shift();
    }

    return { ...this.currentEmotion };
  }

  /**
   * 获取当前情感
   */
  getCurrentEmotion(): PADEmotion {
    return { ...this.currentEmotion };
  }

  /**
   * 获取情感历史
   */
  getEmotionHistory(): Array<{ emotion: PADEmotion; timestamp: number }> {
    return [...this.emotionHistory];
  }

  /**
   * 计算情感稳定性
   * 基于历史情感的方差
   *
   * @returns 稳定性 [0, 1]，1 表示非常稳定
   */
  calculateStability(): number {
    if (this.emotionHistory.length < 2) return 1.0;

    const recent = this.emotionHistory.slice(-10);
    const avgPleasure = recent.reduce((sum, h) => sum + h.emotion.pleasure, 0) / recent.length;
    const avgArousal = recent.reduce((sum, h) => sum + h.emotion.arousal, 0) / recent.length;

    const variance = recent.reduce((sum, h) => {
      const dp = h.emotion.pleasure - avgPleasure;
      const da = h.emotion.arousal - avgArousal;
      return sum + dp * dp + da * da;
    }, 0) / recent.length;

    // 方差越小越稳定
    return Math.exp(-variance * 2);
  }
}

/**
 * 情感传染模型
 * 模拟情感在用户和 AI 之间的传递
 *
 * @param sourceEmotion - 情感源
 * @param receiverEmotion - 情感接收者
 * @param empathyLevel - 共情水平 [0, 1]（默认 0.5）
 * @returns 传染后的情感状态
 */
export function emotionalContagion(
  sourceEmotion: PADEmotion,
  receiverEmotion: PADEmotion,
  empathyLevel: number = 0.5,
): PADEmotion {
  // 共情系数决定情感传染强度
  const contagionStrength = empathyLevel * 0.3;

  return {
    pleasure: receiverEmotion.pleasure + (sourceEmotion.pleasure - receiverEmotion.pleasure) * contagionStrength,
    arousal: receiverEmotion.arousal + (sourceEmotion.arousal - receiverEmotion.arousal) * contagionStrength,
    dominance: receiverEmotion.dominance + (sourceEmotion.dominance - receiverEmotion.dominance) * contagionStrength,
  };
}
