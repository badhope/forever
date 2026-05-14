/**
 * Forever 数学模型库 - 决策模型
 *
 * 基于多属性效用理论（MAUT）提供决策支持。
 */

/**
 * 决策选项
 */
export interface DecisionOption {
  /** 选项唯一标识 */
  id: string;
  /** 属性名到值的映射，值范围 [0, 1] */
  attributes: Record<string, number>;
}

/**
 * 计算选项的综合效用值
 *
 * 使用加权求和法计算多属性效用值。
 *
 * @param option - 决策选项
 * @param attributeWeights - 属性权重映射
 * @returns 效用值 [0, 1]
 */
export function calculateUtility(
  option: DecisionOption,
  attributeWeights: Record<string, number>,
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
 *
 * 遍历所有选项，返回效用值最高的选项。
 *
 * @param options - 决策选项列表
 * @param attributeWeights - 属性权重映射
 * @returns 最优选项，如果列表为空则返回 null
 */
export function selectOptimalOption(
  options: DecisionOption[],
  attributeWeights: Record<string, number>,
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
