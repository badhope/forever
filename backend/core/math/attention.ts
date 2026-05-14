/**
 * Forever 数学模型库 - 注意力机制模型
 *
 * 模拟人类注意力的有限性和选择性。
 */

/**
 * 注意力权重计算配置
 */
export interface AttentionConfig {
  /** 最大注意力槽位数 */
  maxAttentionSlots: number;
  /** 注意力衰减率 */
  decayRate: number;
  /** 重要性提升因子 */
  boostFactor: number;
}

/**
 * 注意力管理器
 *
 * 管理多个项目的注意力权重，模拟人类注意力的有限性和选择性。
 * 基于米勒定律（7+/-2），默认最大注意力槽位数为 7。
 */
export class AttentionManager {
  private config: AttentionConfig;
  private attentionWeights: Map<string, number> = new Map();

  constructor(config: Partial<AttentionConfig> = {}) {
    this.config = {
      maxAttentionSlots: 7,         // 神奇的数字 7+/-2
      decayRate: 0.95,
      boostFactor: 1.5,
      ...config,
    };
  }

  /**
   * 更新注意力权重
   *
   * 衰减所有现有权重，然后提升指定项的权重。
   *
   * @param itemId - 项目 ID
   * @param importance - 重要性分数
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
      currentWeight + importance * this.config.boostFactor,
    );

    // 清理低权重项
    this.pruneAttention();
  }

  /**
   * 获取当前注意力焦点
   *
   * @param limit - 返回的最大数量（默认 5）
   * @returns 按权重降序排列的焦点项目
   */
  getFocusItems(limit: number = 5): Array<{ id: string; weight: number }> {
    return Array.from(this.attentionWeights.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([id, weight]) => ({ id, weight }));
  }

  /**
   * 计算注意力负载
   *
   * @returns 负载度 [0, 1]，1 表示满载
   */
  getAttentionLoad(): number {
    const totalWeight = Array.from(this.attentionWeights.values())
      .reduce((sum, w) => sum + w, 0);
    return Math.min(1, totalWeight / this.config.maxAttentionSlots);
  }

  /**
   * 清理低权重项，只保留前 N 个
   */
  private pruneAttention(): void {
    const sorted = Array.from(this.attentionWeights.entries())
      .sort((a, b) => b[1] - a[1]);

    // 只保留前 N 个
    this.attentionWeights = new Map(
      sorted.slice(0, this.config.maxAttentionSlots),
    );
  }
}
