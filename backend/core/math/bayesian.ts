/**
 * Forever 数学模型库 - 贝叶斯信念更新
 *
 * 提供基于贝叶斯定理的信念更新机制，用于根据新证据更新概率信念。
 */

/**
 * 贝叶斯更新器
 * 用于根据新证据更新信念
 */
export class BayesianBelief {
  private prior: number;
  private evidenceHistory: Array<{ likelihood: number; timestamp: number }> = [];

  /**
   * @param prior - 先验概率（默认 0.5）
   */
  constructor(prior: number = 0.5) {
    this.prior = prior;
  }

  /**
   * 根据新证据更新信念
   *
   * @param likelihoodTrue - 假设为真时的证据似然 P(E|H)
   * @param likelihoodFalse - 假设为假时的证据似然 P(E|~H)
   * @returns 更新后的后验概率
   */
  update(likelihoodTrue: number, likelihoodFalse: number): number {
    const posterior = this.bayesianUpdate(
      this.prior,
      likelihoodTrue,
      likelihoodFalse,
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
   *
   * @returns 置信度 [0, 1]，10 条证据达到最大置信度
   */
  getConfidence(): number {
    const count = this.evidenceHistory.length;
    return Math.min(1, count / 10);
  }

  /**
   * 贝叶斯更新计算
   * @internal
   */
  private bayesianUpdate(
    prior: number,
    likelihoodTrue: number,
    likelihoodFalse: number,
  ): number {
    const numerator = likelihoodTrue * prior;
    const denominator = numerator + likelihoodFalse * (1 - prior);
    return denominator === 0 ? prior : numerator / denominator;
  }
}
