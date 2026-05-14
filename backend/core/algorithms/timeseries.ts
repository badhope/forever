/**
 * Forever 算法库 - 时间序列算法
 *
 * 提供简单移动平均和指数移动平均算法。
 */

/**
 * 简单移动平均
 *
 * @param data - 输入数据序列
 * @param windowSize - 窗口大小
 * @returns 移动平均结果序列
 */
export function movingAverage(data: number[], windowSize: number): number[] {
  if (windowSize <= 0 || windowSize > data.length) {
    throw new Error('Invalid window size');
  }

  const result: number[] = [];

  for (let i = 0; i <= data.length - windowSize; i++) {
    const window = data.slice(i, i + windowSize);
    const avg = window.reduce((sum, v) => sum + v, 0) / windowSize;
    result.push(avg);
  }

  return result;
}

/**
 * 指数移动平均
 *
 * @param data - 输入数据序列
 * @param alpha - 平滑系数 (0-1)，越大越接近当前值
 * @returns 指数移动平均结果序列
 */
export function exponentialMovingAverage(
  data: number[],
  alpha: number = 0.3,
): number[] {
  if (alpha < 0 || alpha > 1) {
    throw new Error('Alpha must be between 0 and 1');
  }

  const result: number[] = [data[0]];

  for (let i = 1; i < data.length; i++) {
    result.push(alpha * data[i] + (1 - alpha) * result[i - 1]);
  }

  return result;
}
