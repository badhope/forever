/**
 * Forever 算法库 - 概率与采样算法
 *
 * 提供加权随机采样、softmax 函数和温度采样。
 */

/**
 * 加权随机采样
 *
 * @param items - 候选项列表
 * @param weights - 对应的权重列表
 * @returns 按权重随机选中的元素
 */
export function weightedRandom<T>(items: T[], weights: number[]): T {
  if (items.length !== weights.length) {
    throw new Error('Items and weights must have the same length');
  }

  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  let random = Math.random() * totalWeight;

  for (let i = 0; i < items.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return items[i];
    }
  }

  return items[items.length - 1];
}

/**
 * softmax 函数
 * 将分数转换为概率分布
 *
 * @param scores - 输入分数
 * @returns 概率分布（和为 1）
 */
export function softmax(scores: number[]): number[] {
  const maxScore = Math.max(...scores);
  const expScores = scores.map(s => Math.exp(s - maxScore));
  const sumExp = expScores.reduce((sum, s) => sum + s, 0);

  return expScores.map(s => s / sumExp);
}

/**
 * 温度采样
 * 基于分数和温度参数进行概率采样
 *
 * @param items - 候选项列表
 * @param scores - 对应的分数列表
 * @param temperature - 温度参数（越高分布越均匀，默认 1.0）
 * @returns 按概率随机选中的元素
 */
export function temperatureSampling<T>(
  items: T[],
  scores: number[],
  temperature: number = 1.0,
): T {
  if (items.length !== scores.length) {
    throw new Error('Items and scores must have the same length');
  }

  // 应用温度
  const adjustedScores = scores.map(s => s / temperature);
  const probabilities = softmax(adjustedScores);

  // 累积概率采样
  const cumulative = probabilities.reduce((acc, p, i) => {
    acc.push((acc[i - 1] || 0) + p);
    return acc;
  }, [] as number[]);

  const random = Math.random();
  const index = cumulative.findIndex(p => random <= p);

  return items[index === -1 ? items.length - 1 : index];
}
