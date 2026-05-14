/**
 * Forever 数学模型库 - OCEAN 人格模型
 *
 * 基于 OCEAN 大五人格模型（Openness, Conscientiousness, Extraversion,
 * Agreeableness, Neuroticism）提供人格特质计算、相似度比较和插值功能。
 */

/**
 * OCEAN 大五人格模型
 * Openness (开放性): 想象力、审美、情感丰富度
 * Conscientiousness (尽责性): 组织性、勤奋、自律
 * Extraversion (外向性): 社交性、活跃度、积极情绪
 * Agreeableness (宜人性): 信任、利他、谦逊
 * Neuroticism (神经质): 焦虑、敌意、抑郁倾向
 */
export interface OceanTraits {
  /** 开放性 [0, 1] */
  openness: number;
  /** 尽责性 [0, 1] */
  conscientiousness: number;
  /** 外向性 [0, 1] */
  extraversion: number;
  /** 宜人性 [0, 1] */
  agreeableness: number;
  /** 神经质 [0, 1] */
  neuroticism: number;
}

/**
 * 默认人格特质 (中性)
 */
export const DEFAULT_OCEAN: OceanTraits = {
  openness: 0.5,
  conscientiousness: 0.5,
  extraversion: 0.5,
  agreeableness: 0.5,
  neuroticism: 0.5,
};

/**
 * 人格特质影响因子
 * 用于计算人格如何影响行为和情感
 */
export interface PersonalityInfluence {
  /** 情感波动性 (受神经质影响) */
  emotionalVolatility: number;
  /** 社交参与度 (受外向性影响) */
  socialEngagement: number;
  /** 认知灵活性 (受开放性影响) */
  cognitiveFlexibility: number;
  /** 情感稳定性 (受尽责性影响) */
  emotionalStability: number;
  /** 共情能力 (受宜人性影响) */
  empathy: number;
}

/**
 * 计算人格特质对行为的影响
 *
 * @param traits - OCEAN 人格特质
 * @returns 各维度的影响因子
 */
export function calculatePersonalityInfluence(traits: OceanTraits): PersonalityInfluence {
  return {
    // 神经质越高，情感波动越大
    emotionalVolatility: 0.3 + traits.neuroticism * 0.7,

    // 外向性越高，社交参与度越高
    socialEngagement: 0.2 + traits.extraversion * 0.8,

    // 开放性越高，认知越灵活
    cognitiveFlexibility: 0.3 + traits.openness * 0.7,

    // 尽责性越高，情感越稳定
    emotionalStability: 0.3 + traits.conscientiousness * 0.7,

    // 宜人性越高，共情能力越强
    empathy: 0.2 + traits.agreeableness * 0.8,
  };
}

/**
 * 人格相似度计算
 * 使用加权欧几里得距离的变体
 *
 * @param a - 人格特质 A
 * @param b - 人格特质 B
 * @returns 相似度 [0, 1]，1 表示完全相同
 */
export function oceanSimilarity(a: OceanTraits, b: OceanTraits): number {
  const weights = {
    openness: 1.0,
    conscientiousness: 0.9,
    extraversion: 1.1,
    agreeableness: 1.2,
    neuroticism: 0.8,
  };

  let squaredDiffSum = 0;
  let weightSum = 0;

  for (const trait of Object.keys(weights) as Array<keyof OceanTraits>) {
    const diff = (a[trait] - b[trait]) * weights[trait];
    squaredDiffSum += diff * diff;
    weightSum += weights[trait];
  }

  // 转换为相似度 [0, 1]
  const distance = Math.sqrt(squaredDiffSum / weightSum);
  return Math.max(0, 1 - distance);
}

/**
 * 人格特质插值
 * 用于人格随时间的渐变
 *
 * @param from - 起始人格
 * @param to - 目标人格
 * @param t - 插值系数 [0, 1]
 * @returns 插值后的人格特质
 */
export function interpolateOcean(
  from: OceanTraits,
  to: OceanTraits,
  t: number,
): OceanTraits {
  const clampedT = Math.max(0, Math.min(1, t));

  return {
    openness: from.openness + (to.openness - from.openness) * clampedT,
    conscientiousness: from.conscientiousness + (to.conscientiousness - from.conscientiousness) * clampedT,
    extraversion: from.extraversion + (to.extraversion - from.extraversion) * clampedT,
    agreeableness: from.agreeableness + (to.agreeableness - from.agreeableness) * clampedT,
    neuroticism: from.neuroticism + (to.neuroticism - from.neuroticism) * clampedT,
  };
}
