/**
 * Forever 数学模型库
 * 包含人格模型、情感动力学、记忆网络等数学模型
 */

// OCEAN 人格模型
export {
  DEFAULT_OCEAN,
  calculatePersonalityInfluence,
  oceanSimilarity,
  interpolateOcean,
} from './ocean';
export type { OceanTraits, PersonalityInfluence } from './ocean';

// 情感动力学
export { EmotionalStateMachine, emotionalContagion } from './emotion';

// 记忆网络
export { MemoryNetwork } from './memory-network';
export type { MemoryNode } from './memory-network';

// 注意力机制
export { AttentionManager } from './attention';
export type { AttentionConfig } from './attention';

// 决策模型
export { calculateUtility, selectOptimalOption } from './decision';
export type { DecisionOption } from './decision';

// 贝叶斯信念
export { BayesianBelief } from './bayesian';

// ============ 聚合导出对象 ============

import { DEFAULT_OCEAN, calculatePersonalityInfluence, oceanSimilarity, interpolateOcean } from './ocean';
import { EmotionalStateMachine, emotionalContagion } from './emotion';
import { MemoryNetwork } from './memory-network';
import { AttentionManager } from './attention';
import { calculateUtility, selectOptimalOption } from './decision';
import { BayesianBelief } from './bayesian';

/**
 * 数学模型聚合对象
 * 提供所有数学模型的统一访问入口
 */
export const MathModels = {
  // OCEAN 人格
  DEFAULT_OCEAN,
  calculatePersonalityInfluence,
  oceanSimilarity,
  interpolateOcean,

  // 情感动力学
  EmotionalStateMachine,
  emotionalContagion,

  // 记忆网络
  MemoryNetwork,

  // 注意力
  AttentionManager,

  // 决策
  calculateUtility,
  selectOptimalOption,

  // 贝叶斯
  BayesianBelief,
};

export default MathModels;
