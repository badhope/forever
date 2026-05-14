/**
 * Forever 数学模型库
 * 包含人格模型、情感动力学、记忆网络等数学模型
 */

import { PADEmotion, EMOTION_TO_PAD, padDistance, interpolatePAD } from '../algorithms/index.js';

// ==================== OCEAN 人格模型 ====================

/**
 * OCEAN 大五人格模型
 * Openness (开放性): 想象力、审美、情感丰富度
 * Conscientiousness (尽责性): 组织性、勤奋、自律
 * Extraversion (外向性): 社交性、活跃度、积极情绪
 * Agreeableness (宜人性): 信任、利他、谦逊
 * Neuroticism (神经质): 焦虑、敌意、抑郁倾向
 */
export interface OceanTraits {
  openness: number;           // 开放性 [0, 1]
  conscientiousness: number;  // 尽责性 [0, 1]
  extraversion: number;       // 外向性 [0, 1]
  agreeableness: number;      // 宜人性 [0, 1]
  neuroticism: number;        // 神经质 [0, 1]
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
  emotionalVolatility: number;    // 情感波动性 (受神经质影响)
  socialEngagement: number;       // 社交参与度 (受外向性影响)
  cognitiveFlexibility: number;   // 认知灵活性 (受开放性影响)
  emotionalStability: number;     // 情感稳定性 (受尽责性影响)
  empathy: number;                // 共情能力 (受宜人性影响)
}

/**
 * 计算人格特质对行为的影响
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
 * 使用欧几里得距离的变体
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
 */
