/**
 * Forever 算法库 - 重要性评分与记忆衰减算法
 *
 * 提供记忆重要性评分（加权求和 + Sigmoid 归一化）、
 * 艾宾浩斯遗忘曲线和 SuperMemo-2 复习间隔计算。
 */

// ============ 重要性评分 ============

/**
 * 记忆重要性评分参数
 */
export interface ImportanceFactors {
  /** 情感强度 [0, 1] */
  emotionalIntensity: number;
  /** 新颖性 [0, 1] */
  novelty: number;
  /** 相关性 [0, 1] */
  relevance: number;
  /** 出现频率 [0, 1] */
  frequency: number;
  /** 时间衰减 [0, 1] */
  recency: number;
}

/**
 * 计算记忆重要性分数
 * 使用加权求和 + Sigmoid 归一化
 *
 * @param factors - 重要性因子
 * @param weights - 可选的自定义权重
 * @returns 归一化后的重要性分数 [0, 1]
 */
export function calculateImportance(
  factors: ImportanceFactors,
  weights: Partial<ImportanceFactors> = {},
): number {
  const defaultWeights: ImportanceFactors = {
    emotionalIntensity: 0.25,
    novelty: 0.20,
    relevance: 0.30,
    frequency: 0.15,
    recency: 0.10,
  };

  const w = { ...defaultWeights, ...weights };

  // 加权求和
  const rawScore =
    factors.emotionalIntensity * w.emotionalIntensity +
    factors.novelty * w.novelty +
    factors.relevance * w.relevance +
    factors.frequency * w.frequency +
    factors.recency * w.recency;

  // Sigmoid 归一化到 [0, 1]，使极端值更显著
  return sigmoid(rawScore * 4 - 2);
}

/**
 * Sigmoid 函数
 * @internal
 */
function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

// ============ 记忆衰减 ============

/**
 * 艾宾浩斯遗忘曲线参数
 */
export interface ForgettingCurveParams {
  /** 初始记忆强度 [0, 1] */
  initialStrength: number;
  /** 衰减率 (默认 0.1) */
  decayRate: number;
  /** 复习次数 */
  reviewCount: number;
}

/**
 * 计算记忆强度随时间的衰减
 * 基于艾宾浩斯遗忘曲线
 *
 * @param hoursElapsed - 经过的小时数
 * @param params - 遗忘曲线参数
 * @returns 当前记忆强度 [0, 1]
 */
export function forgettingCurve(
  hoursElapsed: number,
  params: Partial<ForgettingCurveParams> = {},
): number {
  const {
    initialStrength = 1.0,
    decayRate = 0.1,
    reviewCount = 0,
  } = params;

  // 复习增强记忆强度
  const reviewBoost = Math.pow(1.5, reviewCount);
  const effectiveDecayRate = decayRate / reviewBoost;

  // 艾宾浩斯遗忘曲线公式
  const retention = Math.exp(-effectiveDecayRate * Math.log(hoursElapsed + 1));

  return Math.max(0, Math.min(1, initialStrength * retention));
}

/**
 * 计算最佳复习间隔 (SuperMemo-2 算法简化版)
 *
 * @param repetition - 已复习次数
 * @param easeFactor - 易度因子 (默认 2.5)
 * @returns 下次复习间隔 (天)
 */
export function calculateReviewInterval(
  repetition: number,
  easeFactor: number = 2.5,
): number {
  if (repetition === 0) return 1;
  if (repetition === 1) return 6;

  return Math.round(calculateReviewInterval(repetition - 1, easeFactor) * easeFactor);
}