export function interpolateOcean(
  from: OceanTraits,
  to: OceanTraits,
  t: number
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

// ==================== 情感动力学模型 ====================

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
    transitionSpeed: number = 0.1
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
 */
export function emotionalContagion(
  sourceEmotion: PADEmotion,
  receiverEmotion: PADEmotion,
  empathyLevel: number = 0.5
): PADEmotion {
  // 共情系数决定情感传染强度
  const contagionStrength = empathyLevel * 0.3;
  
  return {
    pleasure: receiverEmotion.pleasure + (sourceEmotion.pleasure - receiverEmotion.pleasure) * contagionStrength,
    arousal: receiverEmotion.arousal + (sourceEmotion.arousal - receiverEmotion.arousal) * contagionStrength,
    dominance: receiverEmotion.dominance + (sourceEmotion.dominance - receiverEmotion.dominance) * contagionStrength,
  };
}

// ==================== 记忆网络模型 ====================

/**
 * 记忆节点
 */
export interface MemoryNode {
  id: string;
  content: string;
  embedding: number[];
  importance: number;
  timestamp: number;
  connections: Map<string, number>; // 节点ID -> 连接强度
}

/**
 * 记忆网络
 * 使用图结构组织记忆，支持关联检索
 */
export class MemoryNetwork {
  private nodes: Map<string, MemoryNode> = new Map();
  private readonly similarityThreshold = 0.7;

  /**
   * 添加记忆节点
   */
  addNode(node: MemoryNode): void {
    // 自动建立连接
    for (const existingNode of this.nodes.values()) {
      const similarity = this.calculateEmbeddingSimilarity(
        node.embedding,
        existingNode.embedding
      );
      
      if (similarity > this.similarityThreshold) {
        // 双向连接
        node.connections.set(existingNode.id, similarity);
        existingNode.connections.set(node.id, similarity);
      }
    }
    
    this.nodes.set(node.id, node);
  }

  /**
   * 获取关联记忆
   * 使用随机游走算法
   */
  getAssociatedMemories(
    startNodeId: string,
    depth: number = 2,
    maxResults: number = 10
  ): Array<{ node: MemoryNode; relevance: number }> {
    const startNode = this.nodes.get(startNodeId);
    if (!startNode) return [];

    const visited = new Set<string>();
    const scores = new Map<string, number>();
    
    const walk = (nodeId: string, currentDepth: number, weight: number) => {
      if (currentDepth > depth || weight < 0.1) return;
      
      visited.add(nodeId);
      scores.set(nodeId, (scores.get(nodeId) || 0) + weight);
      
      const node = this.nodes.get(nodeId);
      if (!node) return;
      
      for (const [connectedId, strength] of node.connections) {
        if (!visited.has(connectedId)) {
          walk(connectedId, currentDepth + 1, weight * strength);
        }
      }
    };
    
    walk(startNodeId, 0, 1.0);
    
    // 排序并返回结果
    return Array.from(scores.entries())
      .filter(([id]) => id !== startNodeId)
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxResults)
      .map(([id, relevance]) => ({
        node: this.nodes.get(id)!,
        relevance,
      }));
  }

  /**
   * 激活扩散检索
   * 从多个起始节点同时扩散
   */
  spreadingActivation(
    seedNodeIds: string[],
    decay: number = 0.5,
    threshold: number = 0.1
  ): Map<string, number> {
    const activation = new Map<string, number>();
    const queue: Array<{ id: string; level: number }> = seedNodeIds.map(id => ({ id, level: 0 }));
    
    for (const id of seedNodeIds) {
      activation.set(id, 1.0);
    }
    
    while (queue.length > 0) {
      const { id, level } = queue.shift()!;
      const node = this.nodes.get(id);
      
      if (!node) continue;
      
      for (const [connectedId, strength] of node.connections) {
        const currentActivation = activation.get(connectedId) || 0;
        const newActivation = (activation.get(id) || 0) * strength * Math.pow(decay, level);
        
        if (newActivation > threshold && newActivation > currentActivation) {
          activation.set(connectedId, newActivation);
          queue.push({ id: connectedId, level: level + 1 });
        }
      }
    }
    
    return activation;
  }

  private calculateEmbeddingSimilarity(a: number[], b: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}

// ==================== 注意力机制模型 ====================

/**
 * 注意力权重计算
 * 模拟人类注意力的有限性和选择性
 */
export interface AttentionConfig {
  maxAttentionSlots: number;      // 最大注意力槽位数
  decayRate: number;              // 注意力衰减率
  boostFactor: number;            // 重要性提升因子
}

/**
 * 注意力管理器
 */
export class AttentionManager {
  private config: AttentionConfig;
  private attentionWeights: Map<string, number> = new Map();

  constructor(config: Partial<AttentionConfig> = {}) {
    this.config = {
      maxAttentionSlots: 7,         // 神奇的数字 7±2
      decayRate: 0.95,
      boostFactor: 1.5,
      ...config,
    };
  }

  /**
   * 更新注意力权重
   */
  updateAttention(itemId: string, importance: number): void {
    // 衰减所有现有权重
    for (const [id, weight] of this.attentionWeights) {
      this.attentionWeights.set(id, weight * this.config.decayRate);
    }
    
    // 提升当前项
    const currentWeight = this.attentionWeights.get(itemId) || 0;
    this.attentionWeights.set(
      itemId,
      currentWeight + importance * this.config.boostFactor
    );
    
    // 清理低权重项
    this.pruneAttention();
  }

  /**
   * 获取当前注意力焦点
   */
  getFocusItems(limit: number = 5): Array<{ id: string; weight: number }> {
    return Array.from(this.attentionWeights.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([id, weight]) => ({ id, weight }));
  }

  /**
   * 计算注意力负载
   */
  getAttentionLoad(): number {
    const totalWeight = Array.from(this.attentionWeights.values())
      .reduce((sum, w) => sum + w, 0);
    return Math.min(1, totalWeight / this.config.maxAttentionSlots);
  }

  private pruneAttention(): void {
    const sorted = Array.from(this.attentionWeights.entries())
      .sort((a, b) => b[1] - a[1]);
    
    // 只保留前 N 个
    this.attentionWeights = new Map(
      sorted.slice(0, this.config.maxAttentionSlots)
    );
  }
}

// ==================== 决策模型 ====================

/**
 * 多属性效用理论 (MAUT)
 * 用于复杂决策场景
 */
export interface DecisionOption {
  id: string;
  attributes: Record<string, number>; // 属性名 -> 值 [0, 1]
}

/**
 * 计算选项的综合效用值
 */
export function calculateUtility(
  option: DecisionOption,
  attributeWeights: Record<string, number>
): number {
  let utility = 0;
  let totalWeight = 0;
  
  for (const [attr, value] of Object.entries(option.attributes)) {
    const weight = attributeWeights[attr] || 0;
    utility += value * weight;
    totalWeight += weight;
  }
  
  return totalWeight > 0 ? utility / totalWeight : 0;
}

/**
 * 选择最优选项
 */
export function selectOptimalOption(
  options: DecisionOption[],
  attributeWeights: Record<string, number>
): DecisionOption | null {
  if (options.length === 0) return null;
  
  let bestOption = options[0];
  let bestUtility = calculateUtility(options[0], attributeWeights);
  
  for (let i = 1; i < options.length; i++) {
    const utility = calculateUtility(options[i], attributeWeights);
    if (utility > bestUtility) {
      bestUtility = utility;
      bestOption = options[i];
    }
  }
  
  return bestOption;
}

// ==================== 贝叶斯信念更新 ====================

/**
 * 贝叶斯更新器
 * 用于根据新证据更新信念
 */
export class BayesianBelief {
  private prior: number;
  private evidenceHistory: Array<{ likelihood: number; timestamp: number }> = [];

  constructor(prior: number = 0.5) {
    this.prior = prior;
  }

  /**
   * 根据新证据更新信念
   * @param likelihoodTrue - 假设为真时的证据似然 P(E|H)
   * @param likelihoodFalse - 假设为假时的证据似然 P(E|¬H)
   */
  update(likelihoodTrue: number, likelihoodFalse: number): number {
    const posterior = this.bayesianUpdate(
      this.prior,
      likelihoodTrue,
      likelihoodFalse
    );
    
    this.evidenceHistory.push({
      likelihood: likelihoodTrue / (likelihoodTrue + likelihoodFalse),
      timestamp: Date.now(),
    });
    
    this.prior = posterior;
    return posterior;
  }

  /**
   * 获取当前信念值
   */
  getBelief(): number {
    return this.prior;
  }

  /**
   * 获取信念置信度
   * 基于证据数量
   */
  getConfidence(): number {
    const count = this.evidenceHistory.length;
    return Math.min(1, count / 10); // 10 条证据达到最大置信度
  }

  private bayesianUpdate(
    prior: number,
    likelihoodTrue: number,
    likelihoodFalse: number
  ): number {
    const numerator = likelihoodTrue * prior;
    const denominator = numerator + likelihoodFalse * (1 - prior);
    return denominator === 0 ? prior : numerator / denominator;
  }
}

// ==================== 导出所有模型 ====================

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
